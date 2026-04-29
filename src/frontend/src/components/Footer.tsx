import { Link } from "@tanstack/react-router";
import { Leaf, Mail } from "lucide-react";

const SECTION_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Medical Disclaimer", to: "/disclaimer" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer data-ocid="footer" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2 font-display font-bold text-xl">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow">
                <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <span>
                Dietary <span className="text-gradient">Assistant</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-assisted personalized diet guidance. Practical plans, smart
              tracking, and real-time adjustments.
            </p>
            {/* Strengthened medical disclaimer */}
            <div
              className="rounded-lg px-3 py-2.5 border-l-4"
              style={{
                borderColor: "oklch(0.68 0.22 280 / 0.4)",
                background: "oklch(0.55 0.22 280 / 0.06)",
              }}
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground/70">
                  ⚕ Medical Disclaimer:
                </strong>{" "}
                Dietary Assistant provides AI-assisted diet guidance for
                informational purposes only. This is{" "}
                <strong>
                  NOT a substitute for professional medical advice
                </strong>
                . Always consult a qualified healthcare professional before
                making dietary changes.
              </p>
            </div>
            {/* Support email */}
            <a
              href="mailto:help.dietaryassistant@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-smooth"
              data-ocid="footer.support_email_link"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              Support: help.dietaryassistant@gmail.com
            </a>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="space-y-4">
            {/* Section links */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {SECTION_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    data-ocid={`footer.${link.label.toLowerCase().replace(/\s/g, "_")}.link`}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(link.href);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Legal links */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    data-ocid={`footer.${link.label
                      .toLowerCase()
                      .replace(/\s+/g, "_")
                      .replace(/[^a-z0-9_]/g, "")}.link`}
                    to={link.to}
                    className="text-xs text-muted-foreground/70 hover:text-primary transition-smooth"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} Dietary Assistant. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
