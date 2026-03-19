// server/routes/tickets.ts — Support ticket endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { tickets, ticketMessages, insertTicketSchema, insertTicketMessageSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateTicketNumber } from "@shared/constants";
import { emitTicketMessage } from "../lib/websocket";

const router = Router();

// ==================== GET /api/tickets ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(tickets.dealershipId, req.scopedDealershipId));
    if (req.query.status) conditions.push(eq(tickets.status, req.query.status as any));
    if (req.query.category) conditions.push(eq(tickets.category, req.query.category as any));

    // Customers only see their own tickets
    if (req.user!.role === "customer") {
      conditions.push(eq(tickets.customerId, req.user!.id));
    }

    const items = await db.select().from(tickets).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(tickets.updatedAt));
    res.json({ success: true, tickets: items });
  } catch (error) {
    console.error("List tickets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/tickets ====================
router.post("/", requireAuth, scopeToDealership, validateBody(insertTicketSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.scopedDealershipId || req.body.dealershipId;
    const ticketNumber = generateTicketNumber();

    const [newTicket] = await db
      .insert(tickets)
      .values({
        ...req.body,
        ticketNumber,
        dealershipId,
        customerId: req.user!.role === "customer" ? req.user!.id : req.body.customerId,
      })
      .returning();

    res.status(201).json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/tickets/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, req.params.id)).limit(1);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
    if (!canAccessDealership(ticket.dealershipId, req.user)) {
      // Customers can only see their own
      if (req.user!.role === "customer" && ticket.customerId !== req.user!.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    // Get messages — filter internal notes for customers
    let messages = await db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticket.id)).orderBy(ticketMessages.createdAt);

    if (req.user!.role === "customer") {
      messages = messages.filter((m) => !m.isInternal);
    }

    res.json({ success: true, ticket, messages });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/tickets/:id/messages ====================
router.post("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, req.params.id)).limit(1);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    const [message] = await db
      .insert(ticketMessages)
      .values({
        ticketId: ticket.id,
        senderId: req.user!.id,
        message: req.body.message,
        isInternal: req.body.isInternal || false,
        attachmentUrls: req.body.attachmentUrls,
      })
      .returning();

    // Update ticket timestamp
    await db.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticket.id));

    emitTicketMessage({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      dealershipId: ticket.dealershipId,
      customerId: ticket.customerId || undefined,
      senderId: req.user!.id,
      message: req.body.message,
      isInternal: req.body.isInternal || false,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Add ticket message error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/tickets/:id/status ====================
router.put("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "resolved" || status === "closed") updateData.resolvedAt = new Date();

    const [updated] = await db.update(tickets).set(updateData).where(eq(tickets.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
