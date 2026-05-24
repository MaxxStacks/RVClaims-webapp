// server/routes/assist/message.ts — DS360 Assist chat message endpoint
// POST /api/assist/message

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import {
  assistConversations,
  assistMessages,
} from "@shared/schema-assist";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer } from "../../middleware/rbac";
import { getAssistResponse, type ConversationMessage } from "../../lib/assist-engine";
import { searchSimilar, formatKbContext } from "../../lib/vector-store";

const router = Router();

// POST /api/assist/message
router.post("/", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body as {
      message: string;
      conversationId?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    // ── 1. Resolve or create conversation ──────────────────────────────────
    let convoId = conversationId;

    if (convoId) {
      const [existing] = await db
        .select()
        .from(assistConversations)
        .where(
          and(
            eq(assistConversations.id, convoId),
            eq(assistConversations.dealerId, user.dealershipId)
          )
        )
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }
    } else {
      const [newConvo] = await db
        .insert(assistConversations)
        .values({
          dealerId: user.dealershipId,
          userId: user.clerkUserId,
          userRole: user.role,
          status: "active",
        })
        .returning();
      convoId = newConvo.id;
    }

    // ── 2. Get conversation history (last 20 messages) ──────────────────────
    const recentMessages = await db
      .select()
      .from(assistMessages)
      .where(eq(assistMessages.conversationId, convoId))
      .orderBy(desc(assistMessages.createdAt))
      .limit(20);

    const history: ConversationMessage[] = recentMessages
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // ── 3. Vector search for relevant KB articles ───────────────────────────
    let kbContext = "";
    try {
      const relevant = await searchSimilar(message, 5);
      kbContext = formatKbContext(relevant);
    } catch {
      // Vector search is non-critical — continue without KB context
    }

    // ── 4. Call Claude ──────────────────────────────────────────────────────
    const assistResponse = await getAssistResponse(message, history, kbContext, {
      dealerId: user.dealershipId,
      userRole: user.role,
    });

    // ── 5. Save both messages ───────────────────────────────────────────────
    await db.insert(assistMessages).values([
      {
        conversationId: convoId,
        role: "user",
        content: message,
        metadata: {},
      },
      {
        conversationId: convoId,
        role: "assistant",
        content: assistResponse,
        metadata: { kb_sources: [] },
      },
    ]);

    // Update message count
    await db
      .update(assistConversations)
      .set({
        messageCount: recentMessages.length + 2,
        updatedAt: new Date(),
      })
      .where(eq(assistConversations.id, convoId));

    return res.json({
      success: true,
      conversationId: convoId,
      response: assistResponse,
      sources: [],
    });
  } catch (err) {
    console.error("Assist message error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
