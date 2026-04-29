import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Types "../types/activity";

module {
  /// Log an activity entry into both the List and the O(1) Map index.
  public func logActivity(
    activities : List.List<Types.UserActivity>,
    activityStore : Map.Map<Principal, Types.UserActivity>,
    entry : Types.UserActivity,
  ) {
    activities.add(entry);
    // Upsert into the fast-lookup map (last write wins for the day)
    activityStore.add(entry.user_id, entry);
  };

  /// Get the latest activity record for a user.  O(1) via Map, fallback to List.
  public func getUserActivity(
    activities : List.List<Types.UserActivity>,
    activityStore : Map.Map<Principal, Types.UserActivity>,
    user_id : Principal,
  ) : ?Types.UserActivity {
    switch (activityStore.get(user_id)) {
      case (?a) { ?a };
      case null {
        activities.find(func(a : Types.UserActivity) : Bool = a.user_id == user_id);
      };
    };
  };

  /// Return all activity records for a user (full history).
  public func getByUser(
    activities : List.List<Types.UserActivity>,
    user_id : Principal,
  ) : [Types.UserActivity] {
    let filtered = activities.filter(func(a : Types.UserActivity) : Bool { Principal.equal(a.user_id, user_id) });
    filtered.toArray();
  };

  /// Rebuild the activityStore Map from the full activity List (call after upgrade).
  public func rebuildStore(
    activities : List.List<Types.UserActivity>,
    activityStore : Map.Map<Principal, Types.UserActivity>,
  ) {
    activityStore.clear();
    activities.forEach(func(a : Types.UserActivity) {
      activityStore.add(a.user_id, a);
    });
  };

  public func countActiveUsers(
    activities : List.List<Types.UserActivity>,
    since : Int,
  ) : Nat {
    let activeSet = Set.empty<Principal>();
    activities.forEach<Types.UserActivity>(func(a) {
      if (a.date >= since) {
        activeSet.add(a.user_id);
      };
    });
    activeSet.size();
  };
};
