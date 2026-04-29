import Map "mo:core/Map";
import Time "mo:core/Time";

import FeedbackTypes "../types/feedback";

module {

  // ── Key helpers ───────────────────────────────────────────────────────────

  /// Composite key: "<user_id>:<date>"
  public func storeKey(userId : Principal, date : Text) : Text {
    userId.toText() # ":" # date;
  };

  // ── Create or upsert a feedback entry ────────────────────────────────────

  /// Upsert feedback for (userId, req.date).
  /// On create, id = store.size() + 1 (stable unique ID without a separate counter).
  /// On update, preserves existing id and created_at.
  public func upsert(
    store : Map.Map<Text, FeedbackTypes.UserFeedback>,
    req : FeedbackTypes.AddFeedbackRequest,
    userId : Principal,
  ) : FeedbackTypes.UserFeedback {
    let key = storeKey(userId, req.date);
    switch (store.get(key)) {
      case (?existing) {
        // Update in place — preserve id and created_at
        let updated : FeedbackTypes.UserFeedback = {
          id = existing.id;
          user_id = userId;
          date = req.date;
          feedback_text = req.feedback_text;
          energy_level = req.energy_level;
          health_status = req.health_status;
          notes = req.notes;
          created_at = existing.created_at;
        };
        store.add(key, updated);
        updated;
      };
      case null {
        let newId = store.size() + 1;
        let feedback : FeedbackTypes.UserFeedback = {
          id = newId;
          user_id = userId;
          date = req.date;
          feedback_text = req.feedback_text;
          energy_level = req.energy_level;
          health_status = req.health_status;
          notes = req.notes;
          created_at = Time.now();
        };
        store.add(key, feedback);
        feedback;
      };
    };
  };

  // ── Get by user + date ────────────────────────────────────────────────────

  public func getByUserDate(
    store : Map.Map<Text, FeedbackTypes.UserFeedback>,
    userId : Principal,
    date : Text,
  ) : ?FeedbackTypes.UserFeedback {
    store.get(storeKey(userId, date));
  };

  // ── List last N days for a user, newest-first ─────────────────────────────

  /// Returns feedback entries for the user within the last `days` days,
  /// sorted newest-first by created_at.
  public func listByUserRange(
    store : Map.Map<Text, FeedbackTypes.UserFeedback>,
    userId : Principal,
    days : Nat,
  ) : [FeedbackTypes.UserFeedback] {
    let ONE_DAY_NS : Int = 86_400_000_000_000;
    let now = Time.now();
    let cutoff : Int = now - (days.toInt() * ONE_DAY_NS);

    let results : [FeedbackTypes.UserFeedback] = store.entries()
      .filter(func((_, fb) : (Text, FeedbackTypes.UserFeedback)) : Bool {
        fb.user_id == userId and fb.created_at >= cutoff
      })
      .map(func((_, fb) : (Text, FeedbackTypes.UserFeedback)) : FeedbackTypes.UserFeedback { fb })
      .toArray();

    // Sort newest-first by created_at
    results.sort(func(a : FeedbackTypes.UserFeedback, b : FeedbackTypes.UserFeedback) : { #less; #equal; #greater } {
      if (a.created_at > b.created_at) { #less }
      else if (a.created_at < b.created_at) { #greater }
      else { #equal };
    });
  };
};
