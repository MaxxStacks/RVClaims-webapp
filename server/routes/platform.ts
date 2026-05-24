// server/routes/platform.ts — Platform settings, feature requests, notifications

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { platformSettings, featureRequests, notifications, users, insertFeatureRequestSchema, insertNotificationSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole, requireOperator, scopeToDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { OPERATOR_ROLES } from "@shared/constants";

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
    const { firstName, lastName, phone, timezone } = req.body;
    const [updated] = await db
      .update(users)
      .set({ firstName, lastName, phone, timezone, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id))
      .returning();
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

// POST /api/notifications/broadcast (operator sends to all dealers)
router.post("/notifications/broadcast", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    // TODO: Query all active dealer users and create notification for each
    // For now, placeholder
    res.json({ success: true, message: "Broadcast queued" });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
