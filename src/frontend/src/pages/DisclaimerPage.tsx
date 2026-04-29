import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  XCircle,
} from "lucide-react";

const notProvided = ["Medical advice", "Diagnosis", "Treatment"];

export function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth text-sm"
            data-ocid="disclaimer.back_link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Title block */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/20 border border-destructive/40">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Medical Disclaimer
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">
              Dietary Assistant
            </span>
            {" · "}Please read carefully before using this application.
          </p>
        </div>

        {/* Primary warning box */}
        <div
          className="mb-8 border-2 border-destructive/60 rounded-xl p-6 bg-destructive/5"
          data-ocid="disclaimer.warning_box"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-lg text-destructive mb-1">
                Dietary Assistant is NOT a medical application.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All diet plans, recommendations, and AI responses are for
                informational and educational purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* We do NOT provide */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-4">
            We do <span className="text-destructive">NOT</span> provide:
          </h2>
          <ul className="space-y-3">
            {notProvided.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Consult professional */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-3">
            Consult a Professional
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Always consult a certified doctor, dietitian, or healthcare provider
            before making dietary or lifestyle changes.
          </p>
        </div>

        {/* Risk & Medical Conditions */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-3">
            Use at Your Own Risk
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Use of this app is at your own risk.
          </p>
          <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/25 rounded-lg p-4">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any medical condition, allergy, or injury, do{" "}
              <strong className="text-foreground">not</strong> rely solely on
              this application.
            </p>
          </div>
        </div>

        {/* Contact card */}
        <div
          className="mt-10 bg-card border border-primary/30 rounded-xl p-6"
          data-ocid="disclaimer.contact_card"
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
              data-ocid="disclaimer.terms_link"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy"
              className="hover:text-foreground transition-smooth"
              data-ocid="disclaimer.privacy_link"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
