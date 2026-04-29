import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Bell,
  ClipboardList,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StepItem {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS: StepItem[] = [
  {
    icon: UserCheck,
    title: "Input Your Profile",
    description:
      "Tell us your height, weight, goal, and activity level. Takes 60 seconds to set up.",
  },
  {
    icon: Sparkles,
    title: "Get Your AI Plan",
    description:
      "Your personalized meal plan is generated instantly — tailored to your exact numbers and goals.",
  },
  {
    icon: Bell,
    title: "Follow Smart Reminders",
    description:
      "Get notified for every meal and water intake at the exact right time, every single day.",
  },
  {
    icon: TrendingUp,
    title: "See Real Results",
    description:
      "Track progress daily. Your AI coach adjusts the plan as your body adapts and evolves.",
  },
];

// ── StepCard ──────────────────────────────────────────────────────────────────
function StepCard({ step, index }: { step: StepItem; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const Icon = step.icon;
  const isLast = index === STEPS.length - 1;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      data-ocid={`how-it-works.step.${index + 1}`}
      className={`relative flex flex-col items-center text-center
        animate-on-scroll ${isVisible ? "in-view" : ""}`}
      style={{ transitionDelay: isVisible ? `${index * 120}ms` : "0ms" }}
    >
      {/* Desktop connector line — sits between steps */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-8 left-[58%] w-full h-px z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`h-full bg-gradient-to-r from-primary/50 via-accent/30 to-transparent
              transition-all duration-700 ${isVisible ? "w-full" : "w-0"}`}
            style={{ transitionDelay: `${index * 120 + 300}ms` }}
          />
        </div>
      )}

      {/* Mobile connector — vertical line below icon */}
      {!isLast && (
        <div
          className="lg:hidden absolute top-16 left-1/2 -translate-x-1/2 w-px h-12 z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`w-full bg-gradient-to-b from-primary/50 to-transparent
              transition-all duration-500 ${isVisible ? "h-full" : "h-0"}`}
            style={{ transitionDelay: `${index * 120 + 250}ms` }}
          />
        </div>
      )}

      {/* Step icon + number badge */}
      <div className="relative z-10 mb-5">
        <div
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center
            shadow-[0_8px_24px_oklch(var(--primary)/0.35)] transition-smooth
            hover:scale-105 hover:shadow-[0_12px_32px_oklch(var(--primary)/0.45)]"
        >
          <Icon className="w-7 h-7 text-white" aria-hidden />
        </div>
        {/* Number badge */}
        <span
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-primary
            flex items-center justify-center text-[10px] font-bold font-display text-primary
            shadow-sm"
          aria-label={`Step ${index + 1}`}
        >
          {index + 1}
        </span>
      </div>

      {/* Text */}
      <h3 className="font-display font-bold text-lg text-foreground mb-2 leading-snug">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
        {step.description}
      </p>
    </div>
  );
}

// ── Mobile timeline ───────────────────────────────────────────────────────────
function MobileStepCard({ step, index }: { step: StepItem; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });
  const Icon = step.icon;
  const isLast = index === STEPS.length - 1;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`flex gap-5 animate-on-scroll ${isVisible ? "in-view" : ""}`}
      style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
      data-ocid={`how-it-works.step-mobile.${index + 1}`}
    >
      {/* Left: icon + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="relative w-12 h-12 rounded-xl gradient-primary flex items-center justify-center
            shadow-[0_6px_18px_oklch(var(--primary)/0.3)]"
        >
          <Icon className="w-5 h-5 text-white" aria-hidden />
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border-2 border-primary
              flex items-center justify-center text-[9px] font-bold font-display text-primary"
          >
            {index + 1}
          </span>
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-3 min-h-[40px] bg-gradient-to-b from-primary/40 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Right: text */}
      <div className={`pb-6 ${isLast ? "" : ""}`}>
        <h3 className="font-display font-bold text-base text-foreground mb-1.5 leading-snug">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`text-center mb-16 animate-on-scroll ${isVisible ? "in-view" : ""}`}
    >
      <span
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
          bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-5"
      >
        <ClipboardList className="w-3.5 h-3.5" aria-hidden />
        The Process
      </span>
      <h2
        id="how-it-works-headline"
        className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4"
      >
        Your AI Diet Coach in{" "}
        <span className="text-gradient">4 Simple Steps</span>
      </h2>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
        From setup to real results — the whole system runs in minutes, not
        weeks.
      </p>
    </div>
  );
}

// ── HowItWorks Section ────────────────────────────────────────────────────────
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-ocid="how-it-works.section"
      className="py-24 bg-muted/30 relative overflow-hidden"
      aria-labelledby="how-it-works-headline"
    >
      {/* Subtle background gradient accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <SectionHeader />

        {/* Desktop 4-column layout */}
        <ol
          className="hidden lg:grid grid-cols-4 gap-8"
          data-ocid="how-it-works.steps"
        >
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <StepCard step={step} index={i} />
            </li>
          ))}
        </ol>

        {/* Mobile vertical timeline */}
        <ol
          className="lg:hidden flex flex-col"
          data-ocid="how-it-works.steps-mobile"
        >
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <MobileStepCard step={step} index={i} />
            </li>
          ))}
        </ol>

        {/* Progress indicator dots (desktop) */}
        <div
          className="hidden lg:flex items-center justify-center gap-2 mt-12"
          aria-hidden="true"
        >
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`rounded-full transition-smooth ${
                i === 0
                  ? "w-6 h-2 gradient-primary"
                  : "w-2 h-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
