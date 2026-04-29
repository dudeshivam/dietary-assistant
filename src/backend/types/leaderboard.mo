module {
  /// A single entry in the streak leaderboard.
  public type LeaderboardEntry = {
    rank : Nat;
    display_name : Text;
    streak_days : Nat;
    weekly_xp : Nat;
    is_current_user : Bool;
  };

  /// Full leaderboard response: top-N entries plus the caller's own entry
  /// (which may duplicate a top-N entry if the caller is already in the top N).
  public type StreakLeaderboard = {
    top_entries : [LeaderboardEntry];
    current_user_entry : ?LeaderboardEntry;
  };
};
