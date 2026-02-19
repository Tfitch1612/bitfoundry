import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment");
}

export const stripe = new Stripe(stripeSecretKey, {
  // Don't set apiVersion to avoid TS mismatch errors with your installed Stripe types
});