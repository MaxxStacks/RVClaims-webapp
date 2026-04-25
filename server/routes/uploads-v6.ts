import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { v6Uploads, claims } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { presignUpload } from "../lib/r2";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

// POST /api/v6/uploads/presign
router.post("/presign", async (req: Request, res: Response) => {
  const { scope, scopeId, filename, contentType, photoType } = req.body;
  if (!scope || !contentType) return res.status(400).json({ error: "scope and contentType required" });
  if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(contentType)) {
    return res.status(400).json({ error: "Unsupported content type" });
  }

  const presigned = await presignUpload({ scope, scopeId, contentType, filename });

  const [photo] = await db.insert(v6Uploads).values({
    storageKey: presigned.storageKey,
    publicUrl: presigned.publicUrl,
    contentType,
    uploadStatus: "pending",
    uploadedById: req.user!.id,
    photoType: photoType || "general",
    scope: scope,
    scopeId: scopeId || null,
    filename: filename || null,
  }).returning();

  res.json({
    photoId: photo.id,
    uploadUrl: presigned.uploadUrl,
    publicUrl: presigned.publicUrl,
  });
});

// POST /api/v6/uploads/confirm/:photoId
router.post("/confirm/:photoId", async (req: Request, res: Response) => {
  const [photo] = await db.select().from(v6Uploads).where(eq(v6Uploads.id, req.params.photoId)).limit(1);
  if (!photo) return res.status(404).json({ error: "Photo not found" });
  if (photo.uploadedById !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

  await db.update(v6Uploads).set({
    uploadStatus: "uploaded",
    uploadedAt: new Date(),
  }).where(eq(v6Uploads.id, photo.id));

  if (photo.scope === "claims" && photo.scopeId) {
    const [claim] = await db.select().from(claims).where(eq(claims.id, photo.scopeId)).limit(1);
    if (claim) {
      await emitEvent({
        eventId: "claim.photo_added",
        domain: "Claims",
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        dealershipId: claim.dealershipId,
        targetEntityType: "claim",
        targetEntityId: claim.id,
        payload: {
          claimNumber: claim.claimNumber,
          dealerName: (req.user!.firstName || "") + " " + (req.user!.lastName || ""),
          photoUrl: photo.publicUrl,
        },
      });
    }
  }

  res.json({ ok: true, publicUrl: photo.publicUrl });
});

// GET /api/v6/uploads/by-claim/:claimId
router.get("/by-claim/:claimId", async (req: Request, res: Response) => {
  const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.claimId)).limit(1);
  if (!claim) return res.status(404).json({ error: "Not found" });

  const u = req.user!;
  if ((u.role === "dealer_owner" || u.role === "dealer_staff") && claim.dealershipId !== u.dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const rows = await db.select().from(v6Uploads).where(and(
    eq(v6Uploads.scope, "claims"),
    eq(v6Uploads.scopeId, req.params.claimId),
    eq(v6Uploads.uploadStatus, "uploaded"),
  ));
  res.json(rows);
});

export default router;
