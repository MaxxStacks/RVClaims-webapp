// server/routes/assist/escalate.ts — Phase 3 escalation endpoints
// POST /api/assist/escalate/ticket
// POST /api/assist/escalate/live-chat
// GET  /api/assist/escalate/account-manager
// GET  /api/assist/escalate/live-sessions (operator)

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import {
  assistConversations,
  assistMessages,
  assistSupportTickets,
  dealerAccountManagers,
} from "@shared/schema-assist";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer, requireOperator } from "../../middleware/rbac";
import { liveChatRateLimit } from "../../middleware/assist-rate-limit";
import {
  broadcastToOperators,
  startAssistLiveSession,
  getAssistLiveSessions,
} from "../../lib/websocket";
import { generateConversationSummary } from "../../lib/assist-engine";

const router = Router();

// ── Sequential ticket number ─────────────────────────────────────────────
async function getNextTicketNumber(): Promise<string> {
  const [row] = await db
    .select({
      max: sql<string>`COALESCE(MAX(CAST(SUBSTRING(ticket_number, 4) AS INTEGER)), 0)`,
    })
    .from(assistSupportTickets);
  const next = parseInt(row?.max ?? "0") + 1;
  return `DS-${String(next).padStart(6, "0")}`;
}

// ── POST /api/assist/escalate/ticket ─────────────────────────────────────
router.post("/ticket", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const { conversationId, subject, description, category, priority } = req.body as {
      conversationId?: string;
      subject: string;
      description: string;
      category?: string;
      priority?: string;
    };

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: "subject and description are required" });
    }

    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    const ticketNumber = await getNextTicketNumber();

    const [ticket] = await db
      .insert(assistSupportTickets)
      .values({
        ticketNumber,
        dealerId: user.dealershipId,
        userId: user.clerkUserId,
        conversationId: conversationId ?? null,
        subject: subject.trim(),
        description: description.trim(),
        category: category ?? "General Question",
        priority: (priority as any) ?? "medium",
        status: "open",
      })
      .returning();

    if (conversationId) {
      await db
        .update(assistConversations)
        .set({
          status: "escalated",
          escalationType: "ticket",
          escalatedTo: ticketNumber,
          updatedAt: new Date(),
        })
        .where(eq(assistConversations.id, conversationId));

      await db.insert(assistMessages).values({
        conversationId,
        role: "system" as any,
        content: `Support ticket **${ticketNumber}** has been created. Our team will follow up within 2 hours.`,
        metadata: { ticketId: ticket.id, ticketNumber, systemMessage: true },
      });
    }

    broadcastToOperators({
      type: "assist:new_ticket",
      payload: {
        ticketId: ticket.id,
        ticketNumber,
        dealershipId: user.dealershipId,
        dealerName: `${user.firstName} ${user.lastName}`.trim(),
        subject: subject.trim(),
        priority: priority ?? "medium",
        createdAt: new Date().toISOString(),
      },
    });

    return res.json({ success: true, ticketNumber, ticketId: ticket.id });
  } catch (err) {
    console.error("[assist/escalate/ticket]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST /api/assist/escalate/live-chat ───────────────────────────────────
router.post("/live-chat", requireAuth, requireDealer, liveChatRateLimit, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body as { conversationId?: string };
    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    let summary = "";
    if (conversationId) {
      const msgs = await db
        .select()
        .from(assistMessages)
        .where(eq(assistMessages.conversationId, conversationId))
        .orderBy(desc(assistMessages.createdAt))
        .limit(20);

      const history = msgs
        .reverse()
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      summary = await generateConversationSummary(history);

      await db
        .update(assistConversations)
        .set({
          status: "escalated",
          escalationType: "live_chat",
          summary: summary || null,
          updatedAt: new Date(),
        })
        .where(eq(assistConversations.id, conversationId));

      await db.insert(assistMessages).values({
        conversationId,
        role: "system" as any,
        content: "You've been connected to live support. A support agent will join shortly.",
        metadata: { liveChatStarted: true, systemMessage: true },
      });
    }

    const sessionPayload = {
      conversationId: conversationId ?? "no-conversation",
      dealerId: user.dealershipId,
      dealerUserId: user.id,
      dealerClerkId: user.clerkUserId,
      operatorUserId: null,
      operatorName: null,
      summary,
      userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      requestedAt: new Date().toISOString(),
    };

    startAssistLiveSession(sessionPayload);

    broadcastToOperators({
      type: "assist:live_chat_request",
      payload: {
        ...sessionPayload,
        dealerEmail: user.email,
      },
    });

    return res.json({ success: true, summary });
  } catch (err) {
    console.error("[assist/escalate/live-chat]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/assist/escalate/account-manager ─────────────────────────────
router.get("/account-manager", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    const [am] = await db
      .select()
      .from(dealerAccountManagers)
      .where(eq(dealerAccountManagers.dealerId, user.dealershipId))
      .limit(1);

    if (!am) {
      return res.json({ success: true, accountManager: null });
    }

    return res.json({
      success: true,
      accountManager: {
        name: am.operatorName,
        email: am.operatorEmail,
        phone: am.operatorPhone ?? null,
      },
    });
  } catch (err) {
    console.error("[assist/escalate/account-manager]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET /api/assist/escalate/live-sessions (operator only) ───────────────
router.get("/live-sessions", requireAuth, requireOperator, async (_req: Request, res: Response) => {
  try {
    const sessions = getAssistLiveSessions();
    return res.json({ success: true, sessions });
  } catch (err) {
    console.error("[assist/escalate/live-sessions]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
