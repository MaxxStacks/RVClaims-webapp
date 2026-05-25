// server/routes/consignment.ts — Consignment agreements

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { consignmentAgreements, consignors, units, dealerships } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

const isOperator = (role: string) => OPERATOR_ROLES.includes(role as any);

// GET /api/consignment/agreements — operators see all; dealer_owner sees own
router.get("/agreements", requireAuth, async (req: Request, res: Response) => {
  try {
    let rows;
    if (isOperator(req.user!.role)) {
      rows = await db.select().from(consignmentAgreements).orderBy(desc(consignmentAgreements.createdAt));
    } else if (req.user!.role === "dealer_owner" && req.user!.dealershipId) {
      rows = await db
        .select()
        .from(consignmentAgreements)
        .where(eq(consignmentAgreements.dealershipId, req.user!.dealershipId))
        .orderBy(desc(consignmentAgreements.createdAt));
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({ success: true, agreements: rows });
  } catch (error) {
    console.error("List consignment agreements error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/consignment/agreements/:id
router.get("/agreements/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db
      .select()
      .from(consignmentAgreements)
      .where(eq(consignmentAgreements.id, req.params.id))
      .limit(1);
    if (!row) return res.status(404).json({ success: false, message: "Agreement not found" });

    if (!isOperator(req.user!.role) && row.dealershipId !== req.user!.dealershipId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, agreement: row });
  } catch (error) {
    console.error("Get agreement error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/consignment/agreements — dealer_owner creates
router.post("/agreements", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    if (!isOperator(role) && role !== "dealer_owner") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { consignorId, unitId, splitPct, durationDays, minListPrice, startDate, notes, dealershipId } = req.body;
    if (!consignorId || !unitId || splitPct === undefined) {
      return res.status(400).json({ success: false, message: "consignorId, unitId, and splitPct are required" });
    }

    const targetDealershipId = isOperator(role) ? (dealershipId || req.user!.dealershipId) : req.user!.dealershipId;
    if (!targetDealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    const agreementNumber = `CSG-${Date.now()}`;
    const [created] = await db
      .insert(consignmentAgreements)
      .values({
        agreementNumber,
        consignorId,
        dealershipId: targetDealershipId,
        unitId,
        splitPct: String(splitPct),
        durationDays: durationDays || 90,
        minListPrice: minListPrice ? String(minListPrice) : null,
        startDate: startDate || null,
        notes: notes || null,
        status: "pending_signature",
      })
      .returning();

    res.status(201).json({ success: true, agreement: created });
  } catch (error) {
    console.error("Create agreement error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/consignment/agreements/:id — update status
router.patch("/agreements/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db
      .select()
      .from(consignmentAgreements)
      .where(eq(consignmentAgreements.id, req.params.id))
      .limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Agreement not found" });

    if (!isOperator(req.user!.role) && existing.dealershipId !== req.user!.dealershipId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, notes, signedAt, endDate } = req.body;
    const patch: any = { updatedAt: new Date() };
    if (status !== undefined) patch.status = status;
    if (notes !== undefined) patch.notes = notes;
    if (signedAt !== undefined) patch.signedAt = signedAt ? new Date(signedAt) : null;
    if (endDate !== undefined) patch.endDate = endDate || null;

    const [updated] = await db
      .update(consignmentAgreements)
      .set(patch)
      .where(eq(consignmentAgreements.id, req.params.id))
      .returning();

    res.json({ success: true, agreement: updated });
  } catch (error) {
    console.error("Update agreement error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
