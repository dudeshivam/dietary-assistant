import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Mail, Phone, ShieldCheck } from "lucide-react";

const sections = [
  {
    number: "1",
    title: "Information We Collect",
    content: null,
    list: [
      "Personal details (name, age, height, weight, goals)",
      "Account data (email, password)",
      "Usage data (activity, meals, interactions)",
      "Optional uploaded images",
    ],
    preamble: "We may collect:",
  },
  {
    number: "2",
    title: "How We Use Information",
    content: null,
    list: [
      "Generate personalized diet suggestions",
      "Track progress and improve user experience",
      "Enhance AI performance",
    ],
  },
  {
    number: "3",
    title: "Data Storage & Security",
    content:
      "Your data is stored securely using trusted infrastructure. We use encryption and secure authentication methods.",
  },
  {
    number: "4",
    title: "Data Sharing",
    content: null,
    preamble: "We do NOT sell your data. We may share limited data with:",
    list: [
      "Payment providers (for transactions)",
      "AI service providers (for generating responses)",
    ],
  },
  {
    number: "5",
    title: "User Rights",
    content: null,
    preamble: "You can:",
    list: [
      "Request access to your data",
      "Request deletion of your data",
      "Update your personal information",
    ],
  },
  {
    number: "6",
    title: "Cookies",
    content: "We may use cookies to improve functionality and user experience.",
  },
  {
    number: "7",
    title: "Policy Updates",
    content:
      "We may update this Privacy Policy periodically. We follow the basics of the Digital Personal Data Protection Act, 2023 (India).",
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth text-sm"
            data-ocid="privacy.back_link"
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
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">
              Dietary Assistant
            </span>
            {" · "}Effective Date: April 23, 2026
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Your privacy is important to us.
          </p>
        </div>

        {/* Highlight badge */}
        <div className="mb-8 flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">
            We never sell your personal data. Your information is used only to
            deliver a better, personalized diet coaching experience.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6" data-ocid="privacy.sections">
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
          data-ocid="privacy.contact_card"
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
              to="/terms"
              className="hover:text-foreground transition-smooth"
              data-ocid="privacy.terms_link"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-foreground transition-smooth"
              data-ocid="privacy.disclaimer_link"
            >
              Medical Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
