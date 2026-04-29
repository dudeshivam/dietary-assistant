import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ArrowRight, Brain, Sparkles, Target, Zap } from "lucide-react";

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

const VALUE_CARDS = [
  {
    icon: Brain,
    title: "Intelligent Adaptation",
    body: "Your AI coach learns your preferences and adjusts your plan weekly based on your actual progress — not a generic template.",
  },
  {
    icon: Target,
    title: "Goal-Driven Plans",
    body: "Whether you're cutting fat or building muscle, every meal recommendation is calibrated to your specific goal and body metrics.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    body: "Create your account, enter your goals, and receive a personalized diet plan in under two minutes. No waiting.",
  },
];

// ── Testimonials / Social Proof Section ──────────────────────────────────────
export function Testimonials() {
  return (
    <section
      id="testimonials"
      data-ocid="testimonials.section"
      className="py-24 bg-background"
      aria-labelledby="testimonials-headline"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Why It Works
          </span>
          <h2
            id="testimonials-headline"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            No hype. <span className="text-gradient">Just results.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Be among the first to experience AI-powered diet coaching — built to
            fit your life, not the other way around.
          </p>
        </AnimatedSection>

        {/* Value cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          data-ocid="testimonials.list"
        >
          {VALUE_CARDS.map((card, i) => (
            <AnimatedSection key={card.title} delay={i * 120}>
              <div
                data-ocid={`testimonials.item.${i + 1}`}
                className="group p-7 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-elevated transition-smooth h-full flex flex-col gap-4"
              >
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <card.icon
                    className="w-5 h-5 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {card.body}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Callout + CTA */}
        <AnimatedSection delay={400} className="mt-14 text-center">
          <div className="inline-block max-w-xl mx-auto p-6 rounded-2xl bg-card border border-primary/20 shadow-elevated mb-8">
            <p className="text-base text-foreground font-medium leading-relaxed">
              "Be among the first to experience AI-powered diet coaching — no
              hype, just results."
            </p>
          </div>
          <div>
            <a
              data-ocid="testimonials.register_button"
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Start for Free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
