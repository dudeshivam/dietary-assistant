import CommonTypes "common";

module {
  // veg / non_veg diet type (distinct from DietaryPreference vegetarian/non_vegetarian)
  public type DietType = {
    #veg;
    #non_veg;
  };

  public type User = {
    id : Principal;
    var name : Text;
    var email : Text;
    var goal : ?CommonTypes.Goal;
    var height : ?Float;
    var weight : ?Float;
    var age : Nat;
    var activity_level : CommonTypes.ActivityLevel;
    var dietary_preference : CommonTypes.DietaryPreference;
    var diet_type : DietType;
    var lifestyle_description : ?Text;
    created_at : CommonTypes.Timestamp;
    var subscription_plan : CommonTypes.SubscriptionPlan;
    var plan_status : CommonTypes.PlanStatus;
    var trial_start_date : ?CommonTypes.Timestamp;
    var balance : Float;
  };

  public type UserPublic = {
    id : Principal;
    name : Text;
    email : Text;
    goal : ?CommonTypes.Goal;
    height : ?Float;
    weight : ?Float;
    age : Nat;
    activity_level : CommonTypes.ActivityLevel;
    dietary_preference : CommonTypes.DietaryPreference;
    diet_type : DietType;
    lifestyle_description : ?Text;
    created_at : CommonTypes.Timestamp;
    subscription_plan : CommonTypes.SubscriptionPlan;
    plan_status : CommonTypes.PlanStatus;
    trial_start_date : ?CommonTypes.Timestamp;
    balance : Float;
  };

  public type RegisterUserRequest = {
    name : Text;
    email : Text;
    password : Text;
    goal : ?CommonTypes.Goal;
    height : ?Float;
    weight : ?Float;
    age : Nat;
    activity_level : CommonTypes.ActivityLevel;
    dietary_preference : CommonTypes.DietaryPreference;
    diet_type : ?DietType;
    lifestyle_description : ?Text;
  };

  public type UpdateUserRequest = {
    name : ?Text;
    email : ?Text;
    goal : ?CommonTypes.Goal;
    height : ?Float;
    weight : ?Float;
    age : ?Nat;
    activity_level : ?CommonTypes.ActivityLevel;
    dietary_preference : ?CommonTypes.DietaryPreference;
    diet_type : ?DietType;
    lifestyle_description : ?Text;
    // System-only fields: updated by backend operations (subscription, balance)
    plan_status : ?CommonTypes.PlanStatus;
    balance : ?Float;
  };
};
