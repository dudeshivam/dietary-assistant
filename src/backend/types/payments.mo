import CommonTypes "common";

module {
  public type Payment = {
    payment_id : Text;
    order_id : Text;
    user_id : Principal;
    amount : Nat;
    status : CommonTypes.PaymentStatus;
    plan : ?CommonTypes.SubscriptionPlan;
    date : CommonTypes.Timestamp;
  };

  public type CreateCheckoutRequest = {
    amount : Nat;
    currency : Text;
    description : Text;
  };

  public type WebhookPayload = {
    payment_id : Text;
    order_id : Text;
    user_id : Principal;
    amount : Nat;
    status : CommonTypes.PaymentStatus;
  };

  public type CreateOrderResponse = {
    order_id : Text;
    amount : Nat;
    currency : Text;
  };

  public type VerifyPaymentRequest = {
    payment_id : Text;
    order_id : Text;
    razorpay_signature : Text;
  };
};
