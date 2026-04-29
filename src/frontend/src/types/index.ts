import type { Principal } from "@icp-sdk/core/principal";

// ── Existing UI types ─────────────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

// ── Domain types (mirrored from backend.d.ts) ─────────────────────────────────
export type { Principal };

export type Timestamp = bigint;

export enum Goal {
  muscle_gain = "muscle_gain",
  fat_loss = "fat_loss",
  lifestyle_balance = "lifestyle_balance",
}

export enum ActivityLevel {
  sedentary = "sedentary",
  light = "light",
  moderate = "moderate",
  intense = "intense",
}

export enum DietaryPreference {
  vegetarian = "vegetarian",
  non_vegetarian = "non_vegetarian",
}

/** Fine-grained diet type matching backend DietType enum */
export enum DietType {
  veg = "veg",
  non_veg = "non_veg",
}

export enum SubscriptionPlan {
  premium = "premium",
  free = "free",
}

export type PlanStatus = "trial" | "free" | "premium";

export enum PaymentStatus {
  pending = "pending",
  refunded = "refunded",
  success = "success",
  failed = "failed",
}

export enum WaitlistResult {
  ok = "ok",
  alreadyExists = "alreadyExists",
}

export interface User {
  id: Principal;
  name: string;
  email: string;
  goal?: Goal;
  height?: number;
  weight?: number;
  age?: number;
  activity_level?: ActivityLevel;
  dietary_preference?: DietaryPreference;
  /** New field — maps to backend DietType (veg | non_veg) */
  diet_type?: DietType;
  /** Lifestyle description for AI personalization */
  lifestyle_description?: string;
  subscription_plan: SubscriptionPlan;
  created_at: Timestamp;
  /** Accountability balance in rupees */
  balance: number;
  /** Plan/trial status */
  plan_status: PlanStatus;
  /** Trial start date as ms timestamp (null if not on trial) */
  trial_start_date: number | null;
}

/** One entry in a user's balance transaction history */
export interface BalanceTransaction {
  id: string;
  user_id: string;
  date: number;
  amount: number;
  reason: string;
  balance_after: number;
  transaction_type: "deduction" | "reward" | "recharge";
}

export interface WaitlistEntry {
  email: string;
  timestamp: Timestamp;
}

export interface Payment {
  payment_id: string;
  user_id: Principal;
  order_id?: string;
  amount: bigint;
  status: PaymentStatus;
  date: Timestamp;
  /** Subscription tier associated with this payment */
  plan?: "free" | "premium";
}

export interface UserActivity {
  user_id: Principal;
  date: Timestamp;
  daily_calories?: bigint;
  protein_intake?: number;
  water_intake?: number;
  meals_completed?: bigint;
  /** New: number of skipped meals for the day */
  meals_skipped?: number;
  /** New: total protein intake for the day */
  total_protein?: number;
}

export interface AdminStats {
  total_users: bigint;
  premium_users: bigint;
  active_users: bigint;
  total_waitlist: bigint;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  goal?: Goal;
  height?: number;
  weight?: number;
  age: number;
  activity_level: ActivityLevel;
  dietary_preference: DietaryPreference;
  /** New: maps to backend DietType */
  diet_type?: DietType;
  /** Lifestyle description for AI personalization */
  lifestyle_description?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  goal?: Goal;
  height?: number;
  weight?: number;
  age?: number;
  activity_level?: ActivityLevel;
  dietary_preference?: DietaryPreference;
  diet_type?: DietType;
  /** Lifestyle description for AI personalization */
  lifestyle_description?: string;
}

// ── Feedback types ─────────────────────────────────────────────────────────────

/** Energy level — matches backend EnergyLevel enum */
export enum EnergyLevel {
  low = "low",
  medium = "medium",
  high = "high",
}

export interface UserFeedback {
  id: bigint;
  user_id: Principal;
  date: string;
  feedback_text: string;
  energy_level: EnergyLevel;
  health_status: string;
  notes: string;
  created_at: bigint;
}

export interface AddFeedbackRequest {
  date: string;
  feedback_text: string;
  energy_level: EnergyLevel;
  health_status: string;
  notes: string;
}

export type FeedbackResult =
  | { __kind__: "ok"; ok: UserFeedback }
  | { __kind__: "error"; error: string }
  | { __kind__: "alreadySubmitted"; alreadySubmitted: UserFeedback };

// ── Journey / Level Map ───────────────────────────────────────────────────────

export type JourneyTaskType = "meal" | "water";

/** Extended to include skipped status */
export type MealStatus = "pending" | "completed" | "skipped";

export interface JourneyTask {
  id: number;
  title: string;
  description: string;
  time_label: string;
  task_type: JourneyTaskType;
  xp_reward: number;
  food_items: string[];
  quantity: string;
  calories?: number;
  protein?: number;
}

export interface DailyJourney {
  /** Unique plan ID */
  id?: string;
  tasks: JourneyTask[];
  total_xp: number;
  date: bigint;
  /** Whether this plan was generated by the AI engine */
  generatedByAi?: boolean;
}

export interface JourneyProgress {
  completed_task_ids: number[];
  earned_xp: number;
  streak_days: number;
  date: bigint;
}

// ── Editable Meal Plan ────────────────────────────────────────────────────────

export interface EditableMealItem {
  id: number;
  name: string;
  time: string;
  task_type: "meal" | "water";
  food_items: string[];
  quantity: string;
  calories: number;
  protein: number;
}

export interface EditMealPlanRequest {
  meals: EditableMealItem[];
}

// ── AI types ──────────────────────────────────────────────────────────────────

export interface EditMealRequest {
  task_id: string;
  food_items: string[];
  quantity: string;
}

export interface ChatRequest {
  user_message: string;
}

export interface ChatResponse {
  ai_message: string;
  is_health_response: boolean;
}

export type GeneratePlanResult =
  | { __kind__: "ok"; ok: DailyJourney }
  | { __kind__: "tierLimited"; tierLimited: string }
  | { __kind__: "error"; error: string };

export type ChatResult =
  | { __kind__: "ok"; ok: ChatResponse }
  | { __kind__: "tierLimited"; tierLimited: string }
  | { __kind__: "error"; error: string };

// ── Razorpay ──────────────────────────────────────────────────────────────────

/** Shape of the object passed to the Razorpay `handler` callback on success. */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** Shape returned by the backend's createRazorpayOrder call. */
export interface RazorpayOrderResult {
  order_id: string;
}

// ── Leaderboard & Weekly Balance Report ────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  streak_days: number;
  weekly_xp: number;
  is_current_user: boolean;
}

export interface StreakLeaderboard {
  top_entries: LeaderboardEntry[];
  current_user_entry: LeaderboardEntry | null;
}

export interface DailyBalanceSummary {
  date: string;
  deductions_total: number;
  rewards_total: number;
  balance_end: number;
}

export interface WeeklyBalanceReport {
  daily_summaries: DailyBalanceSummary[];
  week_net_change: number;
  total_deduction_events: number;
  total_reward_events: number;
}
