import { j as jsxRuntimeExports, f as Link, L as Leaf } from "./index-CepXD3wx.js";
import { A as ArrowLeft } from "./arrow-left-I2DQLh1u.js";
function LegalLayout({
  title,
  subtitle,
  effectiveDate,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "legal.page",
      className: "min-h-screen",
      style: { background: "oklch(0.12 0.015 265)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed top-0 right-0 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 pointer-events-none",
            style: { background: "oklch(0.55 0.22 280 / 0.4)" },
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4 border-b",
            style: {
              background: "oklch(0.14 0.018 265 / 0.95)",
              borderColor: "oklch(0.25 0.01 260)",
              backdropFilter: "blur(12px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/",
                  className: "inline-flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-80 transition-colors duration-200",
                  "aria-label": "Go to home",
                  "data-ocid": "legal.home_link",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center w-8 h-8 rounded-lg gradient-primary shadow-glow shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 text-white", "aria-hidden": "true" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Dietary ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "Assistant" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/",
                  className: "inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
                  style: { color: "oklch(0.65 0.02 260)" },
                  "data-ocid": "legal.back_link",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4", "aria-hidden": "true" }),
                    "Back"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs font-semibold uppercase tracking-widest mb-3",
                style: { color: "oklch(0.68 0.22 280)" },
                children: subtitle
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-3xl sm:text-4xl text-white leading-tight mb-3", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", style: { color: "oklch(0.55 0.01 260)" }, children: [
              "Effective Date: ",
              effectiveDate
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "prose-legal space-y-8 text-sm leading-relaxed",
              style: { color: "oklch(0.72 0.01 260)" },
              children
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mt-12 pt-8 border-t flex flex-wrap gap-4 text-xs",
              style: {
                borderColor: "oklch(0.22 0.01 260)",
                color: "oklch(0.5 0.01 260)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/terms",
                    className: "hover:text-primary transition-colors duration-200",
                    "data-ocid": "legal.terms_link",
                    children: "Terms & Conditions"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/privacy",
                    className: "hover:text-primary transition-colors duration-200",
                    "data-ocid": "legal.privacy_link",
                    children: "Privacy Policy"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/disclaimer",
                    className: "hover:text-primary transition-colors duration-200",
                    "data-ocid": "legal.disclaimer_link",
                    children: "Medical Disclaimer"
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h2",
      {
        className: "font-display font-bold text-base text-white mb-3 pb-2 border-b",
        style: { borderColor: "oklch(0.22 0.01 260)" },
        children: title
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children })
  ] });
}
function ContactBlock() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl px-5 py-4 border mt-2",
      style: {
        background: "oklch(0.17 0.02 270 / 0.6)",
        borderColor: "oklch(0.55 0.22 280 / 0.2)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-white text-xs uppercase tracking-wider mb-3", children: "Contact Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "ul",
          {
            className: "space-y-1 text-sm",
            style: { color: "oklch(0.7 0.01 260)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Name:" }),
                " Shivam"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Email:" }),
                " kshivam.work@gmail.com"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Phone:" }),
                " 9518187055"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Business:" }),
                " Dietary Assistant"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Support:" }),
                " ",
                "help.dietaryassistant@gmail.com"
              ] })
            ]
          }
        )
      ]
    }
  );
}
function TermsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    LegalLayout,
    {
      title: "Terms & Conditions",
      subtitle: "Legal",
      effectiveDate: "April 23, 2026",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'By accessing or using Dietary Assistant ("the App"), you agree to these Terms.' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "1. Nature of Service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Dietary Assistant provides AI-generated diet suggestions based on user-provided information. The service is for informational and lifestyle purposes only." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "2. No Medical Advice", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "The App does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making dietary or health changes." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "3. User Responsibility", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You agree to:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide accurate and updated information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Use the app responsibly" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Make independent decisions regarding your diet" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "4. AI Limitations", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Diet plans and responses are generated using AI and may not always be accurate, complete, or suitable for your condition." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "5. Account Security", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You are responsible for maintaining the confidentiality of your login credentials." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "6. Subscription & Payments", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Premium features are billed monthly (₹199 or as displayed)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payments are processed securely via third-party providers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refunds unless required by applicable law" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "7. Limitation of Liability", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We are not liable for:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Any health issues arising from use of the app" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Decisions made based on AI suggestions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Service interruptions or data loss" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "8. Termination", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We reserve the right to suspend or terminate accounts that violate these terms." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "9. Changes to Terms", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may update these Terms at any time. Continued use means acceptance of changes." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Contact", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactBlock, {}) })
      ]
    }
  );
}
function PrivacyPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    LegalLayout,
    {
      title: "Privacy Policy",
      subtitle: "Legal",
      effectiveDate: "April 23, 2026",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your privacy is important to us." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "1. Information We Collect", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may collect:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Personal details (name, age, height, weight, goals)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Account data (email, password)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Usage data (activity, meals, interactions)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Optional uploaded images" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "2. How We Use Information", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Generate personalized diet suggestions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Track progress and improve user experience" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Enhance AI performance" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "3. Data Storage & Security", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your data is stored securely using trusted infrastructure. We use encryption and secure authentication methods." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "4. Data Sharing", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "We do ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "NOT" }),
            " sell your data. We may share limited data with:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment providers (for transactions)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "AI service providers (for generating responses)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "5. User Rights", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You can:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Request access to your data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Request deletion of your data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Update your personal information" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "6. Cookies", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may use cookies to improve functionality and user experience." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "7. Policy Updates", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We may update this Privacy Policy periodically. Continued use of the app constitutes acceptance of the updated policy." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "8. Digital Personal Data Protection (India)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We follow the basics of the Digital Personal Data Protection Act, 2023: we ask for consent before collecting data, allow account deletion on request, and do not misuse user data." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Contact", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactBlock, {}) })
      ]
    }
  );
}
function DisclaimerPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    LegalLayout,
    {
      title: "Medical Disclaimer",
      subtitle: "Important Notice",
      effectiveDate: "April 23, 2026",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-xl px-5 py-4 border",
            style: {
              background: "oklch(0.55 0.22 22 / 0.08)",
              borderColor: "oklch(0.55 0.22 22 / 0.3)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display font-bold text-white text-base leading-snug", children: [
              "⚕ Dietary Assistant is",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.7 0.22 22)" }, children: "NOT" }),
              " a medical application."
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Informational Use Only", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "All diet plans, recommendations, and AI responses are for",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-white", children: "informational and educational purposes only" }),
          "."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "We Do NOT Provide", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Medical advice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Diagnosis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Treatment" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Consult a Professional", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Always consult a certified doctor, dietitian, or healthcare provider before making dietary or lifestyle changes." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Use at Your Own Risk", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Use of this app is at your own risk. If you have any medical condition, allergy, or injury, do not rely solely on this application." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "AI Response Disclaimer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "All AI-generated responses are for guidance only. They do not constitute medical or clinical advice. Every health-related response avoids guarantees and cure language. When relevant, you'll see:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-white/70", children: '"Consider consulting a professional."' })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Contact", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactBlock, {}) })
      ]
    }
  );
}
export {
  DisclaimerPage,
  PrivacyPage,
  TermsPage
};
