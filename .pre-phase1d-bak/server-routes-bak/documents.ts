// server/routes/documents.ts — Document management endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { documents, insertDocumentSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";

const router = Router();

// ==================== POST /api/documents ====================
router.post("/", requireAuth, validateBody(insertDocumentSchema), async (req: Request, res: Response) => {
  try {
    const [newDoc] = await db
      .insert(documents)
      .values({ ...req.body, uploadedBy: req.user!.id })
      .returning();

    res.status(201).json({ success: true, document: newDoc });
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/documents/:id/download ====================
router.get("/:id/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const [doc] = await db.select().from(documents).where(eq(documents.id, req.params.id)).limit(1);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    // TODO: Generate signed URL from cloud storage and redirect
    // For now, return the URL
    res.json({ success: true, url: doc.url, name: doc.name, mimeType: doc.mimeType });
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== DELETE /api/documents/:id ====================
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [doc] = await db.select().from(documents).where(eq(documents.id, req.params.id)).limit(1);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    // TODO: Delete from cloud storage
    await db.delete(documents).where(eq(documents.id, req.params.id));
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
