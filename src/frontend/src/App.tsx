import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingPage } from "@/pages/Landing";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const LoginPage = lazy(() =>
  import("@/pages/Login").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("@/pages/Signup").then((m) => ({ default: m.SignupPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.DashboardPage })),
);
const AdminDashboard = lazy(() =>
  import("@/pages/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const TermsPage = lazy(() =>
  import("@/pages/Legal").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("@/pages/Legal").then((m) => ({ default: m.PrivacyPage })),
);
const DisclaimerPage = lazy(() =>
  import("@/pages/Legal").then((m) => ({ default: m.DisclaimerPage })),
);

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// ── Root layout ───────────────────────────────────────────────────────────────
function RootLayout() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <LoginPage />,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => <SignupPage />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin",
  component: () => (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  ),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: () => <TermsPage />,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: () => <PrivacyPage />,
});

const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/disclaimer",
  component: () => <DisclaimerPage />,
});

// ── Router ────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  signupRoute,
  dashboardRoute,
  adminRoute,
  termsRoute,
  privacyRoute,
  disclaimerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
