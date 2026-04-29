import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useBackend";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import type { PricingPlan } from "@/types/index";
import { Check, Loader2, Mail, Sparkles, Star, Zap } from "lucide-react";

// ── AnimatedSection ────────────────────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`animate-on-scroll ${isVisible ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ── Trial Timeline Graphic ─────────────────────────────────────────────────
function TrialTimeline() {
  const steps = [
    { label: "Day 1", sub: "Sign Up Free", color: "bg-primary/80" },
    { label: "30 Days", sub: "Free Trial", color: "bg-primary/50" },
    { label: "Day 31+", sub: "₹99/month", color: "gradient-primary" },
  ];
  return (
    <div
      className="flex items-center gap-1 mt-5 mb-2 px-1"
      aria-label="Trial timeline"
    >
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div
              className={`rounded-lg px-2 py-2 text-center ${step.color} ${i === 2 ? "gradient-primary" : ""}`}
              style={
                i === 2
                  ? {}
                  : {
                      background:
                        i === 0
                          ? "oklch(0.55 0.22 280 / 0.9)"
                          : "oklch(0.55 0.22 280 / 0.4)",
                    }
              }
            >
              <p className="text-white font-bold text-xs leading-tight">
                {step.label}
              </p>
              <p className="text-white/80 text-[10px] mt-0.5">{step.sub}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-4 shrink-0 h-px"
              style={{ background: "oklch(0.55 0.22 280 / 0.5)" }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────
const PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Start your journey with the essentials.",
    features: [
      "Basic AI diet plan (1 goal)",
      "3 meal reminders per day",
      "Basic calorie tracking",
      "Water intake reminders",
      "Standard meal library",
    ],
    cta: "Register",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "₹99",
    period: "/month",
    description: "Full AI personalization. Unlimited everything.",
    features: [
      "Full AI personalization engine",
      "Unlimited meal reminders",
      "Dynamic AI plan adjustments",
      "Advanced macro & hydration tracking",
      "Ingredient substitution engine",
      "Weekly progress insights",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
];

// ── PremiumCTA ─────────────────────────────────────────────────────────────
function PremiumCTA({ planIndex }: { planIndex: number }) {
  const { isAuthenticated } = useAuth();
  const { data: profile } = useMyProfile();
  const { openCheckout, isPremium, isCreatingOrder, isVerifying } =
    useRazorpayCheckout(profile?.email ?? "");

  const loading = isCreatingOrder || isVerifying;
  const planStatus = profile?.plan_status;
  const isOnTrial = planStatus === "trial";
  const isTrialEnded = planStatus === "free";

  const handleUpgrade = async () => {
    if (isPremium) return;

    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }

    await openCheckout();
  };

  // Already on Premium — show badge instead of button
  if (isPremium) {
    return (
      <p
        data-ocid={`pricing.plan_cta.${planIndex + 1}`}
        className="w-full py-3.5 rounded-xl font-semibold text-sm gradient-primary text-white opacity-80 flex items-center justify-center gap-2 cursor-default select-none"
        aria-label="You are already on the Premium plan"
      >
        <Star className="w-4 h-4 fill-white" aria-hidden="true" />
        Already Premium
      </p>
    );
  }

  const ctaLabel = isTrialEnded
    ? "Subscribe Now — ₹99/month"
    : isOnTrial
      ? "Subscribe — ₹99/month"
      : "Start Free Trial";

  return (
    <button
      data-ocid={`pricing.plan_cta.${planIndex + 1}`}
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      aria-label="Get Premium — ₹99/month"
      aria-busy={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gradient-primary text-white hover:opacity-90 shadow-glow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2
            data-ocid={`pricing.upgrade_loading_state.${planIndex + 1}`}
            className="w-4 h-4 animate-spin"
            aria-hidden="true"
          />
          <span>{isCreatingOrder ? "Preparing order…" : "Verifying…"}</span>
        </>
      ) : (
        ctaLabel
      )}
    </button>
  );
}

// ── PricingCard ────────────────────────────────────────────────────────────
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const handleFreePlan = () => {
    window.location.href = "/signup";
  };

  return (
    <AnimatedSection delay={index * 140}>
      <div
        data-ocid={`pricing.plan.${index + 1}`}
        className={`relative p-8 rounded-2xl h-full flex flex-col transition-smooth ${
          plan.highlighted
            ? "gradient-border shadow-glow-lg"
            : "bg-card border border-border hover:border-primary/20 hover:shadow-elevated"
        }`}
      >
        {/* Most Popular badge */}
        {plan.highlighted && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white gradient-primary shadow-glow">
              <Zap className="w-3 h-3" aria-hidden="true" />
              Most Popular
            </span>
          </div>
        )}

        {/* Plan name + icon */}
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              plan.highlighted ? "gradient-primary" : "bg-muted"
            }`}
          >
            {plan.highlighted ? (
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            ) : (
              <Check
                className="w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <h3 className="font-display font-bold text-xl text-foreground">
            {plan.name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-display font-bold text-5xl leading-none ${
                plan.highlighted ? "text-gradient" : "text-foreground"
              }`}
            >
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-muted-foreground text-sm">
                {plan.period}
              </span>
            )}
          </div>
        </div>

        {/* Free trial callout for premium plan */}
        {plan.highlighted && (
          <div
            className="mb-3 rounded-xl border border-primary/25 px-3 py-2.5 text-center"
            style={{ background: "oklch(0.55 0.22 280 / 0.08)" }}
          >
            <p className="text-xs font-semibold text-primary/90">
              🎁 Start with 30 days FREE — no credit card required
            </p>
            <TrialTimeline />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-7">{plan.description}</p>

        {/* Divider */}
        <div className="h-px bg-border mb-7" aria-hidden="true" />

        {/* Features */}
        <ul className="space-y-3.5 flex-1 mb-8 list-none p-0 m-0">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span
                className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  plan.highlighted
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        {plan.highlighted ? (
          <>
            <PremiumCTA planIndex={index} />
            {/* No refund policy on premium card */}
            <p className="mt-3 text-center text-[11px] text-muted-foreground leading-relaxed">
              No refunds unless required by applicable law. ₹99/month after free
              trial.
            </p>
          </>
        ) : (
          <button
            data-ocid={`pricing.plan_cta.${index + 1}`}
            type="button"
            onClick={handleFreePlan}
            aria-label={`${plan.cta} — ${plan.name} plan`}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-secondary text-foreground hover:bg-muted border border-border"
          >
            {plan.cta}
          </button>
        )}
      </div>
    </AnimatedSection>
  );
}

// ── Pricing Section ────────────────────────────────────────────────────────
export function Pricing() {
  return (
    <section
      id="pricing"
      data-ocid="pricing.section"
      className="py-24 bg-muted/30"
      aria-labelledby="pricing-headline"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Pricing Plans
          </span>
          <h2
            id="pricing-headline"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            Simple, <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Start with your first 30 days FREE — no credit card required.
            Upgrade to premium for just ₹99/month when you're ready.
          </p>
        </AnimatedSection>

        {/* Plans grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          data-ocid="pricing.plans"
        >
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        {/* Fine print */}
        <AnimatedSection delay={300} className="mt-10 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            No credit card required to start.{" "}
            <span className="text-foreground font-medium">Cancel anytime.</span>{" "}
            All prices in Indian Rupees (₹).
          </p>
          {/* No refund policy + support */}
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 px-5 py-3 rounded-xl border"
            style={{
              borderColor: "oklch(0.55 0.22 280 / 0.2)",
              background: "oklch(0.55 0.22 280 / 0.04)",
            }}
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">
                No Refund Policy:
              </span>{" "}
              Payments are non-refundable unless required by applicable law.
            </p>
            <span
              className="hidden sm:block text-muted-foreground/30"
              aria-hidden="true"
            >
              |
            </span>
            <a
              href="mailto:help.dietaryassistant@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline transition-smooth"
              data-ocid="pricing.support_email_link"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              Questions? help.dietaryassistant@gmail.com
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
