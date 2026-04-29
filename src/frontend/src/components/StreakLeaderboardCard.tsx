import { useStreakLeaderboard } from "@/hooks/useBackend";
import type { LeaderboardEntry } from "@/types";

// ── Medal helpers ──────────────────────────────────────────────────────────────
function rankMedal(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

// ── Leaderboard row ────────────────────────────────────────────────────────────
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
}

function LeaderboardRow({ entry, position }: LeaderboardRowProps) {
  const medal = rankMedal(entry.rank);
  const isTop3 = entry.rank <= 3;

  return (
    <li
      data-ocid={`leaderboard.item.${position}`}
      className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-smooth ${
        entry.is_current_user
          ? "border"
          : "border border-transparent hover:border-white/10"
      }`}
      style={
        entry.is_current_user
          ? {
              background: "oklch(0.55 0.22 280 / 0.12)",
              borderColor: "oklch(0.55 0.22 280 / 0.30)",
            }
          : {
              background: isTop3 ? "oklch(0.16 0.02 260 / 0.5)" : "transparent",
            }
      }
      aria-current={entry.is_current_user ? "true" : undefined}
    >
      {/* Rank */}
      <span
        className={`text-base shrink-0 w-8 text-center font-bold ${
          isTop3 ? "text-xl" : "text-white/50"
        }`}
        aria-label={`Rank ${entry.rank}`}
      >
        {medal}
      </span>

      {/* Name + You badge */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-sm font-semibold truncate ${
            entry.is_current_user ? "text-white" : "text-white/80"
          }`}
        >
          {entry.display_name}
        </span>
        {entry.is_current_user && (
          <span
            data-ocid="leaderboard.you_badge"
            className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: "oklch(0.55 0.22 280 / 0.25)",
              color: "oklch(0.75 0.22 280)",
              border: "1px solid oklch(0.55 0.22 280 / 0.40)",
            }}
          >
            You
          </span>
        )}
      </div>

      {/* Streak */}
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${
            entry.is_current_user
              ? ""
              : entry.streak_days >= 7
                ? ""
                : "text-white/70"
          }`}
          style={
            entry.is_current_user || entry.streak_days >= 7
              ? { color: "oklch(0.75 0.18 50)" }
              : undefined
          }
        >
          🔥 {entry.streak_days}d
        </p>
        <p className="text-[10px] text-white/35 mt-0.5">
          {entry.weekly_xp.toLocaleString()} XP
        </p>
      </div>
    </li>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div
      data-ocid="leaderboard.loading_state"
      className="rounded-2xl border border-white/10 overflow-hidden animate-pulse"
      style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
    >
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-white/[8%]">
        <div className="w-9 h-9 rounded-xl bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        {(["a", "b", "c", "d", "e"] as const).map((k) => (
          <div key={k} className="h-12 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface StreakLeaderboardCardProps {
  limit?: number;
}

export function StreakLeaderboardCard({
  limit = 10,
}: StreakLeaderboardCardProps) {
  const { data: leaderboard, isLoading } = useStreakLeaderboard(limit);

  if (isLoading) return <LoadingSkeleton />;

  const topEntries = leaderboard?.top_entries ?? [];
  const currentUserEntry = leaderboard?.current_user_entry;
  const isCurrentUserInTop = topEntries.some((e) => e.is_current_user);

  // Show user at bottom only if they're outside the top list
  const showCurrentUserSeparate = currentUserEntry && !isCurrentUserInTop;

  return (
    <div
      data-ocid="leaderboard.card"
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
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <p className="font-display font-bold text-base text-white leading-tight">
            Streak Leaderboard
          </p>
          <p className="text-xs text-white/45 mt-0.5">Top Streaks This Week</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {topEntries.length === 0 ? (
          <div
            data-ocid="leaderboard.empty_state"
            className="flex flex-col items-center gap-2 py-8 text-center"
          >
            <span className="text-3xl" aria-hidden="true">
              🏅
            </span>
            <p className="text-sm text-white/40">No leaderboard data yet</p>
            <p className="text-xs text-white/25">
              Keep your streak alive to appear here
            </p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 pb-2 mb-1">
              <span className="w-8 shrink-0" />
              <span className="flex-1 text-[10px] font-semibold text-white/35 uppercase tracking-wider">
                Name
              </span>
              <span className="text-[10px] font-semibold text-white/35 uppercase tracking-wider text-right">
                Streak / XP
              </span>
            </div>

            {/* Top entries list */}
            <ol
              data-ocid="leaderboard.list"
              className="space-y-1"
              aria-label="Streak leaderboard"
            >
              {topEntries.map((entry, idx) => (
                <LeaderboardRow
                  key={`${entry.rank}-${entry.display_name}`}
                  entry={entry}
                  position={idx + 1}
                />
              ))}
            </ol>

            {/* Current user outside top 10 */}
            {showCurrentUserSeparate && (
              <>
                {/* Separator */}
                <div
                  className="flex items-center gap-3 py-2 px-4 my-1"
                  aria-hidden="true"
                >
                  <div className="flex-1 border-t border-dashed border-white/15" />
                  <span className="text-xs text-white/30 font-mono">···</span>
                  <div className="flex-1 border-t border-dashed border-white/15" />
                </div>

                {/* User's own entry */}
                <ol aria-label="Your position">
                  <LeaderboardRow
                    entry={currentUserEntry}
                    position={currentUserEntry.rank}
                  />
                </ol>
              </>
            )}
          </>
        )}

        {/* Motivational footer */}
        <p className="mt-4 text-center text-xs text-white/25">
          Complete today's meals to grow your streak 🔥
        </p>
      </div>
    </div>
  );
}
