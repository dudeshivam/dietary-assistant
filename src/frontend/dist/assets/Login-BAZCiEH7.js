import { c as createLucideIcon, u as useAuthContext, a as useNavigate, r as reactExports, j as jsxRuntimeExports, L as Leaf, C as CircleAlert, b as LoaderCircle } from "./index-CepXD3wx.js";
import { E as EyeOff, a as Eye } from "./eye-B9Tyg4fg.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function safeErrorMessage(err) {
  if (err instanceof Error)
    return err.message || "Something went wrong. Please try again.";
  if (typeof err === "string" && err.trim()) return err;
  return "Something went wrong. Please try again.";
}
function LoginPage() {
  const { login, isAuthenticated, isInitializing, error, clearError } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = reactExports.useState({});
  const [touched, setTouched] = reactExports.useState({});
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [submitError, setSubmitError] = reactExports.useState(void 0);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);
  reactExports.useEffect(() => {
    if (error) setSubmitError(safeErrorMessage(error));
  }, [error]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError(void 0);
    clearError();
    if (name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [name]: void 0 }));
    }
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "email") {
      if (!value.trim()) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
      } else if (!validateEmail(value)) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Enter a valid email address."
        }));
      }
    }
    if (name === "password" && !value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "Password is required."
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(void 0);
    clearError();
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password.trim()) errors.password = "Password is required.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ email: true, password: true });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setSubmitError(safeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  const busy = isSubmitting || isInitializing;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "login.page", className: "form-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 pointer-events-none overflow-hidden",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-[120px] opacity-20",
              style: { background: "oklch(0.55 0.22 280 / 0.4)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full blur-[100px] opacity-15",
              style: { background: "oklch(0.62 0.25 260 / 0.3)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-10",
              style: { background: "oklch(0.65 0.28 270 / 0.2)" }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm relative fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => navigate({ to: "/" }),
            className: "inline-flex items-center gap-3 font-display font-bold text-2xl text-white mb-3 hover:opacity-90 transition-smooth",
            "aria-label": "Go to home",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-glow shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-5 h-5 text-white", "aria-hidden": "true" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "AI ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "Diet Coach" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60 mt-1 font-body", children: "Your personal nutrition intelligence system" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "login.card",
          className: "rounded-2xl overflow-hidden shadow-2xl",
          style: {
            background: "oklch(0.19 0.015 260 / 0.92)",
            border: "1px solid oklch(0.55 0.22 280 / 0.25)",
            backdropFilter: "blur(12px)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full gradient-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-2xl text-white mb-1.5", children: "Welcome back" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/55 mb-7 leading-relaxed", children: "Sign in to your account to continue your diet journey." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  "data-ocid": "login.form",
                  onSubmit: handleSubmit,
                  className: "space-y-5",
                  noValidate: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "label",
                        {
                          htmlFor: "login-email",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: "Email"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          id: "login-email",
                          name: "email",
                          type: "email",
                          required: true,
                          autoComplete: "email",
                          placeholder: "you@example.com",
                          value: form.email,
                          onChange: handleChange,
                          onBlur: handleBlur,
                          "data-ocid": "login.email_input",
                          className: "auth-input",
                          "aria-invalid": touched.email && !!fieldErrors.email,
                          "aria-describedby": touched.email && fieldErrors.email ? "login-email-error" : void 0,
                          style: touched.email && fieldErrors.email ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
                        }
                      ),
                      touched.email && fieldErrors.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          id: "login-email-error",
                          "data-ocid": "login.email.field_error",
                          className: "flex items-center gap-1.5 text-xs mt-1",
                          style: { color: "oklch(0.65 0.19 22)" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleAlert,
                              {
                                className: "w-3.5 h-3.5 shrink-0",
                                "aria-hidden": "true"
                              }
                            ),
                            fieldErrors.email
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "label",
                        {
                          htmlFor: "login-password",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: "Password"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            id: "login-password",
                            name: "password",
                            type: showPassword ? "text" : "password",
                            required: true,
                            autoComplete: "current-password",
                            placeholder: "Enter your password",
                            value: form.password,
                            onChange: handleChange,
                            onBlur: handleBlur,
                            "data-ocid": "login.password_input",
                            className: "auth-input pr-11",
                            "aria-invalid": touched.password && !!fieldErrors.password,
                            "aria-describedby": touched.password && fieldErrors.password ? "login-password-error" : void 0,
                            style: touched.password && fieldErrors.password ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => setShowPassword((v) => !v),
                            className: "absolute right-3 top-1/2 -translate-y-1/2 transition-smooth",
                            style: { color: "oklch(0.5 0.01 260)" },
                            "aria-label": showPassword ? "Hide password" : "Show password",
                            children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4", "aria-hidden": "true" })
                          }
                        )
                      ] }),
                      touched.password && fieldErrors.password && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          id: "login-password-error",
                          "data-ocid": "login.password.field_error",
                          className: "flex items-center gap-1.5 text-xs mt-1",
                          style: { color: "oklch(0.65 0.19 22)" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleAlert,
                              {
                                className: "w-3.5 h-3.5 shrink-0",
                                "aria-hidden": "true"
                              }
                            ),
                            fieldErrors.password
                          ]
                        }
                      )
                    ] }),
                    submitError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        "data-ocid": "login.error_state",
                        className: "flex items-start gap-2.5 text-sm rounded-xl px-4 py-3",
                        role: "alert",
                        style: {
                          background: "oklch(0.65 0.19 22 / 0.12)",
                          border: "1px solid oklch(0.65 0.19 22 / 0.35)"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            CircleAlert,
                            {
                              className: "w-4 h-4 mt-0.5 shrink-0",
                              style: { color: "oklch(0.75 0.19 22)" },
                              "aria-hidden": "true"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "p",
                              {
                                className: "font-medium",
                                style: { color: "oklch(0.85 0.12 22)" },
                                children: "Sign in failed"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "p",
                              {
                                className: "text-xs mt-0.5",
                                style: { color: "oklch(0.75 0.1 22)" },
                                children: submitError
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        "data-ocid": "login.submit_button",
                        type: "submit",
                        disabled: busy,
                        className: "w-full py-3.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2",
                        "aria-busy": busy,
                        children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            LoaderCircle,
                            {
                              className: "w-4 h-4 animate-spin",
                              "aria-hidden": "true"
                            }
                          ),
                          "Signing in…"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-4 h-4", "aria-hidden": "true" }),
                          "Sign In"
                        ] })
                      }
                    )
                  ]
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-white/60", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "data-ocid": "login.signup_link",
              type: "button",
              onClick: () => navigate({ to: "/signup" }),
              className: "text-primary font-semibold hover:underline transition-smooth",
              children: "Create an account"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "data-ocid": "login.back_to_home_link",
            type: "button",
            onClick: () => navigate({ to: "/" }),
            className: "text-xs text-white/40 hover:text-white/70 transition-smooth",
            children: "← Back to home"
          }
        ) })
      ] })
    ] })
  ] });
}
export {
  LoginPage
};
