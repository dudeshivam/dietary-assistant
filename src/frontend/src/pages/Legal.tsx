import { Link } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";

function LegalLayout({
  title,
  subtitle,
  effectiveDate,
  children,
}: {
  title: string;
  subtitle: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-ocid="legal.page"
      className="min-h-screen"
      style={{ background: "oklch(0.12 0.015 265)" }}
    >
      {/* Decorative orb */}
      <div
        className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 pointer-events-none"
        style={{ background: "oklch(0.55 0.22 280 / 0.4)" }}
        aria-hidden="true"
      />

      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4 border-b"
        style={{
          background: "oklch(0.14 0.018 265 / 0.95)",
          borderColor: "oklch(0.25 0.01 260)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-80 transition-colors duration-200"
          aria-label="Go to home"
          data-ocid="legal.home_link"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow shrink-0">
            <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span>
            Dietary <span className="text-gradient">Assistant</span>
          </span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "oklch(0.65 0.02 260)" }}
          data-ocid="legal.back_link"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.68 0.22 280)" }}
          >
            {subtitle}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight mb-3">
            {title}
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.55 0.01 260)" }}>
            Effective Date: {effectiveDate}
          </p>
        </div>

        {/* Body */}
        <div
          className="prose-legal space-y-8 text-sm leading-relaxed"
          style={{ color: "oklch(0.72 0.01 260)" }}
        >
          {children}
        </div>

        {/* Bottom nav */}
        <div
          className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-xs"
          style={{
            borderColor: "oklch(0.22 0.01 260)",
            color: "oklch(0.5 0.01 260)",
          }}
        >
          <Link
            to="/terms"
            className="hover:text-primary transition-colors duration-200"
            data-ocid="legal.terms_link"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            to="/privacy"
            className="hover:text-primary transition-colors duration-200"
            data-ocid="legal.privacy_link"
          >
            Privacy Policy
          </Link>
          <Link
            to="/disclaimer"
            className="hover:text-primary transition-colors duration-200"
            data-ocid="legal.disclaimer_link"
          >
            Medical Disclaimer
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="font-display font-bold text-base text-white mb-3 pb-2 border-b"
        style={{ borderColor: "oklch(0.22 0.01 260)" }}
      >
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ContactBlock() {
  return (
    <div
      className="rounded-xl px-5 py-4 border mt-2"
      style={{
        background: "oklch(0.17 0.02 270 / 0.6)",
        borderColor: "oklch(0.55 0.22 280 / 0.2)",
      }}
    >
      <p className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
        Contact Information
      </p>
      <ul
        className="space-y-1 text-sm"
        style={{ color: "oklch(0.7 0.01 260)" }}
      >
        <li>
          <span className="text-white/50">Name:</span> Shivam
        </li>
        <li>
          <span className="text-white/50">Email:</span> kshivam.work@gmail.com
        </li>
        <li>
          <span className="text-white/50">Phone:</span> 9518187055
        </li>
        <li>
          <span className="text-white/50">Business:</span> Dietary Assistant
        </li>
        <li>
          <span className="text-white/50">Support:</span>{" "}
          help.dietaryassistant@gmail.com
        </li>
      </ul>
    </div>
  );
}

// ── Terms Page ─────────────────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Legal"
      effectiveDate="April 23, 2026"
    >
      <p>
        By accessing or using Dietary Assistant ("the App"), you agree to these
        Terms.
      </p>

      <Section title="1. Nature of Service">
        <p>
          Dietary Assistant provides AI-generated diet suggestions based on
          user-provided information. The service is for informational and
          lifestyle purposes only.
        </p>
      </Section>

      <Section title="2. No Medical Advice">
        <p>
          The App does not provide medical advice, diagnosis, or treatment.
          Always consult a qualified healthcare professional before making
          dietary or health changes.
        </p>
      </Section>

      <Section title="3. User Responsibility">
        <p>You agree to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Provide accurate and updated information</li>
          <li>Use the app responsibly</li>
          <li>Make independent decisions regarding your diet</li>
        </ul>
      </Section>

      <Section title="4. AI Limitations">
        <p>
          Diet plans and responses are generated using AI and may not always be
          accurate, complete, or suitable for your condition.
        </p>
      </Section>

      <Section title="5. Account Security">
        <p>
          You are responsible for maintaining the confidentiality of your login
          credentials.
        </p>
      </Section>

      <Section title="6. Subscription & Payments">
        <ul className="list-disc pl-5 space-y-1">
          <li>Premium features are billed monthly (₹199 or as displayed)</li>
          <li>Payments are processed securely via third-party providers</li>
          <li>No refunds unless required by applicable law</li>
        </ul>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>We are not liable for:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Any health issues arising from use of the app</li>
          <li>Decisions made based on AI suggestions</li>
          <li>Service interruptions or data loss</li>
        </ul>
      </Section>

      <Section title="8. Termination">
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these terms.
        </p>
      </Section>

      <Section title="9. Changes to Terms">
        <p>
          We may update these Terms at any time. Continued use means acceptance
          of changes.
        </p>
      </Section>

      <Section title="Contact">
        <ContactBlock />
      </Section>
    </LegalLayout>
  );
}

// ── Privacy Page ───────────────────────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Legal"
      effectiveDate="April 23, 2026"
    >
      <p>Your privacy is important to us.</p>

      <Section title="1. Information We Collect">
        <p>We may collect:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Personal details (name, age, height, weight, goals)</li>
          <li>Account data (email, password)</li>
          <li>Usage data (activity, meals, interactions)</li>
          <li>Optional uploaded images</li>
        </ul>
      </Section>

      <Section title="2. How We Use Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>Generate personalized diet suggestions</li>
          <li>Track progress and improve user experience</li>
          <li>Enhance AI performance</li>
        </ul>
      </Section>

      <Section title="3. Data Storage & Security">
        <p>
          Your data is stored securely using trusted infrastructure. We use
          encryption and secure authentication methods.
        </p>
      </Section>

      <Section title="4. Data Sharing">
        <p>
          We do <strong className="text-white">NOT</strong> sell your data. We
          may share limited data with:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Payment providers (for transactions)</li>
          <li>AI service providers (for generating responses)</li>
        </ul>
      </Section>

      <Section title="5. User Rights">
        <p>You can:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>Request access to your data</li>
          <li>Request deletion of your data</li>
          <li>Update your personal information</li>
        </ul>
      </Section>

      <Section title="6. Cookies">
        <p>We may use cookies to improve functionality and user experience.</p>
      </Section>

      <Section title="7. Policy Updates">
        <p>
          We may update this Privacy Policy periodically. Continued use of the
          app constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="8. Digital Personal Data Protection (India)">
        <p>
          We follow the basics of the Digital Personal Data Protection Act,
          2023: we ask for consent before collecting data, allow account
          deletion on request, and do not misuse user data.
        </p>
      </Section>

      <Section title="Contact">
        <ContactBlock />
      </Section>
    </LegalLayout>
  );
}

// ── Disclaimer Page ────────────────────────────────────────────────────────────
export function DisclaimerPage() {
  return (
    <LegalLayout
      title="Medical Disclaimer"
      subtitle="Important Notice"
      effectiveDate="April 23, 2026"
    >
      <div
        className="rounded-xl px-5 py-4 border"
        style={{
          background: "oklch(0.55 0.22 22 / 0.08)",
          borderColor: "oklch(0.55 0.22 22 / 0.3)",
        }}
      >
        <p className="font-display font-bold text-white text-base leading-snug">
          ⚕ Dietary Assistant is{" "}
          <span style={{ color: "oklch(0.7 0.22 22)" }}>NOT</span> a medical
          application.
        </p>
      </div>

      <Section title="Informational Use Only">
        <p>
          All diet plans, recommendations, and AI responses are for{" "}
          <strong className="text-white">
            informational and educational purposes only
          </strong>
          .
        </p>
      </Section>

      <Section title="We Do NOT Provide">
        <ul className="list-disc pl-5 space-y-1">
          <li>Medical advice</li>
          <li>Diagnosis</li>
          <li>Treatment</li>
        </ul>
      </Section>

      <Section title="Consult a Professional">
        <p>
          Always consult a certified doctor, dietitian, or healthcare provider
          before making dietary or lifestyle changes.
        </p>
      </Section>

      <Section title="Use at Your Own Risk">
        <p>
          Use of this app is at your own risk. If you have any medical
          condition, allergy, or injury, do not rely solely on this application.
        </p>
      </Section>

      <Section title="AI Response Disclaimer">
        <p>
          All AI-generated responses are for guidance only. They do not
          constitute medical or clinical advice. Every health-related response
          avoids guarantees and cure language. When relevant, you'll see:{" "}
          <em className="text-white/70">
            "Consider consulting a professional."
          </em>
        </p>
      </Section>

      <Section title="Contact">
        <ContactBlock />
      </Section>
    </LegalLayout>
  );
}
