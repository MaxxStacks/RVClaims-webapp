// server/routes/dealerships.ts — Dealership management endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { dealerships, users, units, claims, invoices, insertDealershipSchema } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireOperator, requireRole, canAccessDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";

const router = Router();

// ==================== GET /api/dealerships ====================
router.get("/", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const allDealerships = await db
      .select()
      .from(dealerships)
      .orderBy(dealerships.name);

    res.json({ success: true, dealerships: allDealerships });
  } catch (error) {
    console.error("List dealerships error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/dealerships ====================
router.post("/", requireAuth, requireRole("operator_admin"), validateBody(insertDealershipSchema), async (req: Request, res: Response) => {
  try {
    const [newDealership] = await db
      .insert(dealerships)
      .values(req.body)
      .returning();

    res.status(201).json({ success: true, dealership: newDealership });
  } catch (error) {
    console.error("Create dealership error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/dealerships/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!canAccessDealership(req.params.id, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [dealership] = await db
      .select()
      .from(dealerships)
      .where(eq(dealerships.id, req.params.id))
      .limit(1);

    if (!dealership) {
      return res.status(404).json({ success: false, message: "Dealership not found" });
    }

    res.json({ success: true, dealership });
  } catch (error) {
    console.error("Get dealership error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/dealerships/:id ====================
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!canAccessDealership(req.params.id, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Dealer owners can update their own info, operators can update anything
    const allowedFields = req.user!.role === "operator_admin"
      ? req.body  // operators can update everything including plan, fees, notes, status
      : {
          // dealers can only update their own business info + branding
          name: req.body.name,
          legalName: req.body.legalName,
          email: req.body.email,
          phone: req.body.phone,
          website: req.body.website,
          businessNumber: req.body.businessNumber,
          street: req.body.street,
          suite: req.body.suite,
          city: req.body.city,
          province: req.body.province,
          postalCode: req.body.postalCode,
          contactName: req.body.contactName,
          contactEmail: req.body.contactEmail,
          contactPhone: req.body.contactPhone,
          contactTitle: req.body.contactTitle,
          manufacturers: req.body.manufacturers,
        };

    const [updated] = await db
      .update(dealerships)
      .set({ ...allowedFields, updatedAt: new Date() })
      .where(eq(dealerships.id, req.params.id))
      .returning();

    res.json({ success: true, dealership: updated });
  } catch (error) {
    console.error("Update dealership error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/dealerships/:id/branding ====================
router.put("/:id/branding", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!canAccessDealership(req.params.id, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { logoUrl, primaryColor, accentColor, customDomain, welcomeMessage } = req.body;

    const [updated] = await db
      .update(dealerships)
      .set({
        logoUrl,
        primaryColor,
        accentColor,
        customDomain,
        welcomeMessage,
        updatedAt: new Date(),
      })
      .where(eq(dealerships.id, req.params.id))
      .returning();

    res.json({ success: true, dealership: updated });
  } catch (error) {
    console.error("Update branding error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/dealerships/:id/stats ====================
router.get("/:id/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!canAccessDealership(req.params.id, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const dealershipId = req.params.id;

    const [unitCount] = await db.select({ count: count() }).from(units).where(eq(units.dealershipId, dealershipId));
    const [claimCount] = await db.select({ count: count() }).from(claims).where(eq(claims.dealershipId, dealershipId));
    const [staffCount] = await db.select({ count: count() }).from(users).where(eq(users.dealershipId, dealershipId));

    res.json({
      success: true,
      stats: {
        units: unitCount?.count || 0,
        claims: claimCount?.count || 0,
        staff: staffCount?.count || 0,
      },
    });
  } catch (error) {
    console.error("Get dealership stats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
