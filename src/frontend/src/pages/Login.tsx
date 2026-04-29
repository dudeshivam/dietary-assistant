import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Leaf, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

interface LoginForm {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error)
    return err.message || "Something went wrong. Please try again.";
  if (typeof err === "string" && err.trim()) return err;
  return "Something went wrong. Please try again.";
}

export function LoginPage() {
  const { login, isAuthenticated, isInitializing, error, clearError } =
    useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof LoginForm, boolean>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (name === "email") {
      if (!value.trim()) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
      } else if (!validateEmail(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Enter a valid email address.",
        }));
      }
    }
    if (name === "password" && !value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password is required.",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(undefined);
    clearError();

    const errors: FieldErrors = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password.trim()) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setSubmitError(safeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isInitializing;

  return (
    <div data-ocid="login.page" className="form-container">
      {/* Decorative background orbs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[120px] opacity-20"
          style={{ background: "oklch(0.55 0.22 280 / 0.4)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full blur-[100px] opacity-15"
          style={{ background: "oklch(0.62 0.25 260 / 0.3)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-10"
          style={{ background: "oklch(0.65 0.28 270 / 0.2)" }}
        />
      </div>

      <div className="w-full max-w-sm relative fade-in">
        {/* Logo + branding */}
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
          <p className="text-sm text-white/60 mt-1 font-body">
            Your personal nutrition intelligence system
          </p>
        </div>

        {/* Card */}
        <div
          data-ocid="login.card"
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "oklch(0.19 0.015 260 / 0.92)",
            border: "1px solid oklch(0.55 0.22 280 / 0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Top accent stripe */}
          <div className="h-1 w-full gradient-primary" />

          <div className="p-8">
            <h1 className="font-display font-bold text-2xl text-white mb-1.5">
              Welcome back
            </h1>
            <p className="text-sm text-white/55 mb-7 leading-relaxed">
              Sign in to your account to continue your diet journey.
            </p>

            <form
              data-ocid="login.form"
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  data-ocid="login.email_input"
                  className="auth-input"
                  aria-invalid={touched.email && !!fieldErrors.email}
                  aria-describedby={
                    touched.email && fieldErrors.email
                      ? "login-email-error"
                      : undefined
                  }
                  style={
                    touched.email && fieldErrors.email
                      ? { borderColor: "oklch(0.65 0.19 22)" }
                      : undefined
                  }
                />
                {touched.email && fieldErrors.email && (
                  <p
                    id="login-email-error"
                    data-ocid="login.email.field_error"
                    className="flex items-center gap-1.5 text-xs mt-1"
                    style={{ color: "oklch(0.65 0.19 22)" }}
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
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-white/70 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    data-ocid="login.password_input"
                    className="auth-input pr-11"
                    aria-invalid={touched.password && !!fieldErrors.password}
                    aria-describedby={
                      touched.password && fieldErrors.password
                        ? "login-password-error"
                        : undefined
                    }
                    style={
                      touched.password && fieldErrors.password
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
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p
                    id="login-password-error"
                    data-ocid="login.password.field_error"
                    className="flex items-center gap-1.5 text-xs mt-1"
                    style={{ color: "oklch(0.65 0.19 22)" }}
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div
                  data-ocid="login.error_state"
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
                      Sign in failed
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.75 0.1 22)" }}
                    >
                      {submitError}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                data-ocid="login.submit_button"
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 space-y-2.5">
          <p className="text-center text-sm text-white/60">
            Don't have an account?{" "}
            <button
              data-ocid="login.signup_link"
              type="button"
              onClick={() => navigate({ to: "/signup" })}
              className="text-primary font-semibold hover:underline transition-smooth"
            >
              Create an account
            </button>
          </p>
          <p className="text-center">
            <button
              data-ocid="login.back_to_home_link"
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
