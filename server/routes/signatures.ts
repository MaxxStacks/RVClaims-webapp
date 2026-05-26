// server/routes/signatures.ts — Digital Signatures API
//
// POST /api/signatures            — save a signature (requireAuth)
// GET  /api/signatures            — fetch by parentType + parentId (requireAuth)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { signatures } from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ─── POST /api/signatures ─────────────────────────────────────────────────────

router.post("/signatures", requireAuth, async (req: Request, res: Response) => {
  const { parentType, parentId, signerName, signerRole, signatureImage, userAgent } = req.body;

  if (!parentType || !parentId || !signerName || !signerRole || !signatureImage) {
    return res.status(400).json({ error: "parentType, parentId, signerName, signerRole, and signatureImage are required" });
  }

  const VALID_PARENT_TYPES = ["pdi", "work_order", "invoice", "deal_jacket", "consignment", "custom"];
  if (!VALID_PARENT_TYPES.includes(parentType)) {
    return res.status(400).json({ error: `Invalid parentType. Must be one of: ${VALID_PARENT_TYPES.join(", ")}` });
  }

  // Get IP address from request (handles proxies)
  const rawIp = req.headers["x-forwarded-for"] || req.ip || "";
  const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(",")[0].trim();

  // For now, store base64 directly in signatureImageUrl
  // (When R2/S3 is configured, upload here and store URL instead)
  const signatureImageUrl: string = signatureImage as string;

  try {
    const [created] = await db
      .insert(signatures)
      .values({
        parentType: parentType as typeof signatures.$inferInsert["parentType"],
        parentId,
        signerName,
        signerRole,
        signatureImageUrl,
        ipAddress,
        userAgent: (userAgent as string | undefined) || req.headers["user-agent"] || null,
      })
      .returning();

    return res.status(201).json({ signature: created });
  } catch (err: any) {
    console.error("[signatures] POST error:", err);
    return res.status(500).json({ error: "Failed to save signature", message: err.message });
  }
});

// ─── GET /api/signatures ──────────────────────────────────────────────────────

router.get("/signatures", requireAuth, async (req: Request, res: Response) => {
  const { parentType, parentId } = req.query as { parentType?: string; parentId?: string };

  if (!parentType || !parentId) {
    return res.status(400).json({ error: "parentType and parentId query params are required" });
  }

  try {
    const rows = await db
      .select()
      .from(signatures)
      .where(
        and(
          eq(signatures.parentType, parentType as typeof signatures.$inferInsert["parentType"]),
          eq(signatures.parentId, parentId)
        )
      )
      .orderBy(asc(signatures.timestamp));

    return res.json({ signatures: rows });
  } catch (err: any) {
    console.error("[signatures] GET error:", err);
    return res.status(500).json({ error: "Failed to fetch signatures", message: err.message });
  }
});

export default router;
