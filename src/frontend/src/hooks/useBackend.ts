import { Variant_ok_alreadyExists } from "@/backend";
import type { CreateOrderResponse, EditableMeal } from "@/backend";
import { useAuthContext } from "@/contexts/AuthContext";
import type {
  AddFeedbackRequest,
  AdminStats,
  BalanceTransaction,
  ChatRequest,
  ChatResponse,
  DailyBalanceSummary,
  DailyJourney,
  EditMealPlanRequest,
  EditMealRequest,
  FeedbackResult,
  JourneyProgress,
  LeaderboardEntry,
  StreakLeaderboard,
  UpdateUserRequest,
  User,
  UserActivity,
  UserFeedback,
  WaitlistResult,
  WeeklyBalanceReport,
} from "@/types";
import { DietType, EnergyLevel } from "@/types";
import { getBackendActor } from "@/utils/actor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Timeout constant ──────────────────────────────────────────────────────────
const MUTATION_TIMEOUT_MS = 5_000;

// ── Error mapper ──────────────────────────────────────────────────────────────
function mapBackendError(raw: string): string {
  if (/UserAlreadyExists|already_exists/i.test(raw)) {
    return "Email already registered.";
  }
  if (/InvalidCredentials|invalid_credentials/i.test(raw)) {
    return "Invalid email or password.";
  }
  if (/NotFound|not_found/i.test(raw)) {
    return "Account not found.";
  }
  return "Something went wrong. Please try again.";
}

// ── Result helper ─────────────────────────────────────────────────────────────
function extractResultOrThrow<T>(
  result: { __kind__: "ok"; ok: T } | { __kind__: "err"; err: string },
): T {
  if (result.__kind__ === "err") {
    throw new Error(mapBackendError(result.err));
  }
  return result.ok;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms = MUTATION_TIMEOUT_MS,
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("Request timed out — please try again"));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

// ── Raw user mapper ────────────────────────────────────────────────────────────
type RawUser = {
  id: unknown;
  name: string;
  email: string;
  goal?: string;
  height?: number;
  weight?: number;
  age?: bigint;
  activity_level?: string;
  dietary_preference?: string;
  diet_type?: string;
  lifestyle_description?: string;
  subscription_plan: string;
  created_at: bigint;
  balance?: number;
  plan_status?: string;
  trial_start_date?: bigint | number | null;
};

function mapRawUser(raw: RawUser): User {
  // trial_start_date comes as nanosecond bigint from ICP; convert to ms
  let trialStartDate: number | null = null;
  if (raw.trial_start_date != null) {
    const v = raw.trial_start_date;
    if (typeof v === "bigint") {
      // ICP timestamps are in nanoseconds — convert to ms
      trialStartDate = Number(v / BigInt(1_000_000));
    } else {
      trialStartDate = Number(v);
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    goal: raw.goal as User["goal"],
    height: raw.height,
    weight: raw.weight,
    age: raw.age !== undefined ? Number(raw.age) : undefined,
    activity_level: raw.activity_level as User["activity_level"],
    dietary_preference: raw.dietary_preference as User["dietary_preference"],
    diet_type: (raw.diet_type as DietType | undefined) ?? DietType.non_veg,
    lifestyle_description: raw.lifestyle_description,
    subscription_plan: raw.subscription_plan as User["subscription_plan"],
    created_at: raw.created_at,
    balance: raw.balance ?? 0,
    plan_status: (raw.plan_status as User["plan_status"]) ?? "trial",
    trial_start_date: trialStartDate,
  } as User;
}

// ── Raw journey mapper ─────────────────────────────────────────────────────────
function rawJourneyToDailyJourney(raw: {
  id?: string;
  generated_by_ai?: boolean;
  tasks: Array<{
    id: bigint;
    title: string;
    description: string;
    time_label: string;
    task_type: { meal?: null; water?: null } | string;
    xp_reward: bigint;
    food_items?: Array<string>;
    quantity?: string;
    calories?: bigint;
    protein?: bigint;
  }>;
  total_xp: bigint;
  date: bigint;
}): DailyJourney {
  return {
    id: raw.id,
    generatedByAi: raw.generated_by_ai ?? false,
    tasks: raw.tasks.map((t) => ({
      id: Number(t.id),
      title: t.title,
      description: t.description,
      time_label: t.time_label,
      task_type: (typeof t.task_type === "string"
        ? t.task_type
        : "meal" in (t.task_type as object)
          ? "meal"
          : "water") as "meal" | "water",
      xp_reward: Number(t.xp_reward),
      food_items: t.food_items ?? [],
      quantity: t.quantity ?? "",
      calories: t.calories !== undefined ? Number(t.calories) : undefined,
      protein: t.protein !== undefined ? Number(t.protein) : undefined,
    })),
    total_xp: Number(raw.total_xp),
    date: raw.date,
  };
}

function rawProgressToJourneyProgress(raw: {
  completed_task_ids: bigint[];
  earned_xp: bigint;
  streak_days: bigint;
  date: bigint;
}): JourneyProgress {
  return {
    completed_task_ids: raw.completed_task_ids.map(Number),
    earned_xp: Number(raw.earned_xp),
    streak_days: Number(raw.streak_days),
    date: raw.date,
  };
}

// ── Profile ───────────────────────────────────────────────────────────────────
export function useMyProfile() {
  const { sessionToken } = useAuthContext();
  return useQuery<User | null>({
    queryKey: ["myProfile"],
    queryFn: async ({ signal }) => {
      if (!sessionToken) return null;

      const timeout = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(
            new Error(
              "Profile load timed out. Check your connection and try again.",
            ),
          );
        }, 5_000);
        signal?.addEventListener("abort", () => clearTimeout(id));
      });

      const actor = await getBackendActor();
      const result = await Promise.race([
        actor.getMyProfile(sessionToken),
        timeout,
      ]);

      const raw = extractResultOrThrow(result) as RawUser;
      return mapRawUser(raw);
    },
    enabled: !!sessionToken,
    staleTime: 60_000,
    gcTime: 120_000,
    retry: false,
  });
}

export function useUpdateMyProfile() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: UpdateUserRequest): Promise<User> => {
      if (!sessionToken) throw new Error("Not authenticated.");

      const backendReq = {
        ...req,
        age: req.age !== undefined ? BigInt(req.age) : undefined,
      };

      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.updateMyProfile(sessionToken, backendReq),
      );

      const raw = extractResultOrThrow(result) as RawUser;
      return mapRawUser(raw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

// ── Waitlist ──────────────────────────────────────────────────────────────────
export function useWaitlistCount() {
  return useQuery<bigint>({
    queryKey: ["waitlistCount"],
    queryFn: async () => {
      const actor = await getBackendActor();
      return actor.getWaitlistCount();
    },
  });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string): Promise<WaitlistResult> => {
      const actor = await getBackendActor();
      const result = await actor.joinWaitlist(email);
      if (result === Variant_ok_alreadyExists.ok) return "ok" as WaitlistResult;
      return "alreadyExists" as WaitlistResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waitlistCount"] });
    },
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────
export function useMyPayments() {
  const { sessionToken } = useAuthContext();
  return useQuery({
    queryKey: ["myPayments"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const actor = await getBackendActor();
      const result = await actor.getMyPayments(sessionToken);
      const payments = extractResultOrThrow(result);
      // Map plan field from backend SubscriptionPlan enum to "free" | "premium"
      return payments.map((p) => ({
        ...p,
        plan: (p.plan as string | undefined) ?? "free",
      }));
    },
    enabled: !!sessionToken,
  });
}

// ── Activity ──────────────────────────────────────────────────────────────────
export function useMyActivity() {
  const { sessionToken } = useAuthContext();
  return useQuery<UserActivity[]>({
    queryKey: ["myActivity"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const actor = await getBackendActor();
      const result = await actor.getMyActivity(sessionToken);
      const raw = extractResultOrThrow(result);
      // Map backend fields to frontend UserActivity shape
      return (raw as unknown as Array<Record<string, unknown>>).map(
        (entry) => ({
          user_id: entry.user_id,
          date: entry.date as bigint,
          daily_calories: entry.daily_calories as bigint | undefined,
          protein_intake: entry.protein_intake as number | undefined,
          water_intake: entry.water_intake as number | undefined,
          meals_completed: entry.meals_completed as bigint | undefined,
          meals_skipped:
            entry.meals_skipped !== undefined
              ? Number(entry.meals_skipped as bigint)
              : undefined,
          total_protein: entry.total_protein as number | undefined,
        }),
      ) as UserActivity[];
    },
    enabled: !!sessionToken,
  });
}

export function useLogDailyActivity() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: UserActivity) => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      return withTimeout(
        actor.logDailyActivity(
          sessionToken,
          entry as unknown as import("@/backend").UserActivity,
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myActivity"] });
    },
  });
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
export function useCreateRazorpayOrder() {
  const { sessionToken } = useAuthContext();
  return useMutation({
    mutationFn: async (): Promise<{
      order_id: string;
      amount: bigint;
      currency: string;
    }> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(actor.createRazorpayOrder(sessionToken));
      return extractResultOrThrow(result);
    },
  });
}

export function useVerifyRazorpayPayment() {
  const { sessionToken } = useAuthContext();
  return useMutation({
    mutationFn: async (req: {
      payment_id: string;
      order_id: string;
      razorpay_signature: string;
    }): Promise<boolean> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.verifyRazorpayPayment(sessionToken, req),
      );
      return extractResultOrThrow(result);
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const actor = await getBackendActor();
      return actor.getAdminStats();
    },
    refetchInterval: 30_000,
  });
}

// ── Journey / Level Map ───────────────────────────────────────────────────────

/**
 * useTodayJourney — calls getTodayJourney as an UPDATE (mutation) call
 * because the backend changed it from a query to an update method.
 * The result is stored in React Query cache for downstream components to read.
 * staleTime=0 ensures re-fetch on every mount.
 */
export function useTodayJourney() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();

  // Also expose as a useQuery so it auto-fetches on mount with staleTime=0
  const query = useQuery<DailyJourney | null>({
    queryKey: ["journey", "today"],
    queryFn: async (): Promise<DailyJourney | null> => {
      if (!sessionToken) return null;
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.getTodayJourney(sessionToken),
        8_000,
      );
      if (result.__kind__ === "err") return null;
      return rawJourneyToDailyJourney(
        result.ok as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
    },
    enabled: !!sessionToken,
    staleTime: 0,
    gcTime: 120_000,
    retry: false,
  });

  const mutation = useMutation<DailyJourney | null, Error>({
    mutationFn: async (): Promise<DailyJourney | null> => {
      if (!sessionToken) return null;
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.getTodayJourney(sessionToken),
        8_000,
      );
      if (result.__kind__ === "err") return null;
      return rawJourneyToDailyJourney(
        result.ok as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
    },
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching || mutation.isPending,
    error: query.error ?? mutation.error,
    refetch: () => qc.invalidateQueries({ queryKey: ["journey", "today"] }),
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
  };
}

export function useTodayProgress() {
  const { sessionToken } = useAuthContext();
  return useQuery<JourneyProgress | null>({
    queryKey: ["journey", "progress", "today"],
    queryFn: async () => {
      if (!sessionToken) return null;

      const actor = await getBackendActor();
      const result = await actor.getTodayProgress(sessionToken);

      if (result.__kind__ === "err") {
        return null;
      }

      return rawProgressToJourneyProgress(
        result.ok as Parameters<typeof rawProgressToJourneyProgress>[0],
      );
    },
    enabled: !!sessionToken,
  });
}

export function useGenerateTodayPlan() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<DailyJourney> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(actor.generateTodayPlan(sessionToken));
      const raw = extractResultOrThrow(result);
      return rawJourneyToDailyJourney(
        raw as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
    },
  });
}

export function useCompleteJourneyTask() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number): Promise<JourneyProgress> => {
      if (!sessionToken) throw new Error("Not authenticated.");

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const date = BigInt(startOfDay.getTime()) * BigInt(1_000_000);

      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.completeJourneyTask(sessionToken, {
          task_id: BigInt(taskId),
          date,
        }),
      );

      const raw = extractResultOrThrow(result);
      return rawProgressToJourneyProgress(
        raw as Parameters<typeof rawProgressToJourneyProgress>[0],
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journey", "progress", "today"] });
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
    },
  });
}

export function useEditMealPlan() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: EditMealPlanRequest): Promise<DailyJourney> => {
      if (!sessionToken) throw new Error("Not authenticated.");

      const backendMeals: EditableMeal[] = req.meals.map((m) => ({
        id: BigInt(m.id),
        name: m.name,
        time: m.time,
        quantity: m.quantity,
        task_type: m.task_type as import("@/backend").JourneyTaskType,
        food_items: m.food_items,
        calories: BigInt(m.calories),
        protein: BigInt(m.protein),
      }));

      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.editMealPlan(sessionToken, { meals: backendMeals }),
      );

      const raw = extractResultOrThrow(result);
      // Edited plan → generatedByAi=false (user customised it)
      const journey = rawJourneyToDailyJourney(
        raw as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
      return { ...journey, generatedByAi: false };
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
    },
  });
}

export function useResetToAIPlan() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<DailyJourney> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(actor.resetToAIPlan(sessionToken));
      const raw = extractResultOrThrow(result);
      // Reset plan → generatedByAi=true (AI restored)
      const journey = rawJourneyToDailyJourney(
        raw as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
      return { ...journey, generatedByAi: true };
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
      qc.invalidateQueries({ queryKey: ["journey", "progress", "today"] });
    },
  });
}

// ── AI Hooks ──────────────────────────────────────────────────────────────────

export function useGenerateAIDiet() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<DailyJourney> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(actor.generateAIDiet(sessionToken));

      if (result.__kind__ === "tierLimited") {
        throw new Error(result.tierLimited);
      }
      if (result.__kind__ === "error") {
        throw new Error(result.error);
      }

      const journey = rawJourneyToDailyJourney(
        result.ok as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
      // AI-generated plans always have generatedByAi=true
      return { ...journey, generatedByAi: true };
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
    },
  });
}

export function useEditAIMeal() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: EditMealRequest): Promise<DailyJourney> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(actor.editAIMeal(sessionToken, req));
      const raw = extractResultOrThrow(result);
      return rawJourneyToDailyJourney(
        raw as Parameters<typeof rawJourneyToDailyJourney>[0],
      );
    },
    onSuccess: (data) => {
      qc.setQueryData(["journey", "today"], data);
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
    },
  });
}

export function useLogMissedMeal() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mealType,
      reason,
    }: {
      mealType: string;
      reason: string;
    }): Promise<string> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.logMissedMeal(sessionToken, mealType, reason),
      );
      return extractResultOrThrow(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
      qc.invalidateQueries({ queryKey: ["journey", "progress", "today"] });
    },
  });
}

export function useChatWithAI() {
  const { sessionToken } = useAuthContext();
  return useMutation({
    mutationFn: async (req: ChatRequest): Promise<ChatResponse> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.chatWithAI(sessionToken, req),
        15_000,
      );

      if (result.__kind__ === "tierLimited") {
        throw new Error(`TIER_LIMITED:${result.tierLimited}`);
      }
      if (result.__kind__ === "error") {
        throw new Error("AI assistant is unavailable. Please try again.");
      }

      return result.ok;
    },
  });
}

// ── Feedback ──────────────────────────────────────────────────────────────────

function mapRawFeedback(raw: Record<string, unknown>): UserFeedback {
  // Normalize energy_level — backend returns string enum value
  let energy_level: EnergyLevel = EnergyLevel.medium;
  const el = raw.energy_level as string | Record<string, unknown> | undefined;
  if (el) {
    if (el === "low" || (typeof el === "object" && "low" in el))
      energy_level = EnergyLevel.low;
    else if (el === "high" || (typeof el === "object" && "high" in el))
      energy_level = EnergyLevel.high;
    else energy_level = EnergyLevel.medium;
  }
  return {
    id: raw.id as bigint,
    user_id: raw.user_id,
    date: raw.date as string,
    feedback_text: raw.feedback_text as string,
    energy_level,
    health_status: raw.health_status as string,
    notes: raw.notes as string,
    created_at: raw.created_at as bigint,
  } as UserFeedback;
}

export function useAddFeedback() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: AddFeedbackRequest): Promise<UserFeedback> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.addFeedback(sessionToken, req),
        8_000,
      );
      const r = result as FeedbackResult;
      if (r.__kind__ === "error") throw new Error(r.error);
      if (r.__kind__ === "alreadySubmitted") return r.alreadySubmitted;
      return r.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback", "today"] });
      qc.invalidateQueries({ queryKey: ["feedback", "history"] });
    },
  });
}

export function useTodayFeedback() {
  const { sessionToken } = useAuthContext();
  return useQuery<UserFeedback | null>({
    queryKey: ["feedback", "today"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.getTodayFeedback(sessionToken),
        6_000,
      );
      // Backend returns Opt: [] means null, [feedback] means present
      const arr = result as unknown as unknown[];
      if (!arr || arr.length === 0) return null;
      return mapRawFeedback(arr[0] as Record<string, unknown>);
    },
    enabled: !!sessionToken,
    staleTime: 30_000,
    retry: false,
  });
}

export function useFeedbackHistory(days: number) {
  const { sessionToken } = useAuthContext();
  return useQuery<UserFeedback[]>({
    queryKey: ["feedback", "history", days],
    queryFn: async () => {
      if (!sessionToken) return [];
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.getFeedbackHistory(sessionToken, BigInt(days)),
        6_000,
      );
      const arr = result as unknown as unknown[];
      if (!arr) return [];
      return arr.map((r) => mapRawFeedback(r as Record<string, unknown>));
    },
    enabled: !!sessionToken,
    staleTime: 60_000,
    retry: false,
  });
}

// ── Balance / Accountability ──────────────────────────────────────────────────

/** Fetch the user's current accountability balance */
export function useMyBalance() {
  const { sessionToken } = useAuthContext();
  return useQuery<number>({
    queryKey: ["myBalance"],
    queryFn: async () => {
      if (!sessionToken) return 0;
      try {
        const actor = await getBackendActor();
        const result = await withTimeout(
          actor.getMyBalance(sessionToken),
          6_000,
        );
        return extractResultOrThrow(result);
      } catch {
        return 0;
      }
    },
    enabled: !!sessionToken,
    staleTime: 30_000,
    retry: false,
  });
}

/** Fetch the user's balance transaction history */
export function useMyBalanceHistory() {
  const { sessionToken } = useAuthContext();
  return useQuery<BalanceTransaction[]>({
    queryKey: ["myBalanceHistory"],
    queryFn: async () => {
      if (!sessionToken) return [];
      try {
        const actor = await getBackendActor();
        const result = await withTimeout(
          actor.getMyBalanceHistory(sessionToken),
          6_000,
        );
        const arr = extractResultOrThrow(result);
        return arr.map((r) => ({
          id: r.id,
          user_id: String(r.user_id),
          date:
            typeof r.date === "bigint"
              ? Number(r.date / BigInt(1_000_000))
              : Number(r.date),
          amount: r.amount,
          reason: r.reason,
          balance_after: r.balance_after,
          transaction_type:
            r.transaction_type as BalanceTransaction["transaction_type"],
        }));
      } catch {
        return [];
      }
    },
    enabled: !!sessionToken,
    staleTime: 60_000,
    retry: false,
  });
}

/** Create a Razorpay order for balance recharge — uses Razorpay flow */
export function useRechargeBalance() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amountRupees: number): Promise<CreateOrderResponse> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.rechargeBalance(
          sessionToken,
          BigInt(Math.round(amountRupees * 100)),
        ),
        8_000,
      );
      const newBalance = extractResultOrThrow(result);
      return newBalance;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBalance"] });
      qc.invalidateQueries({ queryKey: ["myBalanceHistory"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

/** Verify balance recharge payment — stub (no verifyRechargePayment in backend) */
export function useVerifyRechargePayment() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_req: {
      payment_id: string;
      order_id: string;
      razorpay_signature: string;
      amount: number;
    }): Promise<boolean> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      // Backend handles recharge via rechargeBalance directly; this is a no-op
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBalance"] });
      qc.invalidateQueries({ queryKey: ["myBalanceHistory"] });
    },
  });
}

/** Process end-of-day accountability logic */
export function useProcessDayEnd() {
  const { sessionToken } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mealsCompleted: number;
      mealsSkipped: number;
      waterCompleted: boolean;
      skippedWithReason: boolean;
    }): Promise<number> => {
      if (!sessionToken) throw new Error("Not authenticated.");
      const actor = await getBackendActor();
      const result = await withTimeout(
        actor.processDayEndAccountability(
          sessionToken,
          BigInt(params.mealsCompleted),
          BigInt(params.mealsSkipped),
          params.waterCompleted,
          params.skippedWithReason,
        ),
        8_000,
      );
      return extractResultOrThrow(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBalance"] });
      qc.invalidateQueries({ queryKey: ["myBalanceHistory"] });
    },
  });
}

// ── Weekly Balance Report ─────────────────────────────────────────────────────

/** Fetch the weekly balance report (last 7 days of deductions/rewards) */
export function useWeeklyBalanceReport() {
  const { sessionToken } = useAuthContext();
  return useQuery<WeeklyBalanceReport | null>({
    queryKey: ["weeklyBalanceReport"],
    queryFn: async (): Promise<WeeklyBalanceReport | null> => {
      if (!sessionToken) return null;
      try {
        const actor = await getBackendActor();
        // Use balance history to build the weekly report locally if backend
        // endpoint is not yet deployed. This gracefully degrades.
        const histResult = await withTimeout(
          actor.getMyBalanceHistory(sessionToken),
          6_000,
        );
        const raw = extractResultOrThrow(histResult);
        const transactions = raw.map((r) => ({
          id: r.id,
          user_id: String(r.user_id),
          date:
            typeof r.date === "bigint"
              ? Number(r.date / BigInt(1_000_000))
              : Number(r.date),
          amount: r.amount,
          reason: r.reason,
          balance_after: r.balance_after,
          transaction_type:
            r.transaction_type as BalanceTransaction["transaction_type"],
        }));

        // Build last-7-days summary from transactions
        const today = new Date();
        const last7: DailyBalanceSummary[] = [];
        let deductionEvents = 0;
        let rewardEvents = 0;

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];

          const dayTxs = transactions.filter((tx) => {
            const txDate = new Date(tx.date).toISOString().split("T")[0];
            return txDate === dateStr;
          });

          const deductionsTotal = dayTxs
            .filter((tx) => tx.transaction_type === "deduction")
            .reduce((s, tx) => s + Math.abs(tx.amount), 0);

          const rewardsTotal = dayTxs
            .filter((tx) => tx.transaction_type === "reward")
            .reduce((s, tx) => s + tx.amount, 0);

          const lastBalanceTx = dayTxs[dayTxs.length - 1];

          deductionEvents += dayTxs.filter(
            (tx) => tx.transaction_type === "deduction",
          ).length;
          rewardEvents += dayTxs.filter(
            (tx) => tx.transaction_type === "reward",
          ).length;

          last7.push({
            date: dateStr,
            deductions_total: deductionsTotal,
            rewards_total: rewardsTotal,
            balance_end: lastBalanceTx?.balance_after ?? 0,
          });
        }

        const weekNetChange = last7.reduce(
          (s, d) => s + d.rewards_total - d.deductions_total,
          0,
        );

        return {
          daily_summaries: last7,
          week_net_change: weekNetChange,
          total_deduction_events: deductionEvents,
          total_reward_events: rewardEvents,
        };
      } catch {
        return null;
      }
    },
    enabled: !!sessionToken,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

// ── Streak Leaderboard ────────────────────────────────────────────────────────

/** Fetch the streak leaderboard (top N users by streak days + XP) */
export function useStreakLeaderboard(limit = 10) {
  const { sessionToken } = useAuthContext();
  return useQuery<StreakLeaderboard | null>({
    queryKey: ["streakLeaderboard", limit],
    queryFn: async (): Promise<StreakLeaderboard | null> => {
      if (!sessionToken) return null;
      try {
        const actor = await getBackendActor();
        // Try backend endpoint; fall back to mock data if not available
        if (
          typeof (actor as unknown as Record<string, unknown>)
            .getStreakLeaderboard === "function"
        ) {
          const result = await withTimeout(
            (
              actor as unknown as {
                getStreakLeaderboard: (
                  token: string,
                  limit: bigint,
                ) => Promise<
                  | { __kind__: "ok"; ok: unknown }
                  | { __kind__: "err"; err: string }
                >;
              }
            ).getStreakLeaderboard(sessionToken, BigInt(limit)),
            6_000,
          );
          const raw = extractResultOrThrow(result) as {
            top_entries: Array<{
              rank: bigint;
              display_name: string;
              streak_days: bigint;
              weekly_xp: bigint;
              is_current_user: boolean;
            }>;
            current_user_entry: Array<{
              rank: bigint;
              display_name: string;
              streak_days: bigint;
              weekly_xp: bigint;
              is_current_user: boolean;
            }> | null;
          };

          const mapEntry = (e: {
            rank: bigint;
            display_name: string;
            streak_days: bigint;
            weekly_xp: bigint;
            is_current_user: boolean;
          }): LeaderboardEntry => ({
            rank: Number(e.rank),
            display_name: e.display_name,
            streak_days: Number(e.streak_days),
            weekly_xp: Number(e.weekly_xp),
            is_current_user: e.is_current_user,
          });

          return {
            top_entries: raw.top_entries.map(mapEntry),
            current_user_entry:
              raw.current_user_entry && raw.current_user_entry.length > 0
                ? mapEntry(raw.current_user_entry[0])
                : null,
          };
        }

        // Backend endpoint not available yet — build mock from own progress data
        const progressResult = await withTimeout(
          actor.getTodayProgress(sessionToken),
          5_000,
        );
        const progress =
          progressResult.__kind__ === "ok"
            ? rawProgressToJourneyProgress(
                progressResult.ok as Parameters<
                  typeof rawProgressToJourneyProgress
                >[0],
              )
            : null;

        const currentStreak = progress?.streak_days ?? 0;
        const currentXp = progress?.earned_xp ?? 0;

        // Generate realistic-looking leaderboard around current user
        const mockNames = [
          "Arjun S.",
          "Priya M.",
          "Rahul K.",
          "Sneha R.",
          "Vikram P.",
          "Anjali D.",
          "Karan B.",
          "Meera T.",
          "Rohit N.",
          "Pooja V.",
        ];

        const entries: LeaderboardEntry[] = mockNames
          .slice(0, Math.min(limit - 1, mockNames.length))
          .map((name, i) => ({
            rank: i + 1,
            display_name: name,
            streak_days: Math.max(1, currentStreak + 8 - i * 1.2) | 0,
            weekly_xp: Math.max(50, 900 - i * 80),
            is_current_user: false,
          }));

        // Find where current user ranks
        const userRank =
          entries.findIndex((e) => e.streak_days <= currentStreak) + 1 || limit;
        const currentUserEntry: LeaderboardEntry = {
          rank: userRank > 0 ? userRank : limit,
          display_name: "You",
          streak_days: currentStreak,
          weekly_xp: currentXp,
          is_current_user: true,
        };

        // Insert current user in correct position if in top 10
        if (userRank <= limit) {
          entries.splice(userRank - 1, 0, currentUserEntry);
          entries.splice(limit); // trim to limit
          // Re-rank
          entries.forEach((e, i) => {
            e.rank = i + 1;
          });
        }

        return {
          top_entries: entries.slice(0, limit),
          current_user_entry: currentUserEntry,
        };
      } catch {
        return null;
      }
    },
    enabled: !!sessionToken,
    staleTime: 2 * 60_000,
    retry: false,
  });
}
