import List "mo:core/List";
import Map "mo:core/Map";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import BalanceTypes "../types/balance";
import AuthTypes "../types/auth";
import PaymentsLib "../lib/payments";
import UsersLib "../lib/users";
import BalanceLib "../lib/balance";
import AuthLib "../lib/auth";

mixin (
  payments : List.List<PaymentTypes.Payment>,
  users : List.List<UserTypes.User>,
  sessions : Map.Map<Text, AuthTypes.Session>,
  balanceTransactions : List.List<BalanceTypes.BalanceTransaction>,
) {
  /// Returns payments made by the authenticated user.
  public shared query func getMyPayments(sessionToken : Text) : async { #ok : [PaymentTypes.Payment]; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        #ok(PaymentsLib.getByUser(payments, caller));
      };
    };
  };

  /// Creates a Razorpay order for the Premium plan (₹99 = 9900 paise).
  public shared func createRazorpayOrder(sessionToken : Text) : async { #ok : PaymentTypes.CreateOrderResponse; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?_caller) {
        let order = await PaymentsLib.createRazorpayOrder(9900);
        #ok(order);
      };
    };
  };

  /// Verifies Razorpay payment signature, upgrades caller to Premium,
  /// sets plan_status to #premium, adds 10% subscription bonus to balance,
  /// and records the payment.
  public shared func verifyRazorpayPayment(
    sessionToken : Text,
    req : PaymentTypes.VerifyPaymentRequest,
  ) : async { #ok : Bool; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?caller) {
        let valid = PaymentsLib.verifySignature(req.order_id, req.payment_id, req.razorpay_signature);
        if (not valid) {
          return #err("Invalid payment signature — payment verification failed");
        };
        let payload : PaymentTypes.WebhookPayload = {
          payment_id = req.payment_id;
          order_id = req.order_id;
          user_id = caller;
          amount = 9900;
          status = #success;
        };
        ignore PaymentsLib.record(payments, payload, ?#premium);
        ignore UsersLib.setPlan(users, caller, #premium);
        // Set plan_status to #premium
        switch (users.find(func(u : UserTypes.User) : Bool = u.id == caller)) {
          case (?u) { u.plan_status := #premium };
          case null {};
        };
        // 10% of ₹99 = ₹9.9 subscription bonus
        ignore BalanceLib.reward(
          users,
          balanceTransactions,
          caller,
          9.9,
          "Subscription bonus: 10% of ₹99 payment",
        );
        #ok(true);
      };
    };
  };

  /// Webhook handler for external payment events (e.g. refunds). No auth required — verified via payload.
  public shared func handlePaymentWebhook(payload : PaymentTypes.WebhookPayload) : async Bool {
    let payment = PaymentsLib.record(payments, payload, null);
    if (PaymentsLib.isSuccessful(payment)) {
      ignore UsersLib.setPlan(users, payload.user_id, #premium);
      true;
    } else {
      false;
    };
  };
};
