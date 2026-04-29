import Map "mo:core/Map";
import WaitlistTypes "../types/waitlist";
import WaitlistLib "../lib/waitlist";

mixin (waitlistEntries : Map.Map<Text, WaitlistTypes.WaitlistEntry>) {
  public shared func joinWaitlist(email : Text) : async { #ok; #alreadyExists } {
    WaitlistLib.join(waitlistEntries, email);
  };

  public shared query func getWaitlistCount() : async Nat {
    WaitlistLib.count(waitlistEntries);
  };
};
