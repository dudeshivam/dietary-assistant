import CommonTypes "common";

module {
  public type JourneyTaskType = {
    #meal;
    #water;
  };

  public type MealStatus = {
    #pending;
    #completed;
    #skipped;
  };

  public type JourneyTask = {
    id : Nat;
    title : Text;
    name : Text;
    description : Text;
    time_label : Text;
    time : Text;
    task_type : JourneyTaskType;
    xp_reward : Nat;
    food_items : [Text];
    quantity : Text;
    calories : Nat;
    protein : Nat;
  };

  public type EditableMeal = {
    id : Nat;
    name : Text;
    time : Text;
    task_type : JourneyTaskType;
    food_items : [Text];
    quantity : Text;
    calories : Nat;
    protein : Nat;
  };

  public type EditMealPlanRequest = {
    meals : [EditableMeal];
  };

  public type DailyJourney = {
    id : Text;
    tasks : [JourneyTask];
    total_xp : Nat;
    date : CommonTypes.Timestamp;
    generated_by_ai : Bool;
  };

  public type JourneyProgress = {
    completed_task_ids : [Nat];
    earned_xp : Nat;
    streak_days : Nat;
    date : CommonTypes.Timestamp;
  };

  public type JourneyCompletionRequest = {
    task_id : Nat;
    date : CommonTypes.Timestamp;
  };

  public type EditMealRequest = {
    task_id : Text;
    food_items : [Text];
    quantity : Text;
  };

  public type MissedMealEntry = {
    meal_type : Text;
    reason : Text;
  };

  public type ChatMessage = {
    sender : { #user; #ai };
    content : Text;
    timestamp : Int;
  };

  public type ChatRequest = {
    user_message : Text;
  };

  public type ChatResponse = {
    ai_message : Text;
    is_health_response : Bool;
  };

  public type GeneratePlanResult = {
    #ok : DailyJourney;
    #tierLimited : Text;
    #error : Text;
  };

  public type ChatResult = {
    #ok : ChatResponse;
    #tierLimited : Text;
    #error : Text;
  };
};
