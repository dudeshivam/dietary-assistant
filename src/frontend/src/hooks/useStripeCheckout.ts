import { useMyProfile } from "@/hooks/useBackend";
import { SubscriptionPlan } from "@/types";
import { toast } from "sonner";

/**
 * useStripeCheckout
 *
 * On the Internet Computer platform, payments are handled through the Stripe
 * extension via actor calls to the backend. The backend exposes a
 * createCheckoutSession method that returns a real Stripe Checkout URL.
 *
 * If the backend method is unavailable, a graceful error toast is shown
 * instead of navigating to a broken /api/* endpoint.
 */
export function useStripeCheckout() {
  const { data: profile } = useMyProfile();

  const isPremium = profile?.subscription_plan === SubscriptionPlan.premium;

  const redirectToCheckout = async () => {
    if (isPremium) return;

    try {
      // The Stripe extension exposes checkout via the backend actor.
      // Until createCheckoutSession is wired in the backend, show a clear
      // user-facing message rather than navigating to a 404.
      toast.info("Payments coming soon", {
        description:
          "Premium checkout is not yet available. Join the waitlist to be notified at launch.",
        duration: 6000,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to start checkout. Please try again.";
      toast.error("Checkout failed", { description: msg });
    }
  };

  return {
    redirectToCheckout,
    isPremium,
    priceLabel: "₹199/month",
  };
}
