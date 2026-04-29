import { Apple, Bell, Check, ChevronRight, Droplets, Zap } from "lucide-react";

// ── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[300px]" aria-hidden="true">
      {/* Glow */}
      <div className="absolute inset-0 rounded-[40px] blur-3xl opacity-30 gradient-primary" />
      {/* Frame */}
      <div className="relative rounded-[36px] border-2 border-border bg-card shadow-glow-lg overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-card">
          <span className="text-[10px] font-mono text-muted-foreground">
            9:41
          </span>
          <div className="w-20 h-5 rounded-full bg-muted" />
          <div className="flex gap-1">
            <div className="w-3 h-2 rounded-sm bg-muted-foreground/40" />
            <div className="w-2 h-2 rounded-sm bg-muted-foreground/40" />
          </div>
        </div>

        {/* App content */}
        <div className="px-4 pb-6 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-display font-bold text-foreground">
              Nutrition Dashboard
            </h3>
            <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
              <Bell className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Calorie ring */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg
                viewBox="0 0 56 56"
                className="w-full h-full -rotate-90"
                role="img"
                aria-label="Calorie ring chart"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="oklch(var(--muted))"
                  strokeWidth="5"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="url(#calGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="138.2"
                  strokeDashoffset="82"
                />
                <defs>
                  <linearGradient
                    id="calGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="oklch(0.55 0.22 280)" />
                    <stop offset="100%" stopColor="oklch(0.62 0.25 270)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold font-display text-foreground leading-none">
                  290
                </span>
                <span className="text-[7px] text-muted-foreground">kcal</span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground">
                  Daily Calories
                </span>
                <span className="text-[9px] font-semibold text-foreground">
                  290/2100
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[14%] rounded-full gradient-primary" />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">
                  Protein
                </span>
                <span className="text-[9px] font-semibold text-foreground">
                  285g
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[65%] rounded-full bg-accent" />
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-semibold text-foreground">
                Today's Meals
              </span>
              <span className="text-[8px] text-muted-foreground">3/5 done</span>
            </div>
            {[
              { name: "Oats + Almonds", time: "8:00 AM", done: true },
              { name: "Greek Meal Reminder", time: "12:30 PM", done: false },
            ].map((meal) => (
              <div
                key={meal.name}
                className="flex items-center justify-between p-2 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center flex-shrink-0">
                    <Apple className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold text-foreground">
                      {meal.name}
                    </p>
                    <p className="text-[7px] text-muted-foreground">
                      {meal.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${
                    meal.done
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {meal.done ? "Done" : "Due"}
                </span>
              </div>
            ))}
          </div>

          {/* Water */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40">
            <Droplets className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-muted-foreground">
                  Hydration
                </span>
                <span className="text-[9px] font-semibold text-foreground">
                  6/8 glasses
                </span>
              </div>
              <div className="flex gap-0.5">
                {["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"].map(
                  (id, i) => (
                    <div
                      key={id}
                      className={`flex-1 h-1.5 rounded-full ${i < 6 ? "bg-accent" : "bg-muted"}`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section
      id="hero"
      data-ocid="hero.section"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden gradient-hero"
      aria-labelledby="hero-headline"
    >
      {/* Decorative orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 gradient-primary pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 bg-accent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 bg-primary pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Text column ── */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="fade-in" style={{ animationDelay: "0ms" }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-sm font-medium text-primary mb-4">
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                AI-Powered Diet Coach
              </span>

              <h1
                id="hero-headline"
                className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight"
              >
                AI-assisted{" "}
                <span className="text-gradient">personalized diet</span>{" "}
                guidance.
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="slide-up text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              style={{ animationDelay: "150ms" }}
            >
              Create your account and start your diet system instantly.
              Personalized plans, smart reminders, and real-time adjustments —
              all day, every day.
            </p>

            {/* CTAs */}
            <div
              className="slide-up flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              style={{ animationDelay: "250ms" }}
            >
              <a
                data-ocid="hero.get_started_button"
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow-lg animate-pulse-glow"
              >
                Get Started Free
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <button
                data-ocid="hero.see_how_it_works_button"
                type="button"
                onClick={() =>
                  document
                    .querySelector("#how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white/80 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-smooth"
              >
                See How It Works
              </button>
            </div>

            {/* Trust badges */}
            <div
              className="slide-up flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-white/50"
              style={{ animationDelay: "350ms" }}
            >
              {["Free to start", "No credit card", "Cancel anytime"].map(
                (badge) => (
                  <span key={badge} className="flex items-center gap-1.5">
                    <Check
                      className="w-4 h-4 text-primary"
                      aria-hidden="true"
                    />
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* ── Phone mockup column ── */}
          <div className="flex justify-center lg:justify-end">
            <div className="animate-float">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
