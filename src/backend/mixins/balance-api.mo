import List "mo:core/List";
import Map "mo:core/Map";
import BalanceTypes "../types/balance";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import AuthTypes "../types/auth";
import BalanceLib "../lib/balance";
import PaymentsLib "../lib/payments";
import AuthLib "../lib/auth";

mixin (
  users : List.List<UserTypes.User>,
  transactions : List.List<BalanceTypes.BalanceTransaction>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {

  /// Returns the authenticated user's current accountability balance.
  public shared query func getMyBalance(sessionToken : Text) : async { #ok : Float; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        switch (BalanceLib.getBalance(users, caller)) {
          case (?bal) { #ok(bal) };
          case null { #err("User not found") };
        };
      };
    };
  };

  /// Returns the authenticated user's transaction history (deductions, rewards, recharges).
  public shared query func getMyBalanceHistory(sessionToken : Text) : async { #ok : [BalanceTypes.BalanceTransaction]; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        #ok(BalanceLib.getHistory(transactions, caller));
      };
    };
  };

  /// Creates a Razorpay order to recharge the user's accountability balance.
  /// amountPaise: amount in paise (e.g. 100 = ₹1). Minimum 100 paise (₹1).
  /// Returns order details so the frontend can open the Razorpay checkout.
  public shared func rechargeBalance(sessionToken : Text, amountPaise : Nat) : async { #ok : PaymentTypes.CreateOrderResponse; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?_caller) {
        if (amountPaise < 100) {
          return #err("Minimum recharge amount is ₹1 (100 paise)");
        };
        let order = await PaymentsLib.createRazorpayOrder(amountPaise);
        #ok(order);
      };
    };
  };

  /// Verify recharge payment and credit balance.
  /// amountPaise: amount in paise (must match the order amount).
  public shared func verifyRechargePayment(
    sessionToken : Text,
    req : PaymentTypes.VerifyPaymentRequest,
    amountPaise : Nat,
  ) : async { #ok : Float; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let valid = PaymentsLib.verifySignature(req.order_id, req.payment_id, req.razorpay_signature);
        if (not valid) {
          return #err("Invalid payment signature — recharge verification failed");
        };
        // Convert paise to rupees for balance
        let amountRupees : Float = amountPaise.toFloat() / 100.0;
        switch (BalanceLib.recharge(users, transactions, caller, amountRupees)) {
          case (?newBalance) { #ok(newBalance) };
          case null { #err("User not found") };
        };
      };
    };
  };

  /// Process end-of-day accountability: deduct ₹1 per missed meal/water (unless valid reason given),
  /// and reward +₹0.5 for a fully completed day. Called by backend scheduler or frontend at day end.
  public shared func processDayEndAccountability(
    sessionToken : Text,
    mealsCompleted : Nat,
    mealsSkipped : Nat,
    waterCompleted : Bool,
    skippedWithReason : Bool,
  ) : async { #ok : Float; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        BalanceLib.processDayEnd(
          users,
          transactions,
          caller,
          mealsCompleted,
          mealsSkipped,
          waterCompleted,
          skippedWithReason,
        );
        switch (BalanceLib.getBalance(users, caller)) {
          case (?bal) { #ok(bal) };
          case null { #err("User not found") };
        };
      };
    };
  };
};
