import { c as createLucideIcon, u as useAuthContext, a as useNavigate, d as useGenerateAIDiet, r as reactExports, D as DietType, e as DietaryPreference, A as ActivityLevel, j as jsxRuntimeExports, L as Leaf, C as CircleAlert, G as Goal, f as Link, b as LoaderCircle } from "./index-CepXD3wx.js";
import { E as EyeOff, a as Eye } from "./eye-B9Tyg4fg.js";
import { C as ChevronDown } from "./chevron-down-DputkFqh.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function safeErrorMessage(err) {
  if (err instanceof Error)
    return err.message || "Registration failed. Please try again.";
  if (typeof err === "string" && err.trim()) return err;
  return "Registration failed. Please try again.";
}
const GOAL_OPTIONS = [
  { value: Goal.fat_loss, label: "🔥 Fat Loss" },
  { value: Goal.muscle_gain, label: "💪 Muscle Gain" },
  { value: Goal.lifestyle_balance, label: "⚖️ Lifestyle Balance" }
];
const ACTIVITY_OPTIONS = [
  { value: ActivityLevel.sedentary, label: "🛋️ Sedentary (little/no exercise)" },
  { value: ActivityLevel.light, label: "🚶 Lightly Active (1-3 days/week)" },
  {
    value: ActivityLevel.moderate,
    label: "🏃 Moderately Active (3-5 days/week)"
  },
  { value: ActivityLevel.intense, label: "⚡ Very Active (6-7 days/week)" }
];
function SignupPage() {
  const { register, isAuthenticated, isInitializing, error, clearError } = useAuthContext();
  const navigate = useNavigate();
  const generateAIDiet = useGenerateAIDiet();
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    password: "",
    goal: "",
    height: "",
    weight: "",
    age: "",
    activity_level: ActivityLevel.moderate,
    dietary_preference: DietaryPreference.non_vegetarian,
    diet_type: DietType.non_veg,
    lifestyle_description: ""
  });
  const [fieldErrors, setFieldErrors] = reactExports.useState({});
  const [touched, setTouched] = reactExports.useState({});
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [submitError, setSubmitError] = reactExports.useState(void 0);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [consentChecked, setConsentChecked] = reactExports.useState(false);
  const [consentError, setConsentError] = reactExports.useState(false);
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
    if (name === "name" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Full name is required." }));
    }
    if (name === "email") {
      if (!value.trim())
        setFieldErrors((prev) => ({ ...prev, email: "Email is required." }));
      else if (!validateEmail(value))
        setFieldErrors((prev) => ({
          ...prev,
          email: "Enter a valid email address."
        }));
    }
    if (name === "password") {
      if (!value.trim())
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password is required."
        }));
      else if (value.length < 6)
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters."
        }));
    }
    if (name === "age") {
      const n = Number(value);
      if (value && (n < 18 || n > 80)) {
        setFieldErrors((prev) => ({
          ...prev,
          age: "Age must be between 18 and 80."
        }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(void 0);
    clearError();
    if (!consentChecked) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!validateEmail(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password.trim()) errors.password = "Password is required.";
    else if (form.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (form.age) {
      const n = Number(form.age);
      if (n < 18 || n > 80) errors.age = "Age must be between 18 and 80.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ name: true, email: true, password: true, age: true });
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        goal: form.goal || void 0,
        height: form.height ? Number(form.height) : void 0,
        weight: form.weight ? Number(form.weight) : void 0,
        age: form.age ? Number(form.age) : 25,
        activity_level: form.activity_level,
        dietary_preference: form.dietary_preference,
        diet_type: form.diet_type,
        lifestyle_description: form.lifestyle_description.trim() || void 0
      });
      const PLAN_TIMEOUT = 3e3;
      const planTimer = setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, PLAN_TIMEOUT);
      generateAIDiet.mutateAsync().then(() => {
        clearTimeout(planTimer);
        navigate({ to: "/dashboard" });
      }).catch(() => {
        clearTimeout(planTimer);
        navigate({ to: "/dashboard" });
      });
    } catch (err) {
      setSubmitError(safeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };
  const busy = isSubmitting || isInitializing;
  const fieldError = (field) => touched[field] && fieldErrors[field] ? fieldErrors[field] : void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "signup.page", className: "form-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed inset-0 pointer-events-none overflow-hidden",
        "aria-hidden": "true",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full blur-[120px] opacity-20",
              style: { background: "oklch(0.55 0.22 280 / 0.4)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full blur-[100px] opacity-15",
              style: { background: "oklch(0.62 0.25 260 / 0.3)" }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md relative fade-in", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60 font-body", children: "Personalised nutrition powered by AI" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "signup.card",
          className: "rounded-2xl overflow-hidden shadow-2xl",
          style: {
            background: "oklch(0.19 0.015 260 / 0.92)",
            border: "1px solid oklch(0.55 0.22 280 / 0.25)",
            backdropFilter: "blur(12px)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full gradient-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-2xl text-white mb-1.5", children: "Create your account" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/55 mb-6 leading-relaxed", children: "Set up your profile and get your first AI-personalised diet plan." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  "data-ocid": "signup.form",
                  onSubmit: handleSubmit,
                  className: "space-y-5",
                  noValidate: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-name",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Full Name",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.75 0.19 22)" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          id: "signup-name",
                          name: "name",
                          type: "text",
                          required: true,
                          autoComplete: "name",
                          placeholder: "Your full name",
                          value: form.name,
                          onChange: handleChange,
                          onBlur: handleBlur,
                          "data-ocid": "signup.name_input",
                          className: "auth-input",
                          "aria-invalid": !!fieldError("name"),
                          style: fieldError("name") ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
                        }
                      ),
                      fieldError("name") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          "data-ocid": "signup.name.field_error",
                          className: "flex items-center gap-1.5 text-xs",
                          style: { color: "oklch(0.75 0.19 22)" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleAlert,
                              {
                                className: "w-3.5 h-3.5 shrink-0",
                                "aria-hidden": "true"
                              }
                            ),
                            fieldErrors.name
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-email",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Email ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.75 0.19 22)" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          id: "signup-email",
                          name: "email",
                          type: "email",
                          required: true,
                          autoComplete: "email",
                          placeholder: "you@example.com",
                          value: form.email,
                          onChange: handleChange,
                          onBlur: handleBlur,
                          "data-ocid": "signup.email_input",
                          className: "auth-input",
                          "aria-invalid": !!fieldError("email"),
                          style: fieldError("email") ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
                        }
                      ),
                      fieldError("email") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          "data-ocid": "signup.email.field_error",
                          className: "flex items-center gap-1.5 text-xs",
                          style: { color: "oklch(0.75 0.19 22)" },
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
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-password",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Password",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.75 0.19 22)" }, children: "*" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            id: "signup-password",
                            name: "password",
                            type: showPassword ? "text" : "password",
                            required: true,
                            autoComplete: "new-password",
                            placeholder: "Min. 6 characters",
                            value: form.password,
                            onChange: handleChange,
                            onBlur: handleBlur,
                            "data-ocid": "signup.password_input",
                            className: "auth-input pr-11",
                            "aria-invalid": !!fieldError("password"),
                            style: fieldError("password") ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
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
                            children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                          }
                        )
                      ] }),
                      fieldError("password") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          "data-ocid": "signup.password.field_error",
                          className: "flex items-center gap-1.5 text-xs",
                          style: { color: "oklch(0.75 0.19 22)" },
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
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "border-t pt-1",
                        style: { borderColor: "oklch(1 0 0 / 0.1)" },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/40 mb-4 mt-2", children: "Optional profile info — helps AI personalise your plan" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-goal",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Your Goal",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal text-white/35", children: "(optional)" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "select",
                          {
                            id: "signup-goal",
                            name: "goal",
                            value: form.goal,
                            onChange: handleChange,
                            "data-ocid": "signup.goal_select",
                            className: "auth-input appearance-none pr-10 cursor-pointer",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a goal…" }),
                              GOAL_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: opt.value, children: opt.label }, opt.value))
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ChevronDown,
                          {
                            className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                            style: { color: "oklch(0.5 0.01 260)" },
                            "aria-hidden": "true"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-age",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Age",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal text-white/35", children: "(years, 18–80)" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          id: "signup-age",
                          name: "age",
                          type: "number",
                          min: "18",
                          max: "80",
                          placeholder: "25",
                          value: form.age,
                          onChange: handleChange,
                          onBlur: handleBlur,
                          "data-ocid": "signup.age_input",
                          className: "auth-input",
                          "aria-invalid": !!fieldError("age"),
                          style: fieldError("age") ? { borderColor: "oklch(0.65 0.19 22)" } : void 0
                        }
                      ),
                      fieldError("age") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          "data-ocid": "signup.age.field_error",
                          className: "flex items-center gap-1.5 text-xs",
                          style: { color: "oklch(0.75 0.19 22)" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleAlert,
                              {
                                className: "w-3.5 h-3.5 shrink-0",
                                "aria-hidden": "true"
                              }
                            ),
                            fieldErrors.age
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "label",
                          {
                            htmlFor: "signup-height",
                            className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                            children: [
                              "Height",
                              " ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal text-white/35", children: "cm" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            id: "signup-height",
                            name: "height",
                            type: "number",
                            min: "100",
                            max: "250",
                            placeholder: "175",
                            value: form.height,
                            onChange: handleChange,
                            "data-ocid": "signup.height_input",
                            className: "auth-input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "label",
                          {
                            htmlFor: "signup-weight",
                            className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                            children: [
                              "Weight",
                              " ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal text-white/35", children: "kg" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            id: "signup-weight",
                            name: "weight",
                            type: "number",
                            min: "30",
                            max: "300",
                            placeholder: "70",
                            value: form.weight,
                            onChange: handleChange,
                            "data-ocid": "signup.weight_input",
                            className: "auth-input"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "label",
                        {
                          htmlFor: "signup-activity",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: "Activity Level"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "select",
                          {
                            id: "signup-activity",
                            name: "activity_level",
                            value: form.activity_level,
                            onChange: handleChange,
                            "data-ocid": "signup.activity_level_select",
                            className: "auth-input appearance-none pr-10 cursor-pointer",
                            children: ACTIVITY_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: opt.value, children: opt.label }, opt.value))
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ChevronDown,
                          {
                            className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                            style: { color: "oklch(0.5 0.01 260)" },
                            "aria-hidden": "true"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "block text-xs font-semibold text-white/70 uppercase tracking-wider", children: "Dietary Preference" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [
                        {
                          value: DietaryPreference.non_vegetarian,
                          label: "🍗 Non-Vegetarian"
                        },
                        {
                          value: DietaryPreference.vegetarian,
                          label: "🥦 Vegetarian"
                        }
                      ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          className: `flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer text-sm font-medium transition-smooth ${form.dietary_preference === opt.value ? "border-primary/70 bg-primary/15 text-white" : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "radio",
                                name: "dietary_preference",
                                value: opt.value,
                                checked: form.dietary_preference === opt.value,
                                onChange: handleChange,
                                "data-ocid": `signup.dietary_${opt.value}_radio`,
                                className: "sr-only"
                              }
                            ),
                            opt.label
                          ]
                        },
                        opt.value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "block text-xs font-semibold text-white/70 uppercase tracking-wider", children: "Diet Type" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [
                        { value: DietType.non_veg, label: "🍖 Non-Veg" },
                        { value: DietType.veg, label: "🌿 Veg" }
                      ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          className: `flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border cursor-pointer text-sm font-medium transition-smooth ${form.diet_type === opt.value ? "border-primary/70 bg-primary/15 text-white" : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/80"}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "radio",
                                name: "diet_type",
                                value: opt.value,
                                checked: form.diet_type === opt.value,
                                onChange: handleChange,
                                "data-ocid": `signup.diet_type_${opt.value}_radio`,
                                className: "sr-only"
                              }
                            ),
                            opt.label
                          ]
                        },
                        opt.value
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          htmlFor: "signup-lifestyle",
                          className: "block text-xs font-semibold text-white/70 uppercase tracking-wider",
                          children: [
                            "Describe Your Lifestyle & Preferences",
                            " ",
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal text-white/35", children: "(optional)" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary/70 font-medium -mt-0.5", children: "Help us personalize your diet better" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "textarea",
                        {
                          id: "signup-lifestyle",
                          name: "lifestyle_description",
                          rows: 4,
                          placeholder: "Tell us about your daily routine, eating habits, food you love or dislike, body type, digestion, restrictions…",
                          value: form.lifestyle_description,
                          onChange: handleChange,
                          "data-ocid": "signup.lifestyle_description_textarea",
                          className: "w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed",
                          style: {
                            background: "oklch(0.14 0.015 260 / 0.7)",
                            border: "1px solid oklch(0.55 0.22 280 / 0.25)"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/35 leading-relaxed", children: `Example: "I eat roti daily, don't like oats, sleep by 11pm, go to gym 4x/week"` })
                    ] }),
                    submitError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        "data-ocid": "signup.error_state",
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
                                children: "Registration failed"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "p",
                              {
                                className: "text-xs mt-0.5",
                                style: { color: "oklch(0.75 0.1 22)" },
                                children: submitError
                              }
                            ),
                            /already.*registered|already.*exists|duplicate/i.test(
                              submitError
                            ) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => navigate({ to: "/login" }),
                                className: "text-xs underline mt-1 font-semibold hover:opacity-80 transition-smooth",
                                style: { color: "oklch(0.75 0.19 22)" },
                                "data-ocid": "signup.go_to_login_link",
                                children: "Go to sign in →"
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        "data-ocid": "signup.medical_disclaimer",
                        className: "rounded-xl px-4 py-3.5 flex items-start gap-3",
                        style: {
                          background: "oklch(0.55 0.18 85 / 0.08)",
                          border: "1px solid oklch(0.75 0.18 85 / 0.45)"
                        },
                        role: "note",
                        "aria-label": "Medical disclaimer",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ShieldAlert,
                            {
                              className: "w-5 h-5 shrink-0 mt-0.5",
                              style: { color: "oklch(0.80 0.18 85)" },
                              "aria-hidden": "true"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            {
                              className: "text-xs leading-relaxed",
                              style: { color: "oklch(0.85 0.10 85)" },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  {
                                    className: "font-bold mb-1",
                                    style: { color: "oklch(0.88 0.16 85)" },
                                    children: "⚕ Medical Disclaimer"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                                  "Dietary Assistant provides AI-assisted diet guidance for",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "informational purposes only" }),
                                  ". This is",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NOT medical advice" }),
                                  ". Always consult a qualified doctor or dietitian before making any dietary or health changes.",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Link,
                                    {
                                      to: "/disclaimer",
                                      className: "underline font-semibold hover:opacity-80 transition-smooth",
                                      style: { color: "oklch(0.80 0.18 85)" },
                                      children: "Read full disclaimer →"
                                    }
                                  )
                                ] })
                              ]
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "label",
                        {
                          className: "flex items-start gap-3 cursor-pointer group",
                          htmlFor: "signup-consent",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                id: "signup-consent",
                                type: "checkbox",
                                checked: consentChecked,
                                onChange: (e) => {
                                  setConsentChecked(e.target.checked);
                                  if (e.target.checked) setConsentError(false);
                                },
                                "data-ocid": "signup.consent_checkbox",
                                className: "mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary shrink-0 cursor-pointer",
                                "aria-required": "true"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "span",
                              {
                                className: "text-xs leading-relaxed",
                                style: { color: "oklch(0.6 0.01 260)" },
                                children: [
                                  "I have read and agree to the",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Link,
                                    {
                                      to: "/terms",
                                      className: "font-semibold hover:underline",
                                      style: { color: "oklch(0.68 0.22 280)" },
                                      children: "Terms & Conditions"
                                    }
                                  ),
                                  ",",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Link,
                                    {
                                      to: "/privacy",
                                      className: "font-semibold hover:underline",
                                      style: { color: "oklch(0.68 0.22 280)" },
                                      children: "Privacy Policy"
                                    }
                                  ),
                                  ", and",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Link,
                                    {
                                      to: "/disclaimer",
                                      className: "font-semibold hover:underline",
                                      style: { color: "oklch(0.68 0.22 280)" },
                                      children: "Medical Disclaimer"
                                    }
                                  ),
                                  ". I understand this app provides AI-assisted diet guidance for informational purposes only and is",
                                  " ",
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "not a substitute for professional medical advice" }),
                                  "."
                                ]
                              }
                            )
                          ]
                        }
                      ),
                      consentError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          "data-ocid": "signup.consent.field_error",
                          className: "flex items-center gap-1.5 text-xs",
                          style: { color: "oklch(0.75 0.19 22)" },
                          role: "alert",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleAlert,
                              {
                                className: "w-3.5 h-3.5 shrink-0",
                                "aria-hidden": "true"
                              }
                            ),
                            "Please accept the terms and disclaimer to continue."
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        "data-ocid": "signup.submit_button",
                        type: "submit",
                        disabled: busy || !form.name || !form.email || !form.password || !consentChecked,
                        className: "w-full py-3.5 rounded-xl font-semibold text-sm text-white gradient-primary hover:opacity-90 transition-smooth shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2",
                        "aria-busy": busy,
                        children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            LoaderCircle,
                            {
                              className: "w-4 h-4 animate-spin",
                              "aria-hidden": "true"
                            }
                          ),
                          "Creating your account…"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-4 h-4", "aria-hidden": "true" }),
                          "Register"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-white/40", children: "You can update your stats anytime in the dashboard." })
                  ]
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-white/60", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "data-ocid": "signup.login_link",
              type: "button",
              onClick: () => navigate({ to: "/login" }),
              className: "text-primary font-semibold hover:underline transition-smooth",
              children: "Sign in"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "data-ocid": "signup.back_to_home_link",
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
  SignupPage
};
