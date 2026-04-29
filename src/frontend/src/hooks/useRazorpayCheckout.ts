import {
  useCreateRazorpayOrder,
  useMyProfile,
  useVerifyRazorpayPayment,
} from "@/hooks/useBackend";
import type { RazorpayPaymentResponse } from "@/types";
import { SubscriptionPlan } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Replace this with your live key before going to production.
// Keep the secret key (key_secret) on the backend only — never here.
// ─────────────────────────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = "rzp_test_placeholder";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayConstructorType = new (
  opts: Record<string, unknown>,
) => { open(): void };

declare global {
  interface Window {
    Razorpay?: RazorpayConstructorType;
  }
}

/** Lazily inject the Razorpay checkout script into the document. */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay script failed to load")),
      );
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.head.appendChild(script);
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useRazorpayCheckout(userEmail?: string) {
  const { data: profile } = useMyProfile();
  const createOrder = useCreateRazorpayOrder();
  const verifyPayment = useVerifyRazorpayPayment();
  const qc = useQueryClient();

  const isPremium = profile?.subscription_plan === SubscriptionPlan.premium;

  const openCheckout = async () => {
    if (isPremium) return;

    try {
      // Step 1 — create order on backend
      const orderResult = await createOrder.mutateAsync();

      // Step 2 — load checkout script lazily
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK could not be loaded. Check your connection and try again.",
        );
      }

      // Step 3 — open modal
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        order_id: orderResult.order_id,
        amount: 9900, // paise — ₹99
        currency: "INR",
        name: "Dietary Assistant",
        description: "Premium Plan — ₹99/month",
        prefill: {
          email: userEmail ?? "",
        },
        theme: {
          color: "#7c3aed",
        },

        // Step 4 — verify on success
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await verifyPayment.mutateAsync({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            qc.invalidateQueries({ queryKey: ["myProfile"] });
            qc.invalidateQueries({ queryKey: ["myPayments"] });
            toast.success("You're now Premium! 🎉", {
              description:
                "All premium features are unlocked. Enjoy your AI diet coach.",
              duration: 6000,
            });
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : "Payment verification failed.";
            toast.error("Verification failed", { description: msg });
          }
        },

        // Step 5 — handle modal close without payment
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled", {
              description:
                "Your plan was not changed. Try again whenever you're ready.",
            });
          },
        },
      });

      rzp.open();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not start checkout. Please try again.";
      toast.error("Checkout failed", { description: msg });
    }
  };

  return {
    openCheckout,
    isPremium,
    isCreatingOrder: createOrder.isPending,
    isVerifying: verifyPayment.isPending,
    priceLabel: "₹99/month",
  };
}
