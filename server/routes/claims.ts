// server/routes/claims.ts — Claims management endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { claims, claimFrcLines, photoBatches, insertClaimSchema, insertClaimFrcLineSchema } from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership, requireOperator } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateClaimNumber } from "@shared/constants";
import { notifyClaimUpdate } from "../lib/notifications";
import { emitClaimUpdate } from "../lib/websocket";

const router = Router();

// ==================== GET /api/claims ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) {
      conditions.push(eq(claims.dealershipId, req.scopedDealershipId));
    }
    if (req.query.status) {
      conditions.push(eq(claims.status, req.query.status as any));
    }
    if (req.query.type) {
      conditions.push(eq(claims.type, req.query.type as any));
    }

    const allClaims = await db
      .select()
      .from(claims)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(claims.createdAt));

    res.json({ success: true, claims: allClaims });
  } catch (error) {
    console.error("List claims error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/claims ====================
router.post("/", requireAuth, scopeToDealership, validateBody(insertClaimSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    if (!dealershipId) {
      return res.status(400).json({ success: false, message: "Dealership ID required" });
    }

    const claimNumber = generateClaimNumber();

    const [newClaim] = await db
      .insert(claims)
      .values({
        ...req.body,
        claimNumber,
        dealershipId,
        status: "draft",
      })
      .returning();

    res.status(201).json({ success: true, claim: newClaim });
  } catch (error) {
    console.error("Create claim error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/claims/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);

    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }

    if (!canAccessDealership(claim.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get FRC lines
    const frcLines = await db
      .select()
      .from(claimFrcLines)
      .where(eq(claimFrcLines.claimId, claim.id))
      .orderBy(claimFrcLines.createdAt);

    // Get photo batches
    const batches = await db
      .select()
      .from(photoBatches)
      .where(eq(photoBatches.claimId, claim.id));

    res.json({ success: true, claim, frcLines, photoBatches: batches });
  } catch (error) {
    console.error("Get claim error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/claims/:id ====================
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Claim not found" });
    if (!canAccessDealership(existing.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Track status transitions
    const statusUpdate: any = { ...req.body, updatedAt: new Date() };
    if (req.body.status === "submitted" && !existing.submittedAt) statusUpdate.submittedAt = new Date();
    if (req.body.status === "authorized" && !existing.authorizedAt) statusUpdate.authorizedAt = new Date();
    if (req.body.status === "completed" && !existing.completedAt) statusUpdate.completedAt = new Date();
    if (req.body.status === "paid" && !existing.paidAt) statusUpdate.paidAt = new Date();

    const [updated] = await db
      .update(claims)
      .set(statusUpdate)
      .where(eq(claims.id, req.params.id))
      .returning();

    if (req.body.status && req.body.status !== existing.status) {
      await notifyClaimUpdate({
        claimNumber: updated.claimNumber,
        status: updated.status!,
        dealershipId: updated.dealershipId,
        updatedBy: req.user!.id,
      });
      emitClaimUpdate({
        claimId: updated.id,
        claimNumber: updated.claimNumber,
        dealershipId: updated.dealershipId,
        status: updated.status!,
        updatedBy: req.user!.id,
      });
    }

    res.json({ success: true, claim: updated });
  } catch (error) {
    console.error("Update claim error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/claims/:id/frc-lines ====================
router.post("/:id/frc-lines", requireAuth, validateBody(insertClaimFrcLineSchema), async (req: Request, res: Response) => {
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });
    if (!canAccessDealership(claim.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [newLine] = await db
      .insert(claimFrcLines)
      .values({ ...req.body, claimId: claim.id })
      .returning();

    res.status(201).json({ success: true, frcLine: newLine });
  } catch (error) {
    console.error("Add FRC line error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/claims/:id/frc-lines/:lineId ====================
router.put("/:id/frc-lines/:lineId", requireAuth, async (req: Request, res: Response) => {
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });
    if (!canAccessDealership(claim.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [updated] = await db
      .update(claimFrcLines)
      .set(req.body)
      .where(and(
        eq(claimFrcLines.id, req.params.lineId),
        eq(claimFrcLines.claimId, req.params.id)
      ))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "FRC line not found" });

    res.json({ success: true, frcLine: updated });
  } catch (error) {
    console.error("Update FRC line error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
