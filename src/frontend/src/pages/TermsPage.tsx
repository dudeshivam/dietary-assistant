import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileText, Mail, Phone } from "lucide-react";

const sections = [
  {
    number: "1",
    title: "Nature of Service",
    content:
      "Dietary Assistant provides AI-generated diet suggestions based on user-provided information. The service is for informational and lifestyle purposes only.",
  },
  {
    number: "2",
    title: "No Medical Advice",
    content:
      "The App does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making dietary or health changes.",
  },
  {
    number: "3",
    title: "User Responsibility",
    content: null,
    list: [
      "Provide accurate and updated information",
      "Use the app responsibly",
      "Make independent decisions regarding your diet",
    ],
    preamble: "You agree to:",
  },
  {
    number: "4",
    title: "AI Limitations",
    content:
      "Diet plans and responses are generated using AI and may not always be accurate, complete, or suitable for your condition.",
  },
  {
    number: "5",
    title: "Account Security",
    content:
      "You are responsible for maintaining the confidentiality of your login credentials.",
  },
  {
    number: "6",
    title: "Subscription & Payments",
    content: null,
    list: [
      "Premium features are billed monthly (₹199 or as displayed)",
      "Payments are processed securely via third-party providers",
      "No refunds unless required by applicable law",
    ],
  },
  {
    number: "7",
    title: "Limitation of Liability",
    content: null,
    list: [
      "Any health issues arising from use of the app",
      "Decisions made based on AI suggestions",
      "Service interruptions or data loss",
    ],
    preamble: "We are not liable for:",
  },
  {
    number: "8",
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate accounts that violate these terms.",
  },
  {
    number: "9",
    title: "Changes to Terms",
    content:
      "We may update these Terms at any time. Continued use means acceptance of changes.",
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth text-sm"
            data-ocid="terms.back_link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Title block */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg gradient-primary">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Terms and Conditions
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">
              Dietary Assistant
            </span>
            {" · "}Effective Date: April 23, 2026
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            By accessing or using Dietary Assistant ("the App"), you agree to
            these Terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6" data-ocid="terms.sections">
          {sections.map((section) => (
            <div
              key={section.number}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="font-display font-semibold text-foreground mb-3 flex items-start gap-2">
                <span className="text-primary font-bold">
                  {section.number}.
                </span>
                {section.title}
              </h2>
              {section.preamble && (
                <p className="text-muted-foreground mb-2 leading-relaxed">
                  {section.preamble}
                </p>
              )}
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.list && (
                <ul className="space-y-2 mt-1">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-muted-foreground text-sm"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div
          className="mt-10 bg-card border border-primary/30 rounded-xl p-6"
          data-ocid="terms.contact_card"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                <span className="font-medium text-foreground">Business: </span>
                Dietary Assistant
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="w-4 h-4 text-primary flex-shrink-0 text-center font-bold text-xs">
                👤
              </span>
              <span>
                <span className="font-medium text-foreground">Name: </span>
                Shivam
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <a
                href="mailto:kshivam.work@gmail.com"
                className="hover:text-primary transition-smooth"
              >
                kshivam.work@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              <a
                href="mailto:help.dietaryassistant@gmail.com"
                className="hover:text-primary transition-smooth"
              >
                help.dietaryassistant@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <a
                href="tel:9518187055"
                className="hover:text-primary transition-smooth"
              >
                9518187055
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-10">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Dietary Assistant</span>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-smooth"
              data-ocid="terms.privacy_link"
            >
              Privacy Policy
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-foreground transition-smooth"
              data-ocid="terms.disclaimer_link"
            >
              Medical Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
