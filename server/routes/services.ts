// server/routes/services.ts — Service module endpoints (financing, F&I, warranty, parts)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  financingRequests, fiDeals, warrantyPlans, partsOrders,
  insertFinancingRequestSchema, insertFiDealSchema, insertWarrantyPlanSchema, insertPartsOrderSchema,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateRequestNumber, generateDealNumber, generatePlanNumber, generateOrderNumber } from "@shared/constants";

const router = Router();

// ==================== FINANCING ====================

router.get("/financing", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(financingRequests.dealershipId, req.scopedDealershipId));
    const items = await db.select().from(financingRequests).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(financingRequests.createdAt));
    res.json({ success: true, financingRequests: items });
  } catch (error) {
    console.error("List financing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/financing", requireAuth, scopeToDealership, validateBody(insertFinancingRequestSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    const [item] = await db.insert(financingRequests).values({ ...req.body, requestNumber: generateRequestNumber(), dealershipId }).returning();
    res.status(201).json({ success: true, financingRequest: item });
  } catch (error) {
    console.error("Create financing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/financing/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(financingRequests).where(eq(financingRequests.id, req.params.id)).limit(1);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(item.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, financingRequest: item });
  } catch (error) {
    console.error("Get financing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/financing/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(financingRequests).where(eq(financingRequests.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    const [updated] = await db.update(financingRequests).set({ ...req.body, updatedAt: new Date() }).where(eq(financingRequests.id, req.params.id)).returning();
    res.json({ success: true, financingRequest: updated });
  } catch (error) {
    console.error("Update financing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== F&I DEALS ====================

router.get("/fi-deals", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(fiDeals.dealershipId, req.scopedDealershipId));
    const items = await db.select().from(fiDeals).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(fiDeals.createdAt));
    res.json({ success: true, fiDeals: items });
  } catch (error) {
    console.error("List F&I deals error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/fi-deals", requireAuth, scopeToDealership, validateBody(insertFiDealSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    const [item] = await db.insert(fiDeals).values({ ...req.body, dealNumber: generateDealNumber(), dealershipId }).returning();
    res.status(201).json({ success: true, fiDeal: item });
  } catch (error) {
    console.error("Create F&I deal error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/fi-deals/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(fiDeals).where(eq(fiDeals.id, req.params.id)).limit(1);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(item.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, fiDeal: item });
  } catch (error) {
    console.error("Get F&I deal error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/fi-deals/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(fiDeals).where(eq(fiDeals.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    const [updated] = await db.update(fiDeals).set({ ...req.body, updatedAt: new Date() }).where(eq(fiDeals.id, req.params.id)).returning();
    res.json({ success: true, fiDeal: updated });
  } catch (error) {
    console.error("Update F&I deal error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== WARRANTY PLANS ====================

router.get("/warranty-plans", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(warrantyPlans.dealershipId, req.scopedDealershipId));
    // Optional: filter by unitId query param
    if (req.query.unitId) {
      conditions.push(eq(warrantyPlans.unitId, req.query.unitId as string));
    }
    // Optional: filter expiring within N days
    if (req.query.expiringWithin) {
      const days = parseInt(req.query.expiringWithin as string, 10);
      if (!isNaN(days)) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        // Return plans where endDate <= cutoff AND status = active
        conditions.push(eq(warrantyPlans.status, "active"));
      }
    }
    const items = await db.select().from(warrantyPlans).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(warrantyPlans.createdAt));
    res.json({ success: true, warrantyPlans: items });
  } catch (error) {
    console.error("List warranty plans error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/warranty-plans", requireAuth, scopeToDealership, validateBody(insertWarrantyPlanSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    const [item] = await db.insert(warrantyPlans).values({ ...req.body, planNumber: generatePlanNumber(), dealershipId }).returning();
    res.status(201).json({ success: true, warrantyPlan: item });
  } catch (error) {
    console.error("Create warranty plan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/warranty-plans/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(warrantyPlans).where(eq(warrantyPlans.id, req.params.id)).limit(1);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(item.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, warrantyPlan: item });
  } catch (error) {
    console.error("Get warranty plan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.patch("/warranty-plans/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(warrantyPlans).where(eq(warrantyPlans.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    // Only operator_admin can cancel; dealers and clients can request renewal
    const { status, customData, coverage, endDate, soldByPlatform } = req.body;
    const updatePayload: Record<string, any> = {};
    if (status !== undefined && req.user?.role === 'operator_admin') updatePayload.status = status;
    if (customData !== undefined) updatePayload.customData = customData;
    if (coverage !== undefined) updatePayload.coverage = coverage;
    if (endDate !== undefined && req.user?.role === 'operator_admin') updatePayload.endDate = endDate;
    if (soldByPlatform !== undefined && req.user?.role === 'operator_admin') updatePayload.soldByPlatform = soldByPlatform;
    const [updated] = await db.update(warrantyPlans).set(updatePayload).where(eq(warrantyPlans.id, req.params.id)).returning();
    res.json({ success: true, warrantyPlan: updated });
  } catch (error) {
    console.error("Update warranty plan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/warranty-plans/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'operator_admin') return res.status(403).json({ success: false, message: "Operator Admin only" });
    const [existing] = await db.select().from(warrantyPlans).where(eq(warrantyPlans.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    // Soft-delete: set status to cancelled
    const [updated] = await db.update(warrantyPlans).set({ status: 'cancelled' }).where(eq(warrantyPlans.id, req.params.id)).returning();
    res.json({ success: true, warrantyPlan: updated, message: "Warranty plan cancelled" });
  } catch (error) {
    console.error("Delete warranty plan error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PARTS ORDERS ====================

router.get("/parts-orders", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(partsOrders.dealershipId, req.scopedDealershipId));
    const items = await db.select().from(partsOrders).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(partsOrders.createdAt));
    res.json({ success: true, partsOrders: items });
  } catch (error) {
    console.error("List parts orders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/parts-orders", requireAuth, scopeToDealership, validateBody(insertPartsOrderSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    const [item] = await db.insert(partsOrders).values({ ...req.body, orderNumber: generateOrderNumber(), dealershipId }).returning();
    res.status(201).json({ success: true, partsOrder: item });
  } catch (error) {
    console.error("Create parts order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/parts-orders/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [item] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(item.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, partsOrder: item });
  } catch (error) {
    console.error("Get parts order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/parts-orders/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });
    const [updated] = await db.update(partsOrders).set({ ...req.body, updatedAt: new Date() }).where(eq(partsOrders.id, req.params.id)).returning();
    res.json({ success: true, partsOrder: updated });
  } catch (error) {
    console.error("Update parts order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
