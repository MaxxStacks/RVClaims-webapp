// server/routes/assist/conversations.ts
// GET  /api/assist/conversations         — list dealer user's conversations
// GET  /api/assist/conversations/:id     — get full conversation with messages

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { assistConversations, assistMessages } from "@shared/schema-assist";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer } from "../../middleware/rbac";

const router = Router();

// GET /api/assist/conversations?page=1&limit=20
router.get("/", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const offset = (page - 1) * limit;

    // Get conversations for this specific user, sorted by most recent
    const rows = await db
      .select({
        id: assistConversations.id,
        status: assistConversations.status,
        messageCount: assistConversations.messageCount,
        createdAt: assistConversations.createdAt,
        updatedAt: assistConversations.updatedAt,
      })
      .from(assistConversations)
      .where(
        and(
          eq(assistConversations.dealerId, user.dealershipId!),
          eq(assistConversations.userId, user.clerkUserId)
        )
      )
      .orderBy(desc(assistConversations.updatedAt))
      .limit(limit)
      .offset(offset);

    // For each conversation, fetch the first user message as a preview
    const enriched = await Promise.all(
      rows.map(async (convo) => {
        const [firstMsg] = await db
          .select({ content: assistMessages.content })
          .from(assistMessages)
          .where(
            and(
              eq(assistMessages.conversationId, convo.id),
              eq(assistMessages.role, "user")
            )
          )
          .orderBy(assistMessages.createdAt)
          .limit(1);

        const preview = firstMsg?.content
          ? firstMsg.content.slice(0, 60) + (firstMsg.content.length > 60 ? "…" : "")
          : "New conversation";

        return { ...convo, preview };
      })
    );

    return res.json({ success: true, conversations: enriched, page, limit });
  } catch (err) {
    console.error("List conversations error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/assist/conversations/:id
router.get("/:id", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const [convo] = await db
      .select()
      .from(assistConversations)
      .where(
        and(
          eq(assistConversations.id, id),
          eq(assistConversations.userId, user.clerkUserId)
        )
      )
      .limit(1);

    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await db
      .select()
      .from(assistMessages)
      .where(eq(assistMessages.conversationId, id))
      .orderBy(assistMessages.createdAt);

    return res.json({ success: true, conversation: convo, messages });
  } catch (err) {
    console.error("Get conversation error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
