// server/routes/quick-chat.ts — Quick chat between dealer staff and customers

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { quickChatMessages, users } from "@shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { canAccessDealership } from "../middleware/rbac";
import { emitQuickChat } from "../lib/websocket";
import { DEALER_ROLES } from "@shared/constants";

const router = Router();

// ==================== GET /api/quick-chat/:dealershipId/:customerId ====================
// Get message history between a dealership and a customer
router.get("/:dealershipId/:customerId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { dealershipId, customerId } = req.params;

    // Access check
    if (req.user!.role === "customer" && req.user!.id !== customerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (DEALER_ROLES.includes(req.user!.role as any) && !canAccessDealership(dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await db
      .select({
        id: quickChatMessages.id,
        message: quickChatMessages.message,
        senderId: quickChatMessages.senderId,
        createdAt: quickChatMessages.createdAt,
      })
      .from(quickChatMessages)
      .where(
        and(
          eq(quickChatMessages.dealershipId, dealershipId),
          eq(quickChatMessages.customerId, customerId)
        )
      )
      .orderBy(quickChatMessages.createdAt)
      .limit(100);

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/quick-chat ====================
// Send a message
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { dealershipId, customerId, message } = req.body;

    if (!dealershipId || !customerId || !message?.trim()) {
      return res.status(400).json({ success: false, message: "dealershipId, customerId, and message are required" });
    }

    // Determine sender context
    const senderId = req.user!.id;

    // Access check
    if (req.user!.role === "customer" && req.user!.id !== customerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (DEALER_ROLES.includes(req.user!.role as any) && !canAccessDealership(dealershipId, req.user)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [newMessage] = await db
      .insert(quickChatMessages)
      .values({
        dealershipId,
        customerId,
        senderId,
        message: message.trim(),
      })
      .returning();

    // Emit via WebSocket for real-time delivery
    emitQuickChat({
      dealershipId,
      customerId,
      senderId,
      message: message.trim(),
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Send chat message error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/quick-chat/conversations ====================
// Dealer gets list of active chat conversations with customers
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!DEALER_ROLES.includes(req.user!.role as any)) {
      return res.status(403).json({ success: false, message: "Dealer access required" });
    }

    const dealershipId = req.user!.dealershipId;
    if (!dealershipId) return res.json({ success: true, conversations: [] });

    // Get unique customer IDs with latest message
    const latestMessages = await db
      .select()
      .from(quickChatMessages)
      .where(eq(quickChatMessages.dealershipId, dealershipId))
      .orderBy(desc(quickChatMessages.createdAt));

    // Group by customer, take latest
    const seen = new Set<string>();
    const conversations: Array<{
      customerId: string;
      lastMessage: string;
      lastMessageAt: Date;
      senderId: string;
    }> = [];

    for (const msg of latestMessages) {
      if (!seen.has(msg.customerId)) {
        seen.add(msg.customerId);
        conversations.push({
          customerId: msg.customerId,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          senderId: msg.senderId,
        });
      }
      if (conversations.length >= 50) break;
    }

    // Enrich with customer names
    const customerIds = conversations.map((c) => c.customerId);
    const customerUsers = customerIds.length > 0
      ? await db
          .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, avatarUrl: users.avatarUrl })
          .from(users)
          .where(or(...customerIds.map((id) => eq(users.id, id))))
      : [];

    const customerMap = new Map(customerUsers.map((u) => [u.id, u]));

    const enriched = conversations.map((c) => ({
      ...c,
      customer: customerMap.get(c.customerId) || { firstName: "Unknown", lastName: "" },
    }));

    res.json({ success: true, conversations: enriched });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
