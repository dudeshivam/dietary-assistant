import type { ActivityLevel, DietType, DietaryPreference, Goal } from "@/types";
import { getBackendActor } from "@/utils/actor";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Storage keys ──────────────────────────────────────────────────────────────
const SESSION_TOKEN_KEY = "da_session_token";
const SESSION_USER_KEY = "da_session_user";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  goal?: Goal;
  height?: number;
  weight?: number;
  age?: number;
  activity_level?: ActivityLevel;
  dietary_preference?: DietaryPreference;
  subscription_plan: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: SessionUser | null;
  sessionToken: string | null;
  /** For backwards-compat with pages that reference principalId */
  principalId: string | undefined;
  error: string | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  goal?: Goal;
  height?: number;
  weight?: number;
  age: number;
  activity_level: ActivityLevel;
  dietary_preference: DietaryPreference;
  diet_type?: DietType;
  lifestyle_description?: string;
}

// ── Error parser ──────────────────────────────────────────────────────────────
function parseAuthError(err: unknown, isRegister = false): string {
  const msg = err instanceof Error ? err.message : String(err);

  // Candid variant codes (exact match)
  if (/UserAlreadyExists|already_exists/i.test(msg)) {
    return "Email already registered. Please sign in instead.";
  }
  if (/InvalidCredentials|invalid_credentials/i.test(msg)) {
    return "Invalid email or password.";
  }
  if (/NotFound|not_found/i.test(msg)) {
    return "Account not found. Please register first.";
  }

  // Generic patterns
  if (/already.*registered|already.*exists|duplicate|email.*taken/i.test(msg)) {
    return "Email already registered. Please sign in instead.";
  }
  if (/invalid.*password|wrong.*password|incorrect.*password/i.test(msg)) {
    return "Invalid email or password.";
  }
  if (/user.*not.*found|no.*account|not.*registered/i.test(msg)) {
    return "Account not found. Please register first.";
  }
  if (/network|timeout|fetch|connection/i.test(msg)) {
    return "Network error. Check your connection and try again.";
  }
  if (/actor not ready/i.test(msg)) {
    return "Service not ready. Please wait a moment and try again.";
  }

  return isRegister
    ? "Registration failed. Please try again."
    : "Something went wrong. Please try again.";
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_TOKEN_KEY),
  );
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_USER_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const prevAuthRef = useRef<boolean | null>(null);

  // Track auth state changes silently (no console output)
  useEffect(() => {
    const isAuth = !!sessionToken && !!user;
    prevAuthRef.current = isAuth;
  }, [sessionToken, user]);

  const persistSession = useCallback((token: string, userData: SessionUser) => {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
    setSessionToken(token);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    setSessionToken(null);
    setUser(null);
  }, []);

  const mapRawUser = useCallback((raw: unknown): SessionUser => {
    const r = raw as Record<string, unknown>;
    return {
      id: String(r.id ?? ""),
      name: String(r.name ?? ""),
      email: String(r.email ?? ""),
      goal: r.goal as Goal | undefined,
      height: r.height as number | undefined,
      weight: r.weight as number | undefined,
      age: r.age !== undefined ? Number(r.age) : undefined,
      activity_level: r.activity_level as ActivityLevel | undefined,
      dietary_preference: r.dietary_preference as DietaryPreference | undefined,
      subscription_plan: String(r.subscription_plan ?? "free"),
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(undefined);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Login timed out. Please try again.")),
          5_000,
        );
      });

      try {
        const actor = await getBackendActor();

        const result = await Promise.race([
          actor.loginUser(email, password) as Promise<
            | {
                __kind__: "ok";
                ok: { session_token: string; user_id: unknown };
              }
            | { __kind__: "err"; err: string }
          >,
          timeoutPromise,
        ]);

        if (result.__kind__ === "err") {
          throw new Error(result.err);
        }

        const token = result.ok.session_token;

        // Fetch full profile using the session token
        const profileResult = await Promise.race([
          actor.getMyProfile(token) as Promise<
            { __kind__: "ok"; ok: unknown } | { __kind__: "err"; err: string }
          >,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Profile fetch timed out.")),
              5_000,
            ),
          ),
        ]);

        let rawUser: unknown;
        if (profileResult.__kind__ === "ok") {
          rawUser = profileResult.ok;
        } else {
          rawUser = {
            id: result.ok.user_id,
            name: email,
            email,
            subscription_plan: "free",
            created_at: BigInt(Date.now()) * BigInt(1_000_000),
          };
        }

        const userData = mapRawUser(rawUser);
        persistSession(token, userData);
      } catch (err) {
        const msg = parseAuthError(err, false);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [mapRawUser, persistSession],
  );

  const register = useCallback(
    async (req: RegisterRequest) => {
      setIsLoading(true);
      setError(undefined);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Registration timed out. Please try again.")),
          5_000,
        );
      });

      try {
        const actor = await getBackendActor();

        const backendReq = {
          name: req.name,
          email: req.email,
          password: req.password,
          goal: req.goal,
          height: req.height,
          weight: req.weight,
          age: BigInt(req.age),
          activity_level: req.activity_level,
          dietary_preference: req.dietary_preference,
          diet_type: req.diet_type,
          lifestyle_description: req.lifestyle_description,
        };

        const result = await Promise.race([
          actor.registerUser(backendReq) as Promise<
            | {
                __kind__: "ok";
                ok: { session_token: string; user_id: unknown };
              }
            | { __kind__: "err"; err: string }
          >,
          timeoutPromise,
        ]);

        if (result.__kind__ === "err") {
          throw new Error(result.err);
        }

        const token = result.ok.session_token;
        const profileResult = await Promise.race([
          actor.getMyProfile(token) as Promise<
            { __kind__: "ok"; ok: unknown } | { __kind__: "err"; err: string }
          >,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Profile fetch timed out.")),
              5_000,
            ),
          ),
        ]);

        let rawUser: unknown;
        if (profileResult.__kind__ === "ok") {
          rawUser = profileResult.ok;
        } else {
          rawUser = {
            id: result.ok.user_id,
            name: req.name,
            email: req.email,
            goal: req.goal,
            height: req.height,
            weight: req.weight,
            age: BigInt(req.age),
            activity_level: req.activity_level,
            dietary_preference: req.dietary_preference,
            subscription_plan: "free",
            created_at: BigInt(Date.now()) * BigInt(1_000_000),
          };
        }

        const userData = mapRawUser(rawUser);
        persistSession(token, userData);
      } catch (err) {
        const msg = parseAuthError(err, true);
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [mapRawUser, persistSession],
  );

  const logout = useCallback(async () => {
    try {
      if (sessionToken) {
        const actor = await Promise.race([
          getBackendActor(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 3_000),
          ),
        ]);
        await Promise.race([
          actor.logoutUser(sessionToken),
          new Promise<void>((resolve) => setTimeout(resolve, 3_000)),
        ]);
      }
    } catch {
      // Ignore backend logout errors — session is cleared locally regardless
    } finally {
      clearSession();
    }
  }, [sessionToken, clearSession]);

  const clearError = useCallback(() => setError(undefined), []);

  return {
    isAuthenticated: !!sessionToken && !!user,
    isInitializing: isLoading,
    user,
    sessionToken,
    principalId: user?.id || undefined,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
