import { useWeeklyBalanceReport } from "@/hooks/useBackend";
import type { DailyBalanceSummary } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────
const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getDayAbbr(dateStr: string): string {
  const idx = new Date(`${dateStr}T12:00:00`).getDay();
  return DAY_ABBRS[idx];
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
}

// ── Bar column ─────────────────────────────────────────────────────────────────
interface BarColumnProps {
  summary: DailyBalanceSummary;
  maxValue: number;
  isToday: boolean;
}

function BarColumn({ summary, maxValue, isToday }: BarColumnProps) {
  const BAR_HEIGHT = 72; // px — max bar area
  const deductionH =
    maxValue > 0
      ? Math.round((summary.deductions_total / maxValue) * BAR_HEIGHT)
      : 0;
  const rewardH =
    maxValue > 0
      ? Math.round((summary.rewards_total / maxValue) * BAR_HEIGHT)
      : 0;
  const hasActivity = summary.deductions_total > 0 || summary.rewards_total > 0;
  const dayAbbr = getDayAbbr(summary.date);

  return (
    <li
      data-ocid={`weekly_balance.day.${summary.date}`}
      className="flex-1 flex flex-col items-center gap-1"
      title={
        hasActivity
          ? `${formatDate(summary.date)} — Deductions: ₹${summary.deductions_total.toFixed(2)}, Rewards: ₹${summary.rewards_total.toFixed(2)}`
          : `${formatDate(summary.date)} — No activity`
      }
    >
      {/* Bar area */}
      <div
        className="flex flex-col-reverse items-center gap-0.5 w-full"
        style={{ height: `${BAR_HEIGHT}px` }}
        aria-hidden="true"
      >
        {/* Deductions bar (red) */}
        {deductionH > 0 && (
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${deductionH}px`,
              background: "oklch(0.55 0.22 22 / 0.75)",
              minHeight: "3px",
            }}
          />
        )}
        {/* Rewards bar (green) */}
        {rewardH > 0 && (
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${rewardH}px`,
              background: "oklch(0.55 0.20 145 / 0.80)",
              minHeight: "3px",
            }}
          />
        )}
        {/* Empty placeholder */}
        {!hasActivity && (
          <div
            className="w-full rounded-sm"
            style={{
              height: "4px",
              background: "oklch(0.30 0.01 260 / 0.4)",
              alignSelf: "flex-end",
            }}
          />
        )}
      </div>

      {/* Day label */}
      <span
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          isToday ? "text-primary" : "text-white/40"
        }`}
      >
        {dayAbbr}
      </span>
    </li>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div
      data-ocid="weekly_balance_report.loading_state"
      className="rounded-2xl border border-white/10 overflow-hidden animate-pulse"
      style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
    >
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[8%]">
        <div className="w-9 h-9 rounded-xl bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-3 w-28 rounded bg-white/10" />
        </div>
      </div>
      <div className="px-6 py-5">
        <div
          className="flex gap-2 items-end justify-between"
          style={{ height: "88px" }}
        >
          {(["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const).map(
            (day) => (
              <div
                key={day}
                className="flex-1 flex flex-col-reverse items-center gap-1"
              >
                <div className="h-3 w-5 rounded bg-white/10" />
                <div
                  className="w-full rounded bg-white/10"
                  style={{ height: "30px" }}
                />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function WeeklyBalanceReportCard() {
  const { data: report, isLoading } = useWeeklyBalanceReport();

  if (isLoading) return <LoadingSkeleton />;

  const summaries = report?.daily_summaries ?? [];
  const today = new Date().toISOString().split("T")[0];

  // Compute max value for bar scaling
  const maxValue = summaries.reduce(
    (m, s) => Math.max(m, s.deductions_total, s.rewards_total),
    0,
  );

  const hasActivity = summaries.some(
    (s) => s.deductions_total > 0 || s.rewards_total > 0,
  );

  const netChange = report?.week_net_change ?? 0;
  const isPositive = netChange >= 0;

  // Compute week date range
  const startDate = summaries.length > 0 ? formatDate(summaries[0].date) : "";
  const endDate =
    summaries.length > 0
      ? formatDate(summaries[summaries.length - 1].date)
      : "";

  return (
    <div
      data-ocid="weekly_balance_report.card"
      className="rounded-2xl border border-white/10 overflow-hidden fade-in"
      style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[8%]">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: "oklch(0.55 0.22 280 / 0.15)" }}
          aria-hidden="true"
        >
          <span className="text-lg">📊</span>
        </div>
        <div>
          <p className="font-display font-bold text-base text-white leading-tight">
            Weekly Balance Report
          </p>
          <p className="text-xs text-white/45 mt-0.5">
            {startDate && endDate ? `${startDate} – ${endDate}` : "Last 7 days"}
          </p>
        </div>
      </div>

      <div className="px-6 py-5">
        {!hasActivity ? (
          <div
            data-ocid="weekly_balance_report.empty_state"
            className="flex flex-col items-center gap-2 py-6 text-center"
          >
            <span className="text-3xl" aria-hidden="true">
              📭
            </span>
            <p className="text-sm text-white/40">
              No balance activity this week
            </p>
            <p className="text-xs text-white/25">
              Complete or skip meals to see your accountability trend
            </p>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex gap-4 mb-4 justify-end">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "oklch(0.55 0.20 145 / 0.8)" }}
                  aria-hidden="true"
                />
                <span className="text-xs text-white/50">Rewards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "oklch(0.55 0.22 22 / 0.75)" }}
                  aria-hidden="true"
                />
                <span className="text-xs text-white/50">Deductions</span>
              </div>
            </div>

            {/* Bar chart */}
            <ul
              className="flex gap-2 items-end"
              aria-label="Weekly balance activity chart"
            >
              {summaries.map((s) => (
                <BarColumn
                  key={s.date}
                  summary={s}
                  maxValue={maxValue}
                  isToday={s.date === today}
                />
              ))}
            </ul>

            {/* Summary row */}
            <div className="mt-5 pt-4 border-t border-white/[8%] grid grid-cols-3 gap-3">
              {/* Net change */}
              <div
                data-ocid="weekly_balance_report.net_change"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 py-3 px-2"
                style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Net Change
                </p>
                <p
                  className="text-lg font-display font-bold leading-tight"
                  style={{
                    color: isPositive
                      ? "oklch(0.65 0.18 145)"
                      : "oklch(0.65 0.22 22)",
                  }}
                >
                  {isPositive ? "+" : ""}₹{Math.abs(netChange).toFixed(2)}
                </p>
              </div>

              {/* Deduction events */}
              <div
                data-ocid="weekly_balance_report.deduction_events"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 py-3 px-2"
                style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Deductions
                </p>
                <p
                  className="text-lg font-display font-bold leading-tight"
                  style={{ color: "oklch(0.65 0.22 22)" }}
                >
                  {report?.total_deduction_events ?? 0}
                </p>
              </div>

              {/* Reward events */}
              <div
                data-ocid="weekly_balance_report.reward_events"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 py-3 px-2"
                style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
              >
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Rewards
                </p>
                <p
                  className="text-lg font-display font-bold leading-tight"
                  style={{ color: "oklch(0.65 0.18 145)" }}
                >
                  {report?.total_reward_events ?? 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
