// server/routes/assist/feedback.ts
// POST /api/assist/conversations/:id/feedback

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { assistConversations, assistMessages, assistKnowledgeGaps } from "@shared/schema-assist";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer } from "../../middleware/rbac";

const router = Router();

// POST /api/assist/conversations/:id/feedback
router.post("/:id/feedback", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id: conversationId } = req.params;
    const { messageId, feedback } = req.body as { messageId: string; feedback: "up" | "down" };

    if (!messageId || !["up", "down"].includes(feedback)) {
      return res.status(400).json({ success: false, message: "messageId and feedback ('up'|'down') are required" });
    }

    // Verify conversation belongs to this user
    const [convo] = await db
      .select({ id: assistConversations.id })
      .from(assistConversations)
      .where(
        and(
          eq(assistConversations.id, conversationId),
          eq(assistConversations.userId, user.clerkUserId)
        )
      )
      .limit(1);

    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Verify message belongs to this conversation and is an assistant message
    const [msg] = await db
      .select({ id: assistMessages.id, role: assistMessages.role, content: assistMessages.content })
      .from(assistMessages)
      .where(
        and(
          eq(assistMessages.id, messageId),
          eq(assistMessages.conversationId, conversationId)
        )
      )
      .limit(1);

    if (!msg || msg.role !== "assistant") {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Update message feedback
    await db
      .update(assistMessages)
      .set({ feedback })
      .where(eq(assistMessages.id, messageId));

    // Update conversation thumbs counts
    if (feedback === "up") {
      await db
        .update(assistConversations)
        .set({ thumbsUpCount: sql`${assistConversations.thumbsUpCount} + 1` })
        .where(eq(assistConversations.id, conversationId));
    } else {
      await db
        .update(assistConversations)
        .set({ thumbsDownCount: sql`${assistConversations.thumbsDownCount} + 1` })
        .where(eq(assistConversations.id, conversationId));

      // Thumbs down → look for the preceding user message to log as knowledge gap
      const allMessages = await db
        .select({ id: assistMessages.id, role: assistMessages.role, content: assistMessages.content, createdAt: assistMessages.createdAt })
        .from(assistMessages)
        .where(eq(assistMessages.conversationId, conversationId))
        .orderBy(assistMessages.createdAt);

      const assistIdx = allMessages.findIndex((m) => m.id === messageId);
      const userMsg = assistIdx > 0 ? allMessages[assistIdx - 1] : null;

      if (userMsg && userMsg.role === "user") {
        // Check for near-duplicate in knowledge_gaps (simple text match)
        const existing = await db
          .select({ id: assistKnowledgeGaps.id, frequency: assistKnowledgeGaps.frequency })
          .from(assistKnowledgeGaps)
          .where(eq(assistKnowledgeGaps.question, userMsg.content.slice(0, 500)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(assistKnowledgeGaps)
            .set({
              frequency: sql`${assistKnowledgeGaps.frequency} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(assistKnowledgeGaps.id, existing[0].id));
        } else {
          await db.insert(assistKnowledgeGaps).values({
            conversationId,
            messageId,
            question: userMsg.content.slice(0, 500),
            frequency: 1,
            status: "new",
            autoDetected: false,
          });
        }
      }
    }

    return res.json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
