import { useAuthContext } from "@/contexts/AuthContext";
import { useGenerateAIDiet } from "@/hooks/useBackend";
import { ActivityLevel, DietType, DietaryPreference, Goal } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FormState {
  name: string;
  email: string;
  password: string;
  goal: Goal | "";
  height: string;
  weight: string;
  age: string;
  activity_level: ActivityLevel;
  dietary_preference: DietaryPreference;
  diet_type: DietType;
  lifestyle_description: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  age?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error)
    return err.message || "Registration failed. Please try again.";
  if (typeof err === "string" && err.trim()) return err;
  return "Registration failed. Please try again.";
}

const GOAL_OPTIONS = [
  { value: Goal.fat_loss, label: "🔥 Fat Loss" },
  { value: Goal.muscle_gain, label: "💪 Muscle Gain" },
  { value: Goal.lifestyle_balance, label: "⚖️ Lifestyle Balance" },
];

const ACTIVITY_OPTIONS = [
  { value: ActivityLevel.sedentary, label: "🛋️ Sedentary (little/no exercise)" },
  { value: ActivityLevel.light, label: "🚶 Lightly Active (1-3 days/week)" },
  {
    value: ActivityLevel.moderate,
    label: "🏃 Moderately Active (3-5 days/week)",
  },
  { value: ActivityLevel.intense, label: "⚡ Very Active (6-7 days/week)" },
];

export function SignupPage() {
  const { register, isAuthenticated, isInitializing, error, clearError } =
    useAuthContext();
  const navigate = useNavigate();
  const generateAIDiet = useGenerateAIDiet();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    goal: "",
    height: "",
    weight: "",
    age: "",
    activity_level: ActivityLevel.moderate,
    dietary_preference: DietaryPreference.non_vegetarian,
    diet_type: DietType.non_veg,
    lifestyle_description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  // Sync auth context error into local state as a safe string
  useEffect(() => {
    if (error) setSubmitError(safeErrorMessage(error));
  }, [error]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError(undefined);
    clearError();
    if (name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "name" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Full name is required." }));
    }
    if (name === "email") {
      if (!value.trim())
        setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
      else if (!validateEmail(value))
        setFieldErrors((prev) => ({
          ...prev,
          email: "Enter a valid email address.",
        }));
    }
    if (name === "password") {
      if (!value.trim())
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password is required.",
        }));
      else if (value.length < 6)
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters.",
        }));
    }
    if (name === "age") {
      const n = Number(value);
      if (value && (n < 18 || n > 80)) {
        setFieldErrors((prev) => ({
          ...prev,
          age: "Age must be between 18 and 80.",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(undefined);
    clearError();

    // Consent must be checked
    if (!consentChecked) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = "Full name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password.trim()) errors.password = "Password is required.";
    else if (form.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (form.age) {
      const n = Number(form.age);
      if (n < 18 || n > 80) errors.age = "Age must be between 18 and 80.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ name: true, email: true, password: true, age: true });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        goal: form.goal || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        age: form.age ? Number(form.age) : 25,
        activity_level: form.activity_level,
        dietary_preference: form.dietary_preference,
        diet_type: form.diet_type,
        lifestyle_description: form.lifestyle_description.trim() || undefined,
      });

      // Kick off AI plan generation in background — navigate immediately
      // Dashboard will show the plan once it arrives (staleTime=0 re-fetches)
      const PLAN_TIMEOUT = 3_000;
      const planTimer = setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, PLAN_TIMEOUT);

      generateAIDiet
        .mutateAsync()
        .then(() => {
          clearTimeout(planTimer);
          navigate({ to: "/dashboard" });
        })
        .catch(() => {
          clearTimeout(planTimer);
          navigate({ to: "/dashboard" });
        });
    } catch (err) {
      setSubmitError(safeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isInitializing;

  const fieldError = (field: keyof FieldErrors) =>
    touched[field] && fieldErrors[field] ? fieldErrors[field] : undefined;
  return (
    <div data-ocid="signup.page" className="form-container">
      {/* Decorative background orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full blur-[120px] opacity-20"
          style={{ background: "oklch(0.55 0.22 280 / 0.4)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full blur-[100px] opacity-15"
          style={{ background: "oklch(0.62 0.25 260 / 0.3)" }}
        />
      </div>

      <div className="w-full max-w-md relative fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-3 font-display font-bold text-2xl text-white mb-3 hover:opacity-90 transition-smooth"
            aria-label="Go to home"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-glow shrink-0">
              <Leaf className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <span>
              AI <span className="text-gradient">Diet Coach</span>
            </span>
          </button>
          <p className="text-sm text-white/60 font-body">
            Personalised nutrition powered by AI
          </p>
        </div>

        {/* Card */}
        <div
          data-ocid="signup.card"
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "oklch(0.19 0.015 260 / 0.92)",
            border: "1px solid oklch(0.55 0.22 280 / 0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="h-1 w-full gradient-primary" />

          <div className="p-8">
            <h1 className="font-display font-bold text-2xl text-white mb-1.5">
              Create your account
            </h1>
            <p className="text-sm text-white/55 mb-6 leading-relaxed">
              Set up your profile and get your first AI-personalised diet plan.
            </p>

            <form
              data-ocid="signup.form"
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Full Name{" "}
                  <span style={{ color: "oklch(0.75 0.19 22)" }}>*</span>
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-ocid="signup.name_input"
                  className="auth-input"
                  aria-invalid={!!fieldError("name")}
                  style={
                    fieldError("name")
                      ? { borderColor: "oklch(0.65 0.19 22)" }
                      : undefined
                  }
                />
                {fieldError("name") && (
                  <p
                    data-ocid="signup.name.field_error"
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Email <span style={{ color: "oklch(0.75 0.19 22)" }}>*</span>
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-ocid="signup.email_input"
                  className="auth-input"
                  aria-invalid={!!fieldError("email")}
                  style={
                    fieldError("email")
                      ? { borderColor: "oklch(0.65 0.19 22)" }
                      : undefined
                  }
                />
                {fieldError("email") && (
                  <p
                    data-ocid="signup.email.field_error"
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Password{" "}
                  <span style={{ color: "oklch(0.75 0.19 22)" }}>*</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    data-ocid="signup.password_input"
                    className="auth-input pr-11"
                    aria-invalid={!!fieldError("password")}
                    style={
                      fieldError("password")
                        ? { borderColor: "oklch(0.65 0.19 22)" }
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-smooth"
                    style={{ color: "oklch(0.5 0.01 260)" }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldError("password") && (
                  <p
                    data-ocid="signup.password.field_error"
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div
                className="border-t pt-1"
                style={{ borderColor: "oklch(1 0 0 / 0.1)" }}
              >
                <p className="text-xs text-white/40 mb-4 mt-2">
                  Optional profile info — helps AI personalise your plan
                </p>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-goal"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Your Goal{" "}
                  <span className="normal-case font-normal text-white/35">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="signup-goal"
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    data-ocid="signup.goal_select"
                    className="auth-input appearance-none pr-10 cursor-pointer"
                  >
                    <option value="">Select a goal…</option>
                    {GOAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "oklch(0.5 0.01 260)" }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-age"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Age{" "}
                  <span className="normal-case font-normal text-white/35">
                    (years, 18–80)
                  </span>
                </label>
                <input
                  id="signup-age"
                  name="age"
                  type="number"
                  min="18"
                  max="80"
                  placeholder="25"
                  value={form.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-ocid="signup.age_input"
                  className="auth-input"
                  aria-invalid={!!fieldError("age")}
                  style={
                    fieldError("age")
                      ? { borderColor: "oklch(0.65 0.19 22)" }
                      : undefined
                  }
                />
                {fieldError("age") && (
                  <p
                    data-ocid="signup.age.field_error"
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {fieldErrors.age}
                  </p>
                )}
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-height"
                    className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                  >
                    Height{" "}
                    <span className="normal-case font-normal text-white/35">
                      cm
                    </span>
                  </label>
                  <input
                    id="signup-height"
                    name="height"
                    type="number"
                    min="100"
                    max="250"
                    placeholder="175"
                    value={form.height}
                    onChange={handleChange}
                    data-ocid="signup.height_input"
                    className="auth-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-weight"
                    className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                  >
                    Weight{" "}
                    <span className="normal-case font-normal text-white/35">
                      kg
                    </span>
                  </label>
                  <input
                    id="signup-weight"
                    name="weight"
                    type="number"
                    min="30"
                    max="300"
                    placeholder="70"
                    value={form.weight}
                    onChange={handleChange}
                    data-ocid="signup.weight_input"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-activity"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Activity Level
                </label>
                <div className="relative">
                  <select
                    id="signup-activity"
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                    data-ocid="signup.activity_level_select"
                    className="auth-input appearance-none pr-10 cursor-pointer"
                  >
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "oklch(0.5 0.01 260)" }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="space-y-2">
                <p className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Dietary Preference
                </p>
                <div className="flex gap-3">
                  {[
                    {
                      value: DietaryPreference.non_vegetarian,
                      label: "🍗 Non-Vegetarian",
                    },
                    {
                      value: DietaryPreference.vegetarian,
                      label: "🥦 Vegetarian",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer text-sm font-medium transition-smooth ${
                        form.dietary_preference === opt.value
                          ? "border-primary/70 bg-primary/15 text-white"
                          : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name="dietary_preference"
                        value={opt.value}
                        checked={form.dietary_preference === opt.value}
                        onChange={handleChange}
                        data-ocid={`signup.dietary_${opt.value}_radio`}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Diet Type (veg / non_veg) */}
              <div className="space-y-2">
                <p className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Diet Type
                </p>
                <div className="flex gap-3">
                  {[
                    { value: DietType.non_veg, label: "🍖 Non-Veg" },
                    { value: DietType.veg, label: "🌿 Veg" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer text-sm font-medium transition-smooth ${
                        form.diet_type === opt.value
                          ? "border-primary/70 bg-primary/15 text-white"
                          : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name="diet_type"
                        value={opt.value}
                        checked={form.diet_type === opt.value}
                        onChange={handleChange}
                        data-ocid={`signup.diet_type_${opt.value}_radio`}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Lifestyle Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-lifestyle"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Describe Your Lifestyle &amp; Preferences{" "}
                  <span className="normal-case font-normal text-white/35">
                    (optional)
                  </span>
                </label>
                <p className="text-xs text-primary/70 font-medium -mt-0.5">
                  Help us personalize your diet better
                </p>
                <textarea
                  id="signup-lifestyle"
                  name="lifestyle_description"
                  rows={4}
                  placeholder="Tell us about your daily routine, eating habits, food you love or dislike, body type, digestion, restrictions…"
                  value={form.lifestyle_description}
                  onChange={handleChange}
                  data-ocid="signup.lifestyle_description_textarea"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                  style={{
                    background: "oklch(0.14 0.015 260 / 0.7)",
                    border: "1px solid oklch(0.55 0.22 280 / 0.25)",
                  }}
                />
                <p className="text-xs text-white/35 leading-relaxed">
                  Example: "I eat roti daily, don't like oats, sleep by 11pm, go
                  to gym 4x/week"
                </p>
              </div>

              {/* Submit error */}
              {submitError && (
                <div
                  data-ocid="signup.error_state"
                  className="flex items-start gap-2.5 text-sm rounded-xl px-4 py-3"
                  role="alert"
                  style={{
                    background: "oklch(0.65 0.19 22 / 0.12)",
                    border: "1px solid oklch(0.65 0.19 22 / 0.35)",
                  }}
                >
                  <AlertCircle
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                    aria-hidden="true"
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: "oklch(0.85 0.12 22)" }}
                    >
                      Registration failed
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.75 0.1 22)" }}
                    >
                      {submitError}
                    </p>
                    {/already.*registered|already.*exists|duplicate/i.test(
                      submitError,
                    ) && (
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/login" })}
                        className="text-xs underline mt-1 font-semibold hover:opacity-80 transition-smooth"
                        style={{ color: "oklch(0.75 0.19 22)" }}
                        data-ocid="signup.go_to_login_link"
                      >
                        Go to sign in →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Disclaimer Box */}
              <div
                data-ocid="signup.medical_disclaimer"
                className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                style={{
                  background: "oklch(0.55 0.18 85 / 0.08)",
                  border: "1px solid oklch(0.75 0.18 85 / 0.45)",
                }}
                role="note"
                aria-label="Medical disclaimer"
              >
                <ShieldAlert
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: "oklch(0.80 0.18 85)" }}
                  aria-hidden="true"
                />
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.85 0.10 85)" }}
                >
                  <p
                    className="font-bold mb-1"
                    style={{ color: "oklch(0.88 0.16 85)" }}
                  >
                    ⚕ Medical Disclaimer
                  </p>
                  <p>
                    Dietary Assistant provides AI-assisted diet guidance for{" "}
                    <strong>informational purposes only</strong>. This is{" "}
                    <strong>NOT medical advice</strong>. Always consult a
                    qualified doctor or dietitian before making any dietary or
                    health changes.{" "}
                    <Link
                      to="/disclaimer"
                      className="underline font-semibold hover:opacity-80 transition-smooth"
                      style={{ color: "oklch(0.80 0.18 85)" }}
                    >
                      Read full disclaimer →
                    </Link>
                  </p>
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="space-y-1.5">
                <label
                  className="flex items-start gap-3 cursor-pointer group"
                  htmlFor="signup-consent"
                >
                  <input
                    id="signup-consent"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => {
                      setConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError(false);
                    }}
                    data-ocid="signup.consent_checkbox"
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary shrink-0 cursor-pointer"
                    aria-required="true"
                  />
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.6 0.01 260)" }}
                  >
                    I have read and agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-semibold hover:underline"
                      style={{ color: "oklch(0.68 0.22 280)" }}
                    >
                      Terms &amp; Conditions
                    </Link>
                    ,{" "}
                    <Link
                      to="/privacy"
                      className="font-semibold hover:underline"
                      style={{ color: "oklch(0.68 0.22 280)" }}
                    >
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link
                      to="/disclaimer"
                      className="font-semibold hover:underline"
                      style={{ color: "oklch(0.68 0.22 280)" }}
                    >
                      Medical Disclaimer
                    </Link>
                    . I understand this app provides AI-assisted diet guidance
                    for informational purposes only and is{" "}
                    <strong>
                      not a substitute for professional medical advice
                    </strong>
                    .
                  </span>
                </label>
                {consentError && (
                  <p
                    data-ocid="signup.consent.field_error"
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.75 0.19 22)" }}
                    role="alert"
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    Please accept the terms and disclaimer to continue.
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                data-ocid="signup.submit_button"
                type="submit"
                disabled={
                  busy ||
                  !form.name ||
                  !form.email ||
                  !form.password ||
                  !consentChecked
                }
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    Creating your account…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    Register
                  </>
                )}
              </button>

              <p className="text-center text-xs text-white/40">
                You can update your stats anytime in the dashboard.
              </p>
            </form>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 space-y-2.5">
          <p className="text-center text-sm text-white/60">
            Already have an account?{" "}
            <button
              data-ocid="signup.login_link"
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-primary font-semibold hover:underline transition-smooth"
            >
              Sign in
            </button>
          </p>
          <p className="text-center">
            <button
              data-ocid="signup.back_to_home_link"
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-xs text-white/40 hover:text-white/70 transition-smooth"
            >
              ← Back to home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
