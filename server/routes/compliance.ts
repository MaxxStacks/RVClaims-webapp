// server/routes/compliance.ts — Compliance Manager API
// Endpoints for compliance checks, exceptions, reports, templates, aggregate stats

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  complianceTemplates, complianceChecks, complianceReports, dealerships,
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { z } from "zod";
import {
  runComplianceCheck, generateAuditReport,
  getJurisdictions, getJurisdictionLabel,
} from "../lib/complianceEngine";
import { getDealerCountry } from "../lib/locale";

const router = Router();

// ── Helper: get dealershipId for a dealer user or from a query param ─────────
function resolveDealershipId(req: Request): string | null {
  const user = (req as any).user;
  if (user?.role === "operator_admin" || user?.role === "operator_staff") {
    return (req.query.dealershipId as string) || null;
  }
  return user?.dealershipId || null;
}

// ─── POST /api/compliance/check ──────────────────────────────────────────────
// Run compliance check for dealer, return results
router.post(
  "/check",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

      const result = await runComplianceCheck(dealershipId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error("[compliance check]", err);
      res.status(500).json({ error: err.message || "Compliance check failed" });
    }
  }
);

// ─── GET /api/compliance/status ──────────────────────────────────────────────
// Load latest compliance check status from DB (no re-run)
router.get(
  "/status",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

      const checks = await db
        .select({
          id: complianceChecks.id,
          templateId: complianceChecks.templateId,
          status: complianceChecks.status,
          details: complianceChecks.details,
          resolvedAt: complianceChecks.resolvedAt,
          resolutionNote: complianceChecks.resolutionNote,
          checkedAt: complianceChecks.checkedAt,
          requirementName: complianceTemplates.requirementName,
          severity: complianceTemplates.severity,
          category: complianceTemplates.category,
          verificationMethod: complianceTemplates.verificationMethod,
          documentRequired: complianceTemplates.documentRequired,
          regulatorName: complianceTemplates.regulatorName,
          jurisdiction: complianceTemplates.jurisdiction,
        })
        .from(complianceChecks)
        .innerJoin(complianceTemplates, eq(complianceChecks.templateId, complianceTemplates.id))
        .where(eq(complianceChecks.dealershipId, dealershipId))
        .orderBy(desc(complianceChecks.checkedAt));

      const total = checks.length;
      const compliant = checks.filter(c => c.status === "compliant" || c.status === "waived").length;
      const score = total > 0 ? Math.round((compliant / total) * 100) : 100;
      const lastChecked = checks.length > 0 ? checks[0].checkedAt : null;

      // Jurisdiction label
      const [dealership] = await db
        .select()
        .from(dealerships)
        .where(eq(dealerships.id, dealershipId))
        .limit(1);

      const jurisdictionLabel = dealership ? getJurisdictionLabel(dealership) : "Unknown";

      res.json({ success: true, checks, score, compliant, total, lastChecked, jurisdictionLabel });
    } catch (err: any) {
      console.error("[compliance status]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/compliance/exceptions ──────────────────────────────────────────
// non_compliant + pending_review items sorted by severity
router.get(
  "/exceptions",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

      const exceptions = await db
        .select({
          id: complianceChecks.id,
          templateId: complianceChecks.templateId,
          status: complianceChecks.status,
          details: complianceChecks.details,
          checkedAt: complianceChecks.checkedAt,
          requirementName: complianceTemplates.requirementName,
          requirementDescription: complianceTemplates.requirementDescription,
          severity: complianceTemplates.severity,
          category: complianceTemplates.category,
          verificationMethod: complianceTemplates.verificationMethod,
          documentRequired: complianceTemplates.documentRequired,
          regulatorName: complianceTemplates.regulatorName,
          jurisdiction: complianceTemplates.jurisdiction,
        })
        .from(complianceChecks)
        .innerJoin(complianceTemplates, eq(complianceChecks.templateId, complianceTemplates.id))
        .where(
          and(
            eq(complianceChecks.dealershipId, dealershipId),
            inArray(complianceChecks.status, ["non_compliant", "pending_review"])
          )
        );

      // Sort by severity
      const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
      exceptions.sort((a, b) =>
        (SEV_ORDER[a.severity as keyof typeof SEV_ORDER] ?? 3) -
        (SEV_ORDER[b.severity as keyof typeof SEV_ORDER] ?? 3)
      );

      res.json({ success: true, exceptions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/compliance/exceptions/:id ────────────────────────────────────
// Resolve exception (dealer_owner only)
const resolveSchema = z.object({
  resolutionNote: z.string().min(1, "Resolution note is required"),
});

router.patch(
  "/exceptions/:id",
  requireAuth,
  requireRole("dealer_owner", "operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsed = resolveSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Resolution note is required" });
      }

      const user = (req as any).user;

      const [updated] = await db
        .update(complianceChecks)
        .set({
          status: "compliant",
          resolvedAt: new Date(),
          resolvedBy: user.id,
          resolutionNote: parsed.data.resolutionNote,
        })
        .where(eq(complianceChecks.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Exception not found" });

      res.json({ success: true, check: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/compliance/report ─────────────────────────────────────────────
// Generate audit report, save to compliance_reports
const reportSchema = z.object({
  reportType: z.enum(["full_audit", "document_completeness", "financial", "custom"]).default("full_audit"),
  jurisdiction: z.string().optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
});

router.post(
  "/report",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

      const parsed = reportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid report parameters", issues: parsed.error.issues });
      }

      const { reportType, jurisdiction, dateFrom, dateTo } = parsed.data;
      const user = (req as any).user;

      const [dealership] = await db
        .select()
        .from(dealerships)
        .where(eq(dealerships.id, dealershipId))
        .limit(1);

      const resolvedJurisdiction = jurisdiction || (dealership ? getJurisdictions(dealership)[0] : "FEDERAL");

      const reportData = await generateAuditReport(
        dealershipId,
        resolvedJurisdiction,
        new Date(dateFrom),
        new Date(dateTo)
      );

      const [saved] = await db
        .insert(complianceReports)
        .values({
          dealershipId,
          reportType,
          jurisdiction: resolvedJurisdiction,
          dateFrom,
          dateTo,
          generatedBy: user.id,
          reportData,
        })
        .returning();

      res.json({ success: true, report: saved });
    } catch (err: any) {
      console.error("[compliance report]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/compliance/reports ─────────────────────────────────────────────
// List saved reports for dealer
router.get(
  "/reports",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

      const reports = await db
        .select()
        .from(complianceReports)
        .where(eq(complianceReports.dealershipId, dealershipId))
        .orderBy(desc(complianceReports.createdAt));

      res.json({ success: true, reports });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/compliance/reports/:id ─────────────────────────────────────────
// Single report detail
router.get(
  "/reports/:id",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const [report] = await db
        .select()
        .from(complianceReports)
        .where(eq(complianceReports.id, req.params.id))
        .limit(1);

      if (!report) return res.status(404).json({ error: "Report not found" });

      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/compliance/templates ───────────────────────────────────────────
// Templates for dealer's jurisdiction (auto-detected)
router.get(
  "/templates",
  requireAuth,
  requireRole("dealer_owner", "operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = resolveDealershipId(req);
      if (!dealershipId) {
        // Operator admin: return all templates
        const templates = await db
          .select()
          .from(complianceTemplates)
          .orderBy(complianceTemplates.country, complianceTemplates.jurisdiction);
        return res.json({ success: true, templates, jurisdictionLabel: "All Jurisdictions" });
      }

      const [dealership] = await db
        .select()
        .from(dealerships)
        .where(eq(dealerships.id, dealershipId))
        .limit(1);

      if (!dealership) return res.status(404).json({ error: "Dealership not found" });

      const country = getDealerCountry(dealership);
      const jurisdictions = getJurisdictions(dealership);
      const jurisdictionLabel = getJurisdictionLabel(dealership);

      const templates = await db
        .select()
        .from(complianceTemplates)
        .where(
          and(
            eq(complianceTemplates.country, country),
            eq(complianceTemplates.isActive, true),
            inArray(complianceTemplates.jurisdiction, jurisdictions)
          )
        )
        .orderBy(complianceTemplates.jurisdiction, complianceTemplates.severity);

      res.json({ success: true, templates, jurisdictionLabel });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── POST /api/compliance/templates ──────────────────────────────────────────
// Create template (operator_admin only)
const templateSchema = z.object({
  country: z.string().min(2),
  jurisdiction: z.string().min(1),
  regulatorName: z.string().min(1),
  regulatorFullName: z.string().min(1),
  category: z.enum(["dealer_licensing", "disclosure", "advertising", "consumer_protection", "warranty", "financial", "privacy", "safety"]),
  requirementName: z.string().min(1),
  requirementDescription: z.string().min(1),
  documentRequired: z.string().nullable().optional(),
  verificationMethod: z.enum(["document_check", "field_check", "manual_review"]),
  verificationField: z.string().nullable().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  isActive: z.boolean().optional(),
});

router.post(
  "/templates",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const parsed = templateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid template data", issues: parsed.error.issues });
      }

      const [tpl] = await db
        .insert(complianceTemplates)
        .values({ ...parsed.data, isActive: parsed.data.isActive ?? true })
        .returning();

      res.status(201).json({ success: true, template: tpl });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── PATCH /api/compliance/templates/:id ─────────────────────────────────────
// Update template (operator_admin only)
router.patch(
  "/templates/:id",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const parsed = templateSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid template data", issues: parsed.error.issues });
      }

      const [updated] = await db
        .update(complianceTemplates)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(complianceTemplates.id, req.params.id))
        .returning();

      if (!updated) return res.status(404).json({ error: "Template not found" });

      res.json({ success: true, template: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── GET /api/compliance/aggregate ───────────────────────────────────────────
// All dealers' compliance scores (operator_admin only)
router.get(
  "/aggregate",
  requireAuth,
  requireRole("operator_admin"),
  async (_req: Request, res: Response) => {
    try {
      const allDealerships = await db
        .select({ id: dealerships.id, name: dealerships.name, province: dealerships.province, country: dealerships.country })
        .from(dealerships)
        .where(eq(dealerships.status, "active"));

      const results: Array<{
        dealershipId: string;
        dealershipName: string;
        jurisdiction: string;
        score: number;
        compliant: number;
        total: number;
        exceptions: number;
        lastChecked: Date | null;
      }> = [];

      for (const dealer of allDealerships) {
        const checks = await db
          .select({
            status: complianceChecks.status,
            checkedAt: complianceChecks.checkedAt,
          })
          .from(complianceChecks)
          .where(eq(complianceChecks.dealershipId, dealer.id));

        if (checks.length === 0) {
          results.push({
            dealershipId: dealer.id,
            dealershipName: dealer.name,
            jurisdiction: getJurisdictionLabel(dealer),
            score: 0,
            compliant: 0,
            total: 0,
            exceptions: 0,
            lastChecked: null,
          });
          continue;
        }

        const total = checks.length;
        const compliant = checks.filter(c => c.status === "compliant" || c.status === "waived").length;
        const exceptions = checks.filter(c => c.status === "non_compliant" || c.status === "pending_review").length;
        const score = Math.round((compliant / total) * 100);
        const sorted = [...checks].sort((a, b) => (b.checkedAt?.getTime() ?? 0) - (a.checkedAt?.getTime() ?? 0));
        const lastChecked = sorted[0]?.checkedAt ?? null;

        results.push({
          dealershipId: dealer.id,
          dealershipName: dealer.name,
          jurisdiction: getJurisdictionLabel(dealer),
          score,
          compliant,
          total,
          exceptions,
          lastChecked,
        });
      }

      // Sort worst first
      results.sort((a, b) => a.score - b.score);

      const avgScore = results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
        : 0;
      const criticalDealers = results.filter(r => r.score < 60).length;
      const totalChecks = results.reduce((s, r) => s + r.total, 0);

      res.json({ success: true, dealers: results, stats: { avgScore, criticalDealers, totalChecks } });
    } catch (err: any) {
      console.error("[compliance aggregate]", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
