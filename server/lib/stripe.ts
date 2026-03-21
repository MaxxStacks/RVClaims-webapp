// server/lib/stripe.ts — Stripe payment integration
// Handles subscriptions (Plan A/B), one-time invoice payments, card management, webhooks

import Stripe from "stripe";
import { db } from "../db";
import { dealerships, invoices, auditLog, notifications } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[STRIPE] STRIPE_SECRET_KEY not set — payment features disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

// ==================== CUSTOMER MANAGEMENT ====================

export async function getOrCreateStripeCustomer(dealershipId: string): Promise<string | null> {
  if (!stripe) return null;

  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership) throw new Error("Dealership not found");

  // Return existing Stripe customer
  if (dealership.stripeCustomerId) return dealership.stripeCustomerId;

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: dealership.email,
    name: dealership.name,
    metadata: {
      dealershipId: dealership.id,
      platform: "dealersuite360",
    },
    address: {
      line1: dealership.street || "",
      line2: dealership.suite || "",
      city: dealership.city || "",
      state: dealership.province || "",
      postal_code: dealership.postalCode || "",
      country: dealership.country === "Canada" ? "CA" : "US",
    },
  });

  // Save Stripe customer ID
  await db
    .update(dealerships)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(dealerships.id, dealershipId));

  return customer.id;
}

// ==================== SUBSCRIPTIONS ====================

const PLAN_PRICES: Record<string, { monthly: string; name: string }> = {
  plan_a: {
    monthly: process.env.STRIPE_PLAN_A_PRICE_ID || "price_plan_a_monthly",
    name: "Plan A — Essential ($349/mo)",
  },
  plan_b: {
    monthly: process.env.STRIPE_PLAN_B_PRICE_ID || "price_plan_b_monthly",
    name: "Plan B — Professional ($749/mo)",
  },
};

export async function createSubscription(
  dealershipId: string,
  plan: "plan_a" | "plan_b"
): Promise<{ subscriptionId: string; clientSecret: string | null } | null> {
  if (!stripe) return null;

  const customerId = await getOrCreateStripeCustomer(dealershipId);
  if (!customerId) return null;

  const planConfig = PLAN_PRICES[plan];
  if (!planConfig) throw new Error(`Unknown plan: ${plan}`);

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planConfig.monthly }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: { dealershipId, plan },
  });

  // Save subscription ID
  await db
    .update(dealerships)
    .set({
      stripeSubscriptionId: subscription.id,
      plan,
      updatedAt: new Date(),
    })
    .where(eq(dealerships.id, dealershipId));

  const latestInvoice = subscription.latest_invoice as any;
  const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | undefined;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent?.client_secret || null,
  };
}

export async function cancelSubscription(dealershipId: string): Promise<boolean> {
  if (!stripe) return false;

  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership?.stripeSubscriptionId) return false;

  await stripe.subscriptions.update(dealership.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  return true;
}

export async function getSubscriptionStatus(dealershipId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;

  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership?.stripeSubscriptionId) return null;

  return stripe.subscriptions.retrieve(dealership.stripeSubscriptionId);
}

// ==================== ONE-TIME PAYMENTS (Invoice Payment) ====================

export async function createInvoicePaymentIntent(
  invoiceId: string,
  dealershipId: string
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  if (!stripe) return null;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");

  const customerId = await getOrCreateStripeCustomer(dealershipId);
  if (!customerId) return null;

  const amountCents = Math.round(parseFloat(invoice.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: (invoice.currency || "cad").toLowerCase(),
    customer: customerId,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      dealershipId,
    },
    description: `Invoice ${invoice.invoiceNumber}`,
    automatic_payment_methods: { enabled: true },
  });

  // Save payment intent ID on invoice
  await db
    .update(invoices)
    .set({ stripePaymentIntentId: paymentIntent.id, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

// ==================== CARD MANAGEMENT ====================

export async function createSetupIntent(dealershipId: string): Promise<{ clientSecret: string } | null> {
  if (!stripe) return null;

  const customerId = await getOrCreateStripeCustomer(dealershipId);
  if (!customerId) return null;

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  return { clientSecret: setupIntent.client_secret! };
}

export async function listPaymentMethods(dealershipId: string): Promise<Stripe.PaymentMethod[]> {
  if (!stripe) return [];

  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership?.stripeCustomerId) return [];

  const methods = await stripe.paymentMethods.list({
    customer: dealership.stripeCustomerId,
    type: "card",
  });

  return methods.data;
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  if (!stripe) return false;
  await stripe.paymentMethods.detach(paymentMethodId);
  return true;
}

// ==================== WEBHOOK HANDLER ====================

export async function handleStripeWebhook(
  body: Buffer,
  signature: string
): Promise<{ handled: boolean; type?: string }> {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return { handled: false };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("[STRIPE WEBHOOK] Signature verification failed:", err.message);
    throw new Error("Invalid webhook signature");
  }

  switch (event.type) {
    case "invoice.paid": {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      const dealershipId = stripeInvoice.metadata?.dealershipId;
      if (dealershipId) {
        console.log(`[STRIPE] Invoice paid for dealership ${dealershipId}`);
        // TODO: Update internal invoice status if linked
      }
      break;
    }

    case "invoice.payment_failed": {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      const dealershipId = stripeInvoice.metadata?.dealershipId;
      if (dealershipId) {
        console.log(`[STRIPE] Payment failed for dealership ${dealershipId}`);
        // TODO: Send notification to dealer + operator
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const dealershipId = subscription.metadata?.dealershipId;
      if (dealershipId) {
        const status = subscription.status;
        console.log(`[STRIPE] Subscription ${subscription.id} status: ${status}`);
        if (status === "past_due" || status === "unpaid") {
          // TODO: Notify operator, potentially suspend dealership
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const dealershipId = subscription.metadata?.dealershipId;
      if (dealershipId) {
        await db
          .update(dealerships)
          .set({ stripeSubscriptionId: null, status: "suspended", updatedAt: new Date() })
          .where(eq(dealerships.id, dealershipId));
        console.log(`[STRIPE] Subscription cancelled for dealership ${dealershipId}`);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata?.invoiceId;
      if (invoiceId) {
        await db
          .update(invoices)
          .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
          .where(eq(invoices.id, invoiceId));
        console.log(`[STRIPE] Invoice ${invoiceId} paid`);
      }
      break;
    }

    default:
      console.log(`[STRIPE] Unhandled event type: ${event.type}`);
  }

  return { handled: true, type: event.type };
}
