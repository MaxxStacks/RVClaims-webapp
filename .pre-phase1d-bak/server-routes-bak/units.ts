// server/routes/units.ts — Unit management endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { units, claims, photos, documents, insertUnitSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";

const router = Router();

// ==================== GET /api/units ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) {
      conditions.push(eq(units.dealershipId, req.scopedDealershipId));
    }

    const allUnits = await db
      .select()
      .from(units)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(units.createdAt));

    res.json({ success: true, units: allUnits });
  } catch (error) {
    console.error("List units error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/units ====================
router.post("/", requireAuth, scopeToDealership, validateBody(insertUnitSchema), async (req: Request, res: Response) => {
  try {
    // For dealers, force their dealershipId
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    if (!dealershipId) {
      return res.status(400).json({ success: false, message: "Dealership ID required" });
    }

    const [newUnit] = await db
      .insert(units)
      .values({ ...req.body, dealershipId })
      .returning();

    res.status(201).json({ success: true, unit: newUnit });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A unit with this VIN already exists" });
    }
    console.error("Create unit error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/units/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);

    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    if (!canAccessDealership(unit.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, unit });
  } catch (error) {
    console.error("Get unit error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/units/:id ====================
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Unit not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [updated] = await db
      .update(units)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(units.id, req.params.id))
      .returning();

    res.json({ success: true, unit: updated });
  } catch (error) {
    console.error("Update unit error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/units/:id/claims ====================
router.get("/:id/claims", requireAuth, async (req: Request, res: Response) => {
  try {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (!canAccessDealership(unit.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const unitClaims = await db.select().from(claims).where(eq(claims.unitId, req.params.id)).orderBy(desc(claims.createdAt));
    res.json({ success: true, claims: unitClaims });
  } catch (error) {
    console.error("Get unit claims error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/units/:id/photos ====================
router.get("/:id/photos", requireAuth, async (req: Request, res: Response) => {
  try {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (!canAccessDealership(unit.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const category = req.query.category as string | undefined;
    const conditions = [eq(photos.unitId, req.params.id)];
    if (category) conditions.push(eq(photos.category, category as any));

    const unitPhotos = await db.select().from(photos).where(and(...conditions)).orderBy(desc(photos.createdAt));
    res.json({ success: true, photos: unitPhotos });
  } catch (error) {
    console.error("Get unit photos error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/units/:id/documents ====================
router.get("/:id/documents", requireAuth, async (req: Request, res: Response) => {
  try {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (!canAccessDealership(unit.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const unitDocs = await db.select().from(documents).where(eq(documents.unitId, req.params.id)).orderBy(desc(documents.createdAt));
    res.json({ success: true, documents: unitDocs });
  } catch (error) {
    console.error("Get unit documents error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
