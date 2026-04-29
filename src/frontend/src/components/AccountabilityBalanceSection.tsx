import {
  useMyBalance,
  useMyBalanceHistory,
  useRechargeBalance,
} from "@/hooks/useBackend";
import type { BalanceTransaction } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { WeeklyBalanceReportCard } from "./WeeklyBalanceReportCard";

// ── Quick amount buttons ───────────────────────────────────────────────────
const QUICK_AMOUNTS = [1, 5, 10, 20, 50];

// ── Transaction row ────────────────────────────────────────────────────────
function TransactionRow({ tx }: { tx: BalanceTransaction }) {
  const isDeduction = tx.transaction_type === "deduction";
  const isReward = tx.transaction_type === "reward";

  const icon = isDeduction ? "📉" : isReward ? "🎁" : "💳";
  const amountColor = isDeduction ? "text-red-400" : "text-green-400";
  const sign = isDeduction ? "-" : "+";

  const dateStr = new Date(tx.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <li
      className="flex items-center gap-3 py-2.5 border-b last:border-b-0"
      style={{ borderColor: "oklch(0.30 0.01 260 / 0.3)" }}
    >
      <span className="text-base shrink-0 w-6 text-center" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">{tx.reason}</p>
        <p className="text-xs text-white/35 mt-0.5">{dateStr}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${amountColor}`}>
          {sign}₹{Math.abs(tx.amount).toFixed(2)}
        </p>
        <p className="text-[10px] text-white/30">
          bal: ₹{tx.balance_after.toFixed(2)}
        </p>
      </div>
    </li>
  );
}

// ── Recharge Modal ─────────────────────────────────────────────────────────
interface RechargeModalProps {
  onClose: () => void;
}

function RechargeModal({ onClose }: RechargeModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const rechargeBalance = useRechargeBalance();

  const finalAmount = useCustom ? Number(customAmount) || 0 : selectedAmount;

  const handleRecharge = async () => {
    if (finalAmount < 1) {
      toast.error("Minimum recharge is ₹1");
      return;
    }
    try {
      await rechargeBalance.mutateAsync(finalAmount);
      toast.success(`₹${finalAmount.toFixed(2)} added to your balance 🎉`, {
        duration: 5000,
      });
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Recharge failed. Please try again.";
      toast.error("Recharge failed", { description: msg });
    }
  };

  return (
    <div
      data-ocid="balance.recharge_dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{ background: "oklch(0.08 0.01 260 / 0.85)" }}
        onClick={onClose}
        aria-label="Close recharge modal"
        tabIndex={-1}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl fade-in"
        style={{
          background: "oklch(0.19 0.015 260 / 0.98)",
          border: "1px solid oklch(0.55 0.22 280 / 0.3)",
        }}
      >
        <div className="h-1 gradient-primary rounded-t-2xl absolute top-0 left-0 right-0" />

        <div className="flex items-center justify-between mt-1 mb-5">
          <h2 className="font-display font-bold text-lg text-white">
            💳 Recharge Balance
          </h2>
          <button
            data-ocid="balance.recharge_close_button"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-smooth"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-white/50 mb-4">
          Choose how much to add to your accountability balance
        </p>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              data-ocid={`balance.quick_amount_${amt}`}
              onClick={() => {
                setSelectedAmount(amt);
                setUseCustom(false);
              }}
              className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-smooth min-h-[40px] ${
                !useCustom && selectedAmount === amt
                  ? "border-primary/70 bg-primary/15 text-white"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
              }`}
            >
              ₹{amt}
            </button>
          ))}
          <button
            type="button"
            data-ocid="balance.custom_amount_toggle"
            onClick={() => setUseCustom(true)}
            className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-smooth min-h-[40px] ${
              useCustom
                ? "border-primary/70 bg-primary/15 text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom amount input */}
        {useCustom && (
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              ₹
            </span>
            <input
              data-ocid="balance.custom_amount_input"
              type="number"
              min={1}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/15 bg-white/5 text-foreground text-sm pl-7 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/25"
            />
          </div>
        )}

        {/* Summary */}
        <div
          className="rounded-xl border border-primary/20 px-4 py-3 mb-5 text-center"
          style={{ background: "oklch(0.16 0.025 280 / 0.4)" }}
        >
          <p className="text-xs text-white/50 mb-1">You'll add</p>
          <p className="font-display font-bold text-2xl text-gradient">
            ₹{finalAmount.toFixed(2)}
          </p>
        </div>

        <button
          data-ocid="balance.recharge_confirm_button"
          type="button"
          onClick={handleRecharge}
          disabled={rechargeBalance.isPending || finalAmount < 1}
          className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          aria-busy={rechargeBalance.isPending}
        >
          {rechargeBalance.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            `Add ₹${finalAmount.toFixed(2)} to Balance`
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
interface AccountabilityBalanceSectionProps {
  userEmail?: string;
}

export function AccountabilityBalanceSection({
  userEmail: _userEmail,
}: AccountabilityBalanceSectionProps) {
  const { data: balance = 0, isLoading: balanceLoading } = useMyBalance();
  const { data: history = [], isLoading: historyLoading } =
    useMyBalanceHistory();
  const [showRecharge, setShowRecharge] = useState(false);

  const last7Transactions = history.slice(0, 7);
  const isEmpty = balance === 0;

  return (
    <>
      <div
        data-ocid="balance.section"
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[8%]">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{ background: "oklch(0.55 0.22 280 / 0.15)" }}
            aria-hidden="true"
          >
            <span className="text-lg">⚖️</span>
          </div>
          <div>
            <p className="font-display font-bold text-base text-white leading-tight">
              Accountability Balance
            </p>
            <p className="text-xs text-white/45 mt-0.5">
              Stay consistent to keep your balance safe 💚
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Balance display */}
          {balanceLoading ? (
            <div className="h-12 w-32 rounded-xl bg-white/10 animate-pulse mb-4" />
          ) : (
            <div className="flex items-end gap-3 mb-5">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">
                  Current Balance
                </p>
                <p
                  data-ocid="balance.amount"
                  className={`font-display font-bold text-4xl leading-none ${
                    isEmpty
                      ? "text-red-400"
                      : balance < 5
                        ? "text-orange-400"
                        : "text-gradient"
                  }`}
                >
                  ₹{balance.toFixed(2)}
                </p>
              </div>
              <button
                data-ocid="balance.recharge_open_modal_button"
                type="button"
                onClick={() => setShowRecharge(true)}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-smooth shadow-glow min-h-[40px]"
              >
                💳 Recharge
              </button>
            </div>
          )}

          {/* Zero balance warning */}
          {isEmpty && !balanceLoading && (
            <div
              data-ocid="balance.empty_state"
              className="mb-5 rounded-xl border border-orange-500/30 px-4 py-3 flex items-start gap-3"
              style={{ background: "oklch(0.18 0.04 40 / 0.3)" }}
            >
              <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
                ⚠️
              </span>
              <div>
                <p className="text-sm font-semibold text-orange-300">
                  Balance at ₹0
                </p>
                <p className="text-xs text-orange-300/70 mt-0.5 leading-relaxed">
                  Add at least ₹1 to continue accountability tracking
                </p>
                <button
                  data-ocid="balance.add_funds_button"
                  type="button"
                  onClick={() => setShowRecharge(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs font-semibold hover:bg-orange-500/20 transition-smooth min-h-[36px]"
                >
                  💳 Recharge Balance
                </button>
              </div>
            </div>
          )}

          {/* Accountability rules */}
          <div
            className="mb-5 rounded-xl border border-white/10 px-4 py-3"
            style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
          >
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              How it works
            </p>
            <ul className="space-y-1.5">
              {[
                { emoji: "📉", text: "Skip a meal or water → ₹1 deducted" },
                { emoji: "🎁", text: "Complete full day → +₹0.5 reward" },
                {
                  emoji: "💡",
                  text: "No deduction if you give a valid reason",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-2 text-xs text-white/60"
                >
                  <span className="shrink-0" aria-hidden="true">
                    {item.emoji}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Transaction history */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Recent Activity
            </p>
            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : last7Transactions.length === 0 ? (
              <div
                data-ocid="balance.history_empty_state"
                className="text-center py-6"
              >
                <p className="text-2xl mb-2" aria-hidden="true">
                  📭
                </p>
                <p className="text-xs text-white/35">
                  No transactions yet. Stay consistent!
                </p>
              </div>
            ) : (
              <ul
                data-ocid="balance.history_list"
                aria-label="Balance transaction history"
              >
                {last7Transactions.map((tx, idx) => (
                  <TransactionRow key={tx.id || String(idx)} tx={tx} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRecharge && <RechargeModal onClose={() => setShowRecharge(false)} />}

      {/* Weekly Balance Report */}
      <WeeklyBalanceReportCard />
    </>
  );
}
