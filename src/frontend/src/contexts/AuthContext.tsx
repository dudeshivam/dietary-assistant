import type { AuthState } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { createContext, useContext } from "react";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthState | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// ── Consumer hook ─────────────────────────────────────────────────────────────
export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}
