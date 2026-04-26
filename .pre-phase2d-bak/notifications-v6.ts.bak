// server/routes/notifications-v6.ts — Notification delivery API (/api/v6/notifications)
// Uses notification_deliveries table (event bus fan-out output).
// Separate from legacy /api/notifications (platform.ts notifications table).

import { Router } from "express";
import { db } from "../db";
import { notificationDeliveries } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/v6/notifications — last 50, newest first
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
    console.error("[notifications-v6 GET /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v6/notifications/unread-count
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
    console.error("[notifications-v6 GET /unread-count]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/notifications/mark-all-read — must come before /:id/read
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
    console.error("[notifications-v6 POST /mark-all-read]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/notifications/:id/read
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
    console.error("[notifications-v6 POST /:id/read]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
