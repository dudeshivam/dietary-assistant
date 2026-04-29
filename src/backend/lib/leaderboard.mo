import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import UserTypes "../types/users";
import DietTypes "../types/diet";
import LeaderboardTypes "../types/leaderboard";

module {
  let ONE_DAY_NS : Int = 86_400_000_000_000;
  let SEVEN_DAYS_NS : Int = 604_800_000_000_000;

  // ── Gregorian date string from nanosecond timestamp ───────────────────────

  func _dateStr(ts : Int) : Text {
    let ONE_SEC_NS : Int = 1_000_000_000;
    let totalSecs = ts / ONE_SEC_NS;
    let totalDays : Int = totalSecs / 86_400;
    var z : Int = totalDays + 719468;
    let era : Int = (if (z >= 0) { z } else { z - 146096 }) / 146097;
    let doe : Int = z - era * 146097;
    let yoe : Int = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y : Int = yoe + era * 400;
    let doy : Int = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp : Int = (5 * doy + 2) / 153;
    let d : Int = doy - (153 * mp + 2) / 5 + 1;
    let m : Int = mp + (if (mp < 10) { 3 } else { -9 });
    let yr : Int = y + (if (m <= 2) { 1 } else { 0 });
    let mStr = if (m < 10) { "0" # m.toText() } else { m.toText() };
    let dStr = if (d < 10) { "0" # d.toText() } else { d.toText() };
    yr.toText() # "-" # mStr # "-" # dStr;
  };

  // ── Extract userId prefix from a progress store key "<userId>:<dateStr>" ─

  func _extractUserId(key : Text) : ?Text {
    let parts = key.split(#char ':');
    switch (parts.next()) {
      case (?uid) { ?uid };
      case null { null };
    };
  };

  // ── Display name: user.name if non-empty, else email prefix before '@' ───

  func _displayName(user : UserTypes.User) : Text {
    if (user.name.size() > 0) {
      user.name;
    } else {
      // Take everything before the first '@'
      let parts = user.email.split(#char '@');
      switch (parts.next()) {
        case (?prefix) { prefix };
        case null { user.email };
      };
    };
  };

  // ── Intermediate aggregate per user ──────────────────────────────────────

  type UserAggregate = {
    user_id_text : Text;
    streak_days : Nat;
    weekly_xp : Nat;
  };

  /// Aggregate journeyProgressStore to build streak + weekly XP per user,
  /// sort by streak_days DESC then weekly_xp DESC, and return the top `limit` entries
  /// plus the calling user's entry (with their real rank).
  public func buildLeaderboard(
    users : List.List<UserTypes.User>,
    journeyProgressStore : Map.Map<Text, DietTypes.JourneyProgress>,
    callerPrincipal : ?Text,
    limit : Nat,
  ) : LeaderboardTypes.StreakLeaderboard {
    let now = Time.now();
    let weekAgo : Int = now - SEVEN_DAYS_NS;

    // Aggregate per-user: collect max streak_days and sum weekly XP
    // We use an intermediate Map keyed by userId text
    let aggregateMap = Map.empty<Text, UserAggregate>();

    journeyProgressStore.forEach(func(key : Text, progress : DietTypes.JourneyProgress) {
      switch (_extractUserId(key)) {
        case null {};
        case (?uid) {
          let isInWeek = progress.date >= weekAgo;
          switch (aggregateMap.get(uid)) {
            case null {
              let weeklyXp : Nat = if (isInWeek) { progress.earned_xp } else { 0 };
              aggregateMap.add(uid, {
                user_id_text = uid;
                streak_days = progress.streak_days;
                weekly_xp = weeklyXp;
              });
            };
            case (?existing) {
              let newStreak = if (progress.streak_days > existing.streak_days) {
                progress.streak_days;
              } else {
                existing.streak_days;
              };
              let addXp : Nat = if (isInWeek) { progress.earned_xp } else { 0 };
              aggregateMap.add(uid, {
                user_id_text = uid;
                streak_days = newStreak;
                weekly_xp = existing.weekly_xp + addXp;
              });
            };
          };
        };
      };
    });

    // Convert to sorted array — streak_days DESC, weekly_xp DESC
    let aggregates : [UserAggregate] = aggregateMap.values().toArray().sort(
      func(a : UserAggregate, b : UserAggregate) : { #less; #equal; #greater } {
        if (a.streak_days > b.streak_days) { #less }
        else if (a.streak_days < b.streak_days) { #greater }
        else if (a.weekly_xp > b.weekly_xp) { #less }
        else if (a.weekly_xp < b.weekly_xp) { #greater }
        else { #equal };
      }
    );

    // Build ranked entries with display names
    var callerEntry : ?LeaderboardTypes.LeaderboardEntry = null;
    var topEntries : [LeaderboardTypes.LeaderboardEntry] = [];

    var rank : Nat = 0;
    for (agg in aggregates.values()) {
      rank += 1;
      let isCurrentUser = switch (callerPrincipal) {
        case null { false };
        case (?cp) { cp == agg.user_id_text };
      };

      // Look up display name
      let displayName : Text = switch (users.find(func(u : UserTypes.User) : Bool = u.id.toText() == agg.user_id_text)) {
        case (?u) { _displayName(u) };
        case null { agg.user_id_text };
      };

      let entry : LeaderboardTypes.LeaderboardEntry = {
        rank;
        display_name = displayName;
        streak_days = agg.streak_days;
        weekly_xp = agg.weekly_xp;
        is_current_user = isCurrentUser;
      };

      if (isCurrentUser) {
        callerEntry := ?entry;
      };

      if (rank <= limit) {
        topEntries := topEntries.concat([entry]);
      };
    };

    { top_entries = topEntries; current_user_entry = callerEntry };
  };
};
