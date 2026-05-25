// server/lib/wallet.ts — DS360 Wallet utility
// All balance mutations are atomic (db.transaction) — no silent balance changes.

import { db } from "../db";
import { dealerWallets, walletTransactions, walletFundingTiers, users, dealerships } from "@shared/schema";
import { eq, and, desc, lte, isNull, or, sql as drizzleSql } from "drizzle-orm";
import { createNotification } from "./notifications";

// ─── Internal: get or create wallet ─────────────────────────────────────────

async function getOrCreateWallet(dealershipId: string, tx?: any) {
  const runner = tx ?? db;
  const existing = await runner
    .select()
    .from(dealerWallets)
    .where(eq(dealerWallets.dealershipId, dealershipId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await runner
    .insert(dealerWallets)
    .values({ dealershipId })
    .returning();
  return created;
}

export async function getWalletByDealership(dealershipId: string) {
  return getOrCreateWallet(dealershipId);
}

// ─── Internal: notify dealer owner ──────────────────────────────────────────

async function notifyDealerOwner(
  dealershipId: string,
  type: "payment",
  title: string,
  message: string,
  linkTo?: string,
): Promise<void> {
  try {
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.dealershipId, dealershipId),
          eq(users.role, "dealer_owner"),
          eq(users.isActive, true),
        ),
      )
      .limit(1);

    if (owner) {
      await createNotification({ userId: owner.id, type: "payment", title, message, linkTo });
    }
  } catch (err) {
    console.error("[WALLET] Failed to send low-balance notification:", err);
  }
}

// ─── Internal: notify operator admins ───────────────────────────────────────

async function notifyOperatorAdmins(title: string, message: string): Promise<void> {
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "operator_admin"), eq(users.isActive, true)));

    for (const admin of admins) {
      await createNotification({ userId: admin.id, type: "payment", title, message });
    }
  } catch (err) {
    console.error("[WALLET] Failed to notify operator admins:", err);
  }
}

// ─── calculateBonus ──────────────────────────────────────────────────────────

export async function calculateBonus(amount: number): Promise<{
  bonusPercentage: number;
  bonusAmount: number;
  tierId: string | null;
}> {
  const tiers = await db
    .select()
    .from(walletFundingTiers)
    .where(eq(walletFundingTiers.isActive, true))
    .orderBy(desc(walletFundingTiers.minAmount));

  for (const tier of tiers) {
    const min = parseFloat(tier.minAmount);
    const max = tier.maxAmount !== null ? parseFloat(tier.maxAmount) : null;

    if (amount >= min && (max === null || amount <= max)) {
      const pct = parseFloat(tier.bonusPercentage);
      return {
        bonusPercentage: pct,
        bonusAmount: Math.round(amount * (pct / 100) * 100) / 100,
        tierId: tier.id,
      };
    }
  }

  return { bonusPercentage: 0, bonusAmount: 0, tierId: null };
}

// ─── deductFromWallet ─────────────────────────────────────────────────────────

export async function deductFromWallet(
  dealershipId: string,
  amount: number,
  type: "subscription_fee" | "claim_fee" | "transaction_fee" | "manual_debit",
  description: string,
  referenceType?: string,
  referenceId?: string,
  createdBy?: string,
): Promise<{
  success: boolean;
  newBalance: number;
  gracePeriodStarted?: boolean;
  walletPaused?: boolean;
}> {
  return db.transaction(async (tx) => {
    const wallet = await getOrCreateWallet(dealershipId, tx);
    const now = new Date();

    // Check if already paused
    if (wallet.status === "paused") {
      return { success: false, newBalance: parseFloat(wallet.balance), walletPaused: true };
    }

    // Check if grace period has expired
    if (wallet.status === "grace_period" && wallet.gracePeriodEnds && wallet.gracePeriodEnds < now) {
      await tx
        .update(dealerWallets)
        .set({ status: "paused", updatedAt: now })
        .where(eq(dealerWallets.id, wallet.id));

      // Notify
      const [dealership] = await tx
        .select({ name: dealerships.name })
        .from(dealerships)
        .where(eq(dealerships.id, dealershipId))
        .limit(1);
      const dealerName = dealership?.name ?? "A dealer";

      notifyDealerOwner(
        dealershipId,
        "payment",
        "Services Paused",
        "Your DS360 wallet grace period has ended. Services have been paused. Please fund your wallet to restore access.",
      ).catch(() => {});
      notifyOperatorAdmins(
        `Wallet Paused: ${dealerName}`,
        `${dealerName}'s wallet has been paused due to zero balance.`,
      ).catch(() => {});

      return { success: false, newBalance: parseFloat(wallet.balance), walletPaused: true };
    }

    const currentBalance = parseFloat(wallet.balance);
    const threshold = parseFloat(wallet.lowBalanceThreshold);
    const newBalance = currentBalance - amount;

    // Create transaction record (amount stored as negative for debit)
    await tx.insert(walletTransactions).values({
      walletId: wallet.id,
      dealershipId,
      type,
      amount: (-amount).toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description,
      referenceType: referenceType as any ?? null,
      referenceId: referenceId ?? null,
      createdBy: createdBy ?? null,
    });

    // Determine new status
    let newStatus = wallet.status;
    let gracePeriodEnds: Date | null = wallet.gracePeriodEnds;
    let gracePeriodStarted = false;

    if (newBalance < 0 && wallet.status === "active") {
      newStatus = "grace_period";
      gracePeriodEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      gracePeriodStarted = true;

      notifyDealerOwner(
        dealershipId,
        "payment",
        "Wallet Balance Depleted — Grace Period Started",
        "Your wallet balance is $0. You have 7 days to fund your wallet before services are paused.",
      ).catch(() => {});
    }

    // Update wallet
    await tx
      .update(dealerWallets)
      .set({
        balance: newBalance.toFixed(2),
        totalSpent: (parseFloat(wallet.totalSpent) + amount).toFixed(2),
        status: newStatus as any,
        gracePeriodEnds,
        updatedAt: now,
      })
      .where(eq(dealerWallets.id, wallet.id));

    // Low balance notification (only when first crossing threshold from above)
    if (
      !gracePeriodStarted &&
      newBalance >= 0 &&
      newBalance < threshold &&
      currentBalance >= threshold
    ) {
      notifyDealerOwner(
        dealershipId,
        "payment",
        "Low Wallet Balance",
        `Your DS360 wallet balance is low ($${newBalance.toFixed(2)} remaining). Fund your wallet to avoid service interruption.`,
      ).catch(() => {});
    }

    return { success: true, newBalance, gracePeriodStarted };
  });
}

// ─── creditWallet ─────────────────────────────────────────────────────────────

export async function creditWallet(
  dealershipId: string,
  amount: number,
  type: "funding" | "bonus" | "manual_credit" | "refund",
  description: string,
  stripePaymentIntentId?: string,
  referenceType?: string,
  referenceId?: string,
  createdBy?: string,
): Promise<{ newBalance: number }> {
  return db.transaction(async (tx) => {
    const wallet = await getOrCreateWallet(dealershipId, tx);
    const now = new Date();

    const currentBalance = parseFloat(wallet.balance);
    const newBalance = currentBalance + amount;

    // Create transaction record
    await tx.insert(walletTransactions).values({
      walletId: wallet.id,
      dealershipId,
      type,
      amount: amount.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      description,
      stripePaymentIntentId: stripePaymentIntentId ?? null,
      referenceType: referenceType as any ?? null,
      referenceId: referenceId ?? null,
      createdBy: createdBy ?? null,
    });

    // Totals update
    const totalFundedDelta = type === "funding" ? amount : 0;
    const totalBonusDelta = type === "bonus" ? amount : 0;

    // Reset grace/paused status if balance restored
    let newStatus = wallet.status;
    let gracePeriodEnds = wallet.gracePeriodEnds;
    if ((wallet.status === "grace_period" || wallet.status === "paused") && newBalance > 0) {
      newStatus = "active";
      gracePeriodEnds = null;
    }

    await tx
      .update(dealerWallets)
      .set({
        balance: newBalance.toFixed(2),
        totalFunded: (parseFloat(wallet.totalFunded) + totalFundedDelta).toFixed(2),
        totalBonusEarned: (parseFloat(wallet.totalBonusEarned) + totalBonusDelta).toFixed(2),
        status: newStatus as any,
        gracePeriodEnds,
        updatedAt: now,
      })
      .where(eq(dealerWallets.id, wallet.id));

    return { newBalance };
  });
}
