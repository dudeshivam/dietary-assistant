import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ArrowRight, Sparkles } from "lucide-react";

// ── AnimatedSection ───────────────────────────────────────────────────────────
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

// ── About Section ─────────────────────────────────────────────────────────────
export function About() {
  const scrollToWaitlist = () => {
    document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="about"
      data-ocid="about.section"
      className="py-24 bg-background"
      aria-labelledby="about-headline"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Headline */}
        <AnimatedSection className="text-center mb-14">
          <h2
            id="about-headline"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            Our <span className="text-gradient">Mission</span>
          </h2>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Text column */}
          <AnimatedSection>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We built Dietary Assistant because the hardest part of eating
                healthy isn't knowledge — it's execution. People know what to
                eat. They just can't maintain the mental overhead of tracking,
                planning, and adjusting every single day.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our AI doesn't just track your diet. It thinks for you —
                generating your plan, sending your reminders, and adjusting on
                the fly when life gets in the way. No more willpower battles. No
                more decision fatigue. Just a system that works.
              </p>

              {/* USP callout */}
              <div
                data-ocid="about.usp"
                className="mt-8 p-6 rounded-2xl gradient-border"
              >
                <p className="font-display font-bold text-xl sm:text-2xl text-foreground leading-snug">
                  "We don't just track your diet —{" "}
                  <span className="text-gradient">we control it for you.</span>"
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Honest CTA block */}
          <AnimatedSection delay={150}>
            <div
              data-ocid="about.cta_block"
              className="relative p-8 rounded-2xl bg-card border border-border overflow-hidden"
            >
              {/* Soft glow accent */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 gradient-primary pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Coming Soon
                </span>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-snug">
                  Be among the first to{" "}
                  <span className="text-gradient">experience it.</span>
                </h3>

                <p className="text-base text-muted-foreground leading-relaxed">
                  We're building something meaningful — a truly intelligent diet
                  companion. Join our waitlist and be part of the founding
                  cohort that shapes the product from day one.
                </p>

                <button
                  data-ocid="about.waitlist_button"
                  type="button"
                  onClick={scrollToWaitlist}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow"
                >
                  Join the Waitlist
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
