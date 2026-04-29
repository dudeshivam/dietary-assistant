import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

import UserTypes "../types/users";
import ActivityTypes "../types/activity";
import DietTypes "../types/diet";
import AuthTypes "../types/auth";
import FeedbackTypes "../types/feedback";
import DietLib "../lib/diet";
import UserLib "../lib/users";
import AuthLib "../lib/auth";
import FeedbackLib "../lib/feedback";
import AI "../lib/ai";

mixin (
  users : List.List<UserTypes.User>,
  activities : List.List<ActivityTypes.UserActivity>,
  journeyProgressStore : Map.Map<Text, DietTypes.JourneyProgress>,
  dailyPlanStore : Map.Map<Text, DietTypes.DailyJourney>,
  sessions : Map.Map<Text, AuthTypes.Session>,
  feedbackStore : Map.Map<Text, FeedbackTypes.UserFeedback>,
  rateLimits : Map.Map<Text, AI.DailyRateLimit>,
) {

  // ── helpers ───────────────────────────────────────────────────────────────

  let ONE_DAY_NS : Int = 86_400_000_000_000;

  func _dayBucket() : Int { Time.now() / ONE_DAY_NS };

  // ── Fetch or create the rate-limit record for caller on today's bucket ───
  func _getRateLimit(caller : Principal) : AI.DailyRateLimit {
    let bucket = _dayBucket();
    let key = AI.rateLimitKey(caller, bucket);
    switch (rateLimits.get(key)) {
      case (?rl) { rl };
      case null  { { plan_count = 0; chat_count = 0; day_bucket = bucket } };
    };
  };

  // ── Increment plan count for caller ──────────────────────────────────────
  func _incrementPlanCount(caller : Principal) {
    let bucket = _dayBucket();
    let key = AI.rateLimitKey(caller, bucket);
    let cur = _getRateLimit(caller);
    rateLimits.add(key, { cur with plan_count = cur.plan_count + 1 });
  };

  // ── Increment chat count for caller ──────────────────────────────────────
  func _incrementChatCount(caller : Principal) {
    let bucket = _dayBucket();
    let key = AI.rateLimitKey(caller, bucket);
    let cur = _getRateLimit(caller);
    rateLimits.add(key, { cur with chat_count = cur.chat_count + 1 });
  };

  func _countPlansToday(caller : Principal) : Nat {
    let now = Time.now();
    let planKey = DietLib.dailyPlanKey(caller, now);
    switch (dailyPlanStore.get(planKey)) {
      case (?_) { 1 };
      case null { 0 };
    };
  };

  func _getUser(caller : Principal) : ?UserTypes.UserPublic {
    UserLib.getById(users, caller);
  };

  func _getTodayProgress(caller : Principal) : DietTypes.JourneyProgress {
    let now = Time.now();
    let key = DietLib.progressKey(caller, now);
    switch (journeyProgressStore.get(key)) {
      case (?p) { p };
      case null {
        {
          completed_task_ids = [];
          earned_xp = 0;
          streak_days = 0;
          date = now;
        };
      };
    };
  };

  func _getTodayTasks(caller : Principal) : [DietTypes.JourneyTask] {
    let now = Time.now();
    let planKey = DietLib.dailyPlanKey(caller, now);
    switch (dailyPlanStore.get(planKey)) {
      case (?plan) { plan.tasks };
      case null { [] };
    };
  };

  func _getMissedMeals(caller : Principal) : [DietTypes.MissedMealEntry] {
    let now = Time.now();
    let todayBucket = now / ONE_DAY_NS;
    let result = List.empty<DietTypes.MissedMealEntry>();
    activities.forEach(func(a : ActivityTypes.UserActivity) {
      if (a.user_id == caller and a.date / ONE_DAY_NS == todayBucket) {
        switch (a.missed_meals) {
          case (?entries) {
            entries.forEach(func(m : DietTypes.MissedMealEntry) {
              result.add(m);
            });
          };
          case null {};
        };
      };
    });
    result.toArray();
  };

  // ── Try AI diet generation with one retry on parse failure ────────────────
  // Returns #ok(DailyJourney with generated_by_ai=true) or #fallback
  func _tryGenerateAIPlan(caller : Principal, user : UserTypes.UserPublic) : async { #ok : DietTypes.DailyJourney; #fallback } {
    let now = Time.now();
    let dayBucket = now / ONE_DAY_NS;
    let dateStr = dayBucket.toText() # " (" # AI.formatUtcTime(now) # ")";
    let systemPrompt = AI.getDietCoachSystemPrompt();

    // Fetch personalization context
    let recentFeedback = FeedbackLib.listByUserRange(feedbackStore, caller, 5);
    let lifestyle = user.lifestyle_description;

    let userPrompt = AI.generateDietPlanPrompt(user, dateStr, lifestyle, recentFeedback);

    // Resolve user's diet type for veg filtering
    let dietType = switch (users.find(func(u : UserTypes.User) : Bool = u.id == caller)) {
      case (?u) { u.diet_type };
      case null { #non_veg };
    };

    // First attempt
    switch (await AI.callGeminiWithSystem(systemPrompt, userPrompt)) {
      case (#err(_)) {
        // HTTP error → fallback immediately, no retry
        return #fallback;
      };
      case (#ok(responseText)) {
        let journey = AI.parseGeminiDietResponseWithDiet(responseText, caller, user.goal, dietType);
        if (journey.generated_by_ai) {
          return #ok(journey);
        };
        // Parse returned fallback — retry once with stronger reminder
        // For veg users, append the critical enforcement note
        let retryBase = AI.generateRetryPrompt(user, dateStr, lifestyle, recentFeedback);
        let retryPrompt = if (dietType == #veg) {
          retryBase # "\n\n" # AI.vegEnforcementPrompt();
        } else {
          retryBase;
        };
        switch (await AI.callGeminiWithSystem(systemPrompt, retryPrompt)) {
          case (#err(_)) { #fallback };
          case (#ok(retryText)) {
            let retryJourney = AI.parseGeminiDietResponseWithDiet(retryText, caller, user.goal, dietType);
            if (retryJourney.generated_by_ai) {
              #ok(retryJourney);
            } else {
              #fallback;
            };
          };
        };
      };
    };
  };

  // ── public API ────────────────────────────────────────────────────────────

  /// Generate an AI-personalised daily diet plan. Free users limited to 1 plan/day.
  /// Premium users limited to RATE_LIMIT_PLANS_PER_DAY (10) per day.
  /// Never returns #error for AI failures — always falls back to a safe default plan.
  public shared func generateAIDiet(sessionToken : Text) : async DietTypes.GeneratePlanResult {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { return #error("Not authenticated — please sign in") };
      case (?caller) {
        let userOpt = _getUser(caller);
        let user = switch (userOpt) {
          case (?u) { u };
          case null { return #error("User profile not found — please register first") };
        };

        switch (user.subscription_plan) {
          case (#free) {
            if (_countPlansToday(caller) >= 1) {
              return #tierLimited("You've reached your daily AI limit. Upgrade to Premium for unlimited plans.");
            };
          };
          case (#premium) {
            let rl = _getRateLimit(caller);
            if (rl.plan_count >= AI.RATE_LIMIT_PLANS_PER_DAY) {
              return #tierLimited("Daily AI limit reached. Try again tomorrow.");
            };
          };
        };

        let planKey = DietLib.dailyPlanKey(caller, Time.now());

        switch (await _tryGenerateAIPlan(caller, user)) {
          case (#ok(journey)) {
            _incrementPlanCount(caller);
            dailyPlanStore.add(planKey, journey);
            #ok(journey);
          };
          case (#fallback) {
            _incrementPlanCount(caller);
            let fallback = DietLib.generateDailyPlan(user.goal);
            dailyPlanStore.add(planKey, fallback);
            #ok(fallback);
          };
        };
      };
    };
  };

  /// Edit a specific meal task in today's AI-generated plan.
  public shared func editAIMeal(sessionToken : Text, req : DietTypes.EditMealRequest) : async { #ok : DietTypes.DailyJourney; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);

        switch (dailyPlanStore.get(planKey)) {
          case null { #err("No plan found for today — generate a plan first") };
          case (?plan) {
            let updatedTasks = plan.tasks.map(
              func(t : DietTypes.JourneyTask) : DietTypes.JourneyTask {
                if (t.id.toText() == req.task_id) {
                  { t with food_items = req.food_items; quantity = req.quantity };
                } else { t };
              }
            );
            let updatedPlan : DietTypes.DailyJourney = {
              plan with
              tasks = updatedTasks;
              generated_by_ai = false;
            };
            dailyPlanStore.add(planKey, updatedPlan);
            #ok(updatedPlan);
          };
        };
      };
    };
  };

  /// Replace today's full meal plan with a user-defined set of meals.
  public shared func editMealPlan(sessionToken : Text, req : DietTypes.EditMealPlanRequest) : async { #ok : DietTypes.DailyJourney; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);

        var idx : Nat = 0;
        let newTasks = req.meals.map(
          func(m : DietTypes.EditableMeal) : DietTypes.JourneyTask {
            idx += 1;
            let assignedId : Nat = if (m.id == 0) { idx } else { m.id };
            {
              id = assignedId;
              title = m.name;
              name = m.name;
              description = "";
              time_label = m.time;
              time = m.time;
              task_type = m.task_type;
              xp_reward = 10;
              food_items = m.food_items;
              quantity = m.quantity;
              calories = m.calories;
              protein = m.protein;
            };
          }
        );

        let total_xp : Nat = newTasks.size() * 10;
        let updatedPlan : DietTypes.DailyJourney = {
          id = caller.toText() # "#manual#" # now.toText();
          tasks = newTasks;
          total_xp;
          date = now;
          generated_by_ai = false;
        };
        dailyPlanStore.add(planKey, updatedPlan);
        #ok(updatedPlan);
      };
    };
  };

  /// Delete today's custom plan and regenerate using AI (or default fallback).
  public shared func resetToAIPlan(sessionToken : Text) : async { #ok : DietTypes.DailyJourney; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let userOpt = _getUser(caller);
        let user = switch (userOpt) {
          case (?u) { u };
          case null { return #err("User profile not found — please register first") };
        };

        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);
        let progressKey = DietLib.progressKey(caller, now);

        dailyPlanStore.remove(planKey);
        journeyProgressStore.remove(progressKey);

        let freshPlan = switch (await _tryGenerateAIPlan(caller, user)) {
          case (#ok(journey)) { journey };
          case (#fallback) { DietLib.generateDailyPlan(user.goal) };
        };

        dailyPlanStore.add(planKey, freshPlan);
        #ok(freshPlan);
      };
    };
  };

  /// Log a missed meal and trigger AI adjustment. Premium only.
  /// Also patches the stored plan to mark the skipped meal's description.
  public shared func logMissedMeal(sessionToken : Text, mealType : Text, reason : Text) : async { #ok : Text; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let userOpt = _getUser(caller);
        let user = switch (userOpt) {
          case (?u) { u };
          case null { return #err("User profile not found") };
        };

        switch (user.subscription_plan) {
          case (#free) {
            return #err("Dynamic meal adjustment is a Premium feature. Upgrade to unlock.");
          };
          case (#premium) {};
        };

        let now = Time.now();
        let missedEntry : DietTypes.MissedMealEntry = { meal_type = mealType; reason };

        let activityEntry : ActivityTypes.UserActivity = {
          user_id = caller;
          daily_calories = null;
          protein_intake = null;
          water_intake = null;
          meals_completed = null;
          meals_skipped = ?1;
          total_protein = null;
          missed_meals = ?[missedEntry];
          date = now;
        };
        activities.add(activityEntry);

        let todayProgress = _getTodayProgress(caller);
        let todayTasks = _getTodayTasks(caller);
        let remainingTasks = todayTasks.filter(func(t : DietTypes.JourneyTask) : Bool {
          not todayProgress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id);
        });

        // Patch stored plan: mark skipped meal's description to show it was skipped
        let planKey = DietLib.dailyPlanKey(caller, now);
        switch (dailyPlanStore.get(planKey)) {
          case null {};
          case (?plan) {
            let skippedLower = mealType.toLower();
            var patched = false;
            let patchedTasks = plan.tasks.map(func(t : DietTypes.JourneyTask) : DietTypes.JourneyTask {
              if (not patched and t.title.toLower().contains(#text skippedLower)) {
                patched := true;
                { t with description = t.description # " [Skipped: " # reason # "]" };
              } else { t };
            });
            dailyPlanStore.add(planKey, { plan with tasks = patchedTasks });
          };
        };

        if (remainingTasks.size() == 0) {
          return #ok("Missed meal logged. No remaining tasks to adjust.");
        };

        let systemPrompt = AI.getDietCoachSystemPrompt();
        let adjustmentPrompt = AI.buildAdjustmentPrompt(user, missedEntry, remainingTasks);

        switch (await AI.callGeminiWithSystem(systemPrompt, adjustmentPrompt)) {
          case (#err(_)) {
            #ok("Missed meal logged. Could not reach AI for adjustments — try again later.");
          };
          case (#ok(suggestion)) {
            let sanitizedSuggestion = AI.sanitizeAIResponse(suggestion);
            // Append AI tip to the next uncompleted meal task
            switch (dailyPlanStore.get(planKey)) {
              case null {};
              case (?plan) {
                var applied = false;
                let updatedTasks = plan.tasks.map(
                  func(t : DietTypes.JourneyTask) : DietTypes.JourneyTask {
                    if (
                      not applied and
                      t.task_type == #meal and
                      not todayProgress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id)
                    ) {
                      applied := true;
                      { t with description = t.description # " [Coach tip: " # sanitizedSuggestion # "]" };
                    } else { t };
                  }
                );
                dailyPlanStore.add(planKey, { plan with tasks = updatedTasks });
              };
            };
            #ok("Plan adjusted: " # sanitizedSuggestion);
          };
        };
      };
    };
  };

  /// AI chat assistant — ask your diet coach anything. Premium only.
  public shared func chatWithAI(sessionToken : Text, req : DietTypes.ChatRequest) : async DietTypes.ChatResult {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { return #error("Not authenticated — please sign in") };
      case (?caller) {
        let userOpt = _getUser(caller);
        let user = switch (userOpt) {
          case (?u) { u };
          case null { return #error("User profile not found — please register first") };
        };

        switch (user.subscription_plan) {
          case (#free) {
            return #tierLimited("AI chat is a Premium feature. Upgrade to unlock your personal diet coach.");
          };
          case (#premium) {
            let rl = _getRateLimit(caller);
            if (rl.chat_count >= AI.RATE_LIMIT_CHATS_PER_DAY) {
              return #tierLimited("Daily AI limit reached. Try again tomorrow.");
            };
          };
        };

        let todayProgress = _getTodayProgress(caller);
        let todayTasks = _getTodayTasks(caller);
        let missedMeals = _getMissedMeals(caller);

        let recentFeedback = FeedbackLib.listByUserRange(feedbackStore, caller, 3);
        let lifestyle = user.lifestyle_description;

        let systemPrompt = AI.getDietCoachSystemPrompt();
        let userContextPrompt = AI.buildChatPrompt(user, todayProgress, todayTasks, req.user_message, missedMeals, lifestyle, recentFeedback);

        switch (await AI.callGeminiWithSystem(systemPrompt, userContextPrompt)) {
          case (#err(_)) {
            #ok({
              ai_message = "I'm having trouble connecting right now. Please try again in a moment.";
              is_health_response = false;
            });
          };
          case (#ok(responseText)) {
            _incrementChatCount(caller);
            let chatResponse = AI.parseChatResponse(responseText, req.user_message);
            #ok(chatResponse);
          };
        };
      };
    };
  };
};
