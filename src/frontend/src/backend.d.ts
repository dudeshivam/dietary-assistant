import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegisterUserRequest {
    age: bigint;
    weight?: number;
    height?: number;
    lifestyle_description?: string;
    dietary_preference: DietaryPreference;
    goal?: Goal;
    password: string;
    name: string;
    email: string;
    activity_level: ActivityLevel;
    diet_type?: DietType;
}
export interface LeaderboardEntry {
    streak_days: bigint;
    is_current_user: boolean;
    rank: bigint;
    weekly_xp: bigint;
    display_name: string;
}
export type Timestamp = bigint;
export interface UserPublic {
    id: Principal;
    age: bigint;
    weight?: number;
    height?: number;
    balance: number;
    lifestyle_description?: string;
    dietary_preference: DietaryPreference;
    goal?: Goal;
    name: string;
    created_at: Timestamp;
    email: string;
    plan_status: PlanStatus;
    activity_level: ActivityLevel;
    subscription_plan: SubscriptionPlan;
    diet_type: DietType;
    trial_start_date?: Timestamp;
}
export type GeneratePlanResult = {
    __kind__: "ok";
    ok: DailyJourney;
} | {
    __kind__: "tierLimited";
    tierLimited: string;
} | {
    __kind__: "error";
    error: string;
};
export interface EditableMeal {
    id: bigint;
    calories: bigint;
    name: string;
    time: string;
    quantity: string;
    task_type: JourneyTaskType;
    food_items: Array<string>;
    protein: bigint;
}
export interface UserActivity {
    protein_intake?: number;
    daily_calories?: bigint;
    date: Timestamp;
    water_intake?: number;
    user_id: Principal;
    total_protein?: number;
    meals_skipped?: bigint;
    missed_meals?: Array<MissedMealEntry>;
    meals_completed?: bigint;
}
export interface CreateOrderResponse {
    currency: string;
    order_id: string;
    amount: bigint;
}
export interface AuthResponse {
    user_id: Principal;
    session_token: string;
}
export interface EditMealPlanRequest {
    meals: Array<EditableMeal>;
}
export interface DailyBalanceSummary {
    date: string;
    balance_end: number;
    rewards_total: number;
    deductions_total: number;
}
export interface ChatRequest {
    user_message: string;
}
export interface MissedMealEntry {
    meal_type: string;
    reason: string;
}
export interface UpdateUserRequest {
    age?: bigint;
    weight?: number;
    height?: number;
    balance?: number;
    lifestyle_description?: string;
    dietary_preference?: DietaryPreference;
    goal?: Goal;
    name?: string;
    email?: string;
    plan_status?: PlanStatus;
    activity_level?: ActivityLevel;
    diet_type?: DietType;
}
export interface WebhookPayload {
    status: PaymentStatus;
    user_id: Principal;
    order_id: string;
    payment_id: string;
    amount: bigint;
}
export interface BalanceTransaction {
    id: string;
    balance_after: number;
    transaction_type: TransactionType;
    date: Timestamp;
    user_id: Principal;
    amount: number;
    reason: string;
}
export interface AddFeedbackRequest {
    energy_level: EnergyLevel;
    date: string;
    health_status: string;
    notes: string;
    feedback_text: string;
}
export interface JourneyCompletionRequest {
    task_id: bigint;
    date: Timestamp;
}
export type ChatResult = {
    __kind__: "ok";
    ok: ChatResponse;
} | {
    __kind__: "tierLimited";
    tierLimited: string;
} | {
    __kind__: "error";
    error: string;
};
export interface JourneyTask {
    id: bigint;
    title: string;
    calories: bigint;
    name: string;
    time: string;
    description: string;
    xp_reward: bigint;
    quantity: string;
    task_type: JourneyTaskType;
    time_label: string;
    food_items: Array<string>;
    protein: bigint;
}
export interface WeeklyBalanceReport {
    total_reward_events: bigint;
    total_deduction_events: bigint;
    week_net_change: number;
    daily_summaries: Array<DailyBalanceSummary>;
}
export interface Payment {
    status: PaymentStatus;
    date: Timestamp;
    plan?: SubscriptionPlan;
    user_id: Principal;
    order_id: string;
    payment_id: string;
    amount: bigint;
}
export type FeedbackResult = {
    __kind__: "ok";
    ok: UserFeedback;
} | {
    __kind__: "error";
    error: string;
} | {
    __kind__: "alreadySubmitted";
    alreadySubmitted: UserFeedback;
};
export interface EditMealRequest {
    task_id: string;
    quantity: string;
    food_items: Array<string>;
}
export interface StreakLeaderboard {
    current_user_entry?: LeaderboardEntry;
    top_entries: Array<LeaderboardEntry>;
}
export interface DailyJourney {
    id: string;
    generated_by_ai: boolean;
    tasks: Array<JourneyTask>;
    date: Timestamp;
    total_xp: bigint;
}
export interface ChatResponse {
    ai_message: string;
    is_health_response: boolean;
}
export interface AdminStats {
    total_users: bigint;
    premium_users: bigint;
    active_users: bigint;
    total_waitlist: bigint;
}
export interface VerifyPaymentRequest {
    order_id: string;
    razorpay_signature: string;
    payment_id: string;
}
export interface UserFeedback {
    id: bigint;
    energy_level: EnergyLevel;
    date: string;
    created_at: bigint;
    user_id: Principal;
    health_status: string;
    notes: string;
    feedback_text: string;
}
export interface JourneyProgress {
    streak_days: bigint;
    completed_task_ids: Array<bigint>;
    date: Timestamp;
    earned_xp: bigint;
}
export enum ActivityLevel {
    intense = "intense",
    light = "light",
    sedentary = "sedentary",
    moderate = "moderate"
}
export enum DietType {
    veg = "veg",
    non_veg = "non_veg"
}
export enum DietaryPreference {
    non_vegetarian = "non_vegetarian",
    vegetarian = "vegetarian"
}
export enum EnergyLevel {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Goal {
    muscle_gain = "muscle_gain",
    lifestyle_balance = "lifestyle_balance",
    fat_loss = "fat_loss"
}
export enum JourneyTaskType {
    meal = "meal",
    water = "water"
}
export enum PaymentStatus {
    pending = "pending",
    refunded = "refunded",
    success = "success",
    failed = "failed"
}
export enum PlanStatus {
    trial = "trial",
    premium = "premium",
    free = "free"
}
export enum SubscriptionPlan {
    premium = "premium",
    free = "free"
}
export enum TransactionType {
    reward = "reward",
    deduction = "deduction",
    recharge = "recharge"
}
export enum Variant_ok_alreadyExists {
    ok = "ok",
    alreadyExists = "alreadyExists"
}
export interface backendInterface {
    addFeedback(sessionToken: string, req: AddFeedbackRequest): Promise<FeedbackResult>;
    chatWithAI(sessionToken: string, req: ChatRequest): Promise<ChatResult>;
    completeJourneyTask(sessionToken: string, req: JourneyCompletionRequest): Promise<{
        __kind__: "ok";
        ok: JourneyProgress;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createRazorpayOrder(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: CreateOrderResponse;
    } | {
        __kind__: "err";
        err: string;
    }>;
    editAIMeal(sessionToken: string, req: EditMealRequest): Promise<{
        __kind__: "ok";
        ok: DailyJourney;
    } | {
        __kind__: "err";
        err: string;
    }>;
    editMealPlan(sessionToken: string, req: EditMealPlanRequest): Promise<{
        __kind__: "ok";
        ok: DailyJourney;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateAIDiet(sessionToken: string): Promise<GeneratePlanResult>;
    generateTodayPlan(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: DailyJourney;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAdminStats(): Promise<AdminStats>;
    getFeedbackHistory(sessionToken: string, days: bigint): Promise<Array<UserFeedback>>;
    getMyActivity(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<UserActivity>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyBalance(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: number;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyBalanceHistory(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<BalanceTransaction>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyLatestActivity(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: UserActivity | null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyPayments(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<Payment>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyProfile(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: UserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getStreakLeaderboard(sessionToken: string, limit: bigint): Promise<{
        __kind__: "ok";
        ok: StreakLeaderboard;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTodayFeedback(sessionToken: string): Promise<UserFeedback | null>;
    getTodayJourney(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: DailyJourney;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getTodayProgress(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: JourneyProgress;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getWaitlistCount(): Promise<bigint>;
    getWeeklyBalanceReport(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: WeeklyBalanceReport;
    } | {
        __kind__: "err";
        err: string;
    }>;
    handlePaymentWebhook(payload: WebhookPayload): Promise<boolean>;
    joinWaitlist(email: string): Promise<Variant_ok_alreadyExists>;
    logDailyActivity(sessionToken: string, entry: UserActivity): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    logMissedMeal(sessionToken: string, mealType: string, reason: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    loginUser(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: AuthResponse;
    } | {
        __kind__: "err";
        err: string;
    }>;
    logoutUser(sessionToken: string): Promise<void>;
    processDayEndAccountability(sessionToken: string, mealsCompleted: bigint, mealsSkipped: bigint, waterCompleted: boolean, skippedWithReason: boolean): Promise<{
        __kind__: "ok";
        ok: number;
    } | {
        __kind__: "err";
        err: string;
    }>;
    rechargeBalance(sessionToken: string, amountPaise: bigint): Promise<{
        __kind__: "ok";
        ok: CreateOrderResponse;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(req: RegisterUserRequest): Promise<{
        __kind__: "ok";
        ok: AuthResponse;
    } | {
        __kind__: "err";
        err: string;
    }>;
    resetToAIPlan(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: DailyJourney;
    } | {
        __kind__: "err";
        err: string;
    }>;
    skipJourneyTask(sessionToken: string, taskId: bigint, reason: string): Promise<{
        __kind__: "ok";
        ok: {
            balance: number;
            deducted: boolean;
            balance_empty: boolean;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateMyProfile(sessionToken: string, req: UpdateUserRequest): Promise<{
        __kind__: "ok";
        ok: UserPublic;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyRazorpayPayment(sessionToken: string, req: VerifyPaymentRequest): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyRechargePayment(sessionToken: string, req: VerifyPaymentRequest, amountPaise: bigint): Promise<{
        __kind__: "ok";
        ok: number;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
