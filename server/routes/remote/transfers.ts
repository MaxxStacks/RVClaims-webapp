// server/routes/remote/transfers.ts — Document transfer API
// POST /api/transfers/upload        — upload a file
// GET  /api/transfers               — list transfers for current user
// GET  /api/transfers/:id/download  — download a file and mark received

import { Router, type Request, type Response } from "express";
import path from "path";
import { db } from "../../db";
import { documentTransfers } from "@shared/schema-remote-support";
import { users } from "@shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { transferUpload } from "../../lib/file-storage";
import { DEALER_ROLES, OPERATOR_ROLES } from "@shared/constants";
import { createNotification, notifyDealership, notifyOperators } from "../../lib/notifications";
import { broadcastToDealership, broadcastToOperators, sendToUser } from "../../lib/websocket";

const router = Router();

// ── POST /api/transfers/upload ───────────────────────────────────────────────
router.post(
  "/upload",
  requireAuth,
  transferUpload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const file = req.file;
      if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

      const isDealer = DEALER_ROLES.includes(user.role);
      const isOperator = OPERATOR_ROLES.includes(user.role);

      if (!isDealer && !isOperator) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Dealers must have a dealership
      if (isDealer && !user.dealershipId) {
        return res.status(403).json({ success: false, message: "No dealership assigned" });
      }

      const dealerId = isDealer ? user.dealershipId! : (req.body.dealerId as string);
      if (!dealerId) return res.status(400).json({ success: false, message: "dealerId is required" });

      const senderType = isDealer ? "dealer" : "operator";
      const recipientType = isDealer ? "operator" : "dealer";
      const senderName = `${user.firstName} ${user.lastName}`.trim() || user.email;
      const message = (req.body.message as string)?.slice(0, 200) || null;

      const fileUrl = `/api/files/transfers/${file.filename}`;

      const [transfer] = await db
        .insert(documentTransfers)
        .values({
          dealerId,
          senderType,
          senderUserId: user.id,
          senderName,
          recipientType,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileUrl,
          message,
          status: "sent",
        })
        .returning();

      const title = `📎 ${senderName} sent you a document: ${file.originalname}`;

      if (isDealer) {
        // Notify operators
        await notifyOperators({ type: "system", title, message: message ?? undefined });
        broadcastToOperators({ type: "transfer:new-file", payload: { transferId: transfer.id, fileName: file.originalname, senderName, message } });
      } else {
        // Notify dealer team
        await notifyDealership(dealerId, { type: "system", title, message: message ?? undefined });
        broadcastToDealership(dealerId, { type: "transfer:new-file", payload: { transferId: transfer.id, fileName: file.originalname, senderName, message } });
      }

      return res.json({ success: true, transferId: transfer.id, fileName: file.originalname, fileUrl });
    } catch (err) {
      console.error("[transfers/upload]", err);
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

// ── GET /api/transfers ───────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const isDealer = DEALER_ROLES.includes(user.role);
    const isOperator = OPERATOR_ROLES.includes(user.role);
    const direction = (req.query.direction as string) || "all";
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    let query = db.select().from(documentTransfers).$dynamic();

    if (isDealer) {
      if (!user.dealershipId) return res.json({ success: true, transfers: [] });
      query = query.where(eq(documentTransfers.dealerId, user.dealershipId));
    } else if (isOperator) {
      if (direction === "sent") {
        query = query.where(eq(documentTransfers.senderUserId, user.id));
      } else if (direction === "received") {
        query = query.where(eq(documentTransfers.senderType, "dealer"));
      }
      // 'all' returns everything for operators
    }

    const transfers = await query.orderBy(desc(documentTransfers.createdAt)).limit(limit).offset(offset);
    return res.json({ success: true, transfers });
  } catch (err) {
    console.error("[transfers GET]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/transfers/:id/download ─────────────────────────────────────────
router.get("/:id/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const [transfer] = await db.select().from(documentTransfers).where(eq(documentTransfers.id, id)).limit(1);
    if (!transfer) return res.status(404).json({ success: false, message: "Transfer not found" });

    const isDealer = DEALER_ROLES.includes(user.role);
    const isOperator = OPERATOR_ROLES.includes(user.role);

    // Check access
    if (isDealer && transfer.dealerId !== user.dealershipId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (!isDealer && !isOperator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Mark downloaded
    await db.update(documentTransfers)
      .set({ status: "downloaded", downloadedAt: new Date() })
      .where(eq(documentTransfers.id, id));

    // Redirect to static file
    return res.redirect(transfer.fileUrl);
  } catch (err) {
    console.error("[transfers/:id/download]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
