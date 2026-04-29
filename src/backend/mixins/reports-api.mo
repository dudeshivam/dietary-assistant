import List "mo:core/List";
import Map "mo:core/Map";
import UserTypes "../types/users";
import BalanceTypes "../types/balance";
import AuthTypes "../types/auth";
import ReportTypes "../types/reports";
import ReportsLib "../lib/reports";
import AuthLib "../lib/auth";

mixin (
  users : List.List<UserTypes.User>,
  balanceTransactions : List.List<BalanceTypes.BalanceTransaction>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {
  /// Returns a 7-day rolling balance report for the authenticated user,
  /// with per-day deduction/reward totals and ending balance.
  public shared query func getWeeklyBalanceReport(
    sessionToken : Text,
  ) : async { #ok : ReportTypes.WeeklyBalanceReport; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let report = ReportsLib.buildWeeklyBalanceReport(balanceTransactions, caller);
        #ok(report);
      };
    };
  };
};
