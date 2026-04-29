import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import UserTypes "../types/users";
import ActivityTypes "../types/activity";
import DietTypes "../types/diet";
import BalanceTypes "../types/balance";
import AuthTypes "../types/auth";
import FeedbackTypes "../types/feedback";
import DietLib "../lib/diet";
import AuthLib "../lib/auth";
import UserLib "../lib/users";
import BalanceLib "../lib/balance";
import FeedbackLib "../lib/feedback";
import AI "../lib/ai";

mixin (
  users : List.List<UserTypes.User>,
  activities : List.List<ActivityTypes.UserActivity>,
  journeyProgressStore : Map.Map<Text, DietTypes.JourneyProgress>,
  dailyPlanStore : Map.Map<Text, DietTypes.DailyJourney>,
  sessions : Map.Map<Text, AuthTypes.Session>,
  feedbackStore : Map.Map<Text, FeedbackTypes.UserFeedback>,
  balanceTransactions : List.List<BalanceTypes.BalanceTransaction>,
) {

  // ---------- private helpers ----------

  func _getUserPublic(caller : Principal) : ?UserTypes.UserPublic {
    UserLib.getById(users, caller);
  };

  func _getDietType(caller : Principal) : UserTypes.DietType {
    switch (users.find(func(u : UserTypes.User) : Bool = u.id == caller)) {
      case (?u) { u.diet_type };
      case null { #non_veg };
    };
  };

  // Try AI generation and store result, or fall back to static plan.
  // This is used for the auto-generate on first daily visit.
  func _autoGeneratePlan(caller : Principal) : async DietTypes.DailyJourney {
    let now = Time.now();
    let planKey = DietLib.dailyPlanKey(caller, now);
    let ONE_DAY_NS : Int = 86_400_000_000_000;
    let dayBucket = now / ONE_DAY_NS;
    let dateStr = dayBucket.toText() # " (" # AI.formatUtcTime(now) # ")";

    let goal = switch (users.find(func(u : UserTypes.User) : Bool = u.id == caller)) {
      case (?u) { u.goal };
      case null { null };
    };
    let dietType = _getDietType(caller);

    switch (_getUserPublic(caller)) {
      case null {
        // No profile — use static fallback
        let plan = DietLib.generateDailyPlan(goal);
        dailyPlanStore.add(planKey, plan);
        plan;
      };
      case (?user) {
        let systemPrompt = AI.getDietCoachSystemPrompt();
        let recentFeedback = FeedbackLib.listByUserRange(feedbackStore, caller, 5);
        let lifestyle = user.lifestyle_description;
        let userPrompt   = AI.generateDietPlanPrompt(user, dateStr, lifestyle, recentFeedback);

        // First AI attempt
        let firstResult = await AI.callGeminiWithSystem(systemPrompt, userPrompt);
        switch (firstResult) {
          case (#ok(responseText)) {
            let journey = AI.parseGeminiDietResponseWithDiet(responseText, caller, user.goal, dietType);
            if (journey.generated_by_ai) {
              dailyPlanStore.add(planKey, journey);
              return journey;
            };
            // Retry with a stronger reminder
            let retryPrompt = AI.generateRetryPrompt(user, dateStr, lifestyle, recentFeedback);
            switch (await AI.callGeminiWithSystem(systemPrompt, retryPrompt)) {
              case (#ok(retryText)) {
                let retryJourney = AI.parseGeminiDietResponseWithDiet(retryText, caller, user.goal, dietType);
                if (retryJourney.generated_by_ai) {
                  dailyPlanStore.add(planKey, retryJourney);
                  return retryJourney;
                };
              };
              case (#err(_)) {};
            };
          };
          case (#err(_)) {};
        };

        // Both attempts failed — use static fallback
        let fallback = DietLib.generateDailyPlan(user.goal);
        dailyPlanStore.add(planKey, fallback);
        fallback;
      };
    };
  };

  // Check if all tasks for the day are completed
  func _allTasksCompleted(caller : Principal) : Bool {
    let now = Time.now();
    let planKey = DietLib.dailyPlanKey(caller, now);
    let progressKey = DietLib.progressKey(caller, now);
    let plan = switch (dailyPlanStore.get(planKey)) {
      case (?p) { p };
      case null { return false };
    };
    let progress = switch (journeyProgressStore.get(progressKey)) {
      case (?p) { p };
      case null { return false };
    };
    let mealTasks = plan.tasks.filter(func(t : DietTypes.JourneyTask) : Bool = t.task_type == #meal);
    if (mealTasks.size() == 0) { return false };
    mealTasks.all(func(t : DietTypes.JourneyTask) : Bool {
      progress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id);
    });
  };

  // Check if a day-completion reward was already given today
  func _dayRewardAlreadyGiven(caller : Principal) : Bool {
    let now = Time.now();
    let ONE_DAY_NS : Int = 86_400_000_000_000;
    let todayBucket = now / ONE_DAY_NS;
    let bucketStr = todayBucket.toText();
    balanceTransactions.any(func(tx : BalanceTypes.BalanceTransaction) : Bool {
      tx.user_id == caller and
      tx.transaction_type == #reward and
      tx.reason.contains(#text "Full day completed") and
      (tx.date / ONE_DAY_NS).toText() == bucketStr
    });
  };

  // ---------- public API ----------

  /// Returns today's journey plan for the caller.
  /// If no plan exists yet, auto-generates using AI (with static fallback on failure).
  /// Free users always get auto-generation on first daily visit; daily limit only applies to manual generateAIDiet calls.
  public shared func getTodayJourney(sessionToken : Text) : async { #ok : DietTypes.DailyJourney; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { return #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);
        switch (dailyPlanStore.get(planKey)) {
          case (?plan) { #ok(plan) };
          case null {
            // No plan for today — auto-generate via AI
            let plan = await _autoGeneratePlan(caller);
            #ok(plan);
          };
        };
      };
    };
  };

  /// Generates (or regenerates) today's journey plan for the caller and stores it.
  public shared func generateTodayPlan(sessionToken : Text) : async { #ok : DietTypes.DailyJourney; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);
        switch (dailyPlanStore.get(planKey)) {
          case (?plan) { #ok(plan) };
          case null {
            let plan = await _autoGeneratePlan(caller);
            #ok(plan);
          };
        };
      };
    };
  };

  /// Marks a journey task as completed. Returns updated progress or a descriptive error.
  public shared func completeJourneyTask(sessionToken : Text, req : DietTypes.JourneyCompletionRequest) : async { #ok : DietTypes.JourneyProgress; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { return #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let key = DietLib.progressKey(caller, now);

        let existing = journeyProgressStore.get(key);
        let progress : DietTypes.JourneyProgress = switch (existing) {
          case (?p) { p };
          case null {
            let yKey = DietLib.yesterdayKey(caller, now);
            let hadYesterday = switch (journeyProgressStore.get(yKey)) {
              case (?yp) { yp.completed_task_ids.size() > 0 };
              case null { false };
            };
            let streak : Nat = if (hadYesterday) { 1 } else { 0 };
            {
              completed_task_ids = [];
              earned_xp = 0;
              streak_days = streak;
              date = now;
            };
          };
        };

        switch (progress.completed_task_ids.find(func(id : Nat) : Bool = id == req.task_id)) {
          case (?_) { return #err("Task already completed") };
          case null {};
        };

        let planKey = DietLib.dailyPlanKey(caller, now);
        let planOpt = dailyPlanStore.get(planKey);
        let plan : DietTypes.DailyJourney = switch (planOpt) {
          case (?p) { p };
          case null { return #err("No plan found for today — open the dashboard to generate your plan") };
        };

        let taskOpt = plan.tasks.find(func(t : DietTypes.JourneyTask) : Bool = t.id == req.task_id);
        switch (taskOpt) {
          case null { return #err("Task not found in today's plan") };
          case (?task) {
            let newIds : [Nat] = progress.completed_task_ids.concat([req.task_id]);
            let newXp : Nat = progress.earned_xp + task.xp_reward;

            let newStreak : Nat = if (progress.completed_task_ids.size() == 0) {
              let yKey = DietLib.yesterdayKey(caller, now);
              switch (journeyProgressStore.get(yKey)) {
                case (?yp) {
                  if (yp.completed_task_ids.size() > 0) { yp.streak_days + 1 } else { 1 };
                };
                case null { 1 };
              };
            } else {
              progress.streak_days;
            };

            let updatedProgress : DietTypes.JourneyProgress = {
              completed_task_ids = newIds;
              earned_xp = newXp;
              streak_days = newStreak;
              date = now;
            };

            journeyProgressStore.add(key, updatedProgress);

            let waterDelta : ?Float = switch (task.task_type) {
              case (#water) { ?500.0 };
              case (#meal) { null };
            };
            let mealsDelta : ?Nat = switch (task.task_type) {
              case (#meal) { ?1 };
              case (#water) { null };
            };
            let activityEntry : ActivityTypes.UserActivity = {
              user_id = caller;
              daily_calories = null;
              protein_intake = null;
              water_intake = waterDelta;
              meals_completed = mealsDelta;
              meals_skipped = null;
              total_protein = null;
              missed_meals = null;
              date = now;
            };
            activities.add(activityEntry);

            // Check if all tasks are now complete — reward +₹0.5 once per day
            let allDone = _allTasksCompleted(caller);
            if (allDone and not _dayRewardAlreadyGiven(caller)) {
              ignore BalanceLib.reward(
                users,
                balanceTransactions,
                caller,
                0.5,
                "Full day completed! Great consistency 🌟",
              );
            };

            #ok(updatedProgress);
          };
        };
      };
    };
  };

  /// Marks a journey task as skipped with an optional reason.
  /// If no valid reason is provided and balance > 0, deducts ₹1.
  public shared func skipJourneyTask(
    sessionToken : Text,
    taskId : Nat,
    reason : Text,
  ) : async { #ok : { balance : Float; deducted : Bool; balance_empty : Bool }; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { return #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let planKey = DietLib.dailyPlanKey(caller, now);
        let plan = switch (dailyPlanStore.get(planKey)) {
          case (?p) { p };
          case null { return #err("No plan found for today") };
        };
        let taskOpt = plan.tasks.find(func(t : DietTypes.JourneyTask) : Bool = t.id == taskId);
        switch (taskOpt) {
          case null { return #err("Task not found in today's plan") };
          case (?task) {
            // Record the skip in activity
            let missedEntry : DietTypes.MissedMealEntry = {
              meal_type = task.title;
              reason = if (reason.size() > 0) reason else "no reason";
            };
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

            // Deduct ₹1 if no valid reason and balance > 0
            let hasReason = reason.size() > 0;
            let currentBalance = switch (BalanceLib.getBalance(users, caller)) {
              case (?b) { b };
              case null { 0.0 };
            };

            let deducted : Bool = if (not hasReason and currentBalance > 0.0) {
              ignore BalanceLib.deduct(
                users,
                balanceTransactions,
                caller,
                1.0,
                "Missed meal — stay consistent tomorrow 💪",
              );
              true;
            } else {
              false;
            };

            let newBalance = switch (BalanceLib.getBalance(users, caller)) {
              case (?b) { b };
              case null { 0.0 };
            };
            let balanceEmpty = newBalance == 0.0 and not hasReason and currentBalance == 0.0;

            #ok({ balance = newBalance; deducted; balance_empty = balanceEmpty });
          };
        };
      };
    };
  };

  /// Returns today's journey progress for the caller.
  public shared query func getTodayProgress(sessionToken : Text) : async { #ok : DietTypes.JourneyProgress; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let now = Time.now();
        let key = DietLib.progressKey(caller, now);
        let progress = switch (journeyProgressStore.get(key)) {
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
        #ok(progress);
      };
    };
  };
};
