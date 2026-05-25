// server/routes/platform.ts — Platform settings, feature requests, notifications

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { platformSettings, featureRequests, notifications, users, userNotificationPreferences, insertFeatureRequestSchema, insertNotificationSchema } from "@shared/schema";
import { eq, and, desc, or, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole, requireOperator, scopeToDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { OPERATOR_ROLES } from "@shared/constants";
import { clerkClient } from "@clerk/express";

const router = Router();

// ==================== PLATFORM SETTINGS ====================

// GET /api/settings
router.get("/settings", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const settings = await db.select().from(platformSettings);
    const settingsMap: Record<string, any> = {};
    for (const s of settings) settingsMap[s.key] = s.value;
    res.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/settings/:key
router.put("/settings/:key", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const [existing] = await db.select().from(platformSettings).where(eq(platformSettings.key, req.params.key)).limit(1);

    if (existing) {
      await db.update(platformSettings).set({ value, updatedAt: new Date() }).where(eq(platformSettings.key, req.params.key));
    } else {
      await db.insert(platformSettings).values({ key: req.params.key, value });
    }

    res.json({ success: true, key: req.params.key, value });
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/user/profile
router.put("/user/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, timezone, email } = req.body;
    const clerkUserId = req.user!.clerkUserId;

    // Sync name fields to Clerk so webhook doesn't overwrite them on next event
    const clerkUpdate: Record<string, string> = {};
    if (firstName !== undefined) clerkUpdate.firstName = firstName;
    if (lastName !== undefined) clerkUpdate.lastName = lastName;
    if (Object.keys(clerkUpdate).length > 0) {
      await clerkClient.users.updateUser(clerkUserId, clerkUpdate);
    }

    // Email changes must go through Clerk (creates a verified address and sets it primary)
    if (email && email !== req.user!.email) {
      await clerkClient.emailAddresses.createEmailAddress({
        userId: clerkUserId,
        emailAddress: email,
        primary: true,
        verified: true,
      } as any);
    }

    // Update local DB
    const dbUpdate: Record<string, any> = { updatedAt: new Date() };
    if (firstName !== undefined) dbUpdate.firstName = firstName;
    if (lastName !== undefined) dbUpdate.lastName = lastName;
    if (phone !== undefined) dbUpdate.phone = phone;
    if (timezone !== undefined) dbUpdate.timezone = timezone;
    if (email) dbUpdate.email = email;

    const [updated] = await db
      .update(users)
      .set(dbUpdate)
      .where(eq(users.id, req.user!.id))
      .returning();
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Update profile error:", error);
    const msg = error?.errors?.[0]?.longMessage
      || error?.errors?.[0]?.message
      || error?.message
      || "Internal server error";
    const status = (typeof error?.status === "number" && error.status >= 400 && error.status < 600)
      ? error.status
      : 500;
    res.status(status).json({ success: false, message: msg });
  }
});

// GET /api/settings/connection-status
router.get("/settings/connection-status", requireAuth, requireRole("operator_admin"), async (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: {
      stripe: !!(process.env.STRIPE_SECRET_KEY),
      sendgrid: !!(process.env.SENDGRID_API_KEY),
      anthropic: !!(process.env.ANTHROPIC_API_KEY),
      tavus: !!(process.env.TAVUS_API_KEY),
      clerk: !!(process.env.CLERK_SECRET_KEY),
      neon: !!(process.env.DATABASE_URL),
    },
  });
});

// ==================== FEATURE REQUESTS ====================

// GET /api/feature-requests
router.get("/feature-requests", requireAuth, async (req: Request, res: Response) => {
  try {
    let items;
    if (OPERATOR_ROLES.includes(req.user!.role as any)) {
      // Operators see all requests
      items = await db.select().from(featureRequests).orderBy(desc(featureRequests.createdAt));
    } else {
      // Dealers and clients see only their own dealership's requests
      items = await db.select().from(featureRequests)
        .where(eq(featureRequests.dealershipId, req.user!.dealershipId!))
        .orderBy(desc(featureRequests.createdAt));
    }
    res.json({ success: true, featureRequests: items });
  } catch (error) {
    console.error("List feature requests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/feature-requests
router.post("/feature-requests", requireAuth, validateBody(insertFeatureRequestSchema), async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user!.dealershipId || undefined;
    const requestedBy = dealershipId
      ? req.body.requestedBy || `${req.user!.firstName} ${req.user!.lastName}`
      : "Internal";

    const [item] = await db
      .insert(featureRequests)
      .values({ ...req.body, requestedBy, dealershipId })
      .returning();

    res.status(201).json({ success: true, featureRequest: item });
  } catch (error) {
    console.error("Create feature request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/feature-requests/:id
router.put("/feature-requests/:id", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(featureRequests)
      .set(req.body)
      .where(eq(featureRequests.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, featureRequest: updated });
  } catch (error) {
    console.error("Update feature request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== NOTIFICATIONS ====================

// GET /api/notifications/unread-count
router.get("/notifications/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, req.user!.id), eq(notifications.isRead, false)));
    res.json({ success: true, unread: items.length });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/notifications/inbox — bell dropdown: latest 20 notifications for current user
router.get("/notifications/inbox", requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
    res.json({ success: true, notifications: items });
  } catch (error) {
    console.error("Notifications inbox error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/notifications
router.get("/notifications", requireAuth, async (req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt));

    res.json({ success: true, notifications: items });
  } catch (error) {
    console.error("List notifications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/notifications/:id/read
router.put("/notifications/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.id)))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/notifications/read-all
router.put("/notifications/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, req.user!.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Read-all notifications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/notifications/:id — dismiss (soft-delete via mark read)
router.delete("/notifications/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, req.params.id), eq(notifications.userId, req.user!.id)));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/notifications — operator compose-send (targeted or broadcast)
router.post("/notifications", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const { title, message, type, recipients } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const typeMap: Record<string, string> = {
      general: "announcement", service: "system", billing: "invoice",
      feature: "announcement", maintenance: "system", urgent: "system",
    };
    const notifType = (typeMap[type] || "announcement") as any;

    const allUsers = await db.select({ id: users.id, role: users.role, isActive: users.isActive, dealershipId: users.dealershipId }).from(users);
    let targets = allUsers.filter(u => u.isActive && !["operator_admin", "operator_staff"].includes(u.role));

    // Filter by recipient segment
    if (recipients && recipients !== "all" && recipients !== "active") {
      // Check if it looks like a UUID (specific dealership)
      if (recipients.match(/^[0-9a-f-]{36}$/i)) {
        targets = targets.filter(u => u.dealershipId === recipients);
      }
      // plan_a / plan_b targeting: keep all dealers for now (plan lookup not implemented here)
    }

    for (const u of targets) {
      await db.insert(notifications).values({ userId: u.id, type: notifType, title, message });
    }

    res.json({ success: true, sent: targets.length });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/notifications/broadcast — alias: sends to all active non-operator users
router.post("/notifications/broadcast", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const typeMap: Record<string, string> = {
      general: "announcement", service: "system", billing: "invoice",
      feature: "announcement", maintenance: "system", urgent: "system",
    };
    const notifType = (typeMap[type] || "announcement") as any;

    const allUsers = await db.select({ id: users.id, role: users.role, isActive: users.isActive }).from(users);
    const targets = allUsers.filter(u => u.isActive && !["operator_admin", "operator_staff"].includes(u.role));

    for (const u of targets) {
      await db.insert(notifications).values({ userId: u.id, type: notifType, title, message });
    }

    res.json({ success: true, sent: targets.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/notifications/preferences
router.get("/notifications/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const [prefs] = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, req.user!.id))
      .limit(1);
    res.json({ success: true, preferences: prefs?.preferences || {} });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/notifications/broadcast-log — recent system/announcement notifications, deduplicated by title+message per minute
router.get("/notifications/broadcast-log", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ id: notifications.id, type: notifications.type, title: notifications.title, message: notifications.message, createdAt: notifications.createdAt })
      .from(notifications)
      .where(inArray(notifications.type, ["announcement", "system"] as any[]))
      .orderBy(desc(notifications.createdAt))
      .limit(500);

    // Deduplicate: group by title+message within 1-minute windows
    const seen = new Map<string, any>();
    for (const r of rows) {
      const minuteKey = r.createdAt ? Math.floor(new Date(r.createdAt).getTime() / 60000) : 0;
      const key = `${r.title}||${r.message}||${minuteKey}`;
      if (!seen.has(key)) {
        seen.set(key, { ...r, sent: 1 });
      } else {
        seen.get(key)!.sent++;
      }
    }

    const broadcasts = Array.from(seen.values()).slice(0, 50);
    res.json({ success: true, broadcasts });
  } catch (error) {
    console.error("Broadcast log error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/notifications/preferences
router.patch("/notifications/preferences", requireAuth, async (req: Request, res: Response) => {
  try {
    const { preferences, smsPhone } = req.body;
    const [updated] = await db
      .insert(userNotificationPreferences)
      .values({ userId: req.user!.id, preferences: preferences || {}, smsPhone: smsPhone || null })
      .onConflictDoUpdate({
        target: userNotificationPreferences.userId,
        set: { preferences: preferences || {}, smsPhone: smsPhone || null, updatedAt: new Date() },
      })
      .returning();
    res.json({ success: true, preferences: updated });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
