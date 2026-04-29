import { AccountabilityBalanceSection } from "@/components/AccountabilityBalanceSection";
import { StreakLeaderboardCard } from "@/components/StreakLeaderboardCard";
import { TodayJourneySection } from "@/components/TodayJourneySection";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useAddFeedback,
  useChatWithAI,
  useFeedbackHistory,
  useGenerateAIDiet,
  useMyActivity,
  useMyProfile,
  useTodayFeedback,
  useTodayJourney,
  useUpdateMyProfile,
} from "@/hooks/useBackend";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import {
  ActivityLevel,
  type AddFeedbackRequest,
  type ChatResponse,
  DietType,
  DietaryPreference,
  EnergyLevel,
  Goal,
  type PlanStatus,
  SubscriptionPlan,
  type UpdateUserRequest,
} from "@/types";
import { getBackendActor } from "@/utils/actor";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BotMessageSquare,
  Check,
  CheckCircle2,
  ChevronDown,
  Crown,
  FileText,
  Leaf,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  RefreshCw,
  Ruler,
  Send,
  Sparkles,
  Target,
  TriangleAlert,
  Weight,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrincipal(id: string) {
  if (id.length <= 14) return id;
  return `${id.slice(0, 7)}…${id.slice(-7)}`;
}

function goalLabel(goal?: string) {
  if (goal === "fat_loss") return "🔥 Fat Loss";
  if (goal === "muscle_gain") return "💪 Muscle Gain";
  if (goal === "lifestyle_balance") return "⚖️ Lifestyle Balance";
  return "Not set";
}

function activityLabel(level?: string) {
  if (level === "sedentary") return "🛋️ Sedentary";
  if (level === "light") return "🚶 Lightly Active";
  if (level === "moderate") return "🏃 Moderately Active";
  if (level === "intense") return "⚡ Very Active";
  return "Not set";
}

function dietLabel(pref?: string) {
  if (pref === "vegetarian") return "🥦 Vegetarian";
  if (pref === "non_vegetarian") return "🍗 Non-Vegetarian";
  return "Not set";
}

function dietTypeLabel(dt?: string) {
  if (dt === DietType.veg) return "🌿 Veg";
  if (dt === DietType.non_veg) return "🍖 Non-Veg";
  return "Not set";
}

/** Parse a time label like "8:00 AM" or "2:30 PM" → minutes from midnight */
function parseTimeLabel(label: string): number | null {
  const m = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

const PREMIUM_BENEFITS = [
  "AI-personalised daily meal plans",
  "Smart calorie & macro tracking",
  "Full AI coach chat assistant",
  "Dynamic meal adjustments",
  "Priority support & early features",
];

// ── Skeleton card ──────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-white/10 px-4 py-3 animate-pulse"
      style={{ background: "oklch(0.14 0.015 260 / 0.6)" }}
    >
      <div className="h-3 w-12 rounded bg-white/10 mb-2" />
      <div className="h-4 w-20 rounded bg-white/10" />
    </div>
  );
}

// ── Goal inline editor ─────────────────────────────────────────────────────────
interface GoalEditorProps {
  current?: Goal;
  onSave: (val: Goal) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
function GoalEditor({ current, onSave, onCancel, saving }: GoalEditorProps) {
  const [val, setVal] = useState<Goal>(current ?? Goal.fat_loss);

  return (
    <div className="flex flex-col gap-2">
      <select
        data-ocid="dashboard.goal.select"
        value={val}
        onChange={(e) => setVal(e.target.value as Goal)}
        className="rounded-lg border border-white/20 bg-white/5 text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
        aria-label="Select goal"
      >
        <option value={Goal.fat_loss}>🔥 Fat Loss</option>
        <option value={Goal.muscle_gain}>💪 Muscle Gain</option>
        <option value={Goal.lifestyle_balance}>⚖️ Lifestyle Balance</option>
      </select>
      <div className="flex gap-2">
        <button
          data-ocid="dashboard.goal.save_button"
          type="button"
          onClick={() => onSave(val)}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] min-w-[44px] hover:opacity-90 transition-smooth disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-3 h-3" aria-hidden="true" />
          )}
          Save
        </button>
        <button
          data-ocid="dashboard.goal.cancel_button"
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold min-h-[44px] min-w-[44px] hover:border-white/40 hover:text-white transition-smooth disabled:opacity-50"
        >
          <X className="w-3 h-3" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Numeric inline editor ──────────────────────────────────────────────────────
interface NumericEditorProps {
  field: "height" | "weight" | "age";
  current?: number;
  unit: string;
  onSave: (val: number) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
function NumericEditor({
  field,
  current,
  unit,
  onSave,
  onCancel,
  saving,
}: NumericEditorProps) {
  const [val, setVal] = useState(current?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const limits = {
    height: { min: 1, max: 300 },
    weight: { min: 1, max: 500 },
    age: { min: 18, max: 80 },
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          ref={inputRef}
          data-ocid={`dashboard.${field}.input`}
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={`Enter ${unit}`}
          min={limits[field].min}
          max={limits[field].max}
          className="w-full rounded-lg border border-white/20 bg-white/5 text-foreground text-sm px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] placeholder:text-white/30"
          aria-label={`${field} in ${unit}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val) onSave(Number(val));
            if (e.key === "Escape") onCancel();
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 pointer-events-none">
          {unit}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          data-ocid={`dashboard.${field}.save_button`}
          type="button"
          onClick={() => val && onSave(Number(val))}
          disabled={saving || !val}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] min-w-[44px] hover:opacity-90 transition-smooth disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-3 h-3" aria-hidden="true" />
          )}
          Save
        </button>
        <button
          data-ocid={`dashboard.${field}.cancel_button`}
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold min-h-[44px] min-w-[44px] hover:border-white/40 hover:text-white transition-smooth disabled:opacity-50"
        >
          <X className="w-3 h-3" aria-hidden="true" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Activity Level inline editor ───────────────────────────────────────────────
interface ActivityEditorProps {
  current?: ActivityLevel;
  onSave: (val: ActivityLevel) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
function ActivityEditor({
  current,
  onSave,
  onCancel,
  saving,
}: ActivityEditorProps) {
  const [val, setVal] = useState<ActivityLevel>(
    current ?? ActivityLevel.moderate,
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          data-ocid="dashboard.activity_level.select"
          value={val}
          onChange={(e) => setVal(e.target.value as ActivityLevel)}
          className="w-full rounded-lg border border-white/20 bg-white/5 text-foreground text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] appearance-none"
          aria-label="Select activity level"
        >
          <option value={ActivityLevel.sedentary}>🛋️ Sedentary</option>
          <option value={ActivityLevel.light}>🚶 Lightly Active</option>
          <option value={ActivityLevel.moderate}>🏃 Moderately Active</option>
          <option value={ActivityLevel.intense}>⚡ Very Active</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
      </div>
      <div className="flex gap-2">
        <button
          data-ocid="dashboard.activity_level.save_button"
          type="button"
          onClick={() => onSave(val)}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] min-w-[44px] hover:opacity-90 transition-smooth disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Save
        </button>
        <button
          data-ocid="dashboard.activity_level.cancel_button"
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold min-h-[44px] min-w-[44px] hover:border-white/40 hover:text-white transition-smooth disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Diet Preference inline editor ──────────────────────────────────────────────
interface DietEditorProps {
  current?: DietaryPreference;
  onSave: (val: DietaryPreference) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
function DietEditor({ current, onSave, onCancel, saving }: DietEditorProps) {
  const [val, setVal] = useState<DietaryPreference>(
    current ?? DietaryPreference.non_vegetarian,
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {[
          { v: DietaryPreference.non_vegetarian, label: "🍗 Non-Veg" },
          { v: DietaryPreference.vegetarian, label: "🥦 Veg" },
        ].map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => setVal(opt.v)}
            className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-smooth ${
              val === opt.v
                ? "border-primary/70 bg-primary/10 text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          data-ocid="dashboard.diet.save_button"
          type="button"
          onClick={() => onSave(val)}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] min-w-[44px] hover:opacity-90 transition-smooth disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Save
        </button>
        <button
          data-ocid="dashboard.diet.cancel_button"
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold min-h-[44px] min-w-[44px] hover:border-white/40 hover:text-white transition-smooth disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Diet Type inline editor ────────────────────────────────────────────────────
interface DietTypeEditorProps {
  current?: DietType;
  onSave: (val: DietType) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}
function DietTypeEditor({
  current,
  onSave,
  onCancel,
  saving,
}: DietTypeEditorProps) {
  const [val, setVal] = useState<DietType>(current ?? DietType.non_veg);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {[
          { v: DietType.non_veg, label: "🍖 Non-Veg" },
          { v: DietType.veg, label: "🌿 Veg" },
        ].map((opt) => (
          <button
            key={opt.v}
            type="button"
            onClick={() => setVal(opt.v)}
            className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-smooth ${
              val === opt.v
                ? "border-primary/70 bg-primary/10 text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          data-ocid="dashboard.diet_type.save_button"
          type="button"
          onClick={() => onSave(val)}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold min-h-[44px] min-w-[44px] hover:opacity-90 transition-smooth disabled:opacity-50"
          aria-busy={saving}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
          Save
        </button>
        <button
          data-ocid="dashboard.diet_type.cancel_button"
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold min-h-[44px] min-w-[44px] hover:border-white/40 hover:text-white transition-smooth disabled:opacity-50"
        >
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Stat card with edit ────────────────────────────────────────────────────────
type EditableField =
  | "goal"
  | "height"
  | "weight"
  | "age"
  | "activity_level"
  | "dietary_preference"
  | "diet_type";

interface StatCardProps {
  field: EditableField;
  label: string;
  value: string;
  isLoading: boolean;
  editingField: EditableField | null;
  setEditingField: (f: EditableField | null) => void;
  profile:
    | {
        goal?: Goal;
        height?: number;
        weight?: number;
        age?: number;
        activity_level?: ActivityLevel;
        dietary_preference?: DietaryPreference;
        diet_type?: DietType;
      }
    | null
    | undefined;
  onUpdate: (req: UpdateUserRequest) => Promise<void>;
  savingField: EditableField | null;
}

function StatCard({
  field,
  label,
  value,
  isLoading,
  editingField,
  setEditingField,
  profile,
  onUpdate,
  savingField,
}: StatCardProps) {
  const isEditing = editingField === field;
  const isSaving = savingField === field;

  const fieldIcons: Record<EditableField, React.ReactNode> = {
    goal: <Target className="w-3 h-3" aria-hidden="true" />,
    height: <Ruler className="w-3 h-3" aria-hidden="true" />,
    weight: <Weight className="w-3 h-3" aria-hidden="true" />,
    age: (
      <span className="text-[10px] font-bold" aria-hidden="true">
        yr
      </span>
    ),
    activity_level: <Zap className="w-3 h-3" aria-hidden="true" />,
    dietary_preference: (
      <span className="text-[10px]" aria-hidden="true">
        🥗
      </span>
    ),
    diet_type: (
      <span className="text-[10px]" aria-hidden="true">
        🌿
      </span>
    ),
  };

  return (
    <div
      data-ocid={`dashboard.${field}_card`}
      className={`rounded-xl border px-4 py-3 transition-smooth ${
        isEditing
          ? "border-primary/50"
          : "border-white/10 hover:border-white/20"
      }`}
      style={{ background: "oklch(0.14 0.015 260 / 0.6)" }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          {fieldIcons[field]}
          {label}
        </p>
        {!isEditing && (
          <button
            data-ocid={`dashboard.${field}.edit_button`}
            type="button"
            onClick={() => setEditingField(field)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-white/30 hover:text-primary hover:bg-primary/10 transition-smooth focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
      ) : isEditing ? (
        field === "goal" ? (
          <GoalEditor
            current={profile?.goal}
            onSave={async (v) => onUpdate({ goal: v })}
            onCancel={() => setEditingField(null)}
            saving={isSaving}
          />
        ) : field === "activity_level" ? (
          <ActivityEditor
            current={profile?.activity_level}
            onSave={async (v) => onUpdate({ activity_level: v })}
            onCancel={() => setEditingField(null)}
            saving={isSaving}
          />
        ) : field === "dietary_preference" ? (
          <DietEditor
            current={profile?.dietary_preference}
            onSave={async (v) => onUpdate({ dietary_preference: v })}
            onCancel={() => setEditingField(null)}
            saving={isSaving}
          />
        ) : field === "diet_type" ? (
          <DietTypeEditor
            current={profile?.diet_type}
            onSave={async (v) => onUpdate({ diet_type: v })}
            onCancel={() => setEditingField(null)}
            saving={isSaving}
          />
        ) : (
          <NumericEditor
            field={field as "height" | "weight" | "age"}
            current={
              field === "height"
                ? profile?.height
                : field === "weight"
                  ? profile?.weight
                  : profile?.age
            }
            unit={
              field === "height" ? "cm" : field === "weight" ? "kg" : "years"
            }
            onSave={async (v) => onUpdate({ [field]: v })}
            onCancel={() => setEditingField(null)}
            saving={isSaving}
          />
        )
      ) : (
        <p className="text-sm font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}

// ── Reminders Section ─────────────────────────────────────────────────────────
interface RemindersSectionProps {
  isPremium: boolean;
  dismissedIds: Set<number>;
  onDismiss: (id: number) => void;
}

function RemindersSection({
  isPremium,
  dismissedIds,
  onDismiss,
}: RemindersSectionProps) {
  const { data: journey } = useTodayJourney();

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const upcomingTasks = (journey?.tasks ?? [])
    .filter((t) => {
      const taskMin = parseTimeLabel(t.time_label);
      return (
        taskMin !== null && taskMin >= nowMinutes && !dismissedIds.has(t.id)
      );
    })
    .slice(0, 3);

  const dueSoonTasks = upcomingTasks.filter((t) => {
    const taskMin = parseTimeLabel(t.time_label);
    return taskMin !== null && Math.abs(taskMin - nowMinutes) <= 30;
  });

  if (upcomingTasks.length === 0) return null;

  return (
    <div
      data-ocid="dashboard.reminders_section"
      className="rounded-2xl border border-primary/20 p-5 relative overflow-hidden"
      style={{ background: "oklch(0.17 0.025 280 / 0.8)" }}
    >
      {/* Gradient orb */}
      <div
        className="absolute top-0 right-0 w-48 h-24 blur-[60px] pointer-events-none opacity-20"
        style={{ background: "oklch(0.68 0.22 280 / 0.5)" }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
          <p className="text-sm font-bold text-white">Upcoming Tasks</p>
          {dueSoonTasks.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-xs text-primary font-semibold animate-pulse">
              Due soon
            </span>
          )}
        </div>

        <div className="space-y-2">
          {upcomingTasks.map((task) => {
            const taskMin = parseTimeLabel(task.time_label) ?? 0;
            const isDueSoon = Math.abs(taskMin - nowMinutes) <= 30;
            return (
              <div
                key={task.id}
                data-ocid={`dashboard.reminder.item.${task.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-smooth ${
                  isDueSoon
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-base shrink-0" aria-hidden="true">
                  {task.task_type === "water" ? "💧" : "🍽️"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {task.title}{" "}
                    <span className="text-white/50 font-normal text-xs">
                      at {task.time_label}
                    </span>
                  </p>
                  {isPremium && task.description && (
                    <p className="text-xs text-primary/80 truncate mt-0.5">
                      ✨ {task.description}
                    </p>
                  )}
                  {!isPremium && (
                    <p className="text-xs text-white/30 mt-0.5 truncate">
                      Upgrade for AI suggestions
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(task.id)}
                  className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-smooth"
                  aria-label={`Dismiss reminder for ${task.title}`}
                  data-ocid={`dashboard.reminder.dismiss.${task.id}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── AI Chat Panel ─────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  role: "user" | "ai" | "thinking";
  text: string;
  isHealthResponse?: boolean;
}

interface AIChatPanelProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

function AIChatPanel({ isPremium, onUpgrade }: AIChatPanelProps) {
  const chatWithAI = useChatWithAI();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "ai",
      text: "Hi! I'm your personal AI diet coach 👋 Ask me anything about your nutrition, meals, or fitness goals.",
      isHealthResponse: false,
    },
  ]);
  const [input, setInput] = useState("");
  const msgCounter = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(messages.length);

  if (prevMsgCount.current !== messages.length) {
    prevMsgCount.current = messages.length;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  if (!isPremium) {
    return (
      <div
        data-ocid="dashboard.ai_coach.locked_state"
        className="flex flex-col items-center gap-5 py-12 px-4 text-center"
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: "oklch(0.55 0.22 280 / 0.12)" }}
          aria-hidden="true"
        >
          <Lock
            className="w-7 h-7"
            style={{ color: "oklch(0.68 0.22 280)" }}
            aria-hidden="true"
          />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h3 className="font-display font-bold text-lg text-white">
            AI Coach is Premium
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            Chat with your personal AI coach, get meal adjustments, and receive
            real-time guidance on your nutrition journey.
          </p>
        </div>
        <ul className="text-left space-y-2 w-full max-w-xs">
          {[
            'Ask "What should I eat now?"',
            "Missed a meal? Get smart alternatives",
            "Health tips with safety disclaimers",
            "Goal-specific nutrition coaching",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-2 text-sm text-white/60"
            >
              <CheckCircle2
                className="w-4 h-4 text-primary shrink-0 mt-0.5"
                aria-hidden="true"
              />
              {t}
            </li>
          ))}
        </ul>
        <button
          data-ocid="dashboard.ai_coach.upgrade_button"
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth min-h-[44px]"
        >
          <Crown className="w-4 h-4" aria-hidden="true" />
          Upgrade to Premium
        </button>
      </div>
    );
  }

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || chatWithAI.isPending) return;

    const userMsgId = msgCounter.current++;
    const thinkingMsgId = msgCounter.current++;

    // Add user message + thinking indicator instantly
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: msg },
      { id: thinkingMsgId, role: "thinking", text: "thinking" },
    ]);
    setInput("");

    try {
      const response: ChatResponse = await chatWithAI.mutateAsync({
        user_message: msg,
      });
      const aiMsgId = msgCounter.current++;
      // Replace thinking indicator with actual response
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: aiMsgId,
            role: "ai",
            text: response.ai_message,
            isHealthResponse: response.is_health_response,
          }),
      );
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to get a response.";
      const isTierLimit = errMsg.startsWith("TIER_LIMITED:");
      const isTimeout = /timed out|timeout/i.test(errMsg);
      const aiMsgId = msgCounter.current++;
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingMsgId)
          .concat({
            id: aiMsgId,
            role: "ai",
            text: isTierLimit
              ? "You've reached your daily limit. Upgrade to Premium for unlimited AI chat."
              : isTimeout
                ? "I'm having trouble connecting right now. Try again in a moment."
                : `Sorry, I couldn't respond right now. ${errMsg}`,
            isHealthResponse: false,
          }),
      );
    }
  };

  return (
    <div
      data-ocid="dashboard.ai_coach.panel"
      className="flex flex-col h-[480px]"
    >
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            data-ocid={`dashboard.chat.message.${m.id}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {(m.role === "ai" || m.role === "thinking") && (
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-1"
                style={{ background: "oklch(0.55 0.22 280 / 0.2)" }}
                aria-hidden="true"
              >
                <BotMessageSquare
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.68 0.22 280)" }}
                />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm text-white"
                  : "rounded-bl-sm text-white/90 border border-white/10"
              }`}
              style={
                m.role === "user"
                  ? { background: "oklch(0.55 0.22 280 / 0.8)" }
                  : { background: "oklch(0.20 0.02 270 / 0.8)" }
              }
            >
              {m.role === "thinking" ? (
                <div
                  data-ocid="dashboard.ai_coach.loading_state"
                  className="flex items-center gap-2 text-xs text-white/50"
                >
                  <Loader2
                    className="w-3 h-3 animate-spin"
                    aria-hidden="true"
                  />
                  Your coach is thinking…
                </div>
              ) : (
                <>
                  {m.text}
                  {m.role === "ai" && m.id > 0 && (
                    <p
                      className="mt-2 text-[11px] leading-tight italic"
                      style={{ color: "oklch(0.5 0.01 260)" }}
                    >
                      Note: This is informational only. Consider consulting a
                      professional.
                    </p>
                  )}
                  {m.isHealthResponse && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 rounded-lg px-2.5 py-1.5">
                      <TriangleAlert
                        className="w-3 h-3 shrink-0"
                        aria-hidden="true"
                      />
                      Not medical advice
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-white/10">
        <input
          data-ocid="dashboard.ai_coach.input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask your AI coach anything…"
          className="flex-1 rounded-xl border border-white/15 bg-white/5 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] placeholder:text-white/30"
          disabled={chatWithAI.isPending}
          aria-label="Message to AI coach"
          maxLength={500}
        />
        <button
          data-ocid="dashboard.ai_coach.send_button"
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || chatWithAI.isPending}
          className="flex items-center justify-center w-11 h-11 rounded-xl gradient-primary text-white shrink-0 hover:opacity-90 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed shadow-glow"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      {/* Medical disclaimer below input — always visible */}
      <p
        data-ocid="dashboard.ai_coach.disclaimer"
        className="mt-2 text-xs text-center leading-relaxed"
        style={{ color: "oklch(0.55 0.01 260)" }}
      >
        ⚕ This is <strong>not medical advice</strong>. Consider consulting a
        qualified healthcare professional for any health decisions.
      </p>
    </div>
  );
}

// ── Lifestyle Description Modal ────────────────────────────────────────────────
interface LifestyleModalProps {
  current?: string;
  onSave: (text: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function LifestyleModal({
  current,
  onSave,
  onClose,
  saving,
}: LifestyleModalProps) {
  const [text, setText] = useState(current ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      data-ocid="dashboard.lifestyle_modal.dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{ background: "oklch(0.08 0.01 260 / 0.85)" }}
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{
          background: "oklch(0.19 0.015 260 / 0.98)",
          border: "1px solid oklch(0.55 0.22 280 / 0.3)",
        }}
      >
        <div className="h-1 w-full gradient-primary rounded-t-2xl absolute top-0 left-0 right-0" />

        <div className="flex items-center justify-between mb-4 mt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: "oklch(0.55 0.22 280 / 0.15)" }}
              aria-hidden="true"
            >
              <FileText
                className="w-4 h-4"
                style={{ color: "oklch(0.68 0.22 280)" }}
              />
            </div>
            <h2 className="font-display font-bold text-lg text-white">
              Lifestyle &amp; Preferences
            </h2>
          </div>
          <button
            data-ocid="dashboard.lifestyle_modal.close_button"
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-smooth"
            aria-label="Close"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-primary/80 font-medium mb-3">
          Help us personalize your diet better
        </p>

        <textarea
          data-ocid="dashboard.lifestyle_modal.textarea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us about your daily routine, eating habits, food you love or dislike, body type, digestion, restrictions…&#10;&#10;Example: 'I eat roti daily, don't like oats, sleep by 11pm, go to gym 4x/week'"
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 resize-none leading-relaxed mb-4"
          ref={textareaRef}
          style={{
            background: "oklch(0.14 0.015 260 / 0.7)",
            border: "1px solid oklch(0.55 0.22 280 / 0.25)",
          }}
        />

        <div className="flex gap-3">
          <button
            data-ocid="dashboard.lifestyle_modal.save_button"
            type="button"
            onClick={() => onSave(text)}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth disabled:opacity-50 min-h-[44px]"
            aria-busy={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Save Description
              </>
            )}
          </button>
          <button
            data-ocid="dashboard.lifestyle_modal.cancel_button"
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-smooth min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Weekly Energy Trend Card ──────────────────────────────────────────────────

const DAY_ABBRS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getLastSevenDays(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function WeeklyEnergyTrendCard() {
  const { data: history = [], isLoading } = useFeedbackHistory(7);

  const last7 = getLastSevenDays();

  // Map date → energy_level for fast lookup
  const feedbackByDate = new Map(history.map((f) => [f.date, f.energy_level]));

  const loggedCount = last7.filter((d) => feedbackByDate.has(d)).length;

  // Compute average energy from logged days only
  let avgLabel = "";
  if (loggedCount > 0) {
    let highCount = 0;
    let lowCount = 0;
    for (const d of last7) {
      const e = feedbackByDate.get(d);
      if (e === EnergyLevel.high) highCount++;
      else if (e === EnergyLevel.low) lowCount++;
    }
    const highRatio = highCount / loggedCount;
    const lowRatio = lowCount / loggedCount;
    if (highRatio >= 0.5) avgLabel = "high";
    else if (lowRatio >= 0.5) avgLabel = "low";
    else avgLabel = "medium";
  }

  const energyDotColor = {
    [EnergyLevel.high]: "oklch(0.64 0.20 142)",
    [EnergyLevel.medium]: "oklch(0.76 0.18 85)",
    [EnergyLevel.low]: "oklch(0.55 0.22 27)",
  };

  const energyEmoji = {
    [EnergyLevel.high]: "⚡",
    [EnergyLevel.medium]: "😊",
    [EnergyLevel.low]: "😴",
  };

  return (
    <div
      data-ocid="dashboard.weekly_energy_card"
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
          <span className="text-lg">📈</span>
        </div>
        <div>
          <p className="font-display font-bold text-base text-white leading-tight">
            Weekly Energy Trend
          </p>
          <p className="text-xs text-white/45 mt-0.5">Last 7 days</p>
        </div>
      </div>

      <div className="px-6 py-5">
        {isLoading ? (
          <div className="flex gap-2 justify-between">
            {Array.from({ length: 7 }, (_, i) => i).map((i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 animate-pulse"
              >
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-3 w-6 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 7-day tiles */}
            <ul
              className="flex justify-between gap-1"
              aria-label="Energy levels for last 7 days"
            >
              {last7.map((dateStr) => {
                const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay();
                const abbr = DAY_ABBRS[dayOfWeek];
                const energy = feedbackByDate.get(dateStr);
                const isToday = dateStr === last7[6];

                return (
                  <li
                    key={dateStr}
                    data-ocid={`dashboard.weekly_energy.day.${dateStr}`}
                    className="flex-1 flex flex-col items-center gap-1.5"
                    title={
                      energy
                        ? `${dateStr}: ${energy} energy`
                        : `${dateStr}: no data`
                    }
                  >
                    {/* Dot */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-smooth"
                      style={{
                        background: energy
                          ? `${energyDotColor[energy]}22`
                          : "oklch(0.28 0.01 260 / 0.5)",
                        border: energy
                          ? `2px solid ${energyDotColor[energy]}80`
                          : "2px solid oklch(0.35 0.01 260 / 0.4)",
                        boxShadow:
                          energy && isToday
                            ? `0 0 10px ${energyDotColor[energy]}40`
                            : undefined,
                      }}
                      aria-label={energy ?? "no data"}
                    >
                      {energy ? (
                        <span aria-hidden="true">{energyEmoji[energy]}</span>
                      ) : (
                        <span
                          className="text-white/25 text-xs font-bold"
                          aria-hidden="true"
                        >
                          –
                        </span>
                      )}
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        isToday ? "text-primary" : "text-white/40"
                      }`}
                    >
                      {abbr}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Summary line */}
            <div className="mt-4 pt-3 border-t border-white/[8%]">
              {loggedCount === 0 ? (
                <p className="text-xs text-white/40 text-center">
                  No feedback logged this week yet
                </p>
              ) : (
                <p className="text-xs text-white/60 text-center">
                  This week:{" "}
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        avgLabel === "high"
                          ? "oklch(0.64 0.20 142)"
                          : avgLabel === "low"
                            ? "oklch(0.55 0.22 27)"
                            : "oklch(0.76 0.18 85)",
                    }}
                  >
                    avg energy{" "}
                    {avgLabel === "high"
                      ? "⚡ high"
                      : avgLabel === "low"
                        ? "😴 low"
                        : "😊 medium"}
                  </span>{" "}
                  ·{" "}
                  <span className="text-white/50">
                    {loggedCount}/7 days logged
                  </span>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Macro Breakdown Panel ─────────────────────────────────────────────────────

function MacroBreakdownPanel() {
  const { data: journey, isLoading } = useTodayJourney();

  const mealTasks = (journey?.tasks ?? []).filter(
    (t) => t.task_type === "meal",
  );

  const totalCalories = mealTasks.reduce(
    (sum, t) => sum + (t.calories ?? 0),
    0,
  );
  const totalProtein = mealTasks.reduce((sum, t) => sum + (t.protein ?? 0), 0);
  // Estimated carbs: (total_calories - protein_calories) / 4
  const estimatedCarbs = Math.max(
    0,
    Math.round((totalCalories - totalProtein * 4) / 4),
  );

  const hasData = mealTasks.length > 0;

  if (isLoading) {
    return (
      <div
        data-ocid="dashboard.macro_panel.loading_state"
        className="rounded-2xl border border-white/10 px-6 py-4"
        style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
      >
        <div className="flex gap-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-10 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div
        data-ocid="dashboard.macro_panel.empty_state"
        className="rounded-2xl border border-white/10 px-6 py-4 text-center"
        style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
      >
        <p className="text-xs text-white/35">
          Generate today's plan to see macros
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="dashboard.macro_panel"
      className="rounded-2xl border border-white/10 px-6 py-4 fade-in"
      style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
    >
      {/* Stat chips */}
      <ul className="flex gap-2 flex-wrap" aria-label="Today's macro breakdown">
        {/* Calories */}
        <li
          data-ocid="dashboard.macro_panel.calories"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 flex-1 min-w-[80px]"
          style={{ background: "oklch(0.14 0.015 260 / 0.6)" }}
        >
          <span className="text-base shrink-0" aria-hidden="true">
            🔥
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {totalCalories}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">
              kcal
            </p>
          </div>
        </li>

        {/* Protein */}
        <li
          data-ocid="dashboard.macro_panel.protein"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 flex-1 min-w-[80px]"
          style={{ background: "oklch(0.14 0.015 260 / 0.6)" }}
        >
          <span className="text-base shrink-0" aria-hidden="true">
            💪
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {totalProtein}g
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">
              protein
            </p>
          </div>
        </li>

        {/* Carbs (estimated) */}
        <li
          data-ocid="dashboard.macro_panel.carbs"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 flex-1 min-w-[80px]"
          style={{ background: "oklch(0.14 0.015 260 / 0.6)" }}
        >
          <span className="text-base shrink-0" aria-hidden="true">
            🌾
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              ~{estimatedCarbs}g
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">
              carbs
            </p>
          </div>
        </li>
      </ul>

      {/* Label */}
      <p className="mt-3 text-[11px] text-white/35 text-center">
        Today's planned macros from your AI meal plan
      </p>
    </div>
  );
}

// ── Daily Review Card ─────────────────────────────────────────────────────────
function energyLevelToLabel(level: EnergyLevel): "low" | "medium" | "high" {
  if (level === EnergyLevel.low) return "low";
  if (level === EnergyLevel.high) return "high";
  return "medium";
}

function labelToEnergyLevel(label: "low" | "medium" | "high"): EnergyLevel {
  if (label === "low") return EnergyLevel.low;
  if (label === "high") return EnergyLevel.high;
  return EnergyLevel.medium;
}

interface DailyReviewCardProps {
  onFeedbackSaved?: () => void;
}

function DailyReviewCard({ onFeedbackSaved }: DailyReviewCardProps) {
  const { data: todayFeedback, isLoading: feedbackLoading } =
    useTodayFeedback();
  const addFeedback = useAddFeedback();

  // Start collapsed/hidden until we know whether feedback exists.
  // isExpanded starts false; the useEffect below opens it only when there's
  // no existing feedback (so the form is ready to fill in).
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [energyLevel, setEnergyLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [healthStatus, setHealthStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Once the query resolves, sync state once (guard with a ref so it only
  // runs on the first resolved value, not on every re-render).
  const initialised = useRef(false);
  useEffect(() => {
    if (feedbackLoading || initialised.current) return;
    initialised.current = true;
    if (todayFeedback) {
      setFeedbackText(todayFeedback.feedback_text);
      setEnergyLevel(energyLevelToLabel(todayFeedback.energy_level));
      setHealthStatus(todayFeedback.health_status);
      setNotes(todayFeedback.notes);
      setSubmitted(true);
      setIsExpanded(false);
    } else {
      // No existing feedback — open the form automatically
      setIsExpanded(true);
    }
  }, [feedbackLoading, todayFeedback]);

  const today = new Date().toISOString().split("T")[0];
  const hasExisting = !!todayFeedback;

  const handleSubmit = async () => {
    const req: AddFeedbackRequest = {
      date: today,
      feedback_text: feedbackText.trim(),
      energy_level: labelToEnergyLevel(energyLevel),
      health_status: healthStatus.trim(),
      notes: notes.trim(),
    };

    try {
      await addFeedback.mutateAsync(req);
      setSubmitted(true);
      setIsExpanded(false);
      toast.success("Today's review saved!", { duration: 3000 });
      onFeedbackSaved?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save review.";
      toast.error(msg);
    }
  };

  const energyConfig = {
    low: {
      label: "Low",
      emoji: "😴",
      active: "border-orange-400/70 bg-orange-400/15 text-orange-300",
      inactive:
        "border-white/15 bg-white/5 text-white/50 hover:border-white/30",
    },
    medium: {
      label: "Medium",
      emoji: "😊",
      active: "border-primary/70 bg-primary/15 text-white",
      inactive:
        "border-white/15 bg-white/5 text-white/50 hover:border-white/30",
    },
    high: {
      label: "High",
      emoji: "⚡",
      active: "border-green-400/70 bg-green-400/15 text-green-300",
      inactive:
        "border-white/15 bg-white/5 text-white/50 hover:border-white/30",
    },
  } as const;

  return (
    <div
      data-ocid="dashboard.daily_review_card"
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
    >
      {/* Header */}
      <button
        type="button"
        data-ocid="dashboard.daily_review.toggle"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-smooth"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
            style={{ background: "oklch(0.55 0.22 280 / 0.15)" }}
            aria-hidden="true"
          >
            <span className="text-lg">📋</span>
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-base text-white leading-tight">
              Daily Review
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Help us personalize your diet better
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {submitted && !isExpanded && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "oklch(0.45 0.18 145 / 0.2)",
                color: "oklch(0.75 0.18 145)",
                border: "1px solid oklch(0.45 0.18 145 / 0.3)",
              }}
            >
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              Saved
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Collapsed success state */}
      {!isExpanded && submitted && (
        <div
          data-ocid="dashboard.daily_review.success_state"
          className="px-6 pb-5"
        >
          <div
            className="rounded-xl border px-4 py-3 flex items-center gap-3"
            style={{
              background: "oklch(0.45 0.18 145 / 0.08)",
              borderColor: "oklch(0.45 0.18 145 / 0.2)",
            }}
          >
            <CheckCircle2
              className="w-5 h-5 shrink-0"
              style={{ color: "oklch(0.65 0.18 145)" }}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                Today's feedback saved ✓
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Your feedback shapes tomorrow's plan. Tap above to update.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded form */}
      {isExpanded && (
        <div
          data-ocid="dashboard.daily_review.form"
          className="px-6 pb-6 space-y-4"
        >
          {feedbackLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Diet feedback */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-feedback"
                  className="block text-xs font-semibold text-white/60 uppercase tracking-wider"
                >
                  How was your diet today?
                </label>
                <textarea
                  id="review-feedback"
                  data-ocid="dashboard.daily_review.feedback_textarea"
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Did you feel improvement? Any issues with the meals? Did you follow the plan?"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 resize-none leading-relaxed"
                  style={{
                    background: "oklch(0.14 0.015 260 / 0.7)",
                    border: "1px solid oklch(0.55 0.22 280 / 0.2)",
                  }}
                />
              </div>

              {/* Energy level */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Energy Level Today
                </p>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((level) => {
                    const cfg = energyConfig[level];
                    const isActive = energyLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        data-ocid={`dashboard.daily_review.energy_${level}_button`}
                        onClick={() => setEnergyLevel(level)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-smooth min-h-[44px] ${isActive ? cfg.active : cfg.inactive}`}
                      >
                        <span aria-hidden="true">{cfg.emoji}</span>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pain / discomfort */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-health"
                  className="block text-xs font-semibold text-white/60 uppercase tracking-wider"
                >
                  Any pain or discomfort?{" "}
                  <span className="normal-case font-normal text-white/35">
                    (optional)
                  </span>
                </label>
                <input
                  id="review-health"
                  data-ocid="dashboard.daily_review.health_input"
                  type="text"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  placeholder="e.g. stomach discomfort, back pain, fatigue…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2"
                  style={{
                    background: "oklch(0.14 0.015 260 / 0.7)",
                    border: "1px solid oklch(0.55 0.22 280 / 0.2)",
                  }}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label
                  htmlFor="review-notes"
                  className="block text-xs font-semibold text-white/60 uppercase tracking-wider"
                >
                  Notes{" "}
                  <span className="normal-case font-normal text-white/35">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="review-notes"
                  data-ocid="dashboard.daily_review.notes_textarea"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra observations about today's meals or how you felt…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 resize-none leading-relaxed"
                  style={{
                    background: "oklch(0.14 0.015 260 / 0.7)",
                    border: "1px solid oklch(0.55 0.22 280 / 0.2)",
                  }}
                />
              </div>

              {/* Submit */}
              <div className="space-y-2 pt-1">
                <button
                  data-ocid="dashboard.daily_review.submit_button"
                  type="button"
                  onClick={handleSubmit}
                  disabled={addFeedback.isPending || !feedbackText.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth disabled:opacity-50 min-h-[44px]"
                  aria-busy={addFeedback.isPending}
                >
                  {addFeedback.isPending ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" aria-hidden="true" />
                      {hasExisting ? "Update Review" : "Save Today's Review"}
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-white/35">
                  Your feedback shapes tomorrow's plan
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Trial / Subscription Banner ────────────────────────────────────────────────
interface TrialBannerProps {
  planStatus: PlanStatus;
  trialStartDate: number | null;
  onSubscribe: () => void;
  isCreatingOrder: boolean;
}

function TrialBanner({
  planStatus,
  trialStartDate,
  onSubscribe,
  isCreatingOrder,
}: TrialBannerProps) {
  if (planStatus === "premium") return null;

  if (planStatus === "free") {
    // Trial ended, not subscribed
    return (
      <div
        data-ocid="dashboard.trial_ended_banner"
        className="mx-4 mt-4 rounded-2xl border border-red-500/30 px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{ background: "oklch(0.18 0.06 20 / 0.5)" }}
      >
        <span className="text-2xl shrink-0" aria-hidden="true">
          ⏰
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-tight">
            Your free trial has ended
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            Subscribe for ₹99/month to continue premium features.
          </p>
        </div>
        <button
          data-ocid="dashboard.trial_subscribe_button"
          type="button"
          onClick={onSubscribe}
          disabled={isCreatingOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold text-xs hover:opacity-90 transition-smooth disabled:opacity-50 shadow-glow shrink-0 min-h-[40px]"
        >
          {isCreatingOrder ? "Processing…" : "Subscribe Now — ₹99/month"}
        </button>
      </div>
    );
  }

  // planStatus === "trial"
  const daysLeft = trialStartDate
    ? Math.max(0, 30 - Math.floor((Date.now() - trialStartDate) / 86_400_000))
    : 30;

  if (daysLeft <= 3) {
    return (
      <div
        data-ocid="dashboard.trial_expiring_banner"
        className="mx-4 mt-4 rounded-2xl border border-orange-500/40 px-5 py-4 flex items-center gap-4 flex-wrap"
        style={{ background: "oklch(0.18 0.06 50 / 0.5)" }}
      >
        <span className="text-2xl shrink-0" aria-hidden="true">
          ⚡
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-orange-200 text-sm leading-tight">
            Your free trial ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-white/55 mt-0.5">
            Subscribe for ₹99/month to keep your progress.
          </p>
        </div>
        <button
          data-ocid="dashboard.trial_subscribe_urgent_button"
          type="button"
          onClick={onSubscribe}
          disabled={isCreatingOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold text-xs hover:opacity-90 transition-smooth disabled:opacity-50 shadow-glow shrink-0 min-h-[40px]"
        >
          {isCreatingOrder ? "Processing…" : "Subscribe — ₹99/month"}
        </button>
      </div>
    );
  }

  return (
    <div
      data-ocid="dashboard.trial_active_banner"
      className="mx-4 mt-4 rounded-xl border border-primary/20 px-5 py-3 flex items-center gap-3"
      style={{ background: "oklch(0.16 0.025 280 / 0.4)" }}
    >
      <span className="text-base shrink-0" aria-hidden="true">
        🎁
      </span>
      <p className="text-xs text-primary/90 font-medium">
        Free trial active — {daysLeft} days remaining
      </p>
    </div>
  );
}

// ── Generate AI Plan Button ─────────────────────────────────────────────────────
interface GenerateAIPlanProps {
  isPremium: boolean;
  onUpgrade: () => void;
  hasJourney: boolean;
}
function GenerateAIPlan({
  isPremium,
  onUpgrade,
  hasJourney,
}: GenerateAIPlanProps) {
  const generateAI = useGenerateAIDiet();
  const [usedToday, setUsedToday] = useState(false);

  const handleGenerate = async () => {
    if (!isPremium && usedToday) return;
    try {
      await generateAI.mutateAsync();
      if (!isPremium) setUsedToday(true);
      toast.success("AI diet plan generated!", { duration: 3000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate.";
      if (msg.startsWith("TIER_LIMITED") || /tier|limit|upgrade/i.test(msg)) {
        toast.error("Daily AI plan limit reached. Upgrade to Premium.");
        setUsedToday(true);
      } else {
        toast.error(msg);
      }
    }
  };

  if (!isPremium && usedToday) {
    return (
      <button
        data-ocid="dashboard.ai_plan.upgrade_button"
        type="button"
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-smooth min-h-[36px]"
      >
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        Daily limit reached — Upgrade
      </button>
    );
  }

  return (
    <button
      data-ocid="dashboard.ai_plan.generate_button"
      type="button"
      onClick={handleGenerate}
      disabled={generateAI.isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-smooth disabled:opacity-50 shadow-glow min-h-[36px]"
      aria-busy={generateAI.isPending}
    >
      {generateAI.isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          Generating…
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          {hasJourney ? "Regenerate AI Plan" : "Generate AI Plan"}
          {!isPremium && (
            <span className="ml-1 opacity-70 font-normal">· 1/day</span>
          )}
        </>
      )}
    </button>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { logout, principalId, sessionToken } = useAuthContext();
  const navigate = useNavigate();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useMyProfile();
  const { data: journey, isLoading: journeyLoading } = useTodayJourney();
  const { data: activityList } = useMyActivity();
  const updateProfile = useUpdateMyProfile();
  const generateAI = useGenerateAIDiet();
  const { openCheckout, isPremium, isCreatingOrder, priceLabel } =
    useRazorpayCheckout(profile?.email);

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [savingField, setSavingField] = useState<EditableField | null>(null);
  const [activeTab, setActiveTab] = useState<"journey" | "ai_coach">("journey");
  const [dismissedReminderIds, setDismissedReminderIds] = useState<Set<number>>(
    new Set(),
  );
  const [showLifestyleModal, setShowLifestyleModal] = useState(false);
  const [savingLifestyle, setSavingLifestyle] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Log profile load
  useEffect(() => {
    if (profile) {
      console.log(
        `[${new Date().toISOString()}] Dashboard: profile loaded for ${profile.name}`,
        { goal: profile.goal, height: profile.height, weight: profile.weight },
      );
    }
  }, [profile]);

  // Log profile error
  useEffect(() => {
    if (profileError) {
      console.error(
        `[${new Date().toISOString()}] Dashboard: profile load failed —`,
        profileErrorObj instanceof Error
          ? profileErrorObj.message
          : String(profileErrorObj),
      );
    }
  }, [profileError, profileErrorObj]);

  // Auto-trigger AI plan generation if no plan exists yet for today
  const generateAIRef = useRef(generateAI.mutate);
  generateAIRef.current = generateAI.mutate;
  const generateAIPendingRef = useRef(generateAI.isPending);
  generateAIPendingRef.current = generateAI.isPending;

  useEffect(() => {
    if (!journeyLoading && journey === null && !generateAIPendingRef.current) {
      generateAIRef.current(undefined, {
        onError: (err) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (!/tier|limit|upgrade/i.test(msg)) {
            console.error(
              `[${new Date().toISOString()}] Dashboard: auto-generate plan failed —`,
              msg,
            );
          }
        },
      });
    }
  }, [journeyLoading, journey]);

  const isOnFreePlan = !isPremium;
  const planLabel =
    profile?.subscription_plan === SubscriptionPlan.premium
      ? "Premium"
      : "Free";

  const handleLogout = () => {
    console.log(`[${new Date().toISOString()}] Dashboard: user signed out`);
    logout();
    navigate({ to: "/" });
  };

  async function handleUpdate(req: UpdateUserRequest, field: EditableField) {
    console.log(
      `[${new Date().toISOString()}] Dashboard: attempting to edit ${field}`,
      req,
    );
    setSavingField(field);
    try {
      await updateProfile.mutateAsync(req);
      setEditingField(null);
      console.log(
        `[${new Date().toISOString()}] Dashboard: ${field} updated successfully`,
      );
      toast.success("Updated successfully", { duration: 3000 });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to update ${field}`;
      console.error(
        `[${new Date().toISOString()}] Dashboard: ${field} update failed —`,
        msg,
      );
      toast.error(msg);
    } finally {
      setSavingField(null);
    }
  }

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    try {
      // Invalidate the server-side session so the token is no longer usable.
      // The backend does not yet expose a dedicated deleteAccount endpoint, so
      // we revoke the session, clear all local data, and direct the user to
      // the support email for permanent data erasure (DPDP Act compliance).
      if (sessionToken) {
        const actor = await getBackendActor();
        await Promise.race([
          actor.logoutUser(sessionToken),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5_000),
          ),
        ]);
      }
      // Clear local session regardless of backend response
      await logout();
      setShowDeleteAccountModal(false);
      toast.success(
        "Your session has been terminated. To permanently erase your data, email help.dietaryassistant@gmail.com with subject 'Delete My Account'.",
        { duration: 10_000 },
      );
      navigate({ to: "/" });
    } catch (err) {
      const msg =
        err instanceof Error
          ? `Failed to delete account: ${err.message}`
          : "Failed to delete account. Please try again or contact help.dietaryassistant@gmail.com.";
      toast.error(msg, { duration: 8_000 });
    } finally {
      setIsDeletingAccount(false);
    }
  }

  // Latest activity stats
  const latestActivity =
    activityList && activityList.length > 0
      ? activityList[activityList.length - 1]
      : null;

  const statCards: {
    field: EditableField;
    label: string;
    value: string;
  }[] = [
    {
      field: "goal",
      label: "Goal",
      value: goalLabel(profile?.goal),
    },
    {
      field: "height",
      label: "Height",
      value: profile?.height ? `${profile.height} cm` : "—",
    },
    {
      field: "weight",
      label: "Weight",
      value: profile?.weight ? `${profile.weight} kg` : "—",
    },
    {
      field: "age",
      label: "Age",
      value: profile?.age ? `${profile.age} yrs` : "—",
    },
    {
      field: "activity_level",
      label: "Activity",
      value: activityLabel(profile?.activity_level),
    },
    {
      field: "dietary_preference",
      label: "Diet Pref",
      value: dietLabel(profile?.dietary_preference),
    },
    {
      field: "diet_type",
      label: "Diet Type",
      value: dietTypeLabel(profile?.diet_type),
    },
  ];

  const hasJourney = (journey?.tasks.length ?? 0) > 0;

  return (
    <div
      data-ocid="dashboard.page"
      className="min-h-screen gradient-hero relative overflow-hidden"
    >
      {/* Decorative orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{ background: "oklch(0.55 0.22 280 / 0.4)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
          style={{ background: "oklch(0.62 0.25 260 / 0.3)" }}
        />
      </div>

      {/* Top nav bar */}
      <header
        data-ocid="dashboard.header"
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10"
        style={{ background: "oklch(0.16 0.02 260 / 0.7)" }}
      >
        <button
          data-ocid="dashboard.home_link"
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-80 transition-smooth"
          aria-label="Go to home"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow shrink-0">
            <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span>
            AI <span className="text-gradient">Diet Coach</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            data-ocid="dashboard.back_to_home_link"
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-smooth"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Home
          </button>
          <button
            data-ocid="dashboard.logout_button"
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3.5 py-2 transition-smooth min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Trial / subscription banner — shown below navbar */}
      {profile && (
        <TrialBanner
          planStatus={profile.plan_status ?? "trial"}
          trialStartDate={profile.trial_start_date ?? null}
          onSubscribe={openCheckout}
          isCreatingOrder={isCreatingOrder}
        />
      )}

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {profileLoading ? (
          /* Loading skeleton */
          <div data-ocid="dashboard.loading_state" className="space-y-6">
            <div
              className="rounded-2xl border border-white/10 p-7 animate-pulse"
              style={{ background: "oklch(0.19 0.015 260 / 0.85)" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 rounded bg-white/10" />
                  <div className="h-3 w-32 rounded bg-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[0, 1, 2].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <div
              className="rounded-3xl border border-white/10 p-8 animate-pulse"
              style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
            >
              <div className="h-8 w-48 rounded-lg bg-white/10 mx-auto mb-3" />
              <div className="h-4 w-64 rounded bg-white/10 mx-auto" />
            </div>
          </div>
        ) : profileError ? (
          /* Error state with retry */
          <div
            data-ocid="dashboard.error_state"
            className="flex flex-col items-center gap-5 py-24 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl border border-destructive/30 bg-destructive/10">
              <AlertCircle
                className="w-8 h-8 text-destructive"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-2 max-w-xs">
              <h2 className="font-display font-bold text-xl text-white">
                Could not load your profile
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {profileErrorObj instanceof Error
                  ? profileErrorObj.message
                  : "Failed to connect to the backend. Check your connection and try again."}
              </p>
            </div>
            <button
              data-ocid="dashboard.retry_button"
              type="button"
              onClick={() => {
                console.log(
                  `[${new Date().toISOString()}] Dashboard: retrying profile load`,
                );
                refetchProfile();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
            <button
              data-ocid="dashboard.logout_after_error_button"
              type="button"
              onClick={handleLogout}
              className="text-sm text-white/40 hover:text-white/70 transition-smooth underline"
            >
              Sign out and try again
            </button>
          </div>
        ) : (
          /* Full dashboard */
          <div className="fade-in space-y-6">
            {/* Welcome card */}
            <div
              data-ocid="dashboard.welcome_card"
              className="rounded-2xl border border-white/10 p-7 relative overflow-hidden"
              style={{ background: "oklch(0.19 0.015 260 / 0.85)" }}
            >
              <div className="h-1 w-full gradient-primary absolute top-0 left-0 right-0" />
              <div className="flex items-start gap-4 mt-1">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-glow shrink-0">
                  <span className="text-2xl" aria-hidden="true">
                    {profile?.goal === Goal.fat_loss
                      ? "🔥"
                      : profile?.goal === Goal.muscle_gain
                        ? "💪"
                        : profile?.goal === Goal.lifestyle_balance
                          ? "⚖️"
                          : "👋"}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-bold text-2xl text-white leading-tight">
                    Welcome back
                    {profile?.name ? (
                      <>
                        , <span className="text-gradient">{profile.name}</span>!
                      </>
                    ) : (
                      "!"
                    )}
                  </h1>
                  <p className="text-sm text-white/50 mt-1 font-mono truncate">
                    {principalId ? formatPrincipal(principalId) : "—"}
                  </p>
                </div>
              </div>

              {/* Profile stat cards — 3-col then wraps */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {statCards.map(({ field, label, value }) => (
                  <StatCard
                    key={field}
                    field={field}
                    label={label}
                    value={value}
                    isLoading={false}
                    editingField={editingField}
                    setEditingField={setEditingField}
                    profile={profile}
                    onUpdate={(req) => handleUpdate(req, field)}
                    savingField={savingField}
                  />
                ))}
              </div>

              {/* Edit hint */}
              {!editingField && (
                <p className="mt-3 text-xs text-white/25 text-center">
                  Tap the{" "}
                  <Pencil
                    className="inline w-3 h-3 align-middle"
                    aria-hidden="true"
                  />{" "}
                  icon on any card to update your stats
                </p>
              )}

              {/* Lifestyle Description button */}
              <div className="mt-4">
                <button
                  data-ocid="dashboard.lifestyle.edit_button"
                  type="button"
                  onClick={() => setShowLifestyleModal(true)}
                  className="w-full flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left hover:border-primary/30 hover:bg-primary/5 transition-smooth group"
                  style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: "oklch(0.55 0.22 280 / 0.12)" }}
                    aria-hidden="true"
                  >
                    <FileText
                      className="w-3.5 h-3.5 group-hover:text-primary transition-smooth"
                      style={{ color: "oklch(0.65 0.22 280)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                      Lifestyle Description
                    </p>
                    <p className="text-sm text-white/50 mt-0.5 truncate">
                      {profile?.lifestyle_description
                        ? profile.lifestyle_description.slice(0, 60) +
                          (profile.lifestyle_description.length > 60 ? "…" : "")
                        : "Add your routine, preferences & restrictions"}
                    </p>
                  </div>
                  <Pencil
                    className="w-3.5 h-3.5 text-white/25 group-hover:text-primary shrink-0 transition-smooth"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Delete Account */}
              <div className="mt-3 flex justify-end">
                <button
                  data-ocid="dashboard.delete_account.open_modal_button"
                  type="button"
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="text-xs font-medium transition-smooth hover:underline"
                  style={{ color: "oklch(0.55 0.19 22)" }}
                >
                  Delete Account
                </button>
              </div>

              {/* Today's activity summary (if available) */}
              {latestActivity && (
                <div
                  data-ocid="dashboard.activity_summary"
                  className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2"
                >
                  {latestActivity.meals_completed !== undefined && (
                    <div
                      className="rounded-lg border border-white/10 px-3 py-2 text-center"
                      style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
                    >
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-0.5">
                        Meals Done
                      </p>
                      <p className="text-sm font-bold text-green-400">
                        {Number(latestActivity.meals_completed)}
                      </p>
                    </div>
                  )}
                  {latestActivity.meals_skipped !== undefined && (
                    <div
                      className="rounded-lg border border-white/10 px-3 py-2 text-center"
                      style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
                    >
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-0.5">
                        Skipped
                      </p>
                      <p className="text-sm font-bold text-orange-400">
                        {latestActivity.meals_skipped}
                      </p>
                    </div>
                  )}
                  {latestActivity.total_protein !== undefined && (
                    <div
                      className="rounded-lg border border-white/10 px-3 py-2 text-center"
                      style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
                    >
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-0.5">
                        Protein
                      </p>
                      <p className="text-sm font-bold text-blue-400">
                        {latestActivity.total_protein}g
                      </p>
                    </div>
                  )}
                  {latestActivity.water_intake !== undefined && (
                    <div
                      className="rounded-lg border border-white/10 px-3 py-2 text-center"
                      style={{ background: "oklch(0.14 0.015 260 / 0.5)" }}
                    >
                      <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-0.5">
                        Water
                      </p>
                      <p className="text-sm font-bold text-cyan-400">
                        {latestActivity.water_intake}ml
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Reminders section ── */}
            <RemindersSection
              isPremium={isPremium}
              dismissedIds={dismissedReminderIds}
              onDismiss={(id) =>
                setDismissedReminderIds((prev) => new Set([...prev, id]))
              }
            />

            {/* ── Tab switcher: Journey / AI Coach ── */}
            <div
              data-ocid="dashboard.main_tabs"
              className="rounded-3xl border border-white/10 overflow-hidden"
              style={{ background: "oklch(0.17 0.018 265 / 0.85)" }}
            >
              {/* Tab header */}
              <div
                className="flex border-b border-white/10"
                role="tablist"
                aria-label="Dashboard sections"
              >
                <button
                  data-ocid="dashboard.journey_tab"
                  role="tab"
                  type="button"
                  aria-selected={activeTab === "journey"}
                  onClick={() => setActiveTab("journey")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-smooth border-b-2 ${
                    activeTab === "journey"
                      ? "border-primary text-white"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Today's Journey
                </button>
                <button
                  data-ocid="dashboard.ai_coach_tab"
                  role="tab"
                  type="button"
                  aria-selected={activeTab === "ai_coach"}
                  onClick={() => setActiveTab("ai_coach")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-smooth border-b-2 ${
                    activeTab === "ai_coach"
                      ? "border-primary text-white"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  <BotMessageSquare className="w-4 h-4" aria-hidden="true" />
                  AI Coach
                  {!isPremium && (
                    <Lock
                      className="w-3 h-3 text-white/30"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>

              {/* Tab content */}
              <div className="p-6 md:p-8">
                {activeTab === "journey" && (
                  <div role="tabpanel" data-ocid="dashboard.journey_panel">
                    {/* Generate AI Plan button above journey */}
                    <div className="flex justify-end mb-4">
                      <GenerateAIPlan
                        isPremium={isPremium}
                        onUpgrade={openCheckout}
                        hasJourney={hasJourney}
                      />
                    </div>
                    <TodayJourneySection isPremium={isPremium} />
                  </div>
                )}
                {activeTab === "ai_coach" && (
                  <div role="tabpanel" data-ocid="dashboard.ai_coach_panel">
                    <AIChatPanel
                      isPremium={isPremium}
                      onUpgrade={openCheckout}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Weekly Energy Trend ── */}
            <WeeklyEnergyTrendCard />

            {/* ── Macro Breakdown Panel ── */}
            <MacroBreakdownPanel />

            {/* ── Daily Review ── */}
            <DailyReviewCard />

            {/* ── Accountability Balance ── */}
            <AccountabilityBalanceSection userEmail={profile?.email} />

            {/* ── Streak Leaderboard ── */}
            <StreakLeaderboardCard />

            {/* Plan card */}
            <div
              data-ocid="dashboard.plan_card"
              className={`rounded-2xl border p-7 relative overflow-hidden ${
                !isOnFreePlan ? "border-primary/50" : "border-white/10"
              }`}
              style={{ background: "oklch(0.19 0.015 260 / 0.85)" }}
            >
              {!isOnFreePlan && (
                <div className="h-1 w-full gradient-primary absolute top-0 left-0 right-0" />
              )}

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                      !isOnFreePlan
                        ? "gradient-primary shadow-glow"
                        : "border border-white/20 bg-white/5"
                    }`}
                  >
                    {!isOnFreePlan ? (
                      <Crown
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    ) : (
                      <Zap
                        className="w-5 h-5 text-white/60"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                      Current Plan
                    </p>
                    <p className="font-display font-bold text-xl text-white">
                      {!isOnFreePlan ? (
                        <span className="text-gradient">{planLabel}</span>
                      ) : (
                        planLabel
                      )}
                    </p>
                  </div>
                </div>

                {isOnFreePlan && (
                  <button
                    data-ocid="dashboard.upgrade_button"
                    type="button"
                    onClick={openCheckout}
                    disabled={isCreatingOrder}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-h-[44px]"
                    aria-busy={isCreatingOrder}
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Upgrade to Premium — {priceLabel}
                      </>
                    )}
                  </button>
                )}
              </div>

              {isOnFreePlan && (
                <ul className="mt-5 space-y-2">
                  {PREMIUM_BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2.5 text-sm text-white/60"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {!isOnFreePlan && (
                <p className="mt-4 text-sm text-white/60 leading-relaxed">
                  You have full access to AI meal plans, tracking, chat, and all
                  premium features.
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div
              data-ocid="dashboard.actions_section"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <button
                data-ocid="dashboard.go_to_landing_button"
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="flex items-center gap-3 rounded-xl border border-white/10 px-5 py-4 text-left hover:border-primary/40 transition-smooth group min-h-[44px]"
                style={{ background: "oklch(0.19 0.015 260 / 0.85)" }}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-subtle border border-primary/20 shrink-0">
                  <Target
                    className="w-4 h-4 text-primary group-hover:scale-110 transition-smooth"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Explore Features
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    View all app capabilities
                  </p>
                </div>
              </button>

              <button
                data-ocid="dashboard.logout_action_button"
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl border border-white/10 px-5 py-4 text-left hover:border-destructive/40 transition-smooth group min-h-[44px]"
                style={{ background: "oklch(0.19 0.015 260 / 0.85)" }}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/20 shrink-0">
                  <LogOut
                    className="w-4 h-4 text-destructive group-hover:scale-110 transition-smooth"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Sign Out
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    End your session securely
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-white/30 border-t border-white/10 mt-8">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          className="hover:text-white/60 underline transition-smooth"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Lifestyle Description Modal */}
      {showLifestyleModal && (
        <LifestyleModal
          current={profile?.lifestyle_description}
          saving={savingLifestyle}
          onClose={() => setShowLifestyleModal(false)}
          onSave={async (text) => {
            setSavingLifestyle(true);
            try {
              await updateProfile.mutateAsync({ lifestyle_description: text });
              setShowLifestyleModal(false);
              toast.success("Lifestyle description saved!", { duration: 3000 });
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : "Failed to save.";
              toast.error(msg);
            } finally {
              setSavingLifestyle(false);
            }
          }}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div
          data-ocid="dashboard.delete_account.dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            style={{ background: "oklch(0.08 0.01 260 / 0.88)" }}
            onClick={() => setShowDeleteAccountModal(false)}
            aria-label="Close modal"
            tabIndex={-1}
          />
          {/* Modal */}
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-desc"
            style={{
              background: "oklch(0.19 0.015 260 / 0.98)",
              border: "1px solid oklch(0.55 0.22 22 / 0.35)",
            }}
          >
            {/* Red accent bar */}
            <div
              className="h-1 w-full rounded-t-2xl absolute top-0 left-0 right-0"
              style={{ background: "oklch(0.55 0.22 22)" }}
            />

            <div className="flex items-start gap-3 mt-2 mb-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: "oklch(0.55 0.22 22 / 0.12)" }}
                aria-hidden="true"
              >
                <TriangleAlert
                  className="w-5 h-5"
                  style={{ color: "oklch(0.65 0.22 22)" }}
                />
              </div>
              <div>
                <h2
                  id="delete-account-title"
                  className="font-display font-bold text-lg text-white leading-tight"
                >
                  Delete Account
                </h2>
                <p
                  id="delete-account-desc"
                  className="text-sm text-white/60 mt-1 leading-relaxed"
                >
                  Are you sure you want to delete your account? This will
                  permanently delete all your data including diet plans,
                  progress, and subscription.{" "}
                  <span className="text-white/80 font-semibold">
                    This action cannot be undone.
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                data-ocid="dashboard.delete_account.cancel_button"
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                disabled={isDeletingAccount}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-white/40 hover:text-white transition-smooth min-h-[44px]"
              >
                Cancel
              </button>
              <button
                data-ocid="dashboard.delete_account.confirm_button"
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-smooth min-h-[44px] disabled:opacity-50"
                style={{ background: "oklch(0.45 0.20 22)" }}
                aria-busy={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting…
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
