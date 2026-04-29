import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate } from "@tanstack/react-router";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional redirect path — defaults to /login */
  redirectTo?: string;
}

/** Timeout in ms before showing an error instead of spinning forever */
const INIT_TIMEOUT_MS = 5_000;

/**
 * ProtectedRoute — renders children when the user is authenticated.
 * Session is derived from localStorage token. Redirects unauthenticated
 * users to /login. Shows a loading state during initialization with a
 * 5-second timeout fallback.
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing } = useAuthContext();
  const [initTimedOut, setInitTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitializing) {
      timerRef.current = setTimeout(() => {
        setInitTimedOut(true);
      }, INIT_TIMEOUT_MS);
    } else {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setInitTimedOut(false);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInitializing]);

  if (isInitializing) {
    if (initTimedOut) {
      return (
        <div
          data-ocid="protected_route.error_state"
          className="min-h-screen flex items-center justify-center bg-background"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
            <p className="text-base font-semibold text-foreground">
              Taking longer than expected.
            </p>
            <p className="text-sm text-muted-foreground">
              Please refresh the page to try again.
            </p>
            <button
              type="button"
              data-ocid="protected_route.refresh_button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        data-ocid="protected_route.loading_state"
        className="min-h-screen flex items-center justify-center bg-background"
        aria-label="Verifying authentication"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="w-10 h-10 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground font-body">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}
