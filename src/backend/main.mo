import List "mo:core/List";
import Map "mo:core/Map";

import UserTypes "types/users";
import WaitlistTypes "types/waitlist";
import PaymentTypes "types/payments";
import ActivityTypes "types/activity";
import DietTypes "types/diet";
import AuthTypes "types/auth";
import FeedbackTypes "types/feedback";
import BalanceTypes "types/balance";
import AI "lib/ai";

import UsersApi "mixins/users-api";
import WaitlistApi "mixins/waitlist-api";
import PaymentsApi "mixins/payments-api";
import ActivityApi "mixins/activity-api";
import AdminApi "mixins/admin-api";
import DietApi "mixins/diet-api";
import AiApi "mixins/ai-api";
import FeedbackApi "mixins/feedback-api";
import BalanceApi "mixins/balance-api";
import LeaderboardApi "mixins/leaderboard-api";
import ReportsApi "mixins/reports-api";



actor {
  let users = List.empty<UserTypes.User>();
  let waitlistEntries = Map.empty<Text, WaitlistTypes.WaitlistEntry>();
  let payments = List.empty<PaymentTypes.Payment>();
  let activities = List.empty<ActivityTypes.UserActivity>();
  // O(1) lookup index: latest activity per user (rebuilt from List on upgrades)
  let activityStore = Map.empty<Principal, ActivityTypes.UserActivity>();
  let journeyProgressStore = Map.empty<Text, DietTypes.JourneyProgress>();
  let dailyPlanStore = Map.empty<Text, DietTypes.DailyJourney>();

  // Email/password auth state
  let credentials = Map.empty<Text, AuthTypes.Credential>(); // email → Credential
  let sessions = Map.empty<Text, AuthTypes.Session>();        // token → Session

  // Feedback state: keyed by "<user_id>:<date>"
  let feedbackStore = Map.empty<Text, FeedbackTypes.UserFeedback>();

  // Balance/accountability ledger
  let balanceTransactions = List.empty<BalanceTypes.BalanceTransaction>();

  // AI rate-limit store: keyed by "<principal>#rl#<dayBucket>"
  let rateLimits = Map.empty<Text, AI.DailyRateLimit>();

  include UsersApi(users, credentials, sessions);
  include WaitlistApi(waitlistEntries);
  include PaymentsApi(payments, users, sessions, balanceTransactions);
  include ActivityApi(activities, activityStore, sessions);
  include AdminApi(users, waitlistEntries, activities);
  include DietApi(users, activities, journeyProgressStore, dailyPlanStore, sessions, feedbackStore, balanceTransactions);
  include AiApi(users, activities, journeyProgressStore, dailyPlanStore, sessions, feedbackStore, rateLimits);
  include FeedbackApi(feedbackStore, sessions);
  include BalanceApi(users, balanceTransactions, sessions);
  include LeaderboardApi(users, journeyProgressStore, sessions);
  include ReportsApi(users, balanceTransactions, sessions);
};
