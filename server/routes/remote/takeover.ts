// server/routes/remote/takeover.ts — Screen takeover request / grant / revoke
// POST /api/remote/sessions/:id/takeover        — operator requests takeover
// POST /api/remote/sessions/:id/takeover/grant  — dealer grants takeover
// POST /api/remote/sessions/:id/takeover/revoke — dealer or operator revokes

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { remoteSessions, remoteSessionEvents } from "@shared/schema-remote-support";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";

const router = Router({ mergeParams: true });

async function logEvent(
  sessionId: string,
  eventType: string,
  actor: "dealer" | "operator" | "system",
  metadata?: Record<string, unknown>
) {
  await db.insert(remoteSessionEvents).values({ sessionId, eventType, actor, metadata: metadata ?? null });
}

// ── POST /api/remote/sessions/:id/takeover ───────────────────────────────────
// Operator requests control — session status → "takeover" (pending grant)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [session] = await db.select().from(remoteSessions).where(eq(remoteSessions.id, id)).limit(1);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.operatorUserId !== user.clerkUserId) {
      return res.status(403).json({ success: false, message: "Not your session" });
    }
    if (session.status !== "connected") {
      return res.status(409).json({ success: false, message: "Session must be connected for takeover" });
    }

    await db.update(remoteSessions).set({ status: "takeover" }).where(eq(remoteSessions.id, id));
    await logEvent(id, "takeover_requested", "operator", { operatorUserId: user.clerkUserId });

    return res.json({ success: true });
  } catch (err) {
    console.error("[remote/takeover POST]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:id/takeover/grant ────────────────────────────
// Dealer grants control
router.post("/grant", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [session] = await db.select().from(remoteSessions).where(eq(remoteSessions.id, id)).limit(1);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.dealerUserId !== user.clerkUserId) {
      return res.status(403).json({ success: false, message: "Only the dealer can grant control" });
    }
    if (session.status !== "takeover") {
      return res.status(409).json({ success: false, message: "No pending takeover request" });
    }

    await db
      .update(remoteSessions)
      .set({ takeoverGranted: true, takeoverGrantedAt: new Date() })
      .where(eq(remoteSessions.id, id));

    await logEvent(id, "takeover_granted", "dealer", { dealerUserId: user.clerkUserId });

    return res.json({ success: true });
  } catch (err) {
    console.error("[remote/takeover/grant POST]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:id/takeover/revoke ───────────────────────────
// Dealer or operator revokes control
router.post("/revoke", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [session] = await db.select().from(remoteSessions).where(eq(remoteSessions.id, id)).limit(1);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    const isDealer = session.dealerUserId === user.clerkUserId;
    const isOperator = session.operatorUserId === user.clerkUserId;
    if (!isDealer && !isOperator) {
      return res.status(403).json({ success: false, message: "Not a participant" });
    }

    await db
      .update(remoteSessions)
      .set({ status: "connected", takeoverGranted: false, takeoverRevokedAt: new Date() })
      .where(eq(remoteSessions.id, id));

    const actor = isDealer ? "dealer" : "operator";
    await logEvent(id, "takeover_revoked", actor as "dealer" | "operator", { revokedBy: user.clerkUserId });

    return res.json({ success: true });
  } catch (err) {
    console.error("[remote/takeover/revoke POST]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
