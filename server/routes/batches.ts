// server/routes/batches.ts — Photo batch upload and processing endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { photoBatches, photos, claims, insertPhotoBatchSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership, requireOperator } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateBatchNumber, generateClaimNumber, OPERATOR_ROLES } from "@shared/constants";
import { emitBatchUploaded } from "../lib/websocket";

const router = Router();

// ==================== GET /api/batches ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) {
      conditions.push(eq(photoBatches.dealershipId, req.scopedDealershipId));
    }
    if (req.query.status) {
      conditions.push(eq(photoBatches.status, req.query.status as any));
    }

    const batches = await db
      .select()
      .from(photoBatches)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(photoBatches.createdAt));

    res.json({ success: true, batches });
  } catch (error) {
    console.error("List batches error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/batches ====================
router.post("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    if (!dealershipId) {
      return res.status(400).json({ success: false, message: "Dealership ID required" });
    }

    const batchNumber = generateBatchNumber();

    const [newBatch] = await db
      .insert(photoBatches)
      .values({
        batchNumber,
        dealershipId,
        unitId: req.body.unitId,
        claimType: req.body.claimType,
        dealerNotes: req.body.dealerNotes,
        photoCount: req.body.photoCount || 0,
        uploadedBy: req.user!.id,
        status: "uploaded",
      })
      .returning();

    emitBatchUploaded({
      batchId: newBatch.id,
      batchNumber: newBatch.batchNumber,
      dealershipId: newBatch.dealershipId,
      photoCount: newBatch.photoCount || 0,
    });

    res.status(201).json({ success: true, batch: newBatch });
  } catch (error) {
    console.error("Create batch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/batches/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [batch] = await db
      .select()
      .from(photoBatches)
      .where(eq(photoBatches.id, req.params.id))
      .limit(1);

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    if (!canAccessDealership(batch.dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get photos for this batch
    const batchPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.batchId, batch.id))
      .orderBy(photos.createdAt);

    res.json({ success: true, batch, photos: batchPhotos });
  } catch (error) {
    console.error("Get batch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/batches/:id/process ====================
// Operator processes a batch: marks as reviewed, optionally creates/links to a claim
router.put("/:id/process", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const [batch] = await db
      .select()
      .from(photoBatches)
      .where(eq(photoBatches.id, req.params.id))
      .limit(1);

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const { status, claimId } = req.body;

    // If linking to existing claim
    let linkedClaimId = claimId;

    // If creating a new claim from this batch
    if (req.body.createClaim && !claimId) {
      const claimNumber = generateClaimNumber();
      const [newClaim] = await db
        .insert(claims)
        .values({
          claimNumber,
          dealershipId: batch.dealershipId,
          unitId: batch.unitId,
          manufacturer: req.body.manufacturer || "Unknown",
          type: batch.claimType,
          status: "submitted",
          dealerNotes: batch.dealerNotes,
          submittedAt: new Date(),
        })
        .returning();

      linkedClaimId = newClaim.id;
    }

    const [updated] = await db
      .update(photoBatches)
      .set({
        status: status || "processed",
        claimId: linkedClaimId,
        processedBy: req.user!.id,
        processedAt: new Date(),
      })
      .where(eq(photoBatches.id, req.params.id))
      .returning();

    res.json({ success: true, batch: updated, claimId: linkedClaimId });
  } catch (error) {
    console.error("Process batch error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
