import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";

import CommonTypes "../types/common";
import UserTypes "../types/users";
import DietTypes "../types/diet";
import FeedbackTypes "../types/feedback";
import DietLib "../lib/diet";

module {

  // ── Gemini API endpoint ───────────────────────────────────────────────────
  let GEMINI_API_KEY : Text = "AIzaSyCO6-JXtXtHVWwxsL1W3NTo9W52pqeooOk";
  let GEMINI_URL : Text = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

  // ── System prompt for the AI Diet Coach role ──────────────────────────────
  let DIET_COACH_SYSTEM_PROMPT : Text = "You are an advanced AI Diet Assistant responsible for managing a user's daily nutrition, hydration, and recovery. Your job is to: Tell the user exactly what to eat, Adjust their diet dynamically, Track their progress, Act like a real personal coach. You must always be: Practical, Simple, Action-oriented (no long explanations). SAFETY RULES (MANDATORY — never violate): 1) NEVER use the words 'cure', 'cures', 'guaranteed', 'guarantees', 'treatment for', 'treats', or any language implying medical treatment or guaranteed outcomes. 2) NEVER provide medical diagnoses, prescribe treatments, or make health claims. 3) EVERY response that mentions food, health, diet, or wellness must end with: 'Consider consulting a qualified healthcare professional before making significant dietary changes.' 4) If a user mentions pain, illness, injury, or any medical condition, add: 'This is not medical advice — please consult a qualified doctor or healthcare professional.' DIETARY ENFORCEMENT: If diet_type is veg/vegetarian, you MUST NEVER include chicken, eggs, fish, mutton, prawn, shrimp, beef, pork, lamb, or any meat/seafood. Strictly use only: paneer, tofu, dal, lentils, beans, vegetables, dairy (milk, curd, cheese), nuts, seeds, whole grains (rice, roti, oats). Violating this rule is a critical error. When generating a daily diet plan, you MUST respond ONLY with valid JSON in this exact structure (no extra text, no markdown, no explanation): {\"meals\": [{\"name\": \"Breakfast\", \"time\": \"08:00 AM\", \"items\": [{\"food\": \"Oats + Milk + Banana\", \"quantity\": \"1 bowl\", \"calories\": 350, \"protein\": 15}]}], \"water_schedule\": [{\"time\": \"10:00 AM\", \"amount\": \"300ml\"}]}";

  // ── Health keywords for disclaimer detection ──────────────────────────────
  let HEALTH_KEYWORDS : [Text] = [
    "pain", "injury", "fever", "cold", "sick", "illness",
    "hurt", "unwell", "nausea",
  ];

  // ── Safety disclaimer appended to chat responses with health content ──────
  let SAFETY_DISCLAIMER : Text = "\n\nNote: Consider consulting a qualified healthcare professional before making significant dietary changes.";

  // ── Unsafe words → safe replacements for sanitization ────────────────────
  let UNSAFE_WORD_REPLACEMENTS : [(Text, Text)] = [
    ("cures",        "supports"),
    ("cure",         "support"),
    ("guaranteed",   "designed to help"),
    ("guarantees",   "is designed to help"),
    ("treatment for","dietary approach for"),
    ("treatment",    "dietary approach"),
    ("treats",       "may help with"),
  ];

  // ── Rate-limit constants ──────────────────────────────────────────────────
  public let RATE_LIMIT_PLANS_PER_DAY  : Nat = 10;
  public let RATE_LIMIT_CHATS_PER_DAY  : Nat = 50;

  // ── Rate-limit record stored per user per day ─────────────────────────────
  public type DailyRateLimit = {
    plan_count  : Nat;
    chat_count  : Nat;
    day_bucket  : Int;   // nowNs / ONE_DAY_NS
  };

  // ── Build a rate-limit map key from principal + day bucket ───────────────
  public func rateLimitKey(userId : Principal, dayBucket : Int) : Text {
    userId.toText() # "#rl#" # dayBucket.toText();
  };

  // ── JSON helper: extract first string value for a field ───────────────────
  func parseJsonStringField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":\"";
    let parts = json.split(#text needle);
    ignore parts.next();
    switch (parts.next()) {
      case null { null };
      case (?after) {
        let valueParts = after.split(#char '\u{22}');
        valueParts.next();
      };
    };
  };

  // ── JSON helper: extract a number field as Nat ────────────────────────────
  func parseJsonNatField(json : Text, fieldName : Text) : Nat {
    let needle = "\"" # fieldName # "\":";
    let parts = json.split(#text needle);
    ignore parts.next();
    switch (parts.next()) {
      case null { 0 };
      case (?after) {
        let digits = after.split(#char ',').next();
        switch (digits) {
          case null { 0 };
          case (?d) {
            let trimmed = d.trim(#char ' ')
                           .trim(#char '\n')
                           .trim(#char '}')
                           .trim(#char ']');
            switch (trimmed.toNat()) {
              case (?n) { n };
              case null { 0 };
            };
          };
        };
      };
    };
  };

  // ── Escape a Text value for embedding in a JSON string ───────────────────
  func jsonEscape(t : Text) : Text {
    t.replace(#char '\\', "\\\\")
     .replace(#char '\u{22}', "\\\"")
     .replace(#char '\n', "\\n")
     .replace(#char '\r', "\\r");
  };

  // ── Goal to display string ────────────────────────────────────────────────
  func goalText(goal : ?CommonTypes.Goal) : Text {
    switch (goal) {
      case (? #muscle_gain) { "muscle gain" };
      case (? #fat_loss) { "fat loss" };
      case (? #lifestyle_balance) { "lifestyle balance" };
      case null { "general health" };
    };
  };

  func activityText(level : CommonTypes.ActivityLevel) : Text {
    switch (level) {
      case (#sedentary) { "sedentary" };
      case (#light) { "lightly active" };
      case (#moderate) { "moderately active" };
      case (#intense) { "very active" };
    };
  };

  func dietText(pref : CommonTypes.DietaryPreference) : Text {
    switch (pref) {
      case (#vegetarian) { "vegetarian" };
      case (#non_vegetarian) { "non-vegetarian" };
    };
  };

  // ── Sanitize AI response: replace unsafe words with safe alternatives ─────
  // Handles lower-case occurrences; capitalised forms are handled by the
  // system prompt rules enforced upstream.
  public func sanitizeAIResponse(text : Text) : Text {
    UNSAFE_WORD_REPLACEMENTS.foldLeft(text, func(acc : Text, pair : (Text, Text)) : Text {
      let (unsafe, safe) = pair;
      acc.replace(#text unsafe, safe);
    });
  };

  // ── Detect health keywords in a message ───────────────────────────────────
  public func hasHealthKeyword(msg : Text) : Bool {
    let lower = msg.toLower();
    HEALTH_KEYWORDS.any(func(kw : Text) : Bool = lower.contains(#text kw));
  };

  // ── Internal HTTP outcall to Gemini ──────────────────────────────────────
  func doGeminiRequest(jsonBody : Text) : async { #ok : Text; #err : Text } {
    let ic : actor {
      http_request : shared {
        url : Text;
        max_response_bytes : ?Nat64;
        method : { #get; #head; #post };
        headers : [{ name : Text; value : Text }];
        body : ?Blob;
        transform : ?{
          function : shared query {
            response : {
              status : Nat;
              headers : [{ name : Text; value : Text }];
              body : Blob;
            };
            context : Blob;
          } -> async {
            status : Nat;
            headers : [{ name : Text; value : Text }];
            body : Blob;
          };
          context : Blob;
        };
        is_replicated : ?Bool;
      } -> async {
        status : Nat;
        headers : [{ name : Text; value : Text }];
        body : Blob;
      };
    } = actor ("aaaaa-aa");

    let url = GEMINI_URL # GEMINI_API_KEY;
    let bodyBlob = jsonBody.encodeUtf8();

    let response = await (with cycles = 20_000_000_000) ic.http_request({
      url;
      max_response_bytes = ?16384;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
      ];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?false;
    });

    if (response.status < 200 or response.status >= 300) {
      return #err("Gemini API error, status: " # response.status.toText());
    };

    let responseText = switch (response.body.decodeUtf8()) {
      case (?t) { t };
      case null { return #err("Invalid UTF-8 in Gemini response") };
    };

    switch (parseJsonStringField(responseText, "text")) {
      case (?text) { #ok(text) };
      case null { #err("Could not parse text from Gemini response") };
    };
  };

  // ── HTTP outcall to Gemini (plain prompt, no system instruction) ──────────
  public func callGemini(prompt : Text) : async { #ok : Text; #err : Text } {
    let escapedPrompt = jsonEscape(prompt);
    let jsonBody = "{\"contents\":[{\"parts\":[{\"text\":\"" # escapedPrompt # "\"}]}]}";
    await doGeminiRequest(jsonBody);
  };

  // ── HTTP outcall to Gemini with system instruction ────────────────────────
  public func callGeminiWithSystem(systemPrompt : Text, userPrompt : Text) : async { #ok : Text; #err : Text } {
    let escapedSystem = jsonEscape(systemPrompt);
    let escapedUser   = jsonEscape(userPrompt);
    let jsonBody =
      "{" #
        "\"systemInstruction\":{\"parts\":[{\"text\":\"" # escapedSystem # "\"}]}," #
        "\"contents\":[{\"role\":\"user\",\"parts\":[{\"text\":\"" # escapedUser # "\"}]}]" #
      "}";
    await doGeminiRequest(jsonBody);
  };

  // ── Expose the system prompt for use in mixins ────────────────────────────
  public func getDietCoachSystemPrompt() : Text { DIET_COACH_SYSTEM_PROMPT };

  // ── Format nanoseconds timestamp as approximate UTC time string ──────────
  public func formatUtcTime(nowNs : Int) : Text {
    let ONE_HOUR_NS : Int = 3_600_000_000_000;
    let ONE_MIN_NS  : Int =    60_000_000_000;
    let ONE_DAY_NS  : Int = 86_400_000_000_000;
    let todayNs = nowNs % ONE_DAY_NS;
    let hours   = todayNs / ONE_HOUR_NS;
    let minutes = (todayNs % ONE_HOUR_NS) / ONE_MIN_NS;
    let hStr = if (hours   < 10) "0" # hours.toText()   else hours.toText();
    let mStr = if (minutes < 10) "0" # minutes.toText() else minutes.toText();
    hStr # ":" # mStr # " UTC";
  };

  func dietTypeText(dt : UserTypes.DietType) : Text {
    switch (dt) {
      case (#veg) { "veg (vegetarian — NO meat, chicken, egg, fish, seafood)" };
      case (#non_veg) { "non-veg" };
    };
  };

  // ── Energy level to text ──────────────────────────────────────────────────
  func energyText(level : FeedbackTypes.EnergyLevel) : Text {
    switch (level) {
      case (#low) { "low" };
      case (#medium) { "medium" };
      case (#high) { "high" };
    };
  };

  // ── Diet plan user context prompt ─────────────────────────────────────────
  public func generateDietPlanPrompt(
    user : UserTypes.UserPublic,
    date : Text,
    lifestyle_description : ?Text,
    recentFeedback : [FeedbackTypes.UserFeedback],
  ) : Text {
    let heightStr = switch (user.height) {
      case (?h) { h.toText() # " cm" };
      case null { "unknown" };
    };
    let weightStr = switch (user.weight) {
      case (?w) { w.toText() # " kg" };
      case null { "unknown" };
    };
    let currentTime = formatUtcTime(Time.now());

    // Build lifestyle section
    let lifestyleSection = switch (lifestyle_description) {
      case (?desc) {
        "\nUser Lifestyle & Preferences: " # desc #
        "\nIMPORTANT: Respect these habits. Include familiar foods mentioned. Avoid any foods or habits the user dislikes.\n";
      };
      case null { "" };
    };

    // Build recent feedback section
    let feedbackSection = if (recentFeedback.size() == 0) { "" } else {
      let feedbackLines = recentFeedback
        .map(func(fb : FeedbackTypes.UserFeedback) : Text {
          "- " # fb.date # ": Energy=" # energyText(fb.energy_level) #
          ", Health=" # fb.health_status #
          (if (fb.feedback_text.size() > 0) ", Feedback=\"" # fb.feedback_text # "\"" else "") #
          (if (fb.notes.size() > 0) ", Notes=\"" # fb.notes # "\"" else "");
        })
        .foldLeft("", func(acc : Text, line : Text) : Text {
          if (acc == "") line else acc # "\n" # line;
        });
      "\nRecent Feedback (last " # recentFeedback.size().toText() # " days):\n" # feedbackLines #
      "\nBased on feedback: adjust meal portions if energy was low (lighter meals), add recovery foods if pain or illness was mentioned. Make gradual changes only (no more than 20-30% change between days).\n";
    };

    "Generate a personalized daily meal plan for " # date # " (current time: " # currentTime # ").\n\n" #
    "User profile:\n" #
    "- Age: " # user.age.toText() # " years\n" #
    "- Height: " # heightStr # "\n" #
    "- Weight: " # weightStr # "\n" #
    "- Goal: " # goalText(user.goal) # "\n" #
    "- Activity level: " # activityText(user.activity_level) # "\n" #
    "- Dietary preference: " # dietText(user.dietary_preference) # "\n" #
    "- Diet type: " # dietTypeText(user.diet_type) # "\n" #
    lifestyleSection #
    feedbackSection #
    "\ntoday_progress: {\"meals_completed\": [], \"meals_skipped\": [], \"water_intake\": 0}\n" #
    "health_status: \"normal\"\n\n" #
    "IMPORTANT: Respond ONLY with valid JSON matching the exact schema. No markdown, no explanation.\n" #
    "Required fields: meals[].name, meals[].time, meals[].items[].food, meals[].items[].quantity, meals[].items[].calories, meals[].items[].protein, water_schedule[].time, water_schedule[].amount";
  };

  // ── Diet plan retry prompt (appended when first parse fails) ─────────────
  public func generateRetryPrompt(
    user : UserTypes.UserPublic,
    date : Text,
    lifestyle_description : ?Text,
    recentFeedback : [FeedbackTypes.UserFeedback],
  ) : Text {
    generateDietPlanPrompt(user, date, lifestyle_description, recentFeedback) #
    "\n\nIMPORTANT: Your previous response was not valid JSON. Respond ONLY with valid JSON matching the exact schema. No markdown, no explanation, no text before or after the JSON object.";
  };

  // ── Parse task type from title ─────────────────────────────────────────────
  func inferTaskType(title : Text) : DietTypes.JourneyTaskType {
    let lower = title.toLower();
    if (lower.contains(#text "water") or lower.contains(#text "drink")) {
      #water;
    } else {
      #meal;
    };
  };

  // ── Minimal JSON array extractor: find array content between [ and ] ───────
  func extractJsonArray(json : Text, fieldName : Text) : [Text] {
    let needle = "\"" # fieldName # "\":[";
    let parts = json.split(#text needle);
    ignore parts.next();
    switch (parts.next()) {
      case null { [] };
      case (?after) {
        let closeParts = after.split(#char ']');
        switch (closeParts.next()) {
          case null { [] };
          case (?inner) {
            inner.split(#char ',')
              .map(func(item : Text) : Text {
                let trimmed = item.trim(#text " ").trim(#char '\u{22}');
                trimmed;
              })
              .filter(func(s : Text) : Bool = s.size() > 0)
              .toArray<Text>();
          };
        };
      };
    };
  };

  // ── Parse a single task object from JSON fragment (legacy tasks[] format) ──
  func parseTask(taskJson : Text, index : Nat) : DietTypes.JourneyTask {
    let title = switch (parseJsonStringField(taskJson, "title")) {
      case (?t) { t };
      case null { "Task " # index.toText() };
    };
    let description = switch (parseJsonStringField(taskJson, "description")) {
      case (?d) { d };
      case null { "" };
    };
    let time_label = switch (parseJsonStringField(taskJson, "time_label")) {
      case (?t) { t };
      case null { "" };
    };
    let quantity = switch (parseJsonStringField(taskJson, "quantity")) {
      case (?q) { q };
      case null { "" };
    };
    let food_items = extractJsonArray(taskJson, "food_items");
    {
      id = index + 1;
      title;
      name = title;
      description;
      time_label;
      time = time_label;
      task_type = inferTaskType(title);
      xp_reward = 10;
      food_items;
      quantity;
      calories = 0;
      protein = 0;
    };
  };

  // ── Validate and parse the new meals[] + water_schedule[] format ──────────
  // Returns null if the JSON is invalid or missing required fields
  public func parseNewFormatDietResponse(jsonText : Text, _userId : Principal) : ?[DietTypes.JourneyTask] {
    if (not jsonText.contains(#text "\"meals\":[")) {
      return null;
    };

    let mealsParts = jsonText.split(#text "\"meals\":[");
    ignore mealsParts.next();
    let mealsContent = switch (mealsParts.next()) {
      case null { return null };
      case (?c) { c };
    };

    let outerClose = mealsContent.split(#char ']');
    let mealsInner = switch (outerClose.next()) {
      case null { return null };
      case (?inner) { inner };
    };

    if (mealsInner.size() == 0) {
      return null;
    };

    let taskList = List.empty<DietTypes.JourneyTask>();
    var idx : Nat = 0;
    var validMealCount : Nat = 0;

    let mealFragments = mealsInner.split(#text "},{");
    mealFragments.forEach(func(mealJson : Text) {
      let name = switch (parseJsonStringField(mealJson, "name")) {
        case (?n) { n };
        case null { return };
      };
      let mealTime = switch (parseJsonStringField(mealJson, "time")) {
        case (?t) { t };
        case null { "" };
      };

      let (totalCals, totalProt, foodItems) : (Nat, Nat, [Text]) = do {
        let itemsParts = mealJson.split(#text "\"items\":[");
        ignore itemsParts.next();
        switch (itemsParts.next()) {
          case null { (0, 0, []) };
          case (?itemsAfter) {
            let itemsClose = itemsAfter.split(#char ']');
            let itemsInner = switch (itemsClose.next()) {
              case null { "" };
              case (?i) { i };
            };
            let foods = List.empty<Text>();
            var cals : Nat = 0;
            var prot : Nat = 0;
            itemsInner.split(#text "},{").forEach(func(itemJson : Text) {
              // Validate required item fields: food, quantity, calories, protein
              let food = switch (parseJsonStringField(itemJson, "food")) {
                case (?f) { f };
                case null { return };
              };
              let qty = switch (parseJsonStringField(itemJson, "quantity")) {
                case (?q) { q };
                case null { return };
              };
              let itemCals = parseJsonNatField(itemJson, "calories");
              let itemProt = parseJsonNatField(itemJson, "protein");
              // Require at least one of calories or protein to be valid
              if (food.size() == 0 or qty.size() == 0) { return };
              cals += itemCals;
              prot += itemProt;
              let foodLabel = food # " (" # qty # ")";
              foods.add(foodLabel);
            });
            (cals, prot, foods.toArray());
          };
        };
      };

      if (foodItems.size() == 0) {
        return;
      };

      idx += 1;
      validMealCount += 1;
      let quantityText = if (totalCals > 0) "approx " # totalCals.toText() # " kcal" else "";
      let description = foodItems.foldLeft("", func(acc : Text, s : Text) : Text {
        if (acc == "") s else acc # ", " # s;
      });

      taskList.add({
        id = idx;
        title = name;
        name;
        description;
        time_label = mealTime;
        time = mealTime;
        task_type = #meal;
        xp_reward = 10;
        food_items = foodItems;
        quantity = quantityText;
        calories = totalCals;
        protein = totalProt;
      });
    });

    // Require at least one valid meal with food items
    if (validMealCount == 0) {
      return null;
    };

    // Parse water_schedule if present — validate time and amount fields
    if (jsonText.contains(#text "\"water_schedule\":[")) {
      let waterParts = jsonText.split(#text "\"water_schedule\":[");
      ignore waterParts.next();
      switch (waterParts.next()) {
        case null {};
        case (?waterAfter) {
          let waterClose = waterAfter.split(#char ']');
          switch (waterClose.next()) {
            case null {};
            case (?waterInner) {
              if (waterInner.size() > 0) {
                waterInner.split(#text "},{").forEach(func(wJson : Text) {
                  let wTime = switch (parseJsonStringField(wJson, "time")) {
                    case (?t) { t };
                    case null { return };
                  };
                  let amount = switch (parseJsonStringField(wJson, "amount")) {
                    case (?a) { a };
                    case null { return };
                  };
                  if (wTime.size() == 0 or amount.size() == 0) { return };
                  idx += 1;
                  taskList.add({
                    id = idx;
                    title = "Drink Water";
                    name = "Drink Water";
                    description = "Stay hydrated — " # amount;
                    time_label = wTime;
                    time = wTime;
                    task_type = #water;
                    xp_reward = 10;
                    food_items = ["Water (" # amount # ")"];
                    quantity = amount;
                    calories = 0;
                    protein = 0;
                  });
                });
              };
            };
          };
        };
      };
    };

    ?taskList.toArray();
  };

  // ── Non-veg keyword list ──────────────────────────────────────────────────
  let NON_VEG_KEYWORDS : [Text] = [
    "chicken", "egg", "fish", "mutton", "prawn", "shrimp",
    "beef", "pork", "lamb", "meat", "tuna", "salmon",
  ];

  // ── Check if a food string contains non-veg keywords (case-insensitive) ──
  func containsNonVeg(food : Text) : Bool {
    let lower = food.toLower();
    NON_VEG_KEYWORDS.any(func(kw : Text) : Bool = lower.contains(#text kw));
  };

  // ── Replace a removed non-veg item description with a veg alternative ────
  func vegAlternative(food : Text) : Text {
    let lower = food.toLower();
    // Protein-rich items → paneer or tofu
    if (lower.contains(#text "chicken") or lower.contains(#text "mutton")
        or lower.contains(#text "beef") or lower.contains(#text "pork")
        or lower.contains(#text "lamb") or lower.contains(#text "meat")) {
      "Paneer (100g)";
    } else if (lower.contains(#text "fish") or lower.contains(#text "tuna")
               or lower.contains(#text "salmon") or lower.contains(#text "prawn")
               or lower.contains(#text "shrimp")) {
      "Tofu (100g)";
    } else if (lower.contains(#text "egg")) {
      "Paneer bhurji (1 serving)";
    } else {
      "Dal (1 bowl)";
    };
  };

  // ── Filter non-veg items from a task's food_items list ───────────────────
  func filterTaskFoodItems(task : DietTypes.JourneyTask) : (DietTypes.JourneyTask, Nat) {
    if (task.task_type == #water) { return (task, 0) };
    var removedCount : Nat = 0;
    let filtered = task.food_items.map(func(item : Text) : Text {
      if (containsNonVeg(item)) {
        removedCount += 1;
        vegAlternative(item);
      } else {
        item;
      };
    });
    let filteredTask : DietTypes.JourneyTask = { task with food_items = filtered };
    (filteredTask, removedCount);
  };

  // ── Filter non-veg items from all tasks when diet_type == #veg ───────────
  // Returns (filteredTasks, totalRemovedCount)
  public func filterVegMeals(
    tasks : [DietTypes.JourneyTask],
    dietType : UserTypes.DietType,
  ) : ([DietTypes.JourneyTask], Nat) {
    if (dietType != #veg) { return (tasks, 0) };
    var totalRemoved : Nat = 0;
    let filtered = tasks.map(func(task : DietTypes.JourneyTask) : DietTypes.JourneyTask {
      let (filteredTask, removed) = filterTaskFoodItems(task);
      totalRemoved += removed;
      filteredTask;
    });
    (filtered, totalRemoved);
  };

  // ── Build veg-enforcement prompt for regeneration ─────────────────────────
  public func vegEnforcementPrompt() : Text {
    "CRITICAL: User is vegetarian. NEVER include chicken, egg, fish, mutton, prawn, shrimp, beef, pork, lamb, meat, tuna, or salmon in ANY meal. Only use: paneer, tofu, dal, lentils, chickpeas, vegetables, dairy products, nuts, seeds, rice, roti, oats. Regenerate the entire plan strictly following this rule. Respond ONLY with valid JSON matching the required schema.";
  };

  // ── Parse Gemini diet response into DailyJourney ──────────────────────────
  // Tries new format (meals[] + water_schedule[]) first, falls back to legacy tasks[] format
  // Applies veg filter when dietType == #veg
  public func parseGeminiDietResponse(jsonText : Text, userId : Principal, goal : ?CommonTypes.Goal) : DietTypes.DailyJourney {
    parseGeminiDietResponseWithDiet(jsonText, userId, goal, #non_veg);
  };

  // Full version with dietType for veg filtering
  public func parseGeminiDietResponseWithDiet(jsonText : Text, userId : Principal, goal : ?CommonTypes.Goal, dietType : UserTypes.DietType) : DietTypes.DailyJourney {
    let ONE_DAY_NS : Int = 86_400_000_000_000;
    let now = Time.now();
    let dayBucket = now / ONE_DAY_NS;
    let planId = userId.toText() # "#ai#" # dayBucket.toText();

    // Try new structured format first
    switch (parseNewFormatDietResponse(jsonText, userId)) {
      case (?rawTasks) {
        let (tasks, _removed) = filterVegMeals(rawTasks, dietType);
        {
          id = planId;
          tasks;
          total_xp = tasks.size() * 10;
          date = now;
          generated_by_ai = true;
        };
      };
      case null {
        // Fall back to legacy tasks[] format
        let needle = "\"tasks\":[";
        let parts = jsonText.split(#text needle);
        ignore parts.next();

        switch (parts.next()) {
          case null {
            DietLib.generateDailyPlan(goal);
          };
          case (?afterTasks) {
            let outerParts = afterTasks.split(#char ']');
            switch (outerParts.next()) {
              case null { DietLib.generateDailyPlan(goal) };
              case (?tasksContent) {
                let taskFragments = tasksContent.split(#text "},{");
                let rawList = taskFragments
                  .enumerate()
                  .map(func((i, fragment) : (Nat, Text)) : DietTypes.JourneyTask {
                    parseTask(fragment, i);
                  })
                  .toArray();

                if (rawList.size() == 0) {
                  DietLib.generateDailyPlan(goal);
                } else {
                  let (taskList, _removed) = filterVegMeals(rawList, dietType);
                  {
                    id = planId;
                    tasks = taskList;
                    total_xp = taskList.size() * 10;
                    date = now;
                    generated_by_ai = true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  // ── Chat user context prompt ──────────────────────────────────────────────
  public func buildChatPrompt(
    user : UserTypes.UserPublic,
    todayProgress : DietTypes.JourneyProgress,
    todayTasks : [DietTypes.JourneyTask],
    userMessage : Text,
    missedMeals : [DietTypes.MissedMealEntry],
    lifestyle_description : ?Text,
    recentFeedback : [FeedbackTypes.UserFeedback],
  ) : Text {
    let completedCount = todayProgress.completed_task_ids.size();
    let skippedCount   = missedMeals.size();
    let totalTasks = todayTasks.size();
    let currentTime = formatUtcTime(Time.now());

    let completedTitles = todayTasks
      .filter(func(t : DietTypes.JourneyTask) : Bool {
        todayProgress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id);
      })
      .map(func(t : DietTypes.JourneyTask) : Text { t.title });

    let missedList = if (missedMeals.size() > 0) {
      "Missed meals today: " # missedMeals
        .map(func(m : DietTypes.MissedMealEntry) : Text { m.meal_type # " (" # m.reason # ")" })
        .foldLeft("", func(acc : Text, s : Text) : Text {
          if (acc == "") s else acc # ", " # s;
        }) # ".\n";
    } else { "" };

    // Find next uncompleted meal task
    let nextMealOpt = todayTasks.find(func(t : DietTypes.JourneyTask) : Bool {
      t.task_type == #meal and
      not todayProgress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id);
    });
    let nextMealText = switch (nextMealOpt) {
      case (?m) { "Next scheduled meal: " # m.title # " at " # m.time_label # ".\n" };
      case null  { "No more meals scheduled today.\n" };
    };

    let todayTasksSummary = if (todayTasks.size() > 0) {
      "Today's plan:\n" # todayTasks
        .map(func(t : DietTypes.JourneyTask) : Text {
          let status = if (todayProgress.completed_task_ids.any(func(id : Nat) : Bool = id == t.id)) {
            "[done]"
          } else { "[pending]" };
          "  - " # t.title # " at " # t.time_label # " " # status;
        })
        .foldLeft("", func(acc : Text, s : Text) : Text {
          if (acc == "") s else acc # "\n" # s;
        }) # "\n";
    } else { "" };

    let isHealth = hasHealthKeyword(userMessage);
    let healthNote = if (isHealth) {
      "Note: User mentioned a health concern. Include disclaimer: '⚠️ Not medical advice — consult a healthcare professional.' at the end.\n\n";
    } else { "" };

    // Lifestyle section for chat
    let lifestyleNote = switch (lifestyle_description) {
      case (?desc) { "User lifestyle & preferences: " # desc # "\n" };
      case null { "" };
    };

    // Recent feedback summary for chat
    let feedbackNote = if (recentFeedback.size() == 0) { "" } else {
      let latestFb = recentFeedback[0];
      "Latest feedback: Energy=" # energyText(latestFb.energy_level) #
      ", Health=" # latestFb.health_status #
      (if (latestFb.notes.size() > 0) ", Note=\"" # latestFb.notes # "\"" else "") # ".\n";
    };

    healthNote #
    lifestyleNote #
    feedbackNote #
    "It is currently " # currentTime # ".\n" #
    "User profile:\n" #
    "- Goal: " # goalText(user.goal) # "\n" #
    "- Activity: " # activityText(user.activity_level) # "\n" #
    "- Diet: " # dietText(user.dietary_preference) # "\n" #
    "- Streak: " # todayProgress.streak_days.toText() # " days\n" #
    "- XP today: " # todayProgress.earned_xp.toText() # "\n\n" #
    "Today's progress: " # completedCount.toText() # "/" # totalTasks.toText() # " tasks completed, " # skippedCount.toText() # " skipped.\n" #
    (if (completedTitles.size() > 0) {
      "Completed: " # completedTitles.foldLeft("", func(acc : Text, s : Text) : Text {
        if (acc == "") s else acc # ", " # s;
      }) # ".\n";
    } else { "" }) #
    nextMealText #
    missedList #
    todayTasksSummary #
    "\nUser asks: " # userMessage;
  };

  // ── Parse chat response ───────────────────────────────────────────────────
  public func parseChatResponse(responseText : Text, userMessage : Text) : DietTypes.ChatResponse {
    let isHealth = hasHealthKeyword(userMessage);
    // Sanitize unsafe words from the AI response
    let sanitized = sanitizeAIResponse(responseText);
    // Append professional consultation disclaimer if not already present
    let disclaimerTag = "Consider consulting a qualified healthcare professional";
    let withDisclaimer = if (sanitized.contains(#text disclaimerTag)) {
      sanitized;
    } else {
      sanitized # SAFETY_DISCLAIMER;
    };
    {
      ai_message = withDisclaimer;
      is_health_response = isHealth;
    };
  };

  // ── Adjustment user context prompt ────────────────────────────────────────
  public func buildAdjustmentPrompt(
    user : UserTypes.UserPublic,
    missedMeal : DietTypes.MissedMealEntry,
    remainingTasks : [DietTypes.JourneyTask],
  ) : Text {
    let remainingMeals = remainingTasks.filter(func(t : DietTypes.JourneyTask) : Bool = t.task_type == #meal);

    let remainingDetails = remainingMeals
      .map(func(t : DietTypes.JourneyTask) : Text {
        let items = if (t.food_items.size() > 0) {
          " [" # t.food_items.foldLeft("", func(acc : Text, s : Text) : Text {
            if (acc == "") s else acc # ", " # s;
          }) # "]";
        } else { "" };
        t.title # " at " # t.time_label # items;
      })
      .foldLeft("", func(acc : Text, s : Text) : Text {
        if (acc == "") "  - " # s else acc # "\n  - " # s;
      });

    "The user missed their " # missedMeal.meal_type #
    " (reason: " # missedMeal.reason # ").\n\n" #
    "User goal: " # goalText(user.goal) # ".\n" #
    "Dietary preference: " # dietText(user.dietary_preference) # ".\n\n" #
    "Remaining meals for today:\n" # (if (remainingDetails.size() > 0) remainingDetails else "  (none)") # "\n\n" #
    "Suggest brief adjustments to compensate for the missed meal. " #
    "Focus on increasing protein or adjusting portions at the next meal. " #
    "Be concise and practical. Respond in 2-3 sentences max.";
  };
};
