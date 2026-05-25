// server/routes/financing.ts — Full Financing Services module
//
// Schema tables used (from shared/schema.ts — all exist in DB):
//   lenders              — lender partner registry
//   lenderIntegrations   — API integration metadata per lender
//   financingApplications — per-dealer application records
//   lenderSubmissions    — per-lender submission within an application
//
// Mount: app.use('/api/financing', financingRouter) in server/routes/index.ts
//
// Endpoints:
//   GET    /api/financing/lenders              — list (operators: all; dealers/clients: active only)
//   POST   /api/financing/lenders              — create lender (operator_admin)
//   PATCH  /api/financing/lenders/:id          — update lender (operator_admin)
//   DELETE /api/financing/lenders/:id          — soft-deactivate (operator_admin)
//   GET    /api/financing/applications          — list apps (role-scoped)
//   GET    /api/financing/applications/:id      — single app + submissions
//   POST   /api/financing/applications          — create (dealer_owner, operator_admin)
//   PATCH  /api/financing/applications/:id      — update status / accepted terms (operator_admin)
//   POST   /api/financing/applications/:id/submissions  — add lender submission (operator_admin)
//   PATCH  /api/financing/submissions/:subId    — update submission result (operator_admin)
//   GET    /api/financing/reports               — volume + approval rate stats (operator + financial_manager)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  lenders,
  financingApplications,
  lenderSubmissions,
  dealerships,
} from "@shared/schema";
import { eq, and, desc, inArray, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

// ─── Role constants ────────────────────────────────────────────────────────────
const FINANCING_VIEW_ROLES = [
  "operator_admin", "operator_staff",
  "dealer_owner", "dealer_staff",
  "financial_manager", "client",
] as const;

function generateApplicationNumber(): string {
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
  return `APP-${seq}`;
}

function isOperator(role: string): boolean {
  return OPERATOR_ROLES.includes(role as any);
}

// ==================== LENDERS ====================

// GET /api/financing/lenders
router.get("/lenders", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const hasAccess = (FINANCING_VIEW_ROLES as readonly string[]).includes(role);
    if (!hasAccess) return res.status(403).json({ success: false, message: "Access denied" });

    // Operators see all; dealers/clients see active only
    const conditions: any[] = [];
    if (!isOperator(role)) conditions.push(eq(lenders.active, true));

    // Operator can filter by active status via query
    if (isOperator(role) && req.query.active !== undefined) {
      conditions.push(eq(lenders.active, req.query.active === "true"));
    }

    const items = await db
      .select()
      .from(lenders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(lenders.name);

    res.json({ success: true, lenders: items });
  } catch (error) {
    console.error("List lenders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/financing/lenders — operator_admin only
router.post(
  "/lenders",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const {
        name, legalName, country, website,
        contactEmail, contactPhone,
        minLoanAmount, maxLoanAmount,
        minTermMonths, maxTermMonths,
        minCreditScore, active,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Lender name is required" });
      }

      const [item] = await db
        .insert(lenders)
        .values({
          name: name.trim(),
          legalName: legalName || null,
          country: country || "Canada",
          website: website || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          minLoanAmount: minLoanAmount || null,
          maxLoanAmount: maxLoanAmount || null,
          minTermMonths: minTermMonths ? parseInt(minTermMonths) : null,
          maxTermMonths: maxTermMonths ? parseInt(maxTermMonths) : null,
          minCreditScore: minCreditScore ? parseInt(minCreditScore) : null,
          active: active !== false,
          approvalRules: {},
          commissionStructure: {},
        })
        .returning();

      res.status(201).json({ success: true, lender: item });
    } catch (error) {
      console.error("Create lender error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// PATCH /api/financing/lenders/:id — operator_admin only
router.patch(
  "/lenders/:id",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(lenders)
        .where(eq(lenders.id, req.params.id))
        .limit(1);

      if (!existing) return res.status(404).json({ success: false, message: "Lender not found" });

      const allowed = [
        "name", "legalName", "country", "website",
        "contactEmail", "contactPhone",
        "minLoanAmount", "maxLoanAmount",
        "minTermMonths", "maxTermMonths",
        "minCreditScore", "active",
        "approvalRules", "commissionStructure",
      ];
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const [updated] = await db
        .update(lenders)
        .set(updates)
        .where(eq(lenders.id, req.params.id))
        .returning();

      res.json({ success: true, lender: updated });
    } catch (error) {
      console.error("Update lender error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// DELETE /api/financing/lenders/:id — soft-deactivate, operator_admin only
router.delete(
  "/lenders/:id",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(lenders)
        .where(eq(lenders.id, req.params.id))
        .limit(1);

      if (!existing) return res.status(404).json({ success: false, message: "Lender not found" });

      const [updated] = await db
        .update(lenders)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(lenders.id, req.params.id))
        .returning();

      res.json({ success: true, lender: updated, message: "Lender deactivated" });
    } catch (error) {
      console.error("Deactivate lender error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ==================== APPLICATIONS ====================

// GET /api/financing/applications — role-scoped list
router.get("/applications", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const hasAccess = (FINANCING_VIEW_ROLES as readonly string[]).includes(role);
    if (!hasAccess) return res.status(403).json({ success: false, message: "Access denied" });

    const conditions: any[] = [];

    if (isOperator(role)) {
      // Operators see all — optionally filter by dealership
      if (req.query.dealershipId) {
        conditions.push(eq(financingApplications.dealershipId, req.query.dealershipId as string));
      }
      if (req.query.status) {
        conditions.push(eq(financingApplications.status, req.query.status as string));
      }
    } else if (role === "client") {
      // Clients see only their own applications
      if (!req.user!.id) return res.status(403).json({ success: false, message: "User ID required" });
      conditions.push(eq(financingApplications.customerId, req.user!.id));
    } else {
      // dealer_owner, dealer_staff, financial_manager — scoped to their dealership
      if (!req.user!.dealershipId) {
        return res.status(403).json({ success: false, message: "No dealership assigned" });
      }
      conditions.push(eq(financingApplications.dealershipId, req.user!.dealershipId));
      if (req.query.status) {
        conditions.push(eq(financingApplications.status, req.query.status as string));
      }
    }

    const apps = await db
      .select()
      .from(financingApplications)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(financingApplications.createdAt));

    res.json({ success: true, applications: apps });
  } catch (error) {
    console.error("List financing applications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/financing/applications/:id — single application + lender submissions
router.get("/applications/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const hasAccess = (FINANCING_VIEW_ROLES as readonly string[]).includes(role);
    if (!hasAccess) return res.status(403).json({ success: false, message: "Access denied" });

    const [app] = await db
      .select()
      .from(financingApplications)
      .where(eq(financingApplications.id, req.params.id))
      .limit(1);

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    // Access check: non-operators must own the dealership or be the customer
    if (!isOperator(role)) {
      if (role === "client") {
        if (app.customerId !== req.user!.id) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      } else {
        if (app.dealershipId !== req.user!.dealershipId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
    }

    // Fetch lender submissions for this application
    const submissions = await db
      .select()
      .from(lenderSubmissions)
      .where(eq(lenderSubmissions.applicationId, req.params.id))
      .orderBy(desc(lenderSubmissions.createdAt));

    // Fetch accepted lender info if present
    let acceptedLender: any = null;
    if (app.acceptedLenderId) {
      const [l] = await db
        .select()
        .from(lenders)
        .where(eq(lenders.id, app.acceptedLenderId))
        .limit(1);
      acceptedLender = l || null;
    }

    res.json({ success: true, application: app, submissions, acceptedLender });
  } catch (error) {
    console.error("Get financing application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/financing/applications — create (dealer_owner or operator_admin)
router.post("/applications", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const canCreate = role === "operator_admin" || role === "dealer_owner";
    if (!canCreate) return res.status(403).json({ success: false, message: "dealer_owner or operator_admin required" });

    const {
      dealershipId,
      customerId,
      unitId,
      lenderId,
      amountRequested,
      downPayment,
      preferredTermMonths,
      creditInfo,
      notes,
    } = req.body;

    if (!customerId || !customerId.trim()) {
      return res.status(400).json({ success: false, message: "customerId is required" });
    }
    if (!amountRequested) {
      return res.status(400).json({ success: false, message: "amountRequested is required" });
    }

    // Dealers are scoped to their own dealership
    const resolvedDealershipId = isOperator(role)
      ? dealershipId || req.user!.dealershipId
      : req.user!.dealershipId;

    if (!resolvedDealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    const [app] = await db
      .insert(financingApplications)
      .values({
        applicationNumber: generateApplicationNumber(),
        dealershipId: resolvedDealershipId,
        customerId: customerId.trim(),
        unitId: unitId || null,
        submittedByUserId: req.user!.id || null,
        amountRequested: String(amountRequested),
        downPayment: downPayment ? String(downPayment) : null,
        preferredTermMonths: preferredTermMonths ? parseInt(preferredTermMonths) : null,
        creditInfo: creditInfo || {},
        status: "submitted",
        acceptedTerms: notes ? { notes } : null,
      })
      .returning();

    // If a lender was specified, auto-create first submission
    if (lenderId) {
      await db.insert(lenderSubmissions).values({
        applicationId: app.id,
        lenderId,
        status: "submitted",
        submittedAt: new Date(),
      }).catch(() => {/* non-fatal */});
    }

    res.status(201).json({ success: true, application: app });
  } catch (error) {
    console.error("Create financing application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/financing/applications/:id — update status and/or accepted terms (operator_admin)
router.patch("/applications/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    if (role !== "operator_admin") {
      return res.status(403).json({ success: false, message: "operator_admin required" });
    }

    const [existing] = await db
      .select()
      .from(financingApplications)
      .where(eq(financingApplications.id, req.params.id))
      .limit(1);

    if (!existing) return res.status(404).json({ success: false, message: "Application not found" });

    const {
      status,
      acceptedLenderId,
      acceptedTerms,
      withdrawalReason,
    } = req.body;

    const validStatuses = ["draft", "submitted", "shopping", "approved", "declined", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (acceptedLenderId !== undefined) updates.acceptedLenderId = acceptedLenderId;
    if (acceptedTerms !== undefined) updates.acceptedTerms = acceptedTerms;
    if (withdrawalReason !== undefined) {
      updates.withdrawalReason = withdrawalReason;
      updates.withdrawnAt = new Date();
    }

    const [updated] = await db
      .update(financingApplications)
      .set(updates)
      .where(eq(financingApplications.id, req.params.id))
      .returning();

    res.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update financing application error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== LENDER SUBMISSIONS ====================

// POST /api/financing/applications/:id/submissions — add lender submission (operator_admin)
router.post(
  "/applications/:id/submissions",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [app] = await db
        .select()
        .from(financingApplications)
        .where(eq(financingApplications.id, req.params.id))
        .limit(1);

      if (!app) return res.status(404).json({ success: false, message: "Application not found" });

      const { lenderId, status, lenderReferenceId } = req.body;
      if (!lenderId) return res.status(400).json({ success: false, message: "lenderId is required" });

      const [sub] = await db
        .insert(lenderSubmissions)
        .values({
          applicationId: req.params.id,
          lenderId,
          status: status || "submitted",
          submittedAt: new Date(),
          lenderReferenceId: lenderReferenceId || null,
        })
        .returning();

      res.status(201).json({ success: true, submission: sub });
    } catch (error) {
      console.error("Create submission error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// PATCH /api/financing/submissions/:subId — update submission result (operator_admin)
router.patch(
  "/submissions/:subId",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(lenderSubmissions)
        .where(eq(lenderSubmissions.id, req.params.subId))
        .limit(1);

      if (!existing) return res.status(404).json({ success: false, message: "Submission not found" });

      const {
        status,
        approvedRate,
        approvedTermMonths,
        approvedAmount,
        approvedConditions,
        declineReason,
        lenderReferenceId,
      } = req.body;

      const validStatuses = [
        "draft", "submitted", "pending_review", "approved", "declined",
        "counter_offered", "withdrawn", "accepted", "funded",
      ];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (status !== undefined) updates.status = status;
      if (approvedRate !== undefined) updates.approvedRate = approvedRate;
      if (approvedTermMonths !== undefined) updates.approvedTermMonths = parseInt(approvedTermMonths);
      if (approvedAmount !== undefined) updates.approvedAmount = approvedAmount;
      if (approvedConditions !== undefined) updates.approvedConditions = approvedConditions;
      if (declineReason !== undefined) updates.declineReason = declineReason;
      if (lenderReferenceId !== undefined) updates.lenderReferenceId = lenderReferenceId;
      if (status && ["approved", "declined", "counter_offered"].includes(status)) {
        updates.respondedAt = new Date();
      }

      const [updated] = await db
        .update(lenderSubmissions)
        .set(updates)
        .where(eq(lenderSubmissions.id, req.params.subId))
        .returning();

      res.json({ success: true, submission: updated });
    } catch (error) {
      console.error("Update submission error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ==================== REPORTS ====================

// GET /api/financing/reports — volume and approval stats
router.get("/reports", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const canView =
      role === "operator_admin" ||
      role === "operator_staff" ||
      role === "financial_manager" ||
      role === "dealer_owner";
    if (!canView) return res.status(403).json({ success: false, message: "Insufficient permissions" });

    const conditions: any[] = [];
    if (!isOperator(role) && req.user!.dealershipId) {
      conditions.push(eq(financingApplications.dealershipId, req.user!.dealershipId));
    }

    const allApps = await db
      .select()
      .from(financingApplications)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(financingApplications.createdAt));

    const now = new Date();
    const mtd = allApps.filter(a => {
      const c = new Date(a.createdAt);
      return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
    });

    const approved = allApps.filter(a => a.status === "approved" || a.status === "completed");
    const submitted = allApps.filter(a => a.status !== "draft");
    const approvalRate =
      submitted.length > 0
        ? ((approved.length / submitted.length) * 100).toFixed(1)
        : "0";

    const totalVolume = approved.reduce(
      (s, a) => s + parseFloat(a.amountRequested || "0"),
      0
    );
    const avgLoan =
      approved.length > 0 ? (totalVolume / approved.length).toFixed(0) : "0";

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const a of allApps) {
      const s = a.status || "draft";
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    }

    // Per-dealer breakdown (operator_admin only)
    let dealerBreakdown: any[] = [];
    if (role === "operator_admin" && allApps.length > 0) {
      const dealerMap = new Map<string, { total: number; approved: number; volume: number }>();
      for (const a of allApps) {
        const entry = dealerMap.get(a.dealershipId) || { total: 0, approved: 0, volume: 0 };
        entry.total++;
        if (a.status === "approved" || a.status === "completed") {
          entry.approved++;
          entry.volume += parseFloat(a.amountRequested || "0");
        }
        dealerMap.set(a.dealershipId, entry);
      }

      const dealerIds = [...dealerMap.keys()];
      const dealerRecords = await db
        .select({ id: dealerships.id, name: dealerships.name })
        .from(dealerships)
        .where(inArray(dealerships.id, dealerIds))
        .catch(() => [] as { id: string; name: string }[]);

      dealerBreakdown = dealerIds
        .map(id => ({
          dealershipId: id,
          dealershipName: dealerRecords.find(d => d.id === id)?.name || id,
          ...dealerMap.get(id)!,
        }))
        .sort((a, b) => b.volume - a.volume);
    }

    res.json({
      success: true,
      summary: {
        totalApplications: allApps.length,
        mtdApplications: mtd.length,
        approvedCount: approved.length,
        approvalRate,
        totalVolume: totalVolume.toFixed(2),
        avgLoan,
      },
      statusBreakdown,
      dealerBreakdown,
      recentApplications: allApps.slice(0, 50),
    });
  } catch (error) {
    console.error("Financing reports error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
