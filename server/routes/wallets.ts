// server/routes/wallets.ts — DS360 Wallet API
//
// DEALER ROUTES (require dealer_owner or dealer_staff):
//   GET  /api/wallets/my                       — get own wallet
//   GET  /api/wallets/my/transactions          — transaction history (paginated)
//   POST /api/wallets/my/fund                  — initiate Stripe funding
//   POST /api/wallets/my/fund/confirm          — confirm Stripe payment + credit wallet
//   PATCH /api/wallets/my/settings             — update auto-reload / threshold (owner only)
//   GET  /api/wallets/my/upcoming              — upcoming charges estimate
//
// OPERATOR ROUTES:
//   GET  /api/wallets                          — all dealer wallets (operator_admin + staff)
//   GET  /api/wallets/stats                    — platform-wide stats (operator_admin)
//   GET  /api/wallets/funding-tiers            — list tiers (public)
//   PATCH /api/wallets/funding-tiers/:id       — update tier (operator_admin)
//   GET  /api/wallets/:dealershipId            — single dealer wallet
//   GET  /api/wallets/:dealershipId/transactions
//   POST /api/wallets/:dealershipId/credit     — manual credit (operator_admin)
//   POST /api/wallets/:dealershipId/debit      — manual debit (operator_admin)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  dealerWallets,
  walletTransactions,
  walletFundingTiers,
  dealerModuleSubscriptions,
  serviceModules,
  dealerships,
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql as drizzleSql, count, sum, or, isNull } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import {
  getWalletByDealership,
  calculateBonus,
  deductFromWallet,
  creditWallet,
} from "../lib/wallet";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isOperator(role: string) {
  return role === "operator_admin" || role === "operator_staff";
}
function isDealerUser(role: string) {
  return role === "dealer_owner" || role === "dealer_staff";
}

// ─── GET /api/wallets/funding-tiers (no auth required) ───────────────────────

router.get("/wallets/funding-tiers", async (_req: Request, res: Response) => {
  try {
    const tiers = await db
      .select()
      .from(walletFundingTiers)
      .where(eq(walletFundingTiers.isActive, true))
      .orderBy(walletFundingTiers.minAmount);
    res.json({ tiers });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch funding tiers", message: err.message });
  }
});

// ─── PATCH /api/wallets/funding-tiers/:id (operator_admin) ───────────────────

router.patch("/wallets/funding-tiers/:id", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "operator_admin") return res.status(403).json({ error: "operator_admin required" });
  const { id } = req.params;
  const { bonusPercentage, isActive } = req.body;
  try {
    const [tier] = await db
      .update(walletFundingTiers)
      .set({
        ...(bonusPercentage !== undefined && { bonusPercentage: String(bonusPercentage) }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(walletFundingTiers.id, id))
      .returning();
    if (!tier) return res.status(404).json({ error: "Tier not found" });
    res.json({ tier });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update tier", message: err.message });
  }
});

// ─── GET /api/wallets/stats (operator_admin) ─────────────────────────────────

router.get("/wallets/stats", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "operator_admin") return res.status(403).json({ error: "operator_admin required" });
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [platformBalance] = await db
      .select({ total: drizzleSql<string>`COALESCE(SUM(${dealerWallets.balance}), 0)` })
      .from(dealerWallets);

    const [fundedThisMonth] = await db
      .select({ total: drizzleSql<string>`COALESCE(SUM(${walletTransactions.amount}), 0)` })
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.type, "funding"),
          gte(walletTransactions.createdAt, startOfMonth),
        ),
      );

    const [feesThisMonth] = await db
      .select({ total: drizzleSql<string>`COALESCE(SUM(ABS(${walletTransactions.amount})), 0)` })
      .from(walletTransactions)
      .where(
        and(
          drizzleSql`${walletTransactions.type} IN ('subscription_fee', 'claim_fee', 'transaction_fee')`,
          gte(walletTransactions.createdAt, startOfMonth),
        ),
      );

    const [gracePeriodCount] = await db
      .select({ c: count() })
      .from(dealerWallets)
      .where(eq(dealerWallets.status, "grace_period"));

    const [pausedCount] = await db
      .select({ c: count() })
      .from(dealerWallets)
      .where(eq(dealerWallets.status, "paused"));

    res.json({
      totalPlatformBalance: parseFloat(platformBalance?.total ?? "0"),
      totalFundedThisMonth: parseFloat(fundedThisMonth?.total ?? "0"),
      totalFeesCollectedThisMonth: parseFloat(feesThisMonth?.total ?? "0"),
      dealersInGracePeriod: Number(gracePeriodCount?.c ?? 0),
      dealersPaused: Number(pausedCount?.c ?? 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch stats", message: err.message });
  }
});

// ─── GET /api/wallets (operator) ─────────────────────────────────────────────

router.get("/wallets", requireAuth, async (req: Request, res: Response) => {
  if (!isOperator(req.user!.role)) return res.status(403).json({ error: "Operator role required" });
  const page = Math.max(1, parseInt(String(req.query.page || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"))));
  const offset = (page - 1) * limit;
  const search = String(req.query.search || "").trim().toLowerCase();
  const statusFilter = String(req.query.status || "");

  try {
    let query = db
      .select({
        id: dealerWallets.id,
        dealershipId: dealerWallets.dealershipId,
        balance: dealerWallets.balance,
        status: dealerWallets.status,
        lowBalanceThreshold: dealerWallets.lowBalanceThreshold,
        autoReloadEnabled: dealerWallets.autoReloadEnabled,
        gracePeriodEnds: dealerWallets.gracePeriodEnds,
        createdAt: dealerWallets.createdAt,
        updatedAt: dealerWallets.updatedAt,
        dealerName: dealerships.name,
        dealerCity: dealerships.city,
      })
      .from(dealerWallets)
      .leftJoin(dealerships, eq(dealerWallets.dealershipId, dealerships.id))
      .orderBy(desc(dealerWallets.updatedAt))
      .limit(limit)
      .offset(offset);

    const rows = await query;

    // Client-side filter for search/status (simple approach for now)
    let filtered = rows;
    if (search) {
      filtered = filtered.filter(r => r.dealerName?.toLowerCase().includes(search));
    }
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    res.json({ wallets: filtered, page, limit });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch wallets", message: err.message });
  }
});

// ─── GET /api/wallets/my (dealer) ────────────────────────────────────────────

router.get("/wallets/my", requireAuth, async (req: Request, res: Response) => {
  if (!isDealerUser(req.user!.role)) return res.status(403).json({ error: "Dealer role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });
  try {
    const wallet = await getWalletByDealership(dealershipId);
    const activeTier = await calculateBonus(parseFloat(wallet.balance));
    res.json({ wallet, activeTier });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch wallet", message: err.message });
  }
});

// ─── GET /api/wallets/my/transactions (dealer) ───────────────────────────────

router.get("/wallets/my/transactions", requireAuth, async (req: Request, res: Response) => {
  if (!isDealerUser(req.user!.role)) return res.status(403).json({ error: "Dealer role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });
  return getTransactionsForDealership(dealershipId, req, res);
});

// ─── POST /api/wallets/my/fund (dealer_owner) ────────────────────────────────

router.post("/wallets/my/fund", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "dealer_owner") return res.status(403).json({ error: "dealer_owner role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });

  const amount = parseFloat(req.body.amount);
  if (!amount || isNaN(amount) || amount < 100) {
    return res.status(400).json({ error: "Amount must be at least $100" });
  }

  try {
    const { bonusPercentage, bonusAmount, tierId } = await calculateBonus(amount);
    const totalCredits = amount + bonusAmount;

    // Check Stripe config
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.json({
        stripeNotConfigured: true,
        amount,
        bonusAmount,
        bonusPercentage,
        totalCredits,
      });
    }

    // Create Stripe PaymentIntent
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents — fund amount only (bonus is free)
      currency: "cad",
      metadata: {
        dealershipId,
        bonusAmount: String(bonusAmount),
        bonusPercentage: String(bonusPercentage),
        walletFunding: "true",
        tierId: tierId ?? "",
      },
    });

    res.json({
      clientSecret: intent.client_secret,
      amount,
      bonusAmount,
      bonusPercentage,
      totalCredits,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to initiate funding", message: err.message });
  }
});

// ─── POST /api/wallets/my/fund/confirm (dealer_owner) ────────────────────────

router.post("/wallets/my/fund/confirm", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "dealer_owner") return res.status(403).json({ error: "dealer_owner role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });

  const { paymentIntentId } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: "paymentIntentId is required" });

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(400).json({ error: "Stripe not configured" });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment has not succeeded yet", status: intent.status });
    }

    // Idempotency check — make sure this intent hasn't been processed
    const existing = await db
      .select({ id: walletTransactions.id })
      .from(walletTransactions)
      .where(eq(walletTransactions.stripePaymentIntentId, paymentIntentId))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "This payment has already been applied" });
    }

    const amount = intent.amount / 100;
    const bonusAmount = parseFloat(intent.metadata.bonusAmount || "0");

    const { newBalance } = await creditWallet(
      dealershipId,
      amount,
      "funding",
      `Wallet top-up — $${amount.toFixed(2)} CAD`,
      paymentIntentId,
      "manual",
      undefined,
      req.user!.id,
    );

    let finalBalance = newBalance;
    if (bonusAmount > 0) {
      const result = await creditWallet(
        dealershipId,
        bonusAmount,
        "bonus",
        `Bonus credits (${intent.metadata.bonusPercentage}%)`,
        undefined,
        "manual",
        undefined,
        req.user!.id,
      );
      finalBalance = result.newBalance;
    }

    res.json({
      newBalance: finalBalance,
      bonusEarned: bonusAmount,
      message: bonusAmount > 0
        ? `Wallet funded! $${amount.toFixed(2)} added + $${bonusAmount.toFixed(2)} bonus credits applied.`
        : `Wallet funded! $${amount.toFixed(2)} added.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to confirm funding", message: err.message });
  }
});

// ─── PATCH /api/wallets/my/settings (dealer_owner) ───────────────────────────

router.patch("/wallets/my/settings", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "dealer_owner") return res.status(403).json({ error: "dealer_owner role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });

  const { lowBalanceThreshold, autoReloadEnabled, autoReloadAmount } = req.body;
  try {
    const wallet = await getWalletByDealership(dealershipId);
    const [updated] = await db
      .update(dealerWallets)
      .set({
        ...(lowBalanceThreshold !== undefined && { lowBalanceThreshold: String(lowBalanceThreshold) }),
        ...(autoReloadEnabled !== undefined && { autoReloadEnabled }),
        ...(autoReloadAmount !== undefined && { autoReloadAmount: autoReloadAmount ? String(autoReloadAmount) : null }),
        updatedAt: new Date(),
      })
      .where(eq(dealerWallets.id, wallet.id))
      .returning();
    res.json({ wallet: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update settings", message: err.message });
  }
});

// ─── GET /api/wallets/my/upcoming (dealer) ───────────────────────────────────

router.get("/wallets/my/upcoming", requireAuth, async (req: Request, res: Response) => {
  if (!isDealerUser(req.user!.role)) return res.status(403).json({ error: "Dealer role required" });
  const dealershipId = req.user!.dealershipId;
  if (!dealershipId) return res.status(400).json({ error: "No dealership associated" });

  try {
    const subs = await db
      .select({
        id: dealerModuleSubscriptions.id,
        monthlyRate: dealerModuleSubscriptions.monthlyRate,
        moduleName: serviceModules.name,
        moduleMonthlyPrice: serviceModules.monthlyPrice,
      })
      .from(dealerModuleSubscriptions)
      .leftJoin(serviceModules, eq(dealerModuleSubscriptions.moduleId, serviceModules.id))
      .where(
        and(
          eq(dealerModuleSubscriptions.dealershipId, dealershipId),
          eq(dealerModuleSubscriptions.status, "active"),
        ),
      );

    const charges = subs
      .filter(s => {
        const price = parseFloat(s.monthlyRate ?? s.moduleMonthlyPrice ?? "0");
        return price > 0;
      })
      .map(s => ({
        description: `${s.moduleName} — Monthly Subscription`,
        amount: parseFloat(s.monthlyRate ?? s.moduleMonthlyPrice ?? "0"),
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split("T")[0],
      }));

    const totalMonthly = charges.reduce((sum, c) => sum + c.amount, 0);
    const wallet = await getWalletByDealership(dealershipId);
    const balance = parseFloat(wallet.balance);
    const monthsCoverage = totalMonthly > 0 ? Math.floor(balance / totalMonthly) : null;

    res.json({ charges, totalMonthly, monthsCoverage });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch upcoming charges", message: err.message });
  }
});

// ─── GET /api/wallets/:dealershipId (operator) ────────────────────────────────

router.get("/wallets/:dealershipId", requireAuth, async (req: Request, res: Response) => {
  if (!isOperator(req.user!.role)) return res.status(403).json({ error: "Operator role required" });
  const { dealershipId } = req.params;
  try {
    const wallet = await getWalletByDealership(dealershipId);
    const [dealership] = await db
      .select({ name: dealerships.name, city: dealerships.city, status: dealerships.status })
      .from(dealerships)
      .where(eq(dealerships.id, dealershipId))
      .limit(1);
    res.json({ wallet, dealership });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch wallet", message: err.message });
  }
});

// ─── GET /api/wallets/:dealershipId/transactions (operator) ──────────────────

router.get("/wallets/:dealershipId/transactions", requireAuth, async (req: Request, res: Response) => {
  if (!isOperator(req.user!.role)) return res.status(403).json({ error: "Operator role required" });
  return getTransactionsForDealership(req.params.dealershipId, req, res);
});

// ─── POST /api/wallets/:dealershipId/credit (operator_admin) ─────────────────

router.post("/wallets/:dealershipId/credit", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "operator_admin") return res.status(403).json({ error: "operator_admin required" });
  const { dealershipId } = req.params;
  const { amount, reason } = req.body;
  if (!amount || !reason) return res.status(400).json({ error: "amount and reason are required" });
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: "amount must be positive" });

  try {
    const { newBalance } = await creditWallet(
      dealershipId,
      numAmount,
      "manual_credit",
      reason,
      undefined,
      "manual",
      undefined,
      req.user!.id,
    );
    const wallet = await getWalletByDealership(dealershipId);
    res.json({ wallet, newBalance, message: `$${numAmount.toFixed(2)} credited successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to credit wallet", message: err.message });
  }
});

// ─── POST /api/wallets/:dealershipId/debit (operator_admin) ──────────────────

router.post("/wallets/:dealershipId/debit", requireAuth, async (req: Request, res: Response) => {
  if (req.user!.role !== "operator_admin") return res.status(403).json({ error: "operator_admin required" });
  const { dealershipId } = req.params;
  const { amount, reason } = req.body;
  if (!amount || !reason) return res.status(400).json({ error: "amount and reason are required" });
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: "amount must be positive" });

  try {
    const result = await deductFromWallet(
      dealershipId,
      numAmount,
      "manual_debit",
      reason,
      "manual",
      undefined,
      req.user!.id,
    );
    const wallet = await getWalletByDealership(dealershipId);
    res.json({ wallet, ...result, message: `$${numAmount.toFixed(2)} debited successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to debit wallet", message: err.message });
  }
});

// ─── Shared helper: transaction list ─────────────────────────────────────────

async function getTransactionsForDealership(
  dealershipId: string,
  req: Request,
  res: Response,
): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"))));
  const offset = (page - 1) * limit;
  const typeFilter = String(req.query.type || "");
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : null;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : null;

  try {
    const conditions = [eq(walletTransactions.dealershipId, dealershipId)];
    if (typeFilter && typeFilter !== "all") {
      conditions.push(drizzleSql`${walletTransactions.type} = ${typeFilter}`);
    }
    if (startDate) conditions.push(gte(walletTransactions.createdAt, startDate));
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(lte(walletTransactions.createdAt, endOfDay));
    }

    const [{ total }] = await db
      .select({ total: drizzleSql<number>`count(*)::int` })
      .from(walletTransactions)
      .where(and(...conditions));

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(and(...conditions))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    const totalNum = Number(total ?? 0);
    res.json({
      transactions,
      total: totalNum,
      page,
      totalPages: Math.ceil(totalNum / limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch transactions", message: err.message });
  }
}

export default router;
