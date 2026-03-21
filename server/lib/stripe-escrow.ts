// server/lib/stripe-escrow.ts — Stripe escrow for marketplace transactions
// Uses PaymentIntent with capture_method: 'manual' for the $250 hold per unit.
// Hold → Authorize (funds reserved) → Capture (sale completes, $250 deducted from purchase) or Cancel (released back to buyer).
// Separate charge for $250 commission on completed sales (charged to seller).

import Stripe from "stripe";
import { db } from "../db";
import { marketplaceHolds, marketplaceTransactions, marketplaceMembers, marketplaceListings } from "@shared/schema-marketplace";
import { eq } from "drizzle-orm";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

const HOLD_AMOUNT = 25000;       // $250.00 in cents — deposit per unit bid (deducted from purchase if won, returned if lost)
const COMMISSION_AMOUNT = 25000; // $250.00 in cents — flat commission charged to seller on completed sale
const HOLD_EXPIRY_DAYS = 7;     // Hold expires after 7 days (Stripe auto-voids uncaptured after 7 days)

// ==================== MEMBERSHIP PAYMENTS ====================

/**
 * Create a Stripe subscription for the $499/year marketplace membership.
 */
export async function createMembershipSubscription(memberId: string, paymentMethodId: string) {
  if (!stripe) throw new Error("Stripe not configured");

  const [member] = await db.select().from(marketplaceMembers).where(eq(marketplaceMembers.id, memberId)).limit(1);
  if (!member) throw new Error("Member not found");

  // Get or create Stripe customer
  let customerId = member.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: member.businessEmail,
      name: member.businessName,
      metadata: { memberId: member.id, platform: "dealersuite360-marketplace" },
    });
    customerId = customer.id;
    await db.update(marketplaceMembers).set({ stripeCustomerId: customerId }).where(eq(marketplaceMembers.id, memberId));
  }

  // Attach payment method
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Create or get the annual membership price
  const prices = await stripe.prices.list({ lookup_keys: ["marketplace_annual_499"], active: true, limit: 1 });
  let priceId: string;

  if (prices.data.length > 0) {
    priceId = prices.data[0].id;
  } else {
    const product = await stripe.products.create({
      name: "Marketplace Annual Membership",
      metadata: { type: "marketplace_membership" },
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 49900, // $499.00
      currency: "cad",
      recurring: { interval: "year" },
      lookup_key: "marketplace_annual_499",
    });
    priceId = price.id;
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    metadata: { memberId: member.id, type: "marketplace_membership" },
    expand: ["latest_invoice.payment_intent"],
  });

  // Update member record
  const paidUntil = new Date();
  paidUntil.setFullYear(paidUntil.getFullYear() + 1);

  await db.update(marketplaceMembers).set({
    stripeSubscriptionId: subscription.id,
    paidUntil,
    updatedAt: new Date(),
  }).where(eq(marketplaceMembers.id, memberId));

  return {
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret || null,
    status: subscription.status,
  };
}

// ==================== ESCROW HOLDS ====================

/**
 * Authorize a $250 hold on the buyer's card per unit bid.
 * Uses capture_method: 'manual' so funds are held but not charged.
 * If buyer wins: $250 is deducted from final purchase price. If buyer loses: hold is released back to original payment method.
 * Returns the PaymentIntent client secret for 3D Secure confirmation if needed.
 */
export async function authorizeHold(
  listingId: string,
  buyerId: string,
  paymentMethodId?: string
): Promise<{ holdId: string; clientSecret: string | null; status: string }> {
  if (!stripe) throw new Error("Stripe not configured");

  // Get buyer's Stripe customer
  const [buyer] = await db.select().from(marketplaceMembers).where(eq(marketplaceMembers.id, buyerId)).limit(1);
  if (!buyer) throw new Error("Buyer not found");
  if (!buyer.stripeCustomerId) throw new Error("Buyer has no payment method on file");

  // Verify listing is available
  const [listing] = await db.select().from(marketplaceListings).where(eq(marketplaceListings.id, listingId)).limit(1);
  if (!listing) throw new Error("Listing not found");
  if (listing.status !== "active") throw new Error("Listing is not available");
  if (listing.sellerId === buyerId) throw new Error("Cannot place hold on your own listing");

  // Create PaymentIntent with manual capture
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: HOLD_AMOUNT,
    currency: "cad",
    customer: buyer.stripeCustomerId,
    capture_method: "manual",  // KEY: hold, don't charge
    description: `$250 deposit hold — Listing ${listing.title}`,
    metadata: {
      type: "marketplace_hold",
      listingId,
      buyerId,
      platform: "dealersuite360",
    },
  };

  if (paymentMethodId) {
    paymentIntentParams.payment_method = paymentMethodId;
    paymentIntentParams.confirm = true;
    paymentIntentParams.return_url = `${process.env.APP_URL || "https://dealersuite360.com"}/marketplace/hold-confirmed`;
  }

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + HOLD_EXPIRY_DAYS);

  // Create hold record
  const [hold] = await db.insert(marketplaceHolds).values({
    listingId,
    buyerId,
    holdAmount: "500.00",
    stripePaymentIntentId: paymentIntent.id,
    status: paymentIntent.status === "requires_capture" ? "authorized" : "pending",
    authorizedAt: paymentIntent.status === "requires_capture" ? new Date() : null,
    expiresAt,
  }).returning();

  // Update listing status
  if (paymentIntent.status === "requires_capture") {
    await db.update(marketplaceListings).set({
      status: "on_hold",
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, listingId));
  }

  return {
    holdId: hold.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
  };
}

/**
 * Capture the $500 deposit — called when the sale is completing.
 * Funds move from hold to actual charge.
 */
export async function captureHold(holdId: string): Promise<{ success: boolean }> {
  if (!stripe) throw new Error("Stripe not configured");

  const [hold] = await db.select().from(marketplaceHolds).where(eq(marketplaceHolds.id, holdId)).limit(1);
  if (!hold) throw new Error("Hold not found");
  if (hold.status !== "authorized") throw new Error(`Hold is ${hold.status}, cannot capture`);
  if (!hold.stripePaymentIntentId) throw new Error("No PaymentIntent on hold");

  // Capture the payment
  await stripe.paymentIntents.capture(hold.stripePaymentIntentId);

  // Update hold record
  await db.update(marketplaceHolds).set({
    status: "captured",
    capturedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(marketplaceHolds.id, holdId));

  return { success: true };
}

/**
 * Release the $500 hold — sale cancelled or hold expired.
 * Buyer's card is not charged.
 */
export async function releaseHold(holdId: string, reason?: string): Promise<{ success: boolean }> {
  if (!stripe) throw new Error("Stripe not configured");

  const [hold] = await db.select().from(marketplaceHolds).where(eq(marketplaceHolds.id, holdId)).limit(1);
  if (!hold) throw new Error("Hold not found");
  if (hold.status !== "authorized" && hold.status !== "pending") {
    throw new Error(`Hold is ${hold.status}, cannot release`);
  }

  if (hold.stripePaymentIntentId) {
    await stripe.paymentIntents.cancel(hold.stripePaymentIntentId);
  }

  await db.update(marketplaceHolds).set({
    status: "released",
    releasedAt: new Date(),
    notes: reason || "Hold released",
    updatedAt: new Date(),
  }).where(eq(marketplaceHolds.id, holdId));

  // Re-activate the listing
  await db.update(marketplaceListings).set({
    status: "active",
    updatedAt: new Date(),
  }).where(eq(marketplaceListings.id, hold.listingId));

  return { success: true };
}

// ==================== COMMISSION COLLECTION ====================

/**
 * Charge the $250 commission to the SELLER when a sale completes.
 * This is a separate charge from the buyer's deposit.
 */
export async function chargeCommission(transactionId: string): Promise<{ paymentIntentId: string }> {
  if (!stripe) throw new Error("Stripe not configured");

  const [tx] = await db.select().from(marketplaceTransactions).where(eq(marketplaceTransactions.id, transactionId)).limit(1);
  if (!tx) throw new Error("Transaction not found");

  // Get seller's Stripe customer
  const [seller] = await db.select().from(marketplaceMembers).where(eq(marketplaceMembers.id, tx.sellerId)).limit(1);
  if (!seller?.stripeCustomerId) throw new Error("Seller has no payment method");

  // Charge the commission
  const paymentIntent = await stripe.paymentIntents.create({
    amount: COMMISSION_AMOUNT,
    currency: "cad",
    customer: seller.stripeCustomerId,
    description: `$250 commission — Transaction ${tx.id}`,
    metadata: {
      type: "marketplace_commission",
      transactionId: tx.id,
      listingId: tx.listingId,
      sellerId: tx.sellerId,
      buyerId: tx.buyerId,
    },
    confirm: true,
    off_session: true,  // Charge without customer present
  });

  // Update transaction with commission payment
  await db.update(marketplaceTransactions).set({
    stripePaymentIntentId: paymentIntent.id,
    updatedAt: new Date(),
  }).where(eq(marketplaceTransactions.id, transactionId));

  return { paymentIntentId: paymentIntent.id };
}

// ==================== WEBHOOK HANDLER ====================

/**
 * Handle Stripe webhooks for marketplace events.
 * Add this to your existing webhook handler in routes-payments.ts
 */
export async function handleMarketplaceWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.amount_capturable_updated": {
      // Hold authorized — funds reserved on buyer's card
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.type === "marketplace_hold") {
        const holdId = pi.metadata.holdId;
        if (holdId) {
          await db.update(marketplaceHolds).set({
            status: "authorized",
            authorizedAt: new Date(),
            updatedAt: new Date(),
          }).where(eq(marketplaceHolds.id, holdId));

          await db.update(marketplaceListings).set({
            status: "on_hold",
            updatedAt: new Date(),
          }).where(eq(marketplaceListings.id, pi.metadata.listingId));
        }
      }
      break;
    }

    case "payment_intent.canceled": {
      // Hold released or expired
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.type === "marketplace_hold" && pi.metadata.holdId) {
        await db.update(marketplaceHolds).set({
          status: "released",
          releasedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(marketplaceHolds.id, pi.metadata.holdId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Membership cancelled
      const sub = event.data.object as Stripe.Subscription;
      if (sub.metadata?.type === "marketplace_membership") {
        await db.update(marketplaceMembers).set({
          status: "suspended",
          updatedAt: new Date(),
        }).where(eq(marketplaceMembers.stripeSubscriptionId, sub.id));
      }
      break;
    }
  }
}
