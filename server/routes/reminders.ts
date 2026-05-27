// server/routes/reminders.ts — Service Reminders API

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  serviceReminders,
  serviceReminderSends,
  customerNotificationPreferences,
  users,
} from "@shared/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { processReminder, renderTemplate } from "../lib/reminderEngine";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDealershipId(req: Request): string | null {
  const u = (req as any).user;
  if (!u) return null;
  // Operator roles see all (no dealership filter for listing)
  if (u.role === "operator_admin" || u.role === "operator_staff") return null;
  return u.dealershipId ?? null;
}

function isOperator(req: Request): boolean {
  const u = (req as any).user;
  return u?.role === "operator_admin" || u?.role === "operator_staff";
}

function canManage(req: Request): boolean {
  const u = (req as any).user;
  return ["operator_admin", "dealer_owner", "service_manager"].includes(u?.role);
}

// ─── GET /api/reminders ────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    const query = db.select().from(serviceReminders).orderBy(desc(serviceReminders.createdAt));
    const rows = dealershipId
      ? await db.select().from(serviceReminders).where(eq(serviceReminders.dealershipId, dealershipId)).orderBy(desc(serviceReminders.createdAt))
      : await query;
    res.json({ success: true, reminders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reminders" });
  }
});

// ─── GET /api/reminders/stats ─────────────────────────────────────────────────
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);

    // Active reminders count
    const activeQuery = dealershipId
      ? db.select({ c: count() }).from(serviceReminders).where(and(eq(serviceReminders.dealershipId, dealershipId), eq(serviceReminders.isActive, true)))
      : db.select({ c: count() }).from(serviceReminders).where(eq(serviceReminders.isActive, true));
    const [{ c: activeCount }] = await activeQuery;

    // This month sends
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ c: sendsThisMonth }] = await db
      .select({ c: count() })
      .from(serviceReminderSends)
      .where(sql`${serviceReminderSends.sentAt} >= ${startOfMonth.toISOString()}`);

    const [{ c: delivered }] = await db
      .select({ c: count() })
      .from(serviceReminderSends)
      .where(eq(serviceReminderSends.status, "delivered"));

    const [{ c: total }] = await db.select({ c: count() }).from(serviceReminderSends);

    const [{ c: optedOut }] = await db
      .select({ c: count() })
      .from(serviceReminderSends)
      .where(eq(serviceReminderSends.status, "opted_out"));

    const deliveryRate = Number(total) > 0 ? Math.round((Number(delivered) / Number(total)) * 100) : 0;
    const optOutRate = Number(total) > 0 ? Math.round((Number(optedOut) / Number(total)) * 100) : 0;

    res.json({
      success: true,
      stats: {
        activeReminders: Number(activeCount),
        sendsThisMonth: Number(sendsThisMonth),
        deliveryRate,
        optOutRate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// ─── GET /api/reminders/send-history ─────────────────────────────────────────
router.get("/send-history", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const statusFilter = req.query.status as string | undefined;

    let q = db
      .select({
        id: serviceReminderSends.id,
        reminderId: serviceReminderSends.reminderId,
        reminderName: serviceReminders.name,
        customerId: serviceReminderSends.customerId,
        customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        unitId: serviceReminderSends.unitId,
        channel: serviceReminderSends.channel,
        status: serviceReminderSends.status,
        sentAt: serviceReminderSends.sentAt,
        openedAt: serviceReminderSends.openedAt,
      })
      .from(serviceReminderSends)
      .leftJoin(serviceReminders, eq(serviceReminderSends.reminderId, serviceReminders.id))
      .leftJoin(users, eq(serviceReminderSends.customerId, users.id))
      .orderBy(desc(serviceReminderSends.sentAt))
      .limit(limit)
      .offset(offset);

    const rows = await (dealershipId
      ? db
          .select({
            id: serviceReminderSends.id,
            reminderId: serviceReminderSends.reminderId,
            reminderName: serviceReminders.name,
            customerId: serviceReminderSends.customerId,
            customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
            unitId: serviceReminderSends.unitId,
            channel: serviceReminderSends.channel,
            status: serviceReminderSends.status,
            sentAt: serviceReminderSends.sentAt,
            openedAt: serviceReminderSends.openedAt,
          })
          .from(serviceReminderSends)
          .leftJoin(serviceReminders, eq(serviceReminderSends.reminderId, serviceReminders.id))
          .leftJoin(users, eq(serviceReminderSends.customerId, users.id))
          .where(eq(serviceReminders.dealershipId, dealershipId))
          .orderBy(desc(serviceReminderSends.sentAt))
          .limit(limit)
          .offset(offset)
      : q);

    res.json({ success: true, history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch send history" });
  }
});

// ─── GET /api/reminders/:id ───────────────────────────────────────────────────
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [reminder] = await db
      .select()
      .from(serviceReminders)
      .where(eq(serviceReminders.id, req.params.id))
      .limit(1);
    if (!reminder) return res.status(404).json({ success: false, message: "Not found" });
    const dealershipId = getDealershipId(req);
    if (dealershipId && reminder.dealershipId !== dealershipId)
      return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reminder" });
  }
});

// ─── POST /api/reminders ──────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
  try {
    const u = (req as any).user;
    const dealershipId = getDealershipId(req) ?? req.body.dealershipId;
    if (!dealershipId) return res.status(400).json({ success: false, message: "dealershipId required" });

    const {
      name, templateType, triggerType, triggerConfig,
      subject, message, includeProductPromotion,
      promotedProductIds, recipientFilter,
    } = req.body;

    if (!name || !templateType || !triggerType || !subject || !message)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const [created] = await db
      .insert(serviceReminders)
      .values({
        dealershipId,
        name,
        templateType,
        triggerType,
        triggerConfig: triggerConfig ?? {},
        subject,
        message,
        includeProductPromotion: includeProductPromotion ?? false,
        promotedProductIds: promotedProductIds ?? null,
        isActive: true,
        recipientFilter: recipientFilter ?? { allCustomers: true },
        sendCount: 0,
        createdBy: u.id,
      })
      .returning();

    res.status(201).json({ success: true, reminder: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create reminder" });
  }
});

// ─── PATCH /api/reminders/:id ─────────────────────────────────────────────────
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
  try {
    const [existing] = await db.select().from(serviceReminders).where(eq(serviceReminders.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });
    const dealershipId = getDealershipId(req);
    if (dealershipId && existing.dealershipId !== dealershipId)
      return res.status(403).json({ success: false, message: "Access denied" });

    const allowed = ["name","templateType","triggerType","triggerConfig","subject","message",
      "includeProductPromotion","promotedProductIds","isActive","recipientFilter"];
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];

    const [updated] = await db.update(serviceReminders).set(patch).where(eq(serviceReminders.id, req.params.id)).returning();
    res.json({ success: true, reminder: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update reminder" });
  }
});

// ─── DELETE /api/reminders/:id ────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
  try {
    await db.update(serviceReminders).set({ isActive: false, updatedAt: new Date() }).where(eq(serviceReminders.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to disable reminder" });
  }
});

// ─── POST /api/reminders/:id/send ─────────────────────────────────────────────
router.post("/:id/send", requireAuth, async (req: Request, res: Response) => {
  if (!canManage(req)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
  try {
    const result = await processReminder(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to process reminder" });
  }
});

// ─── POST /api/reminders/preview ─────────────────────────────────────────────
router.post("/preview", requireAuth, async (req: Request, res: Response) => {
  try {
    const { subject, message, sampleVars } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "message required" });

    const vars: Record<string, string> = {
      customerName: "Jane Smith",
      unitYear: "2022",
      unitMake: "Jayco",
      unitModel: "Eagle 321RSTS",
      dealerName: "Your Dealership",
      expiryDate: "December 15, 2026",
      ...(sampleVars ?? {}),
    };

    res.json({
      success: true,
      preview: {
        subject: renderTemplate(subject ?? "", vars),
        message: renderTemplate(message, vars),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Preview failed" });
  }
});

// ─── GET /api/customer-preferences ───────────────────────────────────────────
router.get("/customer-preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const u = (req as any).user;
    const [prefs] = await db
      .select()
      .from(customerNotificationPreferences)
      .where(eq(customerNotificationPreferences.userId, u.id))
      .limit(1);
    res.json({ success: true, preferences: prefs ?? null });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch preferences" });
  }
});

// ─── PATCH /api/customer-preferences ─────────────────────────────────────────
router.patch("/customer-preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const u = (req as any).user;
    const {
      pushEnabled, emailEnabled, smsEnabled, marketingOptIn, reminderCategories,
    } = req.body;

    const [existing] = await db
      .select()
      .from(customerNotificationPreferences)
      .where(eq(customerNotificationPreferences.userId, u.id))
      .limit(1);

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (pushEnabled !== undefined) patch.pushEnabled = pushEnabled;
    if (emailEnabled !== undefined) patch.emailEnabled = emailEnabled;
    if (smsEnabled !== undefined) patch.smsEnabled = smsEnabled;
    if (marketingOptIn !== undefined) patch.marketingOptIn = marketingOptIn;
    if (reminderCategories !== undefined) patch.reminderCategories = reminderCategories;

    let result;
    if (existing) {
      [result] = await db
        .update(customerNotificationPreferences)
        .set(patch)
        .where(eq(customerNotificationPreferences.userId, u.id))
        .returning();
    } else {
      [result] = await db
        .insert(customerNotificationPreferences)
        .values({
          userId: u.id,
          pushEnabled: pushEnabled ?? true,
          emailEnabled: emailEnabled ?? true,
          smsEnabled: smsEnabled ?? false,
          marketingOptIn: marketingOptIn ?? true,
          reminderCategories: reminderCategories ?? { service: true, warranty: true, seasonal: true, promotions: true },
        })
        .returning();
    }

    res.json({ success: true, preferences: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update preferences" });
  }
});

export default router;
