import Debug "mo:core/Debug";

module {
  public type EnergyLevel = {
    #low;
    #medium;
    #high;
  };

  public type UserFeedback = {
    id : Nat;
    user_id : Principal;
    date : Text;
    feedback_text : Text;
    energy_level : EnergyLevel;
    health_status : Text;
    notes : Text;
    created_at : Int;
  };

  public type AddFeedbackRequest = {
    date : Text;
    feedback_text : Text;
    energy_level : EnergyLevel;
    health_status : Text;
    notes : Text;
  };

  public type FeedbackResult = {
    #ok : UserFeedback;
    #error : Text;
    #alreadySubmitted : UserFeedback;
  };
};
