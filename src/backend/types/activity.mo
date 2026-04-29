import CommonTypes "common";
import DietTypes "diet";

module {
  public type UserActivity = {
    user_id : Principal;
    daily_calories : ?Nat;
    protein_intake : ?Float;
    water_intake : ?Float;
    meals_completed : ?Nat;
    meals_skipped : ?Nat;
    total_protein : ?Float;
    missed_meals : ?[DietTypes.MissedMealEntry];
    date : CommonTypes.Timestamp;
  };
};
