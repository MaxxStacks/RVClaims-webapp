// server/routes/upsell.ts — Smart Upsell API endpoints
// Mounted at /api/upsell

import { Router } from "express";
import { db } from "../db";
import {
  upsellOpportunities,
  upsellTemplates,
  units,
  users,
  notifications,
  dealerships,
} from "@shared/schema";
import { eq, and, desc, inArray, sql, gte, lte, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { generateOpportunities, runUpsellScan } from "../lib/upsellEngine";

const router = Router();
router.use(requireAuth);

// ─── Helper: check dealer scope ──────────────────────────────────────────────
function getDealershipId(req: any): string | null {
  const u = req.user;
  if (u.role === "operator_admin" || u.role === "operator_staff") return null; // all dealers
  return u.dealershipId ?? null;
}

// ─── POST /api/upsell/scan ───────────────────────────────────────────────────
router.post("/scan", async (req, res) => {
  const u = req.user!;
  try {
    if (u.role === "operator_admin") {
      // Scan all active dealerships
      const result = await runUpsellScan();
      return res.json({ success: true, ...result });
    }

    if (u.role === "dealer_owner" && u.dealershipId) {
      const count = await generateOpportunities(u.dealershipId);
      return res.json({ success: true, dealersScanned: 1, opportunitiesCreated: count });
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (err) {
    console.error("[upsell POST /scan]", err);
    return res.status(500).json({ error: "Scan failed" });
  }
});

// ─── GET /api/upsell/opportunities ───────────────────────────────────────────
router.get("/opportunities", async (req, res) => {
  const u = req.user!;
  const dealershipId = getDealershipId(req);

  const { status, urgency, triggerType, limit: limitStr, offset: offsetStr } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limitStr || "50", 10), 200);
  const off = parseInt(offsetStr || "0", 10);

  try {
    const whereConditions: any[] = [];

    if (dealershipId) {
      whereConditions.push(eq(upsellOpportunities.dealershipId, dealershipId));
    }
    if (status) whereConditions.push(eq(upsellOpportunities.status, status as any));
    if (urgency) whereConditions.push(eq(upsellOpportunities.urgency, urgency as any));
    if (triggerType) whereConditions.push(eq(upsellOpportunities.triggerType, triggerType as any));

    const rows = await db
      .select({
        opp: upsellOpportunities,
        unit: units,
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(upsellOpportunities)
      .leftJoin(units, eq(upsellOpportunities.unitId, units.id))
      .leftJoin(users, eq(upsellOpportunities.customerId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(upsellOpportunities.createdAt))
      .limit(lim)
      .offset(off);

    return res.json({ success: true, opportunities: rows });
  } catch (err) {
    console.error("[upsell GET /opportunities]", err);
    return res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// ─── GET /api/upsell/opportunities/:id ───────────────────────────────────────
router.get("/opportunities/:id", async (req, res) => {
  const u = req.user!;
  try {
    const rows = await db
      .select({
        opp: upsellOpportunities,
        unit: units,
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(upsellOpportunities)
      .leftJoin(units, eq(upsellOpportunities.unitId, units.id))
      .leftJoin(users, eq(upsellOpportunities.customerId, users.id))
      .where(eq(upsellOpportunities.id, req.params.id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const row = rows[0];
    // Enforce dealer scope
    const dealershipId = getDealershipId(req);
    if (dealershipId && row.opp.dealershipId !== dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.json({ success: true, opportunity: row });
  } catch (err) {
    console.error("[upsell GET /opportunities/:id]", err);
    return res.status(500).json({ error: "Failed to fetch opportunity" });
  }
});

// ─── PATCH /api/upsell/opportunities/:id ─────────────────────────────────────
router.patch("/opportunities/:id", async (req, res) => {
  const u = req.user!;
  try {
    const [existing] = await db
      .select()
      .from(upsellOpportunities)
      .where(eq(upsellOpportunities.id, req.params.id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });

    const dealershipId = getDealershipId(req);
    if (dealershipId && existing.dealershipId !== dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { offerMessage, status } = req.body as { offerMessage?: string; status?: string };
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (offerMessage !== undefined) updates.offerMessage = offerMessage;
    if (status && ["reviewed", "dismissed"].includes(status)) updates.status = status;

    await db
      .update(upsellOpportunities)
      .set(updates)
      .where(eq(upsellOpportunities.id, req.params.id));

    return res.json({ success: true });
  } catch (err) {
    console.error("[upsell PATCH /opportunities/:id]", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

// ─── POST /api/upsell/opportunities/:id/send ─────────────────────────────────
router.post("/opportunities/:id/send", async (req, res) => {
  const u = req.user!;
  try {
    const [existing] = await db
      .select()
      .from(upsellOpportunities)
      .where(eq(upsellOpportunities.id, req.params.id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });

    const dealershipId = getDealershipId(req);
    if (dealershipId && existing.dealershipId !== dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { offerMessage } = req.body as { offerMessage?: string };
    const now = new Date();

    // Load dealership for the notification title (dealer name, not DS360)
    const [dealership] = await db
      .select({ name: dealerships.name })
      .from(dealerships)
      .where(eq(dealerships.id, existing.dealershipId))
      .limit(1);

    const dealerName = dealership?.name ?? "Your Dealership";

    // Update opportunity status
    await db
      .update(upsellOpportunities)
      .set({
        status: "sent",
        sentAt: now,
        offerMessage: offerMessage ?? existing.offerMessage,
        updatedAt: now,
      })
      .where(eq(upsellOpportunities.id, req.params.id));

    // Create in-app notification for the customer
    const productLabel = existing.recommendedProductType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    await db.insert(notifications).values({
      userId: existing.customerId,
      type: "system",
      title: `${dealerName}: Special offer — ${productLabel}`,
      message: offerMessage ?? `You have a new offer from ${dealerName}. Tap to view details.`,
      linkTo: `/notifications?upsell=${existing.id}`,
      isRead: false,
    });

    return res.json({ success: true, sentAt: now });
  } catch (err) {
    console.error("[upsell POST /opportunities/:id/send]", err);
    return res.status(500).json({ error: "Send failed" });
  }
});

// ─── GET /api/upsell/stats ────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  const u = req.user!;
  const dealershipId = getDealershipId(req);

  try {
    const baseWhere = dealershipId
      ? eq(upsellOpportunities.dealershipId, dealershipId)
      : undefined;

    const all = await db
      .select()
      .from(upsellOpportunities)
      .where(baseWhere);

    const byStatus: Record<string, number> = {};
    let totalEstimatedValue = 0;
    let sentCount = 0;
    let acceptedCount = 0;

    for (const opp of all) {
      byStatus[opp.status] = (byStatus[opp.status] || 0) + 1;
      totalEstimatedValue += parseFloat(opp.estimatedValue ?? "0");
      if (["sent", "opened", "clicked", "accepted"].includes(opp.status)) sentCount++;
      if (opp.status === "accepted") acceptedCount++;
    }

    const conversionRate = sentCount > 0 ? Math.round((acceptedCount / sentCount) * 100) : 0;

    // Top triggers by count
    const triggerCounts: Record<string, number> = {};
    for (const opp of all) {
      triggerCounts[opp.triggerType] = (triggerCounts[opp.triggerType] || 0) + 1;
    }
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    // Sent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const sentThisMonth = all.filter(
      (o) => o.sentAt && new Date(o.sentAt) >= startOfMonth
    ).length;
    const acceptedThisMonth = all.filter(
      (o) => o.status === "accepted" && o.respondedAt && new Date(o.respondedAt) >= startOfMonth
    ).length;

    return res.json({
      success: true,
      stats: {
        total: all.length,
        byStatus,
        totalEstimatedValue,
        conversionRate,
        topTriggers,
        sentThisMonth,
        acceptedThisMonth,
      },
    });
  } catch (err) {
    console.error("[upsell GET /stats]", err);
    return res.status(500).json({ error: "Stats failed" });
  }
});

// ─── GET /api/upsell/aggregate-stats (operator admin only) ───────────────────
router.get("/aggregate-stats", async (req, res) => {
  const u = req.user!;
  if (u.role !== "operator_admin") return res.status(403).json({ error: "Access denied" });

  try {
    const all = await db.select().from(upsellOpportunities);

    // Per-dealer stats
    const dealerMap: Record<string, { sent: number; accepted: number }> = {};
    const triggerMap: Record<string, { sent: number; accepted: number }> = {};
    let totalAcceptedValue = 0;

    for (const opp of all) {
      if (!dealerMap[opp.dealershipId]) dealerMap[opp.dealershipId] = { sent: 0, accepted: 0 };
      if (!triggerMap[opp.triggerType]) triggerMap[opp.triggerType] = { sent: 0, accepted: 0 };

      const isSent = ["sent", "opened", "clicked", "accepted"].includes(opp.status);
      const isAccepted = opp.status === "accepted";

      if (isSent) {
        dealerMap[opp.dealershipId].sent++;
        triggerMap[opp.triggerType].sent++;
      }
      if (isAccepted) {
        dealerMap[opp.dealershipId].accepted++;
        triggerMap[opp.triggerType].accepted++;
        totalAcceptedValue += parseFloat(opp.estimatedValue ?? "0");
      }
    }

    // Top 5 dealers by conversion
    const topDealers = Object.entries(dealerMap)
      .filter(([, v]) => v.sent > 0)
      .map(([dealershipId, v]) => ({
        dealershipId,
        sent: v.sent,
        accepted: v.accepted,
        conversionRate: Math.round((v.accepted / v.sent) * 100),
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    // Most effective triggers
    const triggerStats = Object.entries(triggerMap)
      .map(([trigger, v]) => ({
        trigger,
        accepted: v.accepted,
        sent: v.sent,
        conversionRate: v.sent > 0 ? Math.round((v.accepted / v.sent) * 100) : 0,
      }))
      .sort((a, b) => b.accepted - a.accepted);

    const totalSent = all.filter((o) => ["sent", "opened", "clicked", "accepted"].includes(o.status)).length;
    const totalAccepted = all.filter((o) => o.status === "accepted").length;
    const overallConversionRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0;

    // Module adoption — count dealers with smart_upsell active
    const { serviceModules: sm, dealerModuleSubscriptions: dms } = await import("@shared/schema");
    const [module] = await db.select({ id: sm.id }).from(sm).where(eq(sm.slug, "smart_upsell")).limit(1);
    let moduleAdoption = 0;
    if (module) {
      const subs = await db.select({ dealershipId: dms.dealershipId }).from(dms)
        .where(and(eq(dms.moduleId, module.id), eq(dms.status, "active")));
      moduleAdoption = subs.length;
    }

    return res.json({
      success: true,
      stats: {
        totalOpportunities: all.length,
        overallConversionRate,
        totalAcceptedValue,
        moduleAdoption,
        topDealers,
        triggerStats,
      },
    });
  } catch (err) {
    console.error("[upsell GET /aggregate-stats]", err);
    return res.status(500).json({ error: "Aggregate stats failed" });
  }
});

// ─── GET /api/upsell/templates ───────────────────────────────────────────────
router.get("/templates", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(upsellTemplates)
      .orderBy(upsellTemplates.triggerType, upsellTemplates.productType);
    return res.json({ success: true, templates: rows });
  } catch (err) {
    console.error("[upsell GET /templates]", err);
    return res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// ─── PATCH /api/upsell/templates/:id ─────────────────────────────────────────
router.patch("/templates/:id", async (req, res) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner"].includes(u.role)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { subjectTemplate, messageTemplate, isActive } = req.body as {
      subjectTemplate?: string;
      messageTemplate?: string;
      isActive?: boolean;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (subjectTemplate !== undefined) updates.subjectTemplate = subjectTemplate;
    if (messageTemplate !== undefined) updates.messageTemplate = messageTemplate;
    if (isActive !== undefined) updates.isActive = isActive;

    await db
      .update(upsellTemplates)
      .set(updates)
      .where(eq(upsellTemplates.id, req.params.id));

    return res.json({ success: true });
  } catch (err) {
    console.error("[upsell PATCH /templates/:id]", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

// ─── POST /api/upsell/opportunities/:id/respond (customer accept/decline) ────
router.post("/opportunities/:id/respond", async (req, res) => {
  const u = req.user!;
  const { response } = req.body as { response: "accepted" | "declined" };

  if (!["accepted", "declined"].includes(response)) {
    return res.status(400).json({ error: "Invalid response" });
  }

  try {
    const [existing] = await db
      .select()
      .from(upsellOpportunities)
      .where(eq(upsellOpportunities.id, req.params.id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.customerId !== u.id) return res.status(403).json({ error: "Access denied" });

    await db
      .update(upsellOpportunities)
      .set({
        status: response,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(upsellOpportunities.id, req.params.id));

    return res.json({ success: true });
  } catch (err) {
    console.error("[upsell POST /opportunities/:id/respond]", err);
    return res.status(500).json({ error: "Response failed" });
  }
});

export default router;
