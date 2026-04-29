import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/balance";
import UserTypes "../types/users";

module {

  // ── Helper: find user in list ─────────────────────────────────────────────

  func _findUser(users : List.List<UserTypes.User>, userId : Principal) : ?UserTypes.User {
    users.find(func(u : UserTypes.User) : Bool = u.id == userId);
  };

  // ── Unique transaction ID ─────────────────────────────────────────────────

  /// Generates a unique transaction ID from userId + timestamp.
  public func newTxId(userId : Principal, timestamp : Int) : Text {
    userId.toText() # "#tx#" # timestamp.toText();
  };

  // ── Deduct ────────────────────────────────────────────────────────────────

  /// Deduct amount from user balance; records a ledger entry.
  /// Returns the new balance, or null if the user was not found.
  public func deduct(
    users : List.List<UserTypes.User>,
    transactions : List.List<Types.BalanceTransaction>,
    userId : Principal,
    amount : Float,
    reason : Text,
  ) : ?Float {
    switch (_findUser(users, userId)) {
      case null { null };
      case (?u) {
        let newBalance = if (u.balance >= amount) { u.balance - amount } else { 0.0 };
        u.balance := newBalance;
        let now = Time.now();
        let tx : Types.BalanceTransaction = {
          id = newTxId(userId, now);
          user_id = userId;
          date = now;
          amount;
          reason;
          balance_after = newBalance;
          transaction_type = #deduction;
        };
        transactions.add(tx);
        ?newBalance;
      };
    };
  };

  // ── Reward ────────────────────────────────────────────────────────────────

  /// Add a reward to user balance (e.g. +₹0.5 for completing full day).
  /// Returns the new balance, or null if the user was not found.
  public func reward(
    users : List.List<UserTypes.User>,
    transactions : List.List<Types.BalanceTransaction>,
    userId : Principal,
    amount : Float,
    reason : Text,
  ) : ?Float {
    switch (_findUser(users, userId)) {
      case null { null };
      case (?u) {
        let newBalance = u.balance + amount;
        u.balance := newBalance;
        let now = Time.now();
        let tx : Types.BalanceTransaction = {
          id = newTxId(userId, now);
          user_id = userId;
          date = now;
          amount;
          reason;
          balance_after = newBalance;
          transaction_type = #reward;
        };
        transactions.add(tx);
        ?newBalance;
      };
    };
  };

  // ── Recharge ──────────────────────────────────────────────────────────────

  /// Top-up user balance (recharge flow when balance = 0).
  /// Returns the new balance, or null if the user was not found.
  public func recharge(
    users : List.List<UserTypes.User>,
    transactions : List.List<Types.BalanceTransaction>,
    userId : Principal,
    amount : Float,
  ) : ?Float {
    switch (_findUser(users, userId)) {
      case null { null };
      case (?u) {
        let newBalance = u.balance + amount;
        u.balance := newBalance;
        let now = Time.now();
        let tx : Types.BalanceTransaction = {
          id = newTxId(userId, now);
          user_id = userId;
          date = now;
          amount;
          reason = "Balance recharge";
          balance_after = newBalance;
          transaction_type = #recharge;
        };
        transactions.add(tx);
        ?newBalance;
      };
    };
  };

  // ── Get balance ───────────────────────────────────────────────────────────

  /// Returns the current balance for a user.
  public func getBalance(
    users : List.List<UserTypes.User>,
    userId : Principal,
  ) : ?Float {
    switch (_findUser(users, userId)) {
      case null { null };
      case (?u) { ?u.balance };
    };
  };

  // ── Get history ───────────────────────────────────────────────────────────

  /// Returns deduction/reward history for a user, most-recent first.
  public func getHistory(
    transactions : List.List<Types.BalanceTransaction>,
    userId : Principal,
  ) : [Types.BalanceTransaction] {
    transactions
      .filter(func(tx : Types.BalanceTransaction) : Bool = tx.user_id == userId)
      .reverse()
      .toArray();
  };

  // ── Process day-end accountability ───────────────────────────────────────

  /// Called daily: checks whether the user completed all meals/water.
  /// If a meal was skipped without a valid reason, triggers a ₹1 deduction.
  /// If all tasks complete, grants +₹0.5 reward.
  public func processDayEnd(
    users : List.List<UserTypes.User>,
    transactions : List.List<Types.BalanceTransaction>,
    userId : Principal,
    mealsCompleted : Nat,
    mealsSkipped : Nat,
    waterCompleted : Bool,
    skippedWithReason : Bool,
  ) : () {
    if (mealsSkipped > 0 and not skippedWithReason) {
      ignore deduct(users, transactions, userId, 1.0, "Missed meal — stay consistent tomorrow 💪");
    };
    if (not waterCompleted and not skippedWithReason) {
      ignore deduct(users, transactions, userId, 1.0, "Missed water intake — stay hydrated tomorrow 💧");
    };
    if (mealsSkipped == 0 and waterCompleted) {
      ignore reward(users, transactions, userId, 0.5, "Full day completed! Great consistency 🌟");
    };
  };
};
