import List "mo:core/List";
import Map "mo:core/Map";
import UserTypes "../types/users";
import DietTypes "../types/diet";
import AuthTypes "../types/auth";
import LeaderboardTypes "../types/leaderboard";
import LeaderboardLib "../lib/leaderboard";
import AuthLib "../lib/auth";

mixin (
  users : List.List<UserTypes.User>,
  journeyProgressStore : Map.Map<Text, DietTypes.JourneyProgress>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {
  /// Returns the top-N users by streak_days (tiebreaker: weekly XP),
  /// plus the caller's own ranked entry even if outside the top N.
  public shared query func getStreakLeaderboard(
    sessionToken : Text,
    limit : Nat,
  ) : async { #ok : LeaderboardTypes.StreakLeaderboard; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let callerText = ?caller.toText();
        let leaderboard = LeaderboardLib.buildLeaderboard(
          users,
          journeyProgressStore,
          callerText,
          limit,
        );
        #ok(leaderboard);
      };
    };
  };
};
