import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AdminTypes "../types/admin";
import UserTypes "../types/users";
import WaitlistTypes "../types/waitlist";
import ActivityTypes "../types/activity";
import UsersLib "../lib/users";
import WaitlistLib "../lib/waitlist";
import ActivityLib "../lib/activity";

mixin (
  users : List.List<UserTypes.User>,
  waitlistEntries : Map.Map<Text, WaitlistTypes.WaitlistEntry>,
  activities : List.List<ActivityTypes.UserActivity>,
) {
  public shared query ({ caller }) func getAdminStats() : async AdminTypes.AdminStats {
    if (not caller.isController()) {
      Runtime.trap("Admin access required");
    };
    // Active = had activity in last 7 days OR is premium
    let sevenDaysNs : Int = 7 * 24 * 60 * 60 * 1_000_000_000;
    let since : Int = Time.now() - sevenDaysNs;
    let activeCount : Nat = users.foldLeft(
      0,
      func(acc, u) {
        let isPremium = switch (u.subscription_plan) { case (#premium) true; case _ false };
        let hasRecentActivity = switch (
          activities.find(func(a : ActivityTypes.UserActivity) : Bool = a.user_id == u.id and a.date >= since)
        ) {
          case (?_) { true };
          case null { false };
        };
        if (isPremium or hasRecentActivity) { acc + 1 } else { acc };
      },
    );
    {
      total_users = UsersLib.count(users);
      total_waitlist = WaitlistLib.count(waitlistEntries);
      premium_users = UsersLib.countPremium(users);
      active_users = activeCount;
    };
  };
};
