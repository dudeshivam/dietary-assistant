module {
  /// Per-day summary for the weekly balance report.
  public type DailyBalanceSummary = {
    date : Text;
    deductions_total : Float;
    rewards_total : Float;
    balance_end : Float;
  };

  /// 7-day rolling balance report for the authenticated user.
  public type WeeklyBalanceReport = {
    daily_summaries : [DailyBalanceSummary];
    week_net_change : Float;
    total_deduction_events : Nat;
    total_reward_events : Nat;
  };
};
