import { loadStripe } from "@stripe/stripe-js";

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

if (!key || key.startsWith("pk_live_REPLACE")) {
  console.warn("[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not set — payment UI disabled");
}

export const stripePromise = (key && !key.startsWith("pk_live_REPLACE")) ? loadStripe(key) : null;
