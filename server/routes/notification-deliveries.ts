// server/routes/notification-deliveries.ts — Notification delivery API (/api/notification-deliveries)
// Uses notification_deliveries table (event bus fan-out output).
// Separate from /api/notifications (platform.ts notifications table — legacy).

import { Router } from "express";
import { db } from "../db";
import { notificationDeliveries } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/notification-deliveries — last 50, newest first
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(notificationDeliveries)
      .where(and(
        eq(notificationDeliveries.recipientUserId, req.user!.id),
        eq(notificationDeliveries.channel, "in_app"),
      ))
      .orderBy(desc(notificationDeliveries.createdAt))
      .limit(50);
    res.json(rows);
  } catch (err) {
    console.error("[notification-deliveries GET /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/notification-deliveries/unread-count
router.get("/unread-count", async (req, res) => {
  try {
    const rows = await db.select({ id: notificationDeliveries.id }).from(notificationDeliveries)
      .where(and(
        eq(notificationDeliveries.recipientUserId, req.user!.id),
        eq(notificationDeliveries.channel, "in_app"),
        eq(notificationDeliveries.isRead, false),
      ));
    res.json({ count: rows.length });
  } catch (err) {
    console.error("[notification-deliveries GET /unread-count]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/notification-deliveries/mark-all-read — must come before /:id/read
router.post("/mark-all-read", async (req, res) => {
  try {
    await db.update(notificationDeliveries)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(notificationDeliveries.recipientUserId, req.user!.id),
        eq(notificationDeliveries.isRead, false),
      ));
    res.json({ ok: true });
  } catch (err) {
    console.error("[notification-deliveries POST /mark-all-read]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/notification-deliveries/:id/read
router.post("/:id/read", async (req, res) => {
  try {
    await db.update(notificationDeliveries)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(notificationDeliveries.id, req.params.id),
        eq(notificationDeliveries.recipientUserId, req.user!.id),
      ));
    res.json({ ok: true });
  } catch (err) {
    console.error("[notification-deliveries POST /:id/read]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
