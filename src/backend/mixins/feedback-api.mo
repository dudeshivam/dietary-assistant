import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AuthTypes "../types/auth";
import FeedbackTypes "../types/feedback";
import FeedbackLib "../lib/feedback";
import AuthLib "../lib/auth";

mixin (
  feedbackStore : Map.Map<Text, FeedbackTypes.UserFeedback>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {
  /// Submit (or update) daily feedback for the authenticated user.
  /// Implements upsert: if feedback for the given date already exists, it is updated.
  public shared func addFeedback(sessionToken : Text, req : FeedbackTypes.AddFeedbackRequest) : async FeedbackTypes.FeedbackResult {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #error("Not authenticated — please sign in") };
      case (?caller) {
        let feedback = FeedbackLib.upsert(feedbackStore, req, caller);
        #ok(feedback);
      };
    };
  };

  /// Get today's feedback for the authenticated user, if already submitted.
  /// Uses the same YYYY-MM-DD date format that the frontend sends via addFeedback.
  public shared query func getTodayFeedback(sessionToken : Text) : async ?FeedbackTypes.UserFeedback {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { null };
      case (?caller) {
        // Compute today's YYYY-MM-DD string from the current nanosecond timestamp.
        // This must match the format the frontend sends as req.date in addFeedback.
        let ONE_SEC_NS : Int = 1_000_000_000;
        let totalSecs = Time.now() / ONE_SEC_NS;
        // Days since Unix epoch
        let totalDays : Int = totalSecs / 86_400;
        // Compute year, month, day via Gregorian calendar algorithm
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

        // Zero-pad month and day to 2 digits
        let mStr = if (m < 10) { "0" # m.toText() } else { m.toText() };
        let dStr = if (d < 10) { "0" # d.toText() } else { d.toText() };
        let todayDate = yr.toText() # "-" # mStr # "-" # dStr;

        FeedbackLib.getByUserDate(feedbackStore, caller, todayDate);
      };
    };
  };

  /// Get the last `days` days of feedback entries for the authenticated user,
  /// ordered newest-first.
  public shared query func getFeedbackHistory(sessionToken : Text, days : Nat) : async [FeedbackTypes.UserFeedback] {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { [] };
      case (?caller) {
        FeedbackLib.listByUserRange(feedbackStore, caller, days);
      };
    };
  };
};
