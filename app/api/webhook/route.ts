import { NextResponse } from "next/server";
import Stripe from "stripe";

// Make sure this runs in Node (Stripe webhooks need Node crypto)
export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    // Use the API version your Stripe account/webhook screen shows
    apiVersion: "2026-01-28.clover",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // IMPORTANT: this must be the raw body (text), not JSON
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle events you care about
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Example: session.id, session.payment_status, session.customer_details?.email
      console.log("✅ checkout.session.completed:", {
        id: session.id,
        payment_status: session.payment_status,
        email: session.customer_details?.email,
      });

      break;
    }

    // Optional (good to include if you accept async payment methods)
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
      console.log("ℹ️ async checkout update:", event.type);
      break;

    default:
      // ignore everything else
      break;
  }

  return NextResponse.json({ received: true });
}