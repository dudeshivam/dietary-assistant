import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  BarChart3,
  Bell,
  Brain,
  Droplets,
  RefreshCw,
  Star,
  Target,
} from "lucide-react";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FeatureItem {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  accentClass: string;
  gradientFrom: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES: FeatureItem[] = [
  {
    icon: Brain,
    title: "AI Diet Planning",
    description:
      "Personalized meal plans built around your height, weight, goal, and activity level — recalculated as you change.",
    accentClass: "text-primary",
    gradientFrom: "from-primary/15 to-accent/5",
  },
  {
    icon: Bell,
    title: "Smart Meal Reminders",
    description:
      "Timely notifications for every meal so you never miss a feeding window. Decision fatigue eliminated.",
    accentClass: "text-accent",
    gradientFrom: "from-accent/15 to-primary/5",
  },
  {
    icon: Droplets,
    title: "Hydration Tracking",
    description:
      "Smart water reminders spaced throughout your day based on body weight and activity level.",
    accentClass: "text-primary",
    gradientFrom: "from-primary/15 to-accent/5",
  },
  {
    icon: RefreshCw,
    title: "Dynamic AI Adjustments",
    description:
      "Missed a meal? AI swaps ingredients in real-time — paneer instead of chicken, oats instead of eggs.",
    accentClass: "text-accent",
    gradientFrom: "from-accent/15 to-primary/5",
  },
  {
    icon: BarChart3,
    title: "Daily Tracking Dashboard",
    description:
      "Monitor calories, protein, meals, and water with a clean visual dashboard built for consistency.",
    accentClass: "text-primary",
    gradientFrom: "from-primary/15 to-accent/5",
  },
  {
    icon: Target,
    title: "Goal-Based System",
    description:
      "Choose fat loss or muscle gain — every plan, reminder, and adjustment aligns to your specific goal.",
    accentClass: "text-accent",
    gradientFrom: "from-accent/15 to-primary/5",
  },
];

// ── AnimatedCard ──────────────────────────────────────────────────────────────
function AnimatedCard({
  feature,
  index,
}: {
  feature: FeatureItem;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      data-ocid={`features.item.${index + 1}`}
      className={`group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/40
        hover:shadow-[0_8px_32px_oklch(var(--primary)/0.12)] transition-smooth h-full
        animate-on-scroll ${isVisible ? "in-view" : ""} overflow-hidden`}
      style={{
        transitionDelay: isVisible ? `${index * 80}ms` : "0ms",
      }}
      aria-label={feature.title}
    >
      {/* Hover gradient wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} opacity-0
          group-hover:opacity-100 transition-smooth rounded-2xl pointer-events-none`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative">
        {/* Icon container */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5
            bg-gradient-to-br from-muted to-muted/60 group-hover:gradient-primary
            transition-smooth shadow-sm group-hover:shadow-[0_4px_16px_oklch(var(--primary)/0.25)]
            group-hover:scale-105"
        >
          <Icon
            className={`w-5 h-5 ${feature.accentClass} group-hover:text-white transition-smooth`}
            aria-hidden
          />
        </div>

        <h3 className="font-display font-bold text-lg text-foreground mb-2 leading-snug">
          {feature.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>

        {/* Bottom accent line */}
        <div
          className="absolute -bottom-6 left-0 right-0 h-0.5 gradient-primary
            opacity-0 group-hover:opacity-100 transition-smooth translate-y-full
            group-hover:translate-y-0 rounded-full"
          aria-hidden="true"
        />
      </div>
    </article>
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
        <Star className="w-3.5 h-3.5" aria-hidden />
        Everything You Need
      </span>
      <h2
        id="features-headline"
        className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4"
      >
        Everything You Need to <span className="text-gradient">Eat Right</span>
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Six powerful features working together to eliminate diet confusion and
        deliver consistent, measurable results.
      </p>
    </div>
  );
}

// ── Features Section ──────────────────────────────────────────────────────────
export function Features() {
  return (
    <section
      id="features"
      data-ocid="features.section"
      className="py-24 bg-background"
      aria-labelledby="features-headline"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader />

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="features.list"
        >
          {FEATURES.map((feature, i) => (
            <AnimatedCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
