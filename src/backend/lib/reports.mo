import List "mo:core/List";
import Time "mo:core/Time";
import BalanceTypes "../types/balance";
import ReportTypes "../types/reports";

module {
  let ONE_DAY_NS : Int = 86_400_000_000_000;
  let ONE_SEC_NS : Int = 1_000_000_000;

  // ── Gregorian date string from nanosecond timestamp ───────────────────────

  func _dateStr(ts : Int) : Text {
    let totalSecs = ts / ONE_SEC_NS;
    let totalDays : Int = totalSecs / 86_400;
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
    let mStr = if (m < 10) { "0" # m.toText() } else { m.toText() };
    let dStr = if (d < 10) { "0" # d.toText() } else { d.toText() };
    yr.toText() # "-" # mStr # "-" # dStr;
  };

  // ── Day bucket (integer days since epoch) from nanosecond timestamp ──────

  func _dayBucket(ts : Int) : Int {
    ts / ONE_DAY_NS;
  };

  /// Build a 7-day rolling balance report for `userId` from `balanceTransactions`.
  /// "Past 7 days" = today + the 6 days before it.
  public func buildWeeklyBalanceReport(
    transactions : List.List<BalanceTypes.BalanceTransaction>,
    userId : Principal,
  ) : ReportTypes.WeeklyBalanceReport {
    let now = Time.now();
    let todayBucket : Int = _dayBucket(now);

    // Filter to this user's transactions only, as an array (most-recent already in natural order)
    let userTxs = transactions
      .filter(func(tx : BalanceTypes.BalanceTransaction) : Bool = tx.user_id == userId)
      .toArray();

    // Build per-day summaries for today and the 6 preceding days (index 0 = 6 days ago, 6 = today)
    var totalDeductionEvents : Nat = 0;
    var totalRewardEvents : Nat = 0;
    var weekNetChange : Float = 0.0;
    var carryBalance : Float = 0.0;

    // Find the balance just before our 7-day window as the carry-forward starting point.
    // That's the balance_after of the last tx whose day bucket < todayBucket - 6.
    let windowStartBucket = todayBucket - 6;
    var latestPreWindowBalance : Float = 0.0;
    for (tx in userTxs.values()) {
      let txBucket = _dayBucket(tx.date);
      if (txBucket < windowStartBucket) {
        if (tx.balance_after > latestPreWindowBalance or latestPreWindowBalance == 0.0) {
          latestPreWindowBalance := tx.balance_after;
        };
      };
    };
    carryBalance := latestPreWindowBalance;

    var dailySummaries : [ReportTypes.DailyBalanceSummary] = [];

    // Walk day by day from 6 days ago to today
    var dayOffset : Int = 6;
    while (dayOffset >= 0) {
      let targetBucket = todayBucket - dayOffset;
      let dayTs = targetBucket * ONE_DAY_NS;
      let dateLabel = _dateStr(dayTs);

      var deductionsTotal : Float = 0.0;
      var rewardsTotal : Float = 0.0;
      var dayDeductionEvents : Nat = 0;
      var dayRewardEvents : Nat = 0;
      var lastBalanceInDay : ?Float = null;

      for (tx in userTxs.values()) {
        if (_dayBucket(tx.date) == targetBucket) {
          switch (tx.transaction_type) {
            case (#deduction) {
              // amount stored as positive; represent as absolute value
              deductionsTotal += if (tx.amount >= 0.0) { tx.amount } else { -tx.amount };
              dayDeductionEvents += 1;
              totalDeductionEvents += 1;
            };
            case (#reward) {
              rewardsTotal += tx.amount;
              dayRewardEvents += 1;
              totalRewardEvents += 1;
            };
            case (#recharge) {
              // recharges affect balance but are not deductions/rewards for the report
            };
          };
          lastBalanceInDay := ?tx.balance_after;
        };
      };

      let balanceEnd : Float = switch (lastBalanceInDay) {
        case (?b) {
          carryBalance := b;
          b;
        };
        case null { carryBalance };
      };

      weekNetChange += rewardsTotal - deductionsTotal;

      let summary : ReportTypes.DailyBalanceSummary = {
        date = dateLabel;
        deductions_total = deductionsTotal;
        rewards_total = rewardsTotal;
        balance_end = balanceEnd;
      };

      dailySummaries := dailySummaries.concat([summary]);
      dayOffset -= 1;
    };

    {
      daily_summaries = dailySummaries;
      week_net_change = weekNetChange;
      total_deduction_events = totalDeductionEvents;
      total_reward_events = totalRewardEvents;
    };
  };
};
