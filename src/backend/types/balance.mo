import CommonTypes "common";

module {
  /// Type of balance transaction for the accountability system
  public type TransactionType = {
    #deduction;
    #reward;
    #recharge;
  };

  /// A single balance ledger entry linked to a user
  public type BalanceTransaction = {
    id : Text;
    user_id : Principal;
    date : CommonTypes.Timestamp;
    amount : Float;
    reason : Text;
    balance_after : Float;
    transaction_type : TransactionType;
  };
};
