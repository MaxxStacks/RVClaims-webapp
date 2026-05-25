// server/routes/modules.ts — Module Marketplace API
// GET  /api/modules                       — list all active modules (public catalog)
// GET  /api/modules/stats                 — adoption stats (operator_admin only)
// GET  /api/modules/:slug                 — single module by slug
// POST /api/modules                       — create module (operator_admin)
// PATCH /api/modules/:id                  — update module (operator_admin)
// DELETE /api/modules/:id                 — soft-delete (operator_admin)
//
// GET  /api/dealerships/:id/subscriptions       — dealer active subscriptions
// POST /api/dealerships/:id/subscriptions       — subscribe to module (dealer_owner)
// PATCH /api/dealerships/:id/subscriptions/:subId — update subscription (dealer_owner)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { serviceModules, dealerModuleSubscriptions, dealerships } from "@shared/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { deductFromWallet } from "../lib/wallet";

const router = Router();

// ─── Public catalog (no auth required for browsing) ─────────────────────────

router.get("/modules", async (_req: Request, res: Response) => {
  try {
    const modules = await db
      .select()
      .from(serviceModules)
      .where(eq(serviceModules.isActive, true))
      .orderBy(serviceModules.sortOrder);
    res.json({ modules });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch modules", message: err.message });
  }
});

router.get("/modules/stats", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }
  try {
    // Count active subscriptions per module
    const subCounts = await db
      .select({
        moduleId: dealerModuleSubscriptions.moduleId,
        subscriberCount: count(),
      })
      .from(dealerModuleSubscriptions)
      .where(eq(dealerModuleSubscriptions.status, "active"))
      .groupBy(dealerModuleSubscriptions.moduleId);

    const modules = await db
      .select()
      .from(serviceModules)
      .orderBy(serviceModules.sortOrder);

    const stats = modules.map((m) => {
      const sub = subCounts.find((s) => s.moduleId === m.id);
      const subscriberCount = Number(sub?.subscriberCount || 0);
      const monthlyRevenue = subscriberCount * parseFloat(m.monthlyPrice || "0");
      return { ...m, subscriberCount, monthlyRevenue };
    });

    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch stats", message: err.message });
  }
});

router.get("/modules/:slug", async (req: Request, res: Response) => {
  try {
    const [module] = await db
      .select()
      .from(serviceModules)
      .where(eq(serviceModules.slug, req.params.slug))
      .limit(1);

    if (!module) return res.status(404).json({ error: "Module not found" });
    res.json({ module });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch module", message: err.message });
  }
});

router.post("/modules", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }
  try {
    const { name, slug, tagline, description, features, icon, category, monthlyPrice, perTransactionFee, setupFee, isBase, sortOrder } = req.body;
    if (!name || !slug || !category) {
      return res.status(400).json({ error: "name, slug, and category are required" });
    }
    const [module] = await db.insert(serviceModules).values({
      name, slug, tagline, description,
      features: features || [],
      icon, category,
      monthlyPrice: monthlyPrice || "0",
      perTransactionFee: perTransactionFee || null,
      setupFee: setupFee || null,
      isBase: isBase || false,
      isActive: true,
      sortOrder: sortOrder || 0,
    }).returning();
    res.status(201).json({ module });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create module", message: err.message });
  }
});

router.patch("/modules/:id", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }
  try {
    const { id } = req.params;
    const { name, tagline, description, features, icon, category, monthlyPrice, perTransactionFee, setupFee, isActive, sortOrder } = req.body;
    const [module] = await db
      .update(serviceModules)
      .set({
        ...(name !== undefined && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
        ...(icon !== undefined && { icon }),
        ...(category !== undefined && { category }),
        ...(monthlyPrice !== undefined && { monthlyPrice }),
        ...(perTransactionFee !== undefined && { perTransactionFee }),
        ...(setupFee !== undefined && { setupFee }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(serviceModules.id, id))
      .returning();
    if (!module) return res.status(404).json({ error: "Module not found" });
    res.json({ module });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update module", message: err.message });
  }
});

router.delete("/modules/:id", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }
  try {
    await db
      .update(serviceModules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(serviceModules.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete module", message: err.message });
  }
});

// ─── Dealer subscriptions ─────────────────────────────────────────────────

router.get("/dealerships/:id/subscriptions", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  const { id } = req.params;

  // Dealer can only see their own; operator can see any
  if (["dealer_owner", "dealer_staff"].includes(u.role) && u.dealershipId !== id) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const subs = await db
      .select({
        id: dealerModuleSubscriptions.id,
        dealershipId: dealerModuleSubscriptions.dealershipId,
        moduleId: dealerModuleSubscriptions.moduleId,
        status: dealerModuleSubscriptions.status,
        subscribedAt: dealerModuleSubscriptions.subscribedAt,
        cancelledAt: dealerModuleSubscriptions.cancelledAt,
        monthlyRate: dealerModuleSubscriptions.monthlyRate,
        // Module fields
        moduleName: serviceModules.name,
        moduleSlug: serviceModules.slug,
        moduleCategory: serviceModules.category,
        moduleIcon: serviceModules.icon,
        moduleMonthlyPrice: serviceModules.monthlyPrice,
        moduleIsBase: serviceModules.isBase,
      })
      .from(dealerModuleSubscriptions)
      .leftJoin(serviceModules, eq(dealerModuleSubscriptions.moduleId, serviceModules.id))
      .where(
        and(
          eq(dealerModuleSubscriptions.dealershipId, id),
          eq(dealerModuleSubscriptions.status, "active")
        )
      );

    res.json({ subscriptions: subs });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch subscriptions", message: err.message });
  }
});

router.post("/dealerships/:id/subscriptions", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  const { id } = req.params;

  if (u.role !== "dealer_owner" && u.role !== "operator_admin") {
    return res.status(403).json({ error: "dealer_owner or operator_admin role required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== id) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { moduleId } = req.body;
  if (!moduleId) return res.status(400).json({ error: "moduleId is required" });

  try {
    // Check module exists
    const [module] = await db
      .select()
      .from(serviceModules)
      .where(and(eq(serviceModules.id, moduleId), eq(serviceModules.isActive, true)))
      .limit(1);

    if (!module) return res.status(404).json({ error: "Module not found" });

    // Check already subscribed
    const [existing] = await db
      .select()
      .from(dealerModuleSubscriptions)
      .where(
        and(
          eq(dealerModuleSubscriptions.dealershipId, id),
          eq(dealerModuleSubscriptions.moduleId, moduleId),
          eq(dealerModuleSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Already subscribed to this module" });
    }

    const [sub] = await db.insert(dealerModuleSubscriptions).values({
      dealershipId: id,
      moduleId,
      status: "active",
      monthlyRate: module.monthlyPrice,
    }).returning();

    // Deduct first month's subscription fee from wallet if module has a price
    const monthlyPrice = parseFloat(module.monthlyPrice || "0");
    if (monthlyPrice > 0) {
      const walletResult = await deductFromWallet(
        id,
        monthlyPrice,
        "subscription_fee",
        `Monthly subscription: ${module.name}`,
        "module_subscription",
        sub.id,
        req.user!.id,
      );
      if (!walletResult.success && walletResult.walletPaused) {
        // Subscription was created but wallet is paused — inform client
        return res.status(201).json({
          subscription: sub,
          module,
          walletWarning: "Wallet balance is zero and services are paused. Please fund your wallet to activate this module.",
        });
      }
    }

    res.status(201).json({ subscription: sub, module });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to subscribe", message: err.message });
  }
});

router.patch("/dealerships/:id/subscriptions/:subId", requireAuth, async (req: Request, res: Response) => {
  const u = req.user!;
  const { id, subId } = req.params;

  if (u.role !== "dealer_owner" && u.role !== "operator_admin") {
    return res.status(403).json({ error: "dealer_owner or operator_admin role required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== id) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { status } = req.body;
  if (!status || !["active", "paused", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "status must be active, paused, or cancelled" });
  }

  try {
    const [sub] = await db
      .update(dealerModuleSubscriptions)
      .set({
        status,
        ...(status === "cancelled" && { cancelledAt: new Date() }),
      })
      .where(
        and(
          eq(dealerModuleSubscriptions.id, subId),
          eq(dealerModuleSubscriptions.dealershipId, id)
        )
      )
      .returning();

    if (!sub) return res.status(404).json({ error: "Subscription not found" });
    res.json({ subscription: sub });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update subscription", message: err.message });
  }
});

export default router;
