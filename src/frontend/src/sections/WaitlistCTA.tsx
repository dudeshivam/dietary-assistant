import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AlertCircle, Check } from "lucide-react";
import { useState } from "react";

// ── AnimatedSection ───────────────────────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`animate-on-scroll ${isVisible ? "in-view" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Apple SVG ────────────────────────────────────────────────────────────────
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// ── Play SVG ─────────────────────────────────────────────────────────────────
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3.18 23.76c.3.16.65.17.96.03l12.14-6.86-2.59-2.59-10.51 9.42zm-1.7-20.71C1.19 3.4 1 3.8 1 4.28v15.43c0 .49.19.89.49 1.23l.07.06 8.65-8.65v-.2L1.55 3.5l-.07.05zm18.52 8.28-2.93-1.66-2.88 2.88 2.88 2.88 2.95-1.67c.84-.48.84-1.25-.02-1.73v.3zm-17.59 9.6l10.5-10.5L9.21.5.96 7.36a1.3 1.3 0 0 0-.47 1.04l-.07 12.53z" />
    </svg>
  );
}

// ── Email validation ──────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── RegisterCTA Section ───────────────────────────────────────────────────────
export function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setValidationError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    window.location.href = `/signup?email=${encodeURIComponent(trimmed)}`;
  };

  return (
    <section
      id="register"
      data-ocid="register.section"
      className="py-28 gradient-hero relative overflow-hidden"
      aria-labelledby="register-headline"
    >
      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/5 w-80 h-80 rounded-full blur-3xl opacity-20 gradient-primary" />
        <div className="absolute bottom-1/4 right-1/5 w-56 h-56 rounded-full blur-3xl opacity-15 bg-accent" />
        <div className="absolute top-0 right-1/3 w-40 h-40 rounded-full blur-2xl opacity-10 bg-primary" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          {/* Headline */}
          <h2
            id="register-headline"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight"
          >
            Start Your <span className="text-gradient">Diet Journey Today</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            Create your account and start your AI diet system instantly.
            Personalized nutrition. Smart reminders. Real results.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              Free plan included
            </span>
          </div>

          {/* Form */}
          <div>
            <form
              data-ocid="register.form"
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              aria-label="Create account form"
              noValidate
            >
              <label htmlFor="register-email" className="sr-only">
                Email address
              </label>
              <input
                id="register-email"
                data-ocid="register.email_input"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError("");
                }}
                onBlur={() => {
                  if (email && !isValidEmail(email.trim())) {
                    setValidationError("Please enter a valid email address.");
                  }
                }}
                placeholder="Enter your email"
                aria-describedby={
                  validationError ? "register-feedback" : undefined
                }
                aria-invalid={!!validationError}
                className="flex-1 min-w-0 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 focus:bg-white/15 transition-smooth text-sm"
              />
              <button
                data-ocid="register.submit_button"
                type="submit"
                className="px-7 py-3.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow flex-shrink-0 flex items-center justify-center gap-2 min-w-[120px]"
              >
                Register
              </button>
            </form>

            {/* Inline validation error */}
            {validationError && (
              <div
                id="register-feedback"
                data-ocid="register.field_error"
                role="alert"
                aria-live="polite"
                className="mt-3 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg max-w-md mx-auto fade-in bg-destructive/10 border border-destructive/20 text-destructive"
              >
                <AlertCircle
                  className="w-4 h-4 flex-shrink-0"
                  aria-hidden="true"
                />
                {validationError}
              </div>
            )}
          </div>

          {/* App store placeholders */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            aria-label="App store availability"
          >
            <div
              data-ocid="register.appstore_badge"
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/8 border border-white/15 text-white/60 text-sm font-medium hover:bg-white/12 transition-smooth cursor-default w-full sm:w-auto justify-center"
            >
              <AppleIcon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-white/40 leading-none mb-0.5">
                  Coming Soon
                </p>
                <p className="font-semibold text-white/70 leading-none">
                  App Store
                </p>
              </div>
            </div>
            <div
              data-ocid="register.playstore_badge"
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/8 border border-white/15 text-white/60 text-sm font-medium hover:bg-white/12 transition-smooth cursor-default w-full sm:w-auto justify-center"
            >
              <PlayIcon className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-white/40 leading-none mb-0.5">
                  Coming Soon
                </p>
                <p className="font-semibold text-white/70 leading-none">
                  Google Play
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
