// server/routes/marketing.ts — Campaign templates + campaigns

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { campaignTemplates, campaigns, dealerships } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole, requireOperator, scopeToDealership } from "../middleware/rbac";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

const isOperator = (role: string) => OPERATOR_ROLES.includes(role as any);

// ==================== CAMPAIGN TEMPLATES ====================

// GET /api/marketing/templates — all authenticated users
router.get("/templates", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(campaignTemplates)
      .where(eq(campaignTemplates.isActive, true))
      .orderBy(desc(campaignTemplates.createdAt));
    res.json({ success: true, templates: rows });
  } catch (error) {
    console.error("List templates error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/marketing/templates/:id
router.get("/templates/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db
      .select()
      .from(campaignTemplates)
      .where(eq(campaignTemplates.id, req.params.id))
      .limit(1);
    if (!row) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, template: row });
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/marketing/templates — operator_admin only
router.post("/templates", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const { name, type, subject, bodyHtml, bodyText } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: "name and type are required" });

    const [created] = await db
      .insert(campaignTemplates)
      .values({ name, type, subject, bodyHtml, bodyText, publishedByUserId: req.user!.id })
      .returning();
    res.status(201).json({ success: true, template: created });
  } catch (error) {
    console.error("Create template error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/marketing/templates/:id — operator_admin only
router.patch("/templates/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const { name, type, subject, bodyHtml, bodyText, isActive } = req.body;
    const [updated] = await db
      .update(campaignTemplates)
      .set({ name, type, subject, bodyHtml, bodyText, isActive, updatedAt: new Date() })
      .where(eq(campaignTemplates.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, template: updated });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/marketing/templates/:id — operator_admin only (soft delete)
router.delete("/templates/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    await db
      .update(campaignTemplates)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(campaignTemplates.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== CAMPAIGNS ====================

// GET /api/marketing/campaigns — operators see all; dealer_owner sees own
router.get("/campaigns", requireAuth, async (req: Request, res: Response) => {
  try {
    let rows;
    if (isOperator(req.user!.role)) {
      rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
    } else if (req.user!.role === "dealer_owner" && req.user!.dealershipId) {
      rows = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.dealershipId, req.user!.dealershipId))
        .orderBy(desc(campaigns.createdAt));
    } else {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({ success: true, campaigns: rows });
  } catch (error) {
    console.error("List campaigns error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/marketing/campaigns — dealer_owner or operator
router.post("/campaigns", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    if (!isOperator(role) && role !== "dealer_owner") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { name, type, templateId, subject, bodyHtml, bodyText, scheduledFor, dealershipId } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: "name and type are required" });

    const targetDealershipId = isOperator(role)
      ? (dealershipId || req.user!.dealershipId)
      : req.user!.dealershipId;

    if (!targetDealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    const num = `CAMP-${Date.now()}`;
    const [created] = await db
      .insert(campaigns)
      .values({
        campaignNumber: num,
        dealershipId: targetDealershipId,
        createdByUserId: req.user!.id,
        name,
        type,
        templateId: templateId || null,
        subject,
        bodyHtml,
        bodyText,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      })
      .returning();
    res.status(201).json({ success: true, campaign: created });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/marketing/campaigns/:id — update status or content
router.patch("/campaigns/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    const [existing] = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Campaign not found" });

    if (!isOperator(role) && existing.dealershipId !== req.user!.dealershipId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status, scheduledFor, name, subject } = req.body;
    const patch: any = { updatedAt: new Date() };
    if (status !== undefined) patch.status = status;
    if (scheduledFor !== undefined) patch.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (name !== undefined) patch.name = name;
    if (subject !== undefined) patch.subject = subject;

    const [updated] = await db
      .update(campaigns)
      .set(patch)
      .where(eq(campaigns.id, req.params.id))
      .returning();
    res.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
