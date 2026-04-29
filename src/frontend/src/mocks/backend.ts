import type { backendInterface } from "../backend";
import {
  ActivityLevel,
  DietaryPreference,
  DietType,
  EnergyLevel,
  Goal,
  JourneyTaskType,
  PaymentStatus,
  PlanStatus,
  SubscriptionPlan,
  TransactionType,
  Variant_ok_alreadyExists,
} from "../backend";

const mockPrincipal = { toText: () => "aaaaa-aa" } as unknown as import("@icp-sdk/core/principal").Principal;

const mockAuthResponse = {
  user_id: mockPrincipal,
  session_token: "mock_session_token_12345",
};

const mockUserPublic = {
  id: mockPrincipal,
  age: BigInt(25),
  weight: 72,
  height: 175,
  dietary_preference: DietaryPreference.non_vegetarian,
  diet_type: DietType.non_veg,
  goal: Goal.fat_loss,
  name: "Arjun Sharma",
  created_at: BigInt(Date.now()) * BigInt(1_000_000),
  email: "arjun@example.com",
  activity_level: ActivityLevel.moderate,
  subscription_plan: SubscriptionPlan.premium,
  balance: 10.5,
  plan_status: PlanStatus.trial,
  trial_start_date: BigInt(Date.now() - 5 * 86_400_000) * BigInt(1_000_000),
};

const mockJourneyTasks = [
  {
    id: BigInt(1),
    title: "Breakfast",
    name: "Breakfast",
    description: "Start your day with a high-protein breakfast to fuel your morning workout.",
    xp_reward: BigInt(10),
    quantity: "400 kcal",
    task_type: JourneyTaskType.meal,
    time_label: "8:00 AM",
    time: "8:00 AM",
    food_items: ["2 boiled eggs", "1 cup oats with honey", "1 glass milk"],
    calories: BigInt(400),
    protein: BigInt(28),
  },
  {
    id: BigInt(2),
    title: "Morning Water",
    name: "Morning Water",
    description: "Stay hydrated! Drink 500ml of water to kickstart your metabolism.",
    xp_reward: BigInt(5),
    quantity: "500 ml",
    task_type: JourneyTaskType.water,
    time_label: "10:00 AM",
    time: "10:00 AM",
    food_items: ["500ml water"],
    calories: BigInt(0),
    protein: BigInt(0),
  },
  {
    id: BigInt(3),
    title: "Lunch",
    name: "Lunch",
    description: "Balanced lunch with lean protein, complex carbs, and greens.",
    xp_reward: BigInt(10),
    quantity: "600 kcal",
    task_type: JourneyTaskType.meal,
    time_label: "1:00 PM",
    time: "1:00 PM",
    food_items: ["150g grilled chicken", "1 cup brown rice", "Mixed green salad"],
    calories: BigInt(600),
    protein: BigInt(42),
  },
  {
    id: BigInt(4),
    title: "Afternoon Water",
    name: "Afternoon Water",
    description: "Mid-afternoon hydration boost.",
    xp_reward: BigInt(5),
    quantity: "500 ml",
    task_type: JourneyTaskType.water,
    time_label: "3:30 PM",
    time: "3:30 PM",
    food_items: ["500ml water"],
    calories: BigInt(0),
    protein: BigInt(0),
  },
  {
    id: BigInt(5),
    title: "Snack",
    name: "Snack",
    description: "Light protein snack to keep your energy levels steady.",
    xp_reward: BigInt(5),
    quantity: "200 kcal",
    task_type: JourneyTaskType.meal,
    time_label: "5:00 PM",
    time: "5:00 PM",
    food_items: ["1 banana", "10 almonds", "1 cup green tea"],
    calories: BigInt(200),
    protein: BigInt(8),
  },
  {
    id: BigInt(6),
    title: "Dinner",
    name: "Dinner",
    description: "Light, nutritious dinner to aid recovery and muscle repair overnight.",
    xp_reward: BigInt(10),
    quantity: "500 kcal",
    task_type: JourneyTaskType.meal,
    time_label: "8:00 PM",
    time: "8:00 PM",
    food_items: ["2 chapati", "150g paneer curry", "1 cup dal"],
    calories: BigInt(500),
    protein: BigInt(32),
  },
];

const mockDailyJourney = {
  id: "mock-journey-today",
  generated_by_ai: true,
  tasks: mockJourneyTasks,
  date: BigInt(Date.now()) * BigInt(1_000_000),
  total_xp: BigInt(45),
};

const mockJourneyProgress = {
  streak_days: BigInt(7),
  completed_task_ids: [BigInt(1), BigInt(2)],
  date: BigInt(Date.now()) * BigInt(1_000_000),
  earned_xp: BigInt(15),
};

export const mockBackend: backendInterface = {
  chatWithAI: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: {
      ai_message:
        "Great question! Based on your fat loss goal and moderate activity level, I recommend focusing on a caloric deficit of around 300–500 kcal/day. Make sure you're hitting 1.6g of protein per kg of bodyweight to preserve muscle mass. For your next meal, try grilled chicken with roasted veggies — high protein, low carb, and very filling. Keep up the streak! 🔥\n\n*Not medical advice — always consult a qualified healthcare professional for personalized medical guidance.*",
      is_health_response: false,
    },
  }),

  completeJourneyTask: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: mockJourneyProgress,
  }),

  createRazorpayOrder: async (_sessionToken) => ({
    __kind__: "ok",
    ok: {
      currency: "INR",
      order_id: "order_mock_123456",
      amount: BigInt(19900),
    },
  }),

  editAIMeal: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  editMealPlan: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  generateAIDiet: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  generateTodayPlan: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  getAdminStats: async () => ({
    total_users: BigInt(128),
    premium_users: BigInt(34),
    active_users: BigInt(89),
    total_waitlist: BigInt(512),
  }),

  getMyActivity: async (_sessionToken) => ({
    __kind__: "ok",
    ok: [
      {
        protein_intake: 120,
        daily_calories: BigInt(1850),
        date: BigInt(Date.now()) * BigInt(1_000_000),
        water_intake: 2000,
        user_id: mockPrincipal,
        missed_meals: [],
        meals_completed: BigInt(4),
        meals_skipped: BigInt(1),
        total_protein: 125,
      },
    ],
  }),

  getMyLatestActivity: async (_sessionToken) => ({
    __kind__: "ok",
    ok: {
      protein_intake: 120,
      daily_calories: BigInt(1850),
      date: BigInt(Date.now()) * BigInt(1_000_000),
      water_intake: 2000,
      user_id: mockPrincipal,
      missed_meals: [],
      meals_completed: BigInt(4),
      meals_skipped: BigInt(1),
      total_protein: 125,
    },
  }),

  getMyPayments: async (_sessionToken) => ({
    __kind__: "ok",
    ok: [
      {
        status: PaymentStatus.success,
        date: BigInt(Date.now()) * BigInt(1_000_000),
        user_id: mockPrincipal,
        order_id: "order_mock_123456",
        payment_id: "pay_mock_789",
        amount: BigInt(19900),
      },
    ],
  }),

  getMyProfile: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockUserPublic,
  }),

  getTodayJourney: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  getTodayProgress: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockJourneyProgress,
  }),

  getWaitlistCount: async () => BigInt(512),

  handlePaymentWebhook: async (_payload) => true,

  joinWaitlist: async (_email) => Variant_ok_alreadyExists.ok,

  logDailyActivity: async (_sessionToken, _entry) => ({
    __kind__: "ok",
    ok: null,
  }),

  logMissedMeal: async (_sessionToken, _mealType, _reason) => ({
    __kind__: "ok",
    ok: "Missed meal logged. AI will adjust your upcoming plan.",
  }),

  loginUser: async (_email, _password) => ({
    __kind__: "ok",
    ok: mockAuthResponse,
  }),

  logoutUser: async (_sessionToken) => undefined,

  registerUser: async (_req) => ({
    __kind__: "ok",
    ok: mockAuthResponse,
  }),

  resetToAIPlan: async (_sessionToken) => ({
    __kind__: "ok",
    ok: mockDailyJourney,
  }),

  updateMyProfile: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: mockUserPublic,
  }),

  verifyRazorpayPayment: async (_sessionToken, _req) => ({
    __kind__: "ok",
    ok: true,
  }),

  addFeedback: async (_sessionToken, _req) => ({
    __kind__: "ok" as const,
    ok: {
      id: BigInt(1),
      user_id: mockPrincipal,
      date: new Date().toISOString().split("T")[0],
      feedback_text: _req.feedback_text,
      energy_level: _req.energy_level,
      health_status: _req.health_status,
      notes: _req.notes,
      created_at: BigInt(Date.now()) * BigInt(1_000_000),
    },
  }),

  getTodayFeedback: async (_sessionToken) => null,

  getFeedbackHistory: async (_sessionToken, _days) => [],

  getMyBalance: async (_sessionToken) => ({
    __kind__: "ok" as const,
    ok: 10.5,
  }),

  getMyBalanceHistory: async (_sessionToken) => ({
    __kind__: "ok" as const,
    ok: [
      {
        id: "tx_1",
        user_id: mockPrincipal,
        date: BigInt(Date.now() - 86_400_000) * BigInt(1_000_000),
        amount: 1,
        reason: "Skipped Breakfast",
        balance_after: 10.5,
        transaction_type: TransactionType.deduction,
      },
      {
        id: "tx_2",
        user_id: mockPrincipal,
        date: BigInt(Date.now() - 2 * 86_400_000) * BigInt(1_000_000),
        amount: 0.5,
        reason: "Completed full day 🌟",
        balance_after: 11.5,
        transaction_type: TransactionType.reward,
      },
    ],
  }),

  rechargeBalance: async (_sessionToken, _amount) => ({
    __kind__: "ok" as const,
    ok: { order_id: "recharge_mock_123", currency: "INR", amount: _amount },
  }),

  processDayEndAccountability: async (
    _sessionToken,
    _mealsCompleted,
    _mealsSkipped,
    _waterCompleted,
    _skippedWithReason,
  ) => ({
    __kind__: "ok" as const,
    ok: 11.0,
  }),

  skipJourneyTask: async (_sessionToken, _taskId, _reason) => ({
    __kind__: "ok" as const,
    ok: { balance: 9.5, deducted: true, balance_empty: false },
  }),

  verifyRechargePayment: async (_sessionToken, _req, _amountPaise) => ({
    __kind__: "ok" as const,
    ok: 19.5,
  }),

  getStreakLeaderboard: async (_sessionToken, _limit) => ({
    __kind__: "ok" as const,
    ok: { top_entries: [], current_user_entry: undefined },
  }),

  getWeeklyBalanceReport: async (_sessionToken) => ({
    __kind__: "ok" as const,
    ok: {
      daily_summaries: [],
      week_net_change: 0,
      total_deduction_events: BigInt(0),
      total_reward_events: BigInt(0),
    },
  }),
};
