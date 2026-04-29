module {
  public type Timestamp = Int;

  public type SubscriptionPlan = {
    #free;
    #premium;
  };

  /// Lifecycle status for a user's subscription (trial → free or premium)
  public type PlanStatus = {
    #trial;
    #free;
    #premium;
  };

  public type Goal = {
    #fat_loss;
    #muscle_gain;
    #lifestyle_balance;
  };

  public type PaymentStatus = {
    #pending;
    #success;
    #failed;
    #refunded;
  };

  public type ActivityLevel = {
    #sedentary;
    #light;
    #moderate;
    #intense;
  };

  public type DietaryPreference = {
    #vegetarian;
    #non_vegetarian;
  };
};
