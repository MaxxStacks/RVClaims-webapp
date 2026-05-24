// server/routes/remote/sessions.ts — Remote support session API
// POST   /api/remote/sessions               — dealer creates session + access code
// GET    /api/remote/sessions/:code         — operator looks up session by code
// POST   /api/remote/sessions/:code/connect — operator connects to session
// GET    /api/remote/sessions/:id/token     — get LiveKit token for participant
// POST   /api/remote/sessions/:id/end       — end session
// GET    /api/remote/session-history        — list completed sessions (operator)
// GET    /api/remote/sessions/:id/events    — session event log (operator)

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { remoteSessions, remoteSessionEvents } from "@shared/schema-remote-support";
import { eq, desc, and, or } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer, requireOperator } from "../../middleware/rbac";
import { remoteSessionRateLimit } from "../../middleware/assist-rate-limit";
import { generateAccessCode } from "../../lib/access-code";
import { generateAccessToken, createRoom, closeRoom, startRoomRecording, stopRoomRecording } from "../../lib/livekit-server";
import { notifyDealership } from "../../lib/notifications";
import { broadcastToDealership, sendToUser, broadcastToOperators } from "../../lib/websocket";
import { users } from "@shared/schema";
import takeoverRouter from "./takeover";

const router = Router();

async function logEvent(
  sessionId: string,
  eventType: string,
  actor: "dealer" | "operator" | "system",
  metadata?: Record<string, unknown>
) {
  await db.insert(remoteSessionEvents).values({ sessionId, eventType, actor, metadata: metadata ?? null });
}

// ── POST /api/remote/sessions ────────────────────────────────────────────────
// Dealer creates a new session and gets back an access code
router.post("/sessions", requireAuth, requireDealer, remoteSessionRateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    const code = generateAccessCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const recordingEnabled = req.body?.recording_enabled === true;

    const [session] = await db
      .insert(remoteSessions)
      .values({
        accessCode: code,
        dealerId: user.dealershipId,
        dealerUserId: user.clerkUserId,
        status: "pending",
        codeExpiresAt: expiresAt,
        recordingEnabled,
      })
      .returning();

    await logEvent(session.id, "session_created", "dealer", {
      dealerId: user.dealershipId,
      dealerName: `${user.firstName} ${user.lastName}`.trim(),
    });

    return res.json({
      success: true,
      sessionId: session.id,
      accessCode: code,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[remote/sessions POST]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/sessions/:code ──────────────────────────────────────────
// Operator looks up a session by access code
router.get("/sessions/:code", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.accessCode, code))
      .limit(1);

    if (!session) {
      return res.status(404).json({ success: false, message: "Invalid access code" });
    }

    if (session.status === "expired" || (session.status === "pending" && new Date() > session.codeExpiresAt)) {
      if (session.status === "pending") {
        await db.update(remoteSessions).set({ status: "expired" }).where(eq(remoteSessions.id, session.id));
      }
      return res.status(410).json({ success: false, message: "Access code has expired" });
    }

    if (session.status === "ended") {
      return res.status(410).json({ success: false, message: "Session has already ended" });
    }

    return res.json({
      success: true,
      session: {
        id: session.id,
        dealerId: session.dealerId,
        dealerUserId: session.dealerUserId,
        status: session.status,
        expiresAt: session.codeExpiresAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[remote/sessions GET :code]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:code/connect ──────────────────────────────────
// Operator connects to session — creates LiveKit room, sets status to connected
router.post("/sessions/:code/connect", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const user = req.user!;

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.accessCode, code))
      .limit(1);

    if (!session) {
      return res.status(404).json({ success: false, message: "Invalid access code" });
    }

    if (session.status !== "pending") {
      return res.status(409).json({ success: false, message: `Session is already ${session.status}` });
    }

    if (new Date() > session.codeExpiresAt) {
      await db.update(remoteSessions).set({ status: "expired" }).where(eq(remoteSessions.id, session.id));
      return res.status(410).json({ success: false, message: "Access code has expired" });
    }

    const roomName = `remote-${session.id}`;

    await createRoom(roomName);

    const [updated] = await db
      .update(remoteSessions)
      .set({
        operatorUserId: user.clerkUserId,
        status: "connected",
        livekitRoomName: roomName,
        connectedAt: new Date(),
      })
      .where(eq(remoteSessions.id, session.id))
      .returning();

    await logEvent(session.id, "operator_connected", "operator", {
      operatorUserId: user.clerkUserId,
      operatorName: `${user.firstName} ${user.lastName}`.trim(),
    });

    // Start recording in background if opted in — never blocks the response
    if (session.recordingEnabled) {
      startRoomRecording(roomName)
        .then((egressId) => {
          if (egressId) {
            db.update(remoteSessions)
              .set({ recordingUrl: egressId }) // store egressId temporarily; replaced with URL on end
              .where(eq(remoteSessions.id, session.id))
              .catch((e) => console.error("[remote] recording update failed:", e));
          }
        })
        .catch(() => {});
    }

    return res.json({
      success: true,
      sessionId: session.id,
      roomName,
      dealerUserId: session.dealerUserId,
      recordingEnabled: session.recordingEnabled,
    });
  } catch (err) {
    console.error("[remote/sessions POST :code/connect]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/sessions/:id/status ─────────────────────────────────────
// Lightweight poll endpoint — dealer or operator checks session state
router.get("/sessions/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.id, req.params.id))
      .limit(1);

    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    const user = req.user!;
    const isDealer = session.dealerUserId === user.clerkUserId;
    const isOperator = session.operatorUserId === user.clerkUserId;

    if (!isDealer && !isOperator) {
      return res.status(403).json({ success: false, message: "Not a participant" });
    }

    return res.json({
      success: true,
      status: session.status,
      takeoverGranted: session.takeoverGranted ?? false,
    });
  } catch (err) {
    console.error("[remote/sessions GET :id/status]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/sessions/:id/token ──────────────────────────────────────
// Get a LiveKit JWT for the current user to join the room
router.get("/sessions/:id/token", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.id, id))
      .limit(1);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (!session.livekitRoomName) {
      return res.status(409).json({ success: false, message: "Room not yet created" });
    }

    if (session.status === "ended" || session.status === "expired") {
      return res.status(410).json({ success: false, message: "Session has ended" });
    }

    // Dealer publishes screen; operator subscribes (and may also publish data for takeover)
    const isDealer = session.dealerUserId === user.clerkUserId;
    const isOperator = session.operatorUserId === user.clerkUserId;

    if (!isDealer && !isOperator) {
      return res.status(403).json({ success: false, message: "Not a participant in this session" });
    }

    const participantIdentity = isDealer ? `dealer-${user.clerkUserId}` : `operator-${user.clerkUserId}`;
    const participantName = `${user.firstName} ${user.lastName}`.trim() || user.email;
    const canPublish = isDealer;
    const canSubscribe = isOperator;

    const lkToken = await generateAccessToken(
      session.livekitRoomName,
      participantIdentity,
      participantName,
      canPublish,
      canSubscribe
    );

    if (!lkToken) {
      return res.status(503).json({ success: false, message: "LiveKit not configured" });
    }

    return res.json({ success: true, token: lkToken.token, url: lkToken.url, roomName: session.livekitRoomName });
  } catch (err) {
    console.error("[remote/sessions GET :id/token]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:id/end ───────────────────────────────────────
// End a session (dealer or operator)
router.post("/sessions/:id/end", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.id, id))
      .limit(1);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.status === "ended" || session.status === "expired") {
      return res.json({ success: true, message: "Session already ended" });
    }

    const isDealer = session.dealerUserId === user.clerkUserId;
    const isOperator = session.operatorUserId === user.clerkUserId;

    if (!isDealer && !isOperator) {
      return res.status(403).json({ success: false, message: "Not a participant in this session" });
    }

    const endedBy = isDealer ? "dealer" : "operator";

    await db
      .update(remoteSessions)
      .set({ status: "ended", endedAt: new Date(), endedBy })
      .where(eq(remoteSessions.id, id));

    await logEvent(id, "session_ended", endedBy as "dealer" | "operator", {
      endedBy,
    });

    if (session.livekitRoomName) {
      closeRoom(session.livekitRoomName).catch(() => {});
    }

    // Stop recording in background if one was started — store URL on completion
    if (session.recordingEnabled && session.recordingUrl && !session.recordingUrl.startsWith("http")) {
      const egressId = session.recordingUrl;
      stopRoomRecording(egressId)
        .then((url) => {
          if (url) {
            db.update(remoteSessions)
              .set({ recordingUrl: url })
              .where(eq(remoteSessions.id, id))
              .catch((e) => console.error("[remote] recording URL update failed:", e));
          }
        })
        .catch(() => {});
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[remote/sessions POST :id/end]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/session-history ─────────────────────────────────────────
// Operator — list completed/ended sessions
router.get("/session-history", requireAuth, requireOperator, async (_req: Request, res: Response) => {
  try {
    const sessions = await db
      .select()
      .from(remoteSessions)
      .where(or(eq(remoteSessions.status, "ended"), eq(remoteSessions.status, "expired")))
      .orderBy(desc(remoteSessions.createdAt))
      .limit(50);

    return res.json({ success: true, sessions });
  } catch (err) {
    console.error("[remote/session-history]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/dealer/session-history ───────────────────────────────────
// Dealer — list their own completed sessions
router.get("/dealer/session-history", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.dealershipId) return res.status(403).json({ success: false, message: "No dealership assigned" });

    const sessions = await db
      .select()
      .from(remoteSessions)
      .where(and(
        eq(remoteSessions.dealerId, user.dealershipId),
        or(eq(remoteSessions.status, "ended"), eq(remoteSessions.status, "expired"))
      ))
      .orderBy(desc(remoteSessions.createdAt))
      .limit(10);

    return res.json({ success: true, sessions });
  } catch (err) {
    console.error("[remote/dealer/session-history]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/request ────────────────────────────────────────
// Operator requests a screen share from a dealer
router.post("/sessions/request", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { dealerId, message } = req.body;

    if (!dealerId) return res.status(400).json({ success: false, message: "dealerId is required" });

    // Use a placeholder access code — replaced when dealer accepts
    const placeholderCode = `REQ-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min to accept

    const [session] = await db
      .insert(remoteSessions)
      .values({
        accessCode: placeholderCode,
        dealerId,
        dealerUserId: "",
        operatorUserId: user.clerkUserId,
        status: "requested",
        codeExpiresAt: expiresAt,
      })
      .returning();

    await logEvent(session.id, "operator_requested", "operator", {
      operatorUserId: user.clerkUserId,
      operatorName: `${user.firstName} ${user.lastName}`.trim(),
      message: message ?? null,
    });

    const operatorName = `${user.firstName} ${user.lastName}`.trim() || "Support Agent";

    // Notify dealer users in-app
    await notifyDealership(dealerId, {
      type: "system",
      title: `${operatorName} wants to view your screen`,
      message: message ?? "A support agent is requesting a screen share session.",
      linkTo: "/dealer",
    });

    // Push real-time WS event to dealer
    broadcastToDealership(dealerId, {
      type: "remote:share-request",
      payload: { sessionId: session.id, operatorName, message: message ?? null },
    });

    return res.json({ success: true, sessionId: session.id, status: "requested" });
  } catch (err) {
    console.error("[remote/sessions/request]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:id/accept ─────────────────────────────────────
// Dealer accepts an operator-initiated request
router.post("/sessions/:id/accept", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!user.dealershipId) return res.status(403).json({ success: false, message: "No dealership assigned" });

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.id, id))
      .limit(1);

    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.dealerId !== user.dealershipId) return res.status(403).json({ success: false, message: "Not authorized" });
    if (session.status !== "requested") return res.status(409).json({ success: false, message: `Session is ${session.status}` });

    const code = generateAccessCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const roomName = `remote-${session.id}`;

    await createRoom(roomName);

    const [updated] = await db
      .update(remoteSessions)
      .set({
        status: "pending",
        accessCode: code,
        codeExpiresAt: expiresAt,
        dealerUserId: user.clerkUserId,
        livekitRoomName: roomName,
      })
      .where(eq(remoteSessions.id, id))
      .returning();

    await logEvent(id, "dealer_accepted", "dealer", {
      dealerUserId: user.clerkUserId,
      dealerName: `${user.firstName} ${user.lastName}`.trim(),
    });

    // Generate both tokens
    const dealerIdentity = `dealer-${user.clerkUserId}`;
    const operatorIdentity = session.operatorUserId ? `operator-${session.operatorUserId}` : "operator-pending";

    const dealerToken = await generateAccessToken(roomName, dealerIdentity, `${user.firstName} ${user.lastName}`.trim(), true, false);
    const operatorToken = await generateAccessToken(roomName, operatorIdentity, "Support Agent", false, true);

    // Notify operator via WS
    if (session.operatorUserId) {
      const [operatorUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, session.operatorUserId)).limit(1);
      if (operatorUser) {
        sendToUser(operatorUser.id, {
          type: "remote:share-accepted",
          payload: {
            sessionId: id,
            accessCode: code,
            operatorToken: operatorToken?.token ?? null,
            livekitUrl: operatorToken?.url ?? null,
            roomName,
          },
        });
      }
    }

    return res.json({
      success: true,
      sessionId: id,
      accessCode: code,
      dealerToken: dealerToken?.token ?? null,
      livekitUrl: dealerToken?.url ?? null,
      roomName,
    });
  } catch (err) {
    console.error("[remote/sessions/:id/accept]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/remote/sessions/:id/decline ────────────────────────────────────
// Dealer declines an operator-initiated request
router.post("/sessions/:id/decline", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!user.dealershipId) return res.status(403).json({ success: false, message: "No dealership assigned" });

    const [session] = await db
      .select()
      .from(remoteSessions)
      .where(eq(remoteSessions.id, id))
      .limit(1);

    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.dealerId !== user.dealershipId) return res.status(403).json({ success: false, message: "Not authorized" });

    await db.update(remoteSessions).set({ status: "declined", endedAt: new Date(), endedBy: "dealer" }).where(eq(remoteSessions.id, id));
    await logEvent(id, "dealer_declined", "dealer", { dealerUserId: user.clerkUserId });

    // Notify operator
    if (session.operatorUserId) {
      const [operatorUser] = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, session.operatorUserId)).limit(1);
      if (operatorUser) {
        sendToUser(operatorUser.id, {
          type: "remote:share-declined",
          payload: { sessionId: id },
        });
      }
    }

    return res.json({ success: true, sessionId: id, status: "declined" });
  } catch (err) {
    console.error("[remote/sessions/:id/decline]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/remote/sessions/:id/events ─────────────────────────────────────
// Operator — full event log for a session
router.get("/sessions/:id/events", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const events = await db
      .select()
      .from(remoteSessionEvents)
      .where(eq(remoteSessionEvents.sessionId, req.params.id))
      .orderBy(remoteSessionEvents.createdAt);

    return res.json({ success: true, events });
  } catch (err) {
    console.error("[remote/sessions GET :id/events]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Mount takeover sub-router
router.use("/sessions/:id/takeover", takeoverRouter);

export default router;
