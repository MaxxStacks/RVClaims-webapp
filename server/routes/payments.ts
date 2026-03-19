// server/routes/payments.ts — Stripe payment endpoints

import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole, canAccessDealership } from "../middleware/rbac";
import { OPERATOR_ROLES } from "@shared/constants";
import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  createInvoicePaymentIntent,
  createSetupIntent,
  listPaymentMethods,
  deletePaymentMethod,
  handleStripeWebhook,
} from "../lib/stripe";

const router = Router();

// ==================== SUBSCRIPTIONS ====================

// POST /api/payments/subscribe — dealer subscribes to a plan
router.post("/subscribe", requireAuth, requireRole("dealer_owner"), async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!["plan_a", "plan_b"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan. Use plan_a or plan_b." });
    }

    const result = await createSubscription(req.user!.dealershipId!, plan);
    if (!result) {
      return res.status(503).json({ success: false, message: "Payment service unavailable" });
    }

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// POST /api/payments/cancel-subscription
router.post("/cancel-subscription", requireAuth, requireRole("dealer_owner"), async (req: Request, res: Response) => {
  try {
    const cancelled = await cancelSubscription(req.user!.dealershipId!);
    if (!cancelled) {
      return res.status(400).json({ success: false, message: "No active subscription found" });
    }
    res.json({ success: true, message: "Subscription will cancel at end of current period" });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// GET /api/payments/subscription-status
router.get("/subscription-status", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user!.dealershipId;
    if (!dealershipId) return res.json({ success: true, subscription: null });

    const subscription = await getSubscriptionStatus(dealershipId);
    if (!subscription) return res.json({ success: true, subscription: null });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(((subscription as any).current_period_end || 0) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (error: any) {
    console.error("Subscription status error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// ==================== INVOICE PAYMENT ====================

// POST /api/payments/pay-invoice
router.post("/pay-invoice", requireAuth, async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;
    if (!invoiceId) return res.status(400).json({ success: false, message: "Invoice ID required" });

    const dealershipId = req.user!.dealershipId;
    if (!dealershipId) return res.status(403).json({ success: false, message: "No dealership assigned" });

    const result = await createInvoicePaymentIntent(invoiceId, dealershipId);
    if (!result) {
      return res.status(503).json({ success: false, message: "Payment service unavailable" });
    }

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Pay invoice error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// ==================== CARD MANAGEMENT ====================

// POST /api/payments/setup-intent — get client secret for adding a card
router.post("/setup-intent", requireAuth, requireRole("dealer_owner"), async (req: Request, res: Response) => {
  try {
    const result = await createSetupIntent(req.user!.dealershipId!);
    if (!result) return res.status(503).json({ success: false, message: "Payment service unavailable" });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Setup intent error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// GET /api/payments/methods — list saved payment methods
router.get("/methods", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user!.dealershipId;
    if (!dealershipId) return res.json({ success: true, methods: [] });

    const methods = await listPaymentMethods(dealershipId);
    res.json({
      success: true,
      methods: methods.map((m) => ({
        id: m.id,
        brand: m.card?.brand,
        last4: m.card?.last4,
        expMonth: m.card?.exp_month,
        expYear: m.card?.exp_year,
      })),
    });
  } catch (error: any) {
    console.error("List methods error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// DELETE /api/payments/methods/:id — remove a payment method
router.delete("/methods/:id", requireAuth, requireRole("dealer_owner"), async (req: Request, res: Response) => {
  try {
    await deletePaymentMethod(req.params.id);
    res.json({ success: true, message: "Payment method removed" });
  } catch (error: any) {
    console.error("Delete method error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// ==================== WEBHOOK ====================

// POST /api/payments/webhook — Stripe webhook handler (no auth, raw body)
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) return res.status(400).json({ error: "Missing stripe-signature header" });

    const result = await handleStripeWebhook(req.body, signature);
    res.json({ received: true, type: result.type });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
