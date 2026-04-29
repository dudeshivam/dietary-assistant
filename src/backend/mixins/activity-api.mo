import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import ActivityTypes "../types/activity";
import AuthTypes "../types/auth";
import ActivityLib "../lib/activity";
import AuthLib "../lib/auth";

mixin (
  activities : List.List<ActivityTypes.UserActivity>,
  activityStore : Map.Map<Principal, ActivityTypes.UserActivity>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {
  public shared func logDailyActivity(sessionToken : Text, entry : ActivityTypes.UserActivity) : async { #ok; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        // Re-scope the entry to the authenticated caller to prevent spoofing
        let safeEntry : ActivityTypes.UserActivity = {
          entry with
          user_id = caller;
          date = Time.now();
        };
        ActivityLib.logActivity(activities, activityStore, safeEntry);
        #ok;
      };
    };
  };

  public shared query func getMyActivity(sessionToken : Text) : async { #ok : [ActivityTypes.UserActivity]; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        #ok(ActivityLib.getByUser(activities, caller));
      };
    };
  };

  public shared query func getMyLatestActivity(sessionToken : Text) : async { #ok : ?ActivityTypes.UserActivity; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        #ok(ActivityLib.getUserActivity(activities, activityStore, caller));
      };
    };
  };
};
