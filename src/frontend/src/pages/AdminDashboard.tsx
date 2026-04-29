import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAdminStats } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Crown,
  Leaf,
  LogOut,
  RefreshCw,
  ShieldOff,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  gradient = false,
  ocid,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient?: boolean;
  ocid: string;
}) {
  return (
    <div data-ocid={ocid} className="stat-card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            gradient ? "gradient-primary" : "bg-muted"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${gradient ? "text-white" : "text-primary"}`}
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="font-display font-bold text-3xl text-foreground">{value}</p>
    </div>
  );
}

// ── Skeleton stat card ────────────────────────────────────────────────────────
function StatCardSkeleton({ ocid }: { ocid: string }) {
  return (
    <div data-ocid={ocid} className="stat-card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      </div>
      <Skeleton className="h-9 w-20 rounded" />
    </div>
  );
}

// ── Admin Dashboard content ───────────────────────────────────────────────────
function AdminDashboardContent() {
  const { logout, principalId } = useAuthContext();
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminStats();

  // Frontend admin protection: if stats fetch errors, treat as access denied
  useEffect(() => {
    if (isError) {
      console.error(
        `[${new Date().toISOString()}] AdminDashboard: access denied — not an admin or backend error`,
      );
    }
  }, [isError]);

  // Auto-redirect non-admins after a short delay so the error message is visible
  useEffect(() => {
    if (!isError) return;
    const timer = setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [isError, navigate]);

  // Log success
  useEffect(() => {
    if (stats) {
      console.log(
        `[${new Date().toISOString()}] AdminDashboard: stats loaded`,
        {
          total_users: Number(stats.total_users),
          premium_users: Number(stats.premium_users),
          active_users: Number(stats.active_users),
          total_waitlist: Number(stats.total_waitlist),
        },
      );
    }
  }, [stats]);

  const statCards = [
    {
      label: "Total Users",
      value: Number(stats?.total_users ?? 0).toLocaleString(),
      icon: Users,
      gradient: true,
      ocid: "admin.total_users.card",
    },
    {
      label: "Waitlist Signups",
      value: Number(stats?.total_waitlist ?? 0).toLocaleString(),
      icon: Wallet,
      gradient: false,
      ocid: "admin.waitlist.card",
    },
    {
      label: "Premium Users",
      value: Number(stats?.premium_users ?? 0).toLocaleString(),
      icon: Crown,
      gradient: false,
      ocid: "admin.premium_users.card",
    },
    {
      label: "Active Users",
      value: Number(stats?.active_users ?? 0).toLocaleString(),
      icon: Activity,
      gradient: false,
      ocid: "admin.active_users.card",
    },
  ];

  const skeletonIds = [
    "admin.skel.total_users",
    "admin.skel.waitlist",
    "admin.skel.premium_users",
    "admin.skel.active_users",
  ];

  return (
    <div
      data-ocid="admin.page"
      className="min-h-screen bg-background flex flex-col"
    >
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border shadow-subtle sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow flex-shrink-0">
              <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-display font-bold text-base text-foreground truncate">
              AI Diet Coach
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Back to site */}
            <a
              data-ocid="admin.back_to_site.link"
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              aria-label="Back to site"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to site</span>
            </a>

            {/* Refresh */}
            <button
              data-ocid="admin.refresh_button"
              type="button"
              onClick={() => refetch()}
              disabled={isFetching || isError}
              aria-label="Refresh stats"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted transition-smooth disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-muted-foreground ${isFetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
            </button>

            {/* Sign out */}
            <button
              data-ocid="admin.logout_button"
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10">
        {/* ── Access denied (error = not admin) ────────────────────────────── */}
        {isError ? (
          <div
            data-ocid="admin.access_denied.error_state"
            className="flex flex-col items-center gap-5 py-24 text-center max-w-sm mx-auto"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl border border-destructive/30 bg-destructive/10">
              <ShieldOff
                className="w-8 h-8 text-destructive"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-foreground">
                Access Denied
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This page is restricted to administrators only. You will be
                redirected to your dashboard shortly.
              </p>
            </div>
            <button
              data-ocid="admin.go_to_dashboard_button"
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-smooth min-h-[44px]"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Page heading */}
            <div className="mb-8">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time platform metrics
                {principalId && (
                  <span className="font-mono ml-2 opacity-60 text-xs">
                    · {principalId.slice(0, 14)}…
                  </span>
                )}
              </p>
            </div>

            {/* ── Loading text indicator ────────────────────────────────────── */}
            {isLoading && (
              <div
                data-ocid="admin.loading_state"
                className="flex items-center gap-2 text-muted-foreground text-sm mb-6"
                aria-live="polite"
                aria-label="Loading stats"
              >
                <RefreshCw
                  className="w-4 h-4 animate-spin"
                  aria-hidden="true"
                />
                <span>Loading stats…</span>
              </div>
            )}

            {/* ── Stat cards grid ───────────────────────────────────────────── */}
            <div
              data-ocid="admin.stats.section"
              className="dashboard-grid mb-10"
            >
              {isLoading
                ? skeletonIds.map((id) => (
                    <StatCardSkeleton key={id} ocid={id} />
                  ))
                : statCards.map((s) => <StatCard key={s.ocid} {...s} />)}
            </div>

            {/* ── Conversion insight ────────────────────────────────────────── */}
            {!isLoading && stats && (
              <div
                data-ocid="admin.conversion.card"
                className="card-elevated rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-base text-foreground">
                      Premium Conversion Rate
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Percentage of total users on the Premium plan
                    </p>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="font-display font-bold text-4xl text-foreground">
                      {stats.total_users > 0
                        ? (
                            (Number(stats.premium_users) /
                              Number(stats.total_users)) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                    </span>
                    <span className="font-display font-bold text-2xl text-muted-foreground mb-1">
                      %
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-700"
                      style={{
                        width:
                          stats.total_users > 0
                            ? `${Math.min(
                                100,
                                (Number(stats.premium_users) /
                                  Number(stats.total_users)) *
                                  100,
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {Number(stats.premium_users).toLocaleString()} premium
                    </span>
                    <span>
                      {Number(stats.total_users).toLocaleString()} total users
                    </span>
                  </div>
                </div>

                {/* Additional stats row */}
                <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      Active Users
                    </p>
                    <p className="font-display font-bold text-xl text-foreground">
                      {Number(stats.active_users).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                      Waitlist
                    </p>
                    <p className="font-display font-bold text-xl text-foreground">
                      {Number(stats.total_waitlist).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Error state (generic, non-access-denied) ──────────────────── */}
            {!isLoading && !stats && !isError && (
              <div
                data-ocid="admin.error_state"
                className="card-elevated rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border-destructive/30 bg-destructive/5"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 flex-shrink-0">
                  <AlertCircle
                    className="w-5 h-5 text-destructive"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    Failed to load statistics
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    An error occurred while fetching metrics from the backend.
                  </p>
                </div>
                <button
                  data-ocid="admin.error_retry_button"
                  type="button"
                  onClick={() => refetch()}
                  className="button-secondary text-sm px-4 py-2 rounded-lg flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-muted/40 border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Export (wrapped in ProtectedRoute) ────────────────────────────────────────
export function AdminDashboard() {
  return (
    <ProtectedRoute redirectTo="/login">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
