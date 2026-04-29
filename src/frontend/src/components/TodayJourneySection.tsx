import {
  useCompleteJourneyTask,
  useEditAIMeal,
  useEditMealPlan,
  useGenerateTodayPlan,
  useLogMissedMeal,
  useResetToAIPlan,
  useTodayJourney,
  useTodayProgress,
} from "@/hooks/useBackend";
import type {
  EditMealPlanRequest,
  EditMealRequest,
  EditableMealItem,
  JourneyTask,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Droplets,
  Flame,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  SkipForward,
  Trash2,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── XP Toast ─────────────────────────────────────────────────────────────────
interface XpToast {
  id: number;
  amount: number;
}

// ── Node state type ───────────────────────────────────────────────────────────
type NodeStatus = "completed" | "skipped" | "active" | "locked";

function getNodeStatus(
  taskId: number,
  completedIds: number[],
  skippedIds: number[],
  activeTaskId: number | null,
): NodeStatus {
  if (completedIds.includes(taskId)) return "completed";
  if (skippedIds.includes(taskId)) return "skipped";
  if (taskId === activeTaskId) return "active";
  return "locked";
}

// ── Task icon ─────────────────────────────────────────────────────────────────
function TaskIcon({
  type,
  size = 24,
}: { type: "meal" | "water"; size?: number }) {
  if (type === "water") return <Droplets width={size} height={size} />;
  return <Utensils width={size} height={size} />;
}

// ── Node Card ─────────────────────────────────────────────────────────────────
interface NodeCardProps {
  task: JourneyTask;
  status: NodeStatus;
  animating: boolean;
  onClick: (task: JourneyTask) => void;
  onMarkMissed?: (task: JourneyTask) => void;
}

function NodeCard({
  task,
  status,
  animating,
  onClick,
  onMarkMissed,
}: NodeCardProps) {
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";

  const cardStyle = [
    "relative flex items-center gap-4 w-full max-w-sm rounded-2xl px-5 py-4 border transition-all duration-300 select-none",
    isCompleted && "border-green-500/40 cursor-default",
    isSkipped && "border-orange-500/30 opacity-60 cursor-default",
    isActive &&
      "border-primary/70 cursor-pointer hover:scale-[1.02] hover:shadow-lg",
    !isActive &&
      !isCompleted &&
      !isSkipped &&
      "border-border/40 opacity-50 cursor-not-allowed",
    animating && "animate-node-complete",
  ]
    .filter(Boolean)
    .join(" ");

  const cardBg = isCompleted
    ? "oklch(0.18 0.04 142 / 0.4)"
    : isSkipped
      ? "oklch(0.18 0.04 40 / 0.3)"
      : isActive
        ? "oklch(0.20 0.03 280 / 0.8)"
        : "oklch(0.17 0.015 260 / 0.6)";

  const iconBg = isCompleted
    ? "oklch(0.65 0.18 142 / 0.2)"
    : isSkipped
      ? "oklch(0.65 0.18 40 / 0.15)"
      : isActive
        ? "oklch(0.55 0.22 280 / 0.15)"
        : "oklch(0.22 0.015 260 / 0.8)";

  const iconColor = isCompleted
    ? "oklch(0.65 0.18 142)"
    : isSkipped
      ? "oklch(0.65 0.18 40)"
      : isActive
        ? "oklch(0.68 0.22 280)"
        : "oklch(0.45 0.01 260)";

  return (
    <div className="w-full max-w-sm">
      <button
        data-ocid={`journey.node.${task.id}`}
        type="button"
        className={cardStyle}
        style={{ background: cardBg }}
        onClick={() => isActive && onClick(task)}
        disabled={!isActive}
        aria-label={
          status === "locked"
            ? `${task.title} — locked`
            : status === "completed"
              ? `${task.title} — completed`
              : status === "skipped"
                ? `${task.title} — skipped`
                : task.title
        }
      >
        {isActive && (
          <span
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                "0 0 0 1.5px oklch(0.68 0.22 280 / 0.6), 0 0 24px 0 oklch(0.55 0.22 280 / 0.3)",
              animation: reducedMotion
                ? undefined
                : "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
            aria-hidden="true"
          />
        )}

        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{ background: iconBg, color: iconColor }}
          aria-hidden="true"
        >
          {isCompleted ? (
            <CheckCircle2 width={22} height={22} />
          ) : isSkipped ? (
            <SkipForward width={18} height={18} />
          ) : status === "locked" ? (
            <Lock width={18} height={18} />
          ) : (
            <TaskIcon type={task.task_type} size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p
            className={`font-semibold text-sm leading-tight truncate ${
              isCompleted
                ? "text-green-400"
                : isSkipped
                  ? "text-orange-400/80 line-through"
                  : isActive
                    ? "text-white font-bold"
                    : "text-white/50"
            }`}
          >
            {task.title}
          </p>
          <p className="text-xs mt-0.5 text-white/40 truncate">
            {task.time_label}
            {isSkipped && (
              <span className="ml-2 text-orange-400/60 font-medium">
                · Skipped
              </span>
            )}
          </p>
          {/* Food preview — first item for meals, quantity for water */}
          {isActive &&
            task.task_type === "meal" &&
            task.food_items.length > 0 && (
              <p className="text-xs mt-1 text-primary/70 truncate">
                {task.food_items[0]}
                {task.food_items.length > 1 && (
                  <span className="text-white/30">
                    {" "}
                    +{task.food_items.length - 1} more
                  </span>
                )}
              </p>
            )}
          {isActive && task.task_type === "water" && task.quantity && (
            <p className="text-xs mt-1 text-blue-400/70 truncate">
              💧 {task.quantity}
            </p>
          )}
        </div>

        <div className="shrink-0 ml-1" aria-hidden="true">
          {isCompleted && (
            <CheckCircle2 width={20} height={20} className="text-green-400" />
          )}
          {isSkipped && (
            <SkipForward
              width={16}
              height={16}
              className="text-orange-400/60"
            />
          )}
          {isActive && (
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "oklch(0.68 0.22 280)",
                animation: reducedMotion
                  ? undefined
                  : "pulse-glow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          )}
          {status === "locked" && (
            <Lock width={14} height={14} className="text-white/20" />
          )}
        </div>
      </button>

      {isActive && task.task_type === "meal" && onMarkMissed && (
        <button
          data-ocid={`journey.mark_missed.${task.id}`}
          type="button"
          onClick={() => onMarkMissed(task)}
          className="mt-1.5 ml-auto flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-white/40 border border-white/10 hover:text-white/70 hover:border-white/25 transition-smooth"
          aria-label={`Mark ${task.title} as missed`}
        >
          <AlertTriangle width={10} height={10} aria-hidden="true" />
          Mark as Missed
        </button>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function NodeSkeleton() {
  return (
    <div
      className="flex items-center gap-4 w-full max-w-sm rounded-2xl px-5 py-4 border border-border/20 animate-pulse"
      style={{ background: "oklch(0.17 0.015 260 / 0.6)", minHeight: 68 }}
      aria-hidden="true"
    >
      <div className="w-11 h-11 rounded-xl bg-muted/30 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/5 rounded bg-muted/30" />
        <div className="h-2 w-2/5 rounded bg-muted/20" />
      </div>
    </div>
  );
}

// ── Node Detail Modal ─────────────────────────────────────────────────────────
interface NodeModalProps {
  task: JourneyTask;
  isPending: boolean;
  error: string | null;
  onComplete: () => void;
  onRetry: () => void;
  onClose: () => void;
}

function NodeModal({
  task,
  isPending,
  error,
  onComplete,
  onRetry,
  onClose,
}: NodeModalProps) {
  const editMeal = useEditAIMeal();
  const [isEditing, setIsEditing] = useState(false);
  const [editFoodItems, setEditFoodItems] = useState(
    task.food_items.join(", "),
  );
  const [editQuantity, setEditQuantity] = useState(task.quantity);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveEdit = async () => {
    setEditError(null);
    const items = editFoodItems
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) {
      setEditError("Please enter at least one food item.");
      return;
    }
    const req: EditMealRequest = {
      task_id: String(task.id),
      food_items: items,
      quantity: editQuantity.trim(),
    };
    try {
      await editMeal.mutateAsync(req);
      setIsEditing(false);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
    }
  };

  return (
    <dialog
      data-ocid="journey.dialog"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 m-0 max-w-none max-h-none w-full h-full bg-transparent border-none outline-none"
      open
      aria-labelledby="task-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 p-7 fade-in"
        style={{ background: "oklch(0.19 0.02 270 / 0.97)" }}
      >
        <button
          data-ocid="journey.close_button"
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-smooth"
          onClick={onClose}
          aria-label="Close"
        >
          <X width={18} height={18} />
        </button>

        {/* Icon */}
        <div
          className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{
            background:
              task.task_type === "water"
                ? "oklch(0.62 0.25 270 / 0.15)"
                : "oklch(0.55 0.22 280 / 0.15)",
          }}
          aria-hidden="true"
        >
          <TaskIcon type={task.task_type} size={32} />
        </div>

        <h2
          id="task-modal-title"
          className="font-display text-xl font-bold text-white text-center mb-1"
        >
          {task.title}
        </h2>
        <p className="text-xs text-white/40 text-center mb-5">
          {task.time_label}
          {task.task_type === "water" && task.quantity && (
            <span className="ml-2 text-blue-400/70 font-medium">
              · {task.quantity}
            </span>
          )}
        </p>

        {/* Coach tip box — shown when description is set (e.g. AI skip adjustment) */}
        {task.description && (
          <div
            className="mb-4 rounded-xl border border-primary/25 px-4 py-3"
            style={{ background: "oklch(0.16 0.025 280 / 0.5)" }}
          >
            <p className="text-xs text-primary/80 font-semibold mb-1 flex items-center gap-1.5">
              <Bot width={11} height={11} aria-hidden="true" />
              AI Coach Tip
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Meal detail view */}
        {task.task_type === "meal" && !isEditing && (
          <div
            className="mb-5 rounded-xl border border-white/10 px-4 py-3 space-y-3"
            style={{ background: "oklch(0.16 0.015 265 / 0.7)" }}
          >
            {task.food_items.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">
                  🍽️ Foods
                </p>
                <ul className="space-y-1">
                  {task.food_items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-white/80"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task.quantity && (
              <p className="text-xs text-white/50">
                <span className="text-white/30">Quantity:</span>{" "}
                <span className="text-white/80 font-medium">
                  {task.quantity}
                </span>
              </p>
            )}

            {/* Macros row */}
            {(task.calories !== undefined || task.protein !== undefined) && (
              <div className="flex gap-3 pt-1 border-t border-white/8">
                {task.calories !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300">
                    🔥 ~{task.calories} kcal
                  </span>
                )}
                {task.protein !== undefined && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    💪 ~{task.protein}g protein
                  </span>
                )}
              </div>
            )}

            <button
              data-ocid="journey.edit_meal_button"
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-smooth"
            >
              <Pencil width={11} height={11} aria-hidden="true" />
              Edit Meal
            </button>
          </div>
        )}

        {/* Water node: hydration tip */}
        {task.task_type === "water" && (
          <div
            className="mb-5 rounded-xl border border-blue-500/20 px-4 py-3 space-y-2"
            style={{ background: "oklch(0.16 0.02 240 / 0.5)" }}
          >
            {task.quantity && (
              <div className="flex items-center gap-2">
                <Droplets
                  width={14}
                  height={14}
                  className="text-blue-400 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-blue-300">
                  {task.quantity}
                </span>
              </div>
            )}
            <p className="text-xs text-blue-300/80 font-semibold">
              💧 Hydration Tip
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Drinking water regularly helps maintain energy, supports
              digestion, and keeps your metabolism active. Aim for at least 8
              glasses per day.
            </p>
          </div>
        )}

        {/* Edit form */}
        {task.task_type === "meal" && isEditing && (
          <div
            className="mb-5 rounded-xl border border-primary/20 px-4 py-3 space-y-3"
            style={{ background: "oklch(0.16 0.02 280 / 0.6)" }}
          >
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Edit Meal
            </p>
            <div>
              <label
                htmlFor="edit-food-items"
                className="block text-xs text-white/50 mb-1"
              >
                Food items (comma-separated)
              </label>
              <input
                id="edit-food-items"
                data-ocid="journey.edit_food_items_input"
                type="text"
                value={editFoodItems}
                onChange={(e) => setEditFoodItems(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 text-foreground text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/25"
                placeholder="e.g. Oats, Banana, Milk"
              />
            </div>
            <div>
              <label
                htmlFor="edit-quantity"
                className="block text-xs text-white/50 mb-1"
              >
                Quantity / portion
              </label>
              <input
                id="edit-quantity"
                data-ocid="journey.edit_quantity_input"
                type="text"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 text-foreground text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/25"
                placeholder="e.g. 1 bowl, 200g"
              />
            </div>
            {editError && (
              <p className="text-xs text-destructive">{editError}</p>
            )}
            <div className="flex gap-2">
              <button
                data-ocid="journey.edit_save_button"
                type="button"
                onClick={handleSaveEdit}
                disabled={editMeal.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition-smooth disabled:opacity-50"
              >
                {editMeal.isPending && (
                  <Loader2 width={11} height={11} className="animate-spin" />
                )}
                Save Changes
              </button>
              <button
                data-ocid="journey.edit_cancel_button"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditFoodItems(task.food_items.join(", "));
                  setEditQuantity(task.quantity);
                  setEditError(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-white/15 text-white/60 text-xs hover:text-white hover:border-white/30 transition-smooth"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* XP badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-bold">
            <Zap width={12} height={12} />+{task.xp_reward} XP on completion
          </span>
        </div>

        {/* Error with retry */}
        {error && (
          <div
            data-ocid="journey.error_state"
            className="mb-4 rounded-xl border border-destructive/30 px-4 py-3 text-center"
            style={{ background: "oklch(0.16 0.04 20 / 0.4)" }}
          >
            <p className="text-xs text-destructive mb-2">{error}</p>
            <button
              data-ocid="journey.retry_button"
              type="button"
              onClick={onRetry}
              className="text-xs text-primary/80 hover:text-primary underline transition-smooth"
            >
              Try again
            </button>
          </div>
        )}

        {/* Mark complete button */}
        <button
          data-ocid="journey.confirm_button"
          type="button"
          disabled={isPending}
          onClick={onComplete}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm gradient-primary hover:opacity-90 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow"
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <Loader2
                width={16}
                height={16}
                className="animate-spin"
                aria-hidden="true"
              />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <CheckCircle2 width={16} height={16} aria-hidden="true" />
              Mark as Completed
            </>
          )}
        </button>
      </div>
    </dialog>
  );
}

// ── Edit Plan Modal ───────────────────────────────────────────────────────────
interface EditPlanModalProps {
  tasks: JourneyTask[];
  onClose: () => void;
}

let nextTempId = 9000;

function EditPlanModal({ tasks, onClose }: EditPlanModalProps) {
  const editMealPlan = useEditMealPlan();
  const resetToAIPlan = useResetToAIPlan();

  const [rows, setRows] = useState<EditableMealItem[]>(() =>
    tasks.map((t) => ({
      id: t.id,
      name: t.title,
      time: t.time_label,
      task_type: t.task_type,
      food_items: t.food_items,
      quantity: t.quantity,
      calories: t.calories ?? 0,
      protein: t.protein ?? 0,
    })),
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateRow = (idx: number, patch: Partial<EditableMealItem>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: ++nextTempId,
        name: "",
        time: "12:00 PM",
        task_type: "meal",
        food_items: [],
        quantity: "",
        calories: 0,
        protein: 0,
      },
    ]);
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaveError(null);
    const req: EditMealPlanRequest = { meals: rows };
    try {
      await editMealPlan.mutateAsync(req);
      onClose();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save plan. Please try again.",
      );
    }
  };

  const handleReset = async () => {
    setSaveError(null);
    try {
      await resetToAIPlan.mutateAsync();
      onClose();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to reset plan. Please try again.",
      );
    }
  };

  const isBusy = editMealPlan.isPending || resetToAIPlan.isPending;

  return (
    <dialog
      data-ocid="journey.edit_plan_dialog"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 m-0 max-w-none max-h-none w-full h-full bg-transparent border-none outline-none"
      open
      aria-labelledby="edit-plan-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 p-6 fade-in max-h-[90vh] flex flex-col"
        style={{ background: "oklch(0.19 0.02 270 / 0.97)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h2
              id="edit-plan-title"
              className="font-display text-lg font-bold text-white"
            >
              Edit Today's Plan
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Customize your meals and times
            </p>
          </div>
          <button
            data-ocid="journey.edit_plan_close_button"
            type="button"
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-smooth"
            onClick={onClose}
            aria-label="Close"
          >
            <X width={18} height={18} />
          </button>
        </div>

        {/* Meal rows */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              data-ocid={`journey.edit_plan_row.${idx + 1}`}
              className="rounded-xl border border-white/10 px-4 py-3 space-y-2.5"
              style={{ background: "oklch(0.16 0.015 265 / 0.7)" }}
            >
              <div className="flex items-center gap-2">
                {/* Meal name */}
                <input
                  data-ocid={`journey.edit_plan_name.${idx + 1}`}
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  placeholder="Meal name"
                  className="flex-1 min-w-0 rounded-lg border border-white/15 bg-white/5 text-foreground text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/25"
                />
                {/* Time */}
                <input
                  data-ocid={`journey.edit_plan_time.${idx + 1}`}
                  type="text"
                  value={row.time}
                  onChange={(e) => updateRow(idx, { time: e.target.value })}
                  placeholder="8:00 AM"
                  className="w-24 rounded-lg border border-white/15 bg-white/5 text-foreground text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/25"
                />
                {/* Delete */}
                <button
                  data-ocid={`journey.edit_plan_delete.${idx + 1}`}
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length <= 1}
                  className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-smooth disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
                  aria-label={`Remove ${row.name || "meal"}`}
                >
                  <Trash2 width={14} height={14} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Type:</span>
                <select
                  data-ocid={`journey.edit_plan_type.${idx + 1}`}
                  value={row.task_type}
                  onChange={(e) =>
                    updateRow(idx, {
                      task_type: e.target.value as "meal" | "water",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-white/5 text-foreground text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="meal">🍽️ Meal</option>
                  <option value="water">💧 Water</option>
                </select>
              </div>
            </div>
          ))}

          {/* Add meal */}
          <button
            data-ocid="journey.edit_plan_add_button"
            type="button"
            onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/20 text-xs text-white/50 hover:text-white/80 hover:border-white/35 transition-smooth"
          >
            <Plus width={14} height={14} />
            Add Meal
          </button>
        </div>

        {/* Error */}
        {saveError && (
          <p
            data-ocid="journey.edit_plan_error_state"
            className="text-xs text-destructive text-center mt-3 shrink-0"
          >
            {saveError}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4 shrink-0">
          <button
            data-ocid="journey.edit_plan_save_button"
            type="button"
            onClick={handleSave}
            disabled={isBusy}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm gradient-primary hover:opacity-90 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {editMealPlan.isPending ? (
              <>
                <Loader2 width={15} height={15} className="animate-spin" />
                Saving Plan…
              </>
            ) : (
              "Save Plan"
            )}
          </button>

          <button
            data-ocid="journey.edit_plan_reset_button"
            type="button"
            onClick={handleReset}
            disabled={isBusy}
            className="w-full py-2.5 rounded-2xl text-sm border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resetToAIPlan.isPending ? (
              <>
                <Loader2 width={14} height={14} className="animate-spin" />
                Resetting…
              </>
            ) : (
              <>
                <RefreshCw width={14} height={14} />
                Reset to AI Plan
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface TodayJourneySectionProps {
  isPremium?: boolean;
}

export function TodayJourneySection({
  isPremium = false,
}: TodayJourneySectionProps) {
  const {
    data: journey,
    isLoading: journeyLoading,
    isFetching: journeyFetching,
    error: journeyError,
  } = useTodayJourney();
  const { data: progress, isLoading: progressLoading } = useTodayProgress();
  const completeTask = useCompleteJourneyTask();
  const generatePlan = useGenerateTodayPlan();
  const logMissedMeal = useLogMissedMeal();
  const qc = useQueryClient();

  // Local optimistic state for completed/skipped ids
  const [optimisticCompletedIds, setOptimisticCompletedIds] = useState<
    number[]
  >([]);
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  const [selectedTask, setSelectedTask] = useState<JourneyTask | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [xpToasts, setXpToasts] = useState<XpToast[]>([]);
  const [missedLoading, setMissedLoading] = useState<number | null>(null);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const isLoading = journeyLoading || progressLoading;
  const tasks = journey?.tasks ?? [];

  // Merge server-confirmed ids with optimistic ids
  const serverCompletedIds = progress?.completed_task_ids ?? [];
  const completedIds = Array.from(
    new Set([...serverCompletedIds, ...optimisticCompletedIds]),
  );

  const earnedXp = progress?.earned_xp ?? 0;
  const streakDays = progress?.streak_days ?? 0;
  const progressPercent =
    tasks.length > 0 ? (completedIds.length / tasks.length) * 100 : 0;
  // Active task: first non-completed, non-skipped task
  const activeTask =
    tasks.find(
      (t) => !completedIds.includes(t.id) && !skippedIds.includes(t.id),
    ) ?? null;

  const allDone = completedIds.length >= tasks.length && tasks.length > 0;

  // Celebrate full-day completion once
  const allDoneFiredRef = useRef(false);
  useEffect(() => {
    if (allDone && !allDoneFiredRef.current) {
      allDoneFiredRef.current = true;
      toast.success(
        "Amazing! Full day completed 🌟 +₹0.5 added to your balance!",
        {
          duration: 6000,
        },
      );
    }
    if (!allDone) {
      allDoneFiredRef.current = false;
    }
  }, [allDone]);

  const showXpToast = (amount: number) => {
    const id = Date.now();
    setXpToasts((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setXpToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1400);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    const taskId = selectedTask.id;
    const taskXpReward = selectedTask.xp_reward;
    setModalError(null);

    // Optimistic update: mark completed in UI immediately
    setOptimisticCompletedIds((prev) => [...prev, taskId]);

    // Close modal instantly for snappy UX
    setSelectedTask(null);
    setAnimatingId(taskId);
    setTimeout(() => setAnimatingId(null), 600);
    showXpToast(taskXpReward);

    try {
      await completeTask.mutateAsync(taskId);
      // On success, remove from optimistic list (server state now authoritative)
      setOptimisticCompletedIds((prev) => prev.filter((id) => id !== taskId));
      await qc.invalidateQueries({ queryKey: ["journey", "today"] });
      await qc.invalidateQueries({
        queryKey: ["journey", "progress", "today"],
      });
    } catch (err) {
      // Revert optimistic update on failure
      setOptimisticCompletedIds((prev) => prev.filter((id) => id !== taskId));
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to complete meal, try again";
      setModalError(msg);
      // Re-open the modal to let user retry
      setSelectedTask(selectedTask);
    }
  };

  const handleNodeClick = (task: JourneyTask) => {
    setSelectedTask(task);
    setModalError(null);
  };

  const handleMarkMissed = async (task: JourneyTask) => {
    setMissedLoading(task.id);
    // Optimistically mark skipped in UI — instant, no spinner
    setSkippedIds((prev) => [...prev, task.id]);

    // Free users: skip backend call entirely, just show toast
    if (!isPremium) {
      toast.info("Meal skipped", { duration: 3000 });
      setMissedLoading(null);
      return;
    }

    try {
      const result = await logMissedMeal.mutateAsync({
        mealType: task.title,
        reason: "user_skipped",
      });

      // Check for balance accountability flags in the response
      const res = result as unknown as Record<string, unknown> | string;
      if (typeof res === "object" && res !== null) {
        if (res.balance_empty) {
          toast.warning(
            "Balance at ₹0 — add at least ₹1 to continue accountability tracking",
            {
              duration: 6000,
            },
          );
        } else if (res.balance_deducted) {
          toast.info("₹1 deducted — let's stay on track tomorrow 💪", {
            duration: 4000,
          });
        }
      }

      // Invalidate journey so AI-patched plan is fetched immediately
      qc.invalidateQueries({ queryKey: ["journey", "today"] });
      qc.invalidateQueries({ queryKey: ["journey", "progress", "today"] });
      toast.success("Plan adjusted by AI", {
        description: "Remaining meals updated based on what you skipped.",
        duration: 4000,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isTierLimited = errMsg.includes("Premium feature");
      if (isTierLimited) {
        // Meal is genuinely skipped — do NOT revert the optimistic skip
        toast.info("Upgrade to Premium for dynamic meal adjustments.", {
          duration: 4000,
        });
      } else {
        // Unexpected error — revert the optimistic skip
        setSkippedIds((prev) => prev.filter((id) => id !== task.id));
        console.error(
          `[${new Date().toISOString()}] logMissedMeal failed —`,
          errMsg,
        );
        toast.error("Could not record skipped meal. Try again.", {
          duration: 3000,
        });
      }
    } finally {
      setMissedLoading(null);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      await generatePlan.mutateAsync();
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] plan generation failed —`,
        err instanceof Error ? err.message : String(err),
      );
    }
  };

  // Loading skeleton (max shown while initial fetch is in-flight)
  if (isLoading || journeyFetching) {
    return (
      <section
        data-ocid="journey.loading_state"
        className="rounded-3xl p-6 md:p-8"
        aria-label="Loading today's journey"
        aria-busy="true"
      >
        <div className="journey-header animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-muted/30 mx-auto mb-3" />
          <div className="h-4 w-64 rounded bg-muted/20 mx-auto" />
        </div>
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-muted/20 animate-pulse"
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <NodeSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Empty / no-plan state — also handle fetch errors
  if (!journey || tasks.length === 0) {
    return (
      <section
        data-ocid="journey.empty_state"
        className="text-center relative overflow-hidden py-4"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-[60px] pointer-events-none opacity-15"
          style={{ background: "oklch(0.55 0.22 280 / 0.5)" }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <div
            className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: "oklch(0.55 0.22 280 / 0.12)" }}
            aria-hidden="true"
          >
            <MapPin
              width={28}
              height={28}
              style={{ color: "oklch(0.68 0.22 280)" }}
            />
          </div>
          <h2 className="font-display text-xl font-bold text-gradient mb-2">
            Today's Journey
          </h2>
          <p className="journey-subtitle mb-2">
            Complete all steps to finish your day
          </p>

          {journeyError ? (
            <p className="text-sm text-destructive/80 leading-relaxed mb-6 max-w-xs mx-auto">
              Couldn't load your journey. Try generating a new plan.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs mx-auto">
              No journey for today yet. Generate your personalised daily plan to
              unlock your tasks!
            </p>
          )}

          {generatePlan.isError && (
            <p
              data-ocid="journey.generate.error_state"
              className="text-xs text-destructive text-center mb-4 px-4"
            >
              {generatePlan.error instanceof Error
                ? generatePlan.error.message
                : "Failed to generate plan. Please try again."}
            </p>
          )}

          <button
            data-ocid="journey.generate_plan_button"
            type="button"
            disabled={generatePlan.isPending}
            onClick={handleGeneratePlan}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm gradient-primary hover:opacity-90 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed shadow-glow min-h-[44px]"
            aria-busy={generatePlan.isPending}
          >
            {generatePlan.isPending ? (
              <>
                <Loader2
                  width={16}
                  height={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Generating…
              </>
            ) : (
              <>
                <RefreshCw width={16} height={16} aria-hidden="true" />
                Generate Today's Plan
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        data-ocid="journey.section"
        className="relative overflow-hidden"
        aria-label="Today's Journey"
      >
        {/* Header with Edit Plan button */}
        <div className="journey-header relative z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="journey-title text-gradient font-display">
                Today's Journey
              </h2>
              {/* AI badge — shown when plan was generated by AI */}
              {journey.generatedByAi && (
                <span
                  data-ocid="journey.ai_badge"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-primary/40 bg-primary/10 text-primary"
                  title="This plan was generated by AI"
                >
                  <Bot width={10} height={10} aria-hidden="true" />
                  AI
                </span>
              )}
            </div>
            <button
              data-ocid="journey.edit_plan_button"
              type="button"
              onClick={() => setShowEditPlan(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-xs text-white/60 hover:text-white hover:border-white/30 transition-smooth"
              aria-label="Edit today's plan"
            >
              <Settings2 width={13} height={13} aria-hidden="true" />
              Edit Plan
            </button>
          </div>
          <p className="journey-subtitle">
            {allDone
              ? "🎉 You've completed all your tasks for today!"
              : "Complete all steps to finish your day"}
          </p>
        </div>

        {/* Stats row */}
        <div data-ocid="journey.stats" className="journey-stats relative z-10">
          <div
            data-ocid="journey.streak_badge"
            className={`streak-badge ${streakDays > 1 ? "active" : ""}`}
          >
            <Flame width={14} height={14} aria-hidden="true" />
            <span>{streakDays}-day streak</span>
          </div>
          <div data-ocid="journey.xp_badge" className="stat-badge">
            <Zap
              width={14}
              height={14}
              className="text-yellow-400"
              aria-hidden="true"
            />
            <span className="text-yellow-300 font-bold">{earnedXp}</span>
            <span className="text-muted-foreground">
              / {journey.total_xp} XP
            </span>
          </div>
          <div data-ocid="journey.percent_badge" className="stat-badge">
            <span className="text-primary font-bold">
              {Math.round(progressPercent)}%
            </span>
            <span className="text-muted-foreground">done</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-wrapper relative z-10 max-w-sm mx-auto">
          <p className="progress-label text-center">Daily Progress</p>
          <div
            data-ocid="journey.progress_bar"
            className="progress-bar"
            role="progressbar"
            tabIndex={0}
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Daily progress"
          >
            <div
              className="progress-fill"
              style={{
                width: `${progressPercent}%`,
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        {/* Path */}
        <div className="journey-path relative z-10 mt-8">
          {tasks.map((task, index) => {
            const status = getNodeStatus(
              task.id,
              completedIds,
              skippedIds,
              activeTask?.id ?? null,
            );
            const isLastCompleted =
              status === "completed" &&
              (index === tasks.length - 1 ||
                !completedIds.includes(tasks[index + 1]?.id));

            return (
              <div
                key={task.id}
                className="flex flex-col items-center w-full"
                data-ocid={`journey.node_wrapper.${index + 1}`}
              >
                <NodeCard
                  task={task}
                  status={status}
                  animating={animatingId === task.id}
                  onClick={handleNodeClick}
                  onMarkMissed={
                    missedLoading === task.id ? undefined : handleMarkMissed
                  }
                />
                {index < tasks.length - 1 && (
                  <div
                    className={`path-connector ${isLastCompleted ? "completed" : ""}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* All done banner */}
        {allDone && (
          <div
            data-ocid="journey.success_state"
            className="mt-8 text-center p-5 rounded-2xl border border-green-500/30 fade-in"
            style={{ background: "oklch(0.18 0.04 142 / 0.3)" }}
          >
            <p className="text-2xl mb-2" aria-hidden="true">
              🏆
            </p>
            <p className="font-display font-bold text-green-300 text-lg">
              Day Complete!
            </p>
            <p className="text-xs text-white/50 mt-1">
              Amazing work! You earned{" "}
              <span className="text-yellow-300 font-bold">{earnedXp} XP</span>{" "}
              today.
            </p>
          </div>
        )}
      </section>

      {/* Node detail modal */}
      {selectedTask && (
        <NodeModal
          task={selectedTask}
          isPending={completeTask.isPending}
          error={modalError}
          onComplete={handleCompleteTask}
          onRetry={() => {
            setModalError(null);
            handleCompleteTask();
          }}
          onClose={() => {
            setSelectedTask(null);
            setModalError(null);
          }}
        />
      )}

      {/* Edit Plan modal */}
      {showEditPlan && (
        <EditPlanModal tasks={tasks} onClose={() => setShowEditPlan(false)} />
      )}

      {/* XP floating toasts */}
      {xpToasts.map((xpToast) => (
        <output
          key={xpToast.id}
          data-ocid="journey.toast"
          className="xp-popup"
          style={{ bottom: "6rem", left: "50%", transform: "translateX(-50%)" }}
          aria-live="polite"
        >
          ⚡ +{xpToast.amount} XP
        </output>
      ))}
    </>
  );
}
