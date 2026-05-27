// server/routes/analytics.ts — Advanced Analytics & BI Dashboard API
// Operator analytics (cross-dealer), Dealer analytics (scoped), CSV export, schedule config

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  claims, dealerships, units, invoices, workOrders, workOrderLabor,
  partsOrders, technicians, users, dealerModuleSubscriptions, serviceModules,
  analyticsReportSchedules,
} from "@shared/schema";
import {
  eq, and, gte, lte, count, avg, sum, sql, desc, isNull, isNotNull,
} from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { z } from "zod";

const router = Router();

// ─── Helper: parse date range ───────────────────────────────────────────────
function parseDateRange(dateFrom: string, dateTo: string) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

// ─── Helper: format month label ─────────────────────────────────────────────
function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short" });
}

// ─── Operator Analytics ──────────────────────────────────────────────────────
// POST /api/analytics/operator
router.post(
  "/operator",
  requireAuth,
  requireRole("operator_admin", "operator_staff"),
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, dealershipId } = req.body as {
        dateFrom?: string;
        dateTo?: string;
        dealershipId?: string;
      };
      const fromStr = dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const toStr = dateTo || new Date().toISOString().slice(0, 10);
      const { from, to } = parseDateRange(fromStr, toStr);

      const dealerFilter = dealershipId
        ? and(gte(claims.createdAt, from), lte(claims.createdAt, to), eq(claims.dealershipId, dealershipId))
        : and(gte(claims.createdAt, from), lte(claims.createdAt, to));

      // ── Claim turnaround ──────────────────────────────────────────────────
      let claimTurnaround = { average: 0, trend: [] as { month: string; avgDays: number }[] };
      try {
        const turnaroundRows = await db
          .select({
            avgDays: avg(
              sql<number>`EXTRACT(EPOCH FROM (${claims.completedAt} - ${claims.submittedAt})) / 86400.0`
            ),
          })
          .from(claims)
          .where(and(
            dealerFilter,
            isNotNull(claims.completedAt),
            isNotNull(claims.submittedAt),
          ));
        claimTurnaround.average = parseFloat(String(turnaroundRows[0]?.avgDays ?? 0)) || 0;

        // Monthly trend
        const trendRows = await db.execute(sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', ${claims.completedAt}), 'Mon YYYY') AS month,
            AVG(EXTRACT(EPOCH FROM (${claims.completedAt} - ${claims.submittedAt})) / 86400.0) AS avg_days
          FROM ${claims}
          WHERE ${claims.completedAt} IS NOT NULL
            AND ${claims.submittedAt} IS NOT NULL
            AND ${claims.createdAt} >= ${from}
            AND ${claims.createdAt} <= ${to}
            ${dealershipId ? sql`AND ${claims.dealershipId} = ${dealershipId}` : sql``}
          GROUP BY DATE_TRUNC('month', ${claims.completedAt})
          ORDER BY DATE_TRUNC('month', ${claims.completedAt})
          LIMIT 12
        `);
        claimTurnaround.trend = (trendRows.rows as any[]).map((r) => ({
          month: String(r.month ?? ""),
          avgDays: parseFloat(String(r.avg_days ?? 0)) || 0,
        }));
      } catch (_e) {
        // Return empty on failure
      }

      // ── Claims by manufacturer ────────────────────────────────────────────
      let claimsByManufacturer: { manufacturer: string; count: number; avgTurnaround: number }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            ${claims.manufacturer} AS manufacturer,
            COUNT(*) AS cnt,
            AVG(EXTRACT(EPOCH FROM (${claims.completedAt} - ${claims.submittedAt})) / 86400.0) AS avg_days
          FROM ${claims}
          WHERE ${claims.createdAt} >= ${from}
            AND ${claims.createdAt} <= ${to}
            ${dealershipId ? sql`AND ${claims.dealershipId} = ${dealershipId}` : sql``}
          GROUP BY ${claims.manufacturer}
          ORDER BY COUNT(*) DESC
          LIMIT 20
        `);
        claimsByManufacturer = (rows.rows as any[]).map((r) => ({
          manufacturer: String(r.manufacturer ?? "Unknown"),
          count: parseInt(String(r.cnt ?? 0), 10),
          avgTurnaround: parseFloat(String(r.avg_days ?? 0)) || 0,
        }));
      } catch (_e) {}

      // ── Dealer activity ───────────────────────────────────────────────────
      let dealerActivity: {
        dealerName: string;
        dealershipId: string;
        claimCount: number;
        unitCount: number;
        revenue: number;
        lastActive: string | null;
      }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            d.id AS dealership_id,
            d.name AS dealer_name,
            COUNT(DISTINCT c.id) AS claim_count,
            COUNT(DISTINCT u.id) AS unit_count,
            COALESCE(SUM(CAST(inv.total AS NUMERIC)), 0) AS revenue,
            MAX(c.updated_at) AS last_active
          FROM ${dealerships} d
          LEFT JOIN ${claims} c ON c.dealership_id = d.id
            AND c.created_at >= ${from}
            AND c.created_at <= ${to}
          LEFT JOIN ${units} u ON u.dealership_id = d.id
          LEFT JOIN ${invoices} inv ON inv.dealership_id = d.id
            AND inv.created_at >= ${from}
            AND inv.created_at <= ${to}
          GROUP BY d.id, d.name
          ORDER BY COUNT(DISTINCT c.id) DESC
          LIMIT 50
        `);
        dealerActivity = (rows.rows as any[]).map((r) => ({
          dealerName: String(r.dealer_name ?? ""),
          dealershipId: String(r.dealership_id ?? ""),
          claimCount: parseInt(String(r.claim_count ?? 0), 10),
          unitCount: parseInt(String(r.unit_count ?? 0), 10),
          revenue: parseFloat(String(r.revenue ?? 0)) || 0,
          lastActive: r.last_active ? new Date(r.last_active).toISOString() : null,
        }));
      } catch (_e) {}

      // ── Revenue by module ─────────────────────────────────────────────────
      let revenueByModule: { module: string; revenue: number; subscriptionCount: number }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            sm.name AS module_name,
            COALESCE(SUM(CAST(dms.monthly_rate AS NUMERIC)), 0) AS revenue,
            COUNT(dms.id) AS sub_count
          FROM ${serviceModules} sm
          LEFT JOIN ${dealerModuleSubscriptions} dms ON dms.module_id = sm.id
            AND dms.status = 'active'
          GROUP BY sm.id, sm.name
          ORDER BY SUM(CAST(dms.monthly_rate AS NUMERIC)) DESC NULLS LAST
        `);
        revenueByModule = (rows.rows as any[]).map((r) => ({
          module: String(r.module_name ?? ""),
          revenue: parseFloat(String(r.revenue ?? 0)) || 0,
          subscriptionCount: parseInt(String(r.sub_count ?? 0), 10),
        }));
      } catch (_e) {}

      // ── Platform growth ───────────────────────────────────────────────────
      let platformGrowth = {
        totalDealers: 0,
        totalUnits: 0,
        totalClaims: 0,
        trend: [] as { month: string; claims: number; units: number }[],
      };
      try {
        const [dealerCount] = await db.select({ count: count() }).from(dealerships);
        const [unitCount] = await db.select({ count: count() }).from(units);
        const [claimCount] = await db
          .select({ count: count() })
          .from(claims)
          .where(and(gte(claims.createdAt, from), lte(claims.createdAt, to)));
        platformGrowth.totalDealers = Number(dealerCount?.count ?? 0);
        platformGrowth.totalUnits = Number(unitCount?.count ?? 0);
        platformGrowth.totalClaims = Number(claimCount?.count ?? 0);

        const trendRows = await db.execute(sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', ${claims.createdAt}), 'Mon YYYY') AS month,
            COUNT(*) AS claim_cnt
          FROM ${claims}
          WHERE ${claims.createdAt} >= ${from}
            AND ${claims.createdAt} <= ${to}
          GROUP BY DATE_TRUNC('month', ${claims.createdAt})
          ORDER BY DATE_TRUNC('month', ${claims.createdAt})
          LIMIT 12
        `);
        platformGrowth.trend = (trendRows.rows as any[]).map((r) => ({
          month: String(r.month ?? ""),
          claims: parseInt(String(r.claim_cnt ?? 0), 10),
          units: 0, // units don't have time-series yet
        }));
      } catch (_e) {}

      // ── Staff efficiency ──────────────────────────────────────────────────
      let staffEfficiency: { staffName: string; claimsProcessed: number }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            CONCAT(u.first_name, ' ', u.last_name) AS staff_name,
            COUNT(c.id) AS claims_processed
          FROM ${users} u
          JOIN ${claims} c ON c.assigned_to_user_id = u.id
          WHERE c.created_at >= ${from}
            AND c.created_at <= ${to}
            AND u.role IN ('operator_admin', 'operator_staff')
          GROUP BY u.id, u.first_name, u.last_name
          ORDER BY COUNT(c.id) DESC
          LIMIT 20
        `);
        staffEfficiency = (rows.rows as any[]).map((r) => ({
          staffName: String(r.staff_name ?? "Unknown"),
          claimsProcessed: parseInt(String(r.claims_processed ?? 0), 10),
        }));
      } catch (_e) {}

      return res.json({
        claimTurnaround,
        claimsByManufacturer,
        dealerActivity,
        revenueByModule,
        platformGrowth,
        staffEfficiency,
      });
    } catch (err) {
      console.error("[analytics/operator]", err);
      return res.status(500).json({ error: "Failed to compute analytics" });
    }
  }
);

// ─── Dealer Analytics ────────────────────────────────────────────────────────
// POST /api/analytics/dealer
router.post(
  "/dealer",
  requireAuth,
  requireRole("dealer_owner", "service_manager", "shop_manager"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = (req as any).user?.dealershipId as string | undefined;
      if (!dealershipId) return res.status(400).json({ error: "No dealership context" });

      const { dateFrom, dateTo } = req.body as { dateFrom?: string; dateTo?: string };
      const fromStr = dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const toStr = dateTo || new Date().toISOString().slice(0, 10);
      const { from, to } = parseDateRange(fromStr, toStr);

      // ── Revenue per unit ──────────────────────────────────────────────────
      let revenuePerUnit: {
        unitId: string; vin: string; unitDesc: string; totalRevenue: number; claimCount: number; woCount: number;
      }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            u.id AS unit_id,
            u.vin,
            CONCAT(COALESCE(CAST(u.year AS TEXT), ''), ' ', COALESCE(u.manufacturer, ''), ' ', COALESCE(u.model, '')) AS unit_desc,
            COALESCE(SUM(CAST(inv.total AS NUMERIC)), 0) AS total_revenue,
            COUNT(DISTINCT c.id) AS claim_count,
            COUNT(DISTINCT wo.id) AS wo_count
          FROM ${units} u
          LEFT JOIN ${claims} c ON c.unit_id = u.id
            AND c.created_at >= ${from}
            AND c.created_at <= ${to}
          LEFT JOIN ${invoices} inv ON inv.claim_id = c.id
          LEFT JOIN ${workOrders} wo ON wo.unit_id = u.id
            AND wo.created_at >= ${from}
            AND wo.created_at <= ${to}
          WHERE u.dealership_id = ${dealershipId}
          GROUP BY u.id, u.vin, u.year, u.manufacturer, u.model
          ORDER BY SUM(CAST(inv.total AS NUMERIC)) DESC NULLS LAST
          LIMIT 50
        `);
        revenuePerUnit = (rows.rows as any[]).map((r) => ({
          unitId: String(r.unit_id ?? ""),
          vin: String(r.vin ?? ""),
          unitDesc: String(r.unit_desc ?? "").trim(),
          totalRevenue: parseFloat(String(r.total_revenue ?? 0)) || 0,
          claimCount: parseInt(String(r.claim_count ?? 0), 10),
          woCount: parseInt(String(r.wo_count ?? 0), 10),
        }));
      } catch (_e) {}

      // ── Technician efficiency ─────────────────────────────────────────────
      let techEfficiency: {
        techId: string; techName: string; wosCompleted: number; avgRepairHours: number;
      }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            t.id AS tech_id,
            CONCAT(u.first_name, ' ', u.last_name) AS tech_name,
            COUNT(wo.id) AS wos_completed,
            AVG(CAST(wol.hours AS NUMERIC)) AS avg_repair_hours
          FROM ${technicians} t
          JOIN ${users} u ON u.id = t.user_id
          LEFT JOIN ${workOrders} wo ON wo.assigned_tech_id = t.id
            AND wo.status = 'completed'
            AND wo.created_at >= ${from}
            AND wo.created_at <= ${to}
          LEFT JOIN ${workOrderLabor} wol ON wol.tech_id = t.id
          WHERE t.dealership_id = ${dealershipId}
          GROUP BY t.id, u.first_name, u.last_name
          ORDER BY COUNT(wo.id) DESC
        `);
        techEfficiency = (rows.rows as any[]).map((r) => ({
          techId: String(r.tech_id ?? ""),
          techName: String(r.tech_name ?? "").trim(),
          wosCompleted: parseInt(String(r.wos_completed ?? 0), 10),
          avgRepairHours: parseFloat(String(r.avg_repair_hours ?? 0)) || 0,
        }));
      } catch (_e) {}

      // ── Claim status breakdown ────────────────────────────────────────────
      let claimStatusBreakdown: { status: string; count: number }[] = [];
      try {
        const rows = await db
          .select({ status: claims.status, count: count() })
          .from(claims)
          .where(and(
            eq(claims.dealershipId, dealershipId),
            gte(claims.createdAt, from),
            lte(claims.createdAt, to),
          ))
          .groupBy(claims.status)
          .orderBy(desc(count()));
        claimStatusBreakdown = rows.map((r) => ({
          status: r.status ?? "unknown",
          count: Number(r.count),
        }));
      } catch (_e) {}

      // ── Monthly overview ──────────────────────────────────────────────────
      let monthlyOverview: { month: string; claims: number; workOrders: number; revenue: number }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', c.created_at), 'Mon YYYY') AS month,
            DATE_TRUNC('month', c.created_at) AS month_ts,
            COUNT(DISTINCT c.id) AS claim_cnt,
            COUNT(DISTINCT wo.id) AS wo_cnt,
            COALESCE(SUM(CAST(inv.total AS NUMERIC)), 0) AS revenue
          FROM ${claims} c
          LEFT JOIN ${workOrders} wo ON wo.dealership_id = ${dealershipId}
            AND DATE_TRUNC('month', wo.created_at) = DATE_TRUNC('month', c.created_at)
          LEFT JOIN ${invoices} inv ON inv.claim_id = c.id
          WHERE c.dealership_id = ${dealershipId}
            AND c.created_at >= ${from}
            AND c.created_at <= ${to}
          GROUP BY DATE_TRUNC('month', c.created_at)
          ORDER BY DATE_TRUNC('month', c.created_at)
          LIMIT 12
        `);
        monthlyOverview = (rows.rows as any[]).map((r) => ({
          month: String(r.month ?? ""),
          claims: parseInt(String(r.claim_cnt ?? 0), 10),
          workOrders: parseInt(String(r.wo_cnt ?? 0), 10),
          revenue: parseFloat(String(r.revenue ?? 0)) || 0,
        }));
      } catch (_e) {}

      // ── Warranty claim rates ──────────────────────────────────────────────
      let warrantyClaimRates: { make: string; model: string; year: number; claimsPerUnit: number }[] = [];
      try {
        const rows = await db.execute(sql`
          SELECT
            u.manufacturer AS make,
            u.model,
            u.year,
            COUNT(c.id)::float / NULLIF(COUNT(DISTINCT u.id), 0) AS claims_per_unit
          FROM ${units} u
          LEFT JOIN ${claims} c ON c.unit_id = u.id
            AND c.type IN ('warranty', 'extended_warranty')
            AND c.created_at >= ${from}
            AND c.created_at <= ${to}
          WHERE u.dealership_id = ${dealershipId}
          GROUP BY u.manufacturer, u.model, u.year
          ORDER BY (COUNT(c.id)::float / NULLIF(COUNT(DISTINCT u.id), 0)) DESC NULLS LAST
          LIMIT 30
        `);
        warrantyClaimRates = (rows.rows as any[]).map((r) => ({
          make: String(r.make ?? ""),
          model: String(r.model ?? ""),
          year: parseInt(String(r.year ?? 0), 10),
          claimsPerUnit: parseFloat(String(r.claims_per_unit ?? 0)) || 0,
        }));
      } catch (_e) {}

      // ── Parts velocity ────────────────────────────────────────────────────
      let partsVelocity = { avgDaysToReceive: 0, trend: [] as { month: string; avgDays: number }[] };
      try {
        const rows = await db.execute(sql`
          SELECT
            AVG(EXTRACT(EPOCH FROM (received_at - created_at)) / 86400.0) AS avg_days
          FROM ${partsOrders}
          WHERE dealership_id = ${dealershipId}
            AND received_at IS NOT NULL
            AND created_at >= ${from}
            AND created_at <= ${to}
        `);
        partsVelocity.avgDaysToReceive = parseFloat(String((rows.rows[0] as any)?.avg_days ?? 0)) || 0;

        const trendRows = await db.execute(sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
            AVG(EXTRACT(EPOCH FROM (received_at - created_at)) / 86400.0) AS avg_days
          FROM ${partsOrders}
          WHERE dealership_id = ${dealershipId}
            AND received_at IS NOT NULL
            AND created_at >= ${from}
            AND created_at <= ${to}
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at)
          LIMIT 12
        `);
        partsVelocity.trend = (trendRows.rows as any[]).map((r) => ({
          month: String(r.month ?? ""),
          avgDays: parseFloat(String(r.avg_days ?? 0)) || 0,
        }));
      } catch (_e) {}

      // ── Customer satisfaction — from service appointments rating ──────────
      let customerSatisfaction = { avgRating: 0, totalReviews: 0 };
      try {
        const rows = await db.execute(sql`
          SELECT
            AVG(CAST(client_rating AS NUMERIC)) AS avg_rating,
            COUNT(client_rating) AS total_reviews
          FROM service_appointments
          WHERE dealership_id = ${dealershipId}
            AND client_rating IS NOT NULL
            AND created_at >= ${from}
            AND created_at <= ${to}
        `);
        customerSatisfaction.avgRating = parseFloat(String((rows.rows[0] as any)?.avg_rating ?? 0)) || 0;
        customerSatisfaction.totalReviews = parseInt(String((rows.rows[0] as any)?.total_reviews ?? 0), 10);
      } catch (_e) {}

      return res.json({
        revenuePerUnit,
        techEfficiency,
        claimStatusBreakdown,
        monthlyOverview,
        warrantyClaimRates,
        partsVelocity,
        customerSatisfaction,
      });
    } catch (err) {
      console.error("[analytics/dealer]", err);
      return res.status(500).json({ error: "Failed to compute dealer analytics" });
    }
  }
);

// ─── Export ──────────────────────────────────────────────────────────────────
// GET /api/analytics/export
router.get(
  "/export",
  requireAuth,
  requireRole("operator_admin", "operator_staff", "dealer_owner", "service_manager", "shop_manager"),
  async (req: Request, res: Response) => {
    try {
      const { reportType = "dealer", dateFrom, dateTo, format = "json" } = req.query as Record<string, string>;
      const fromStr = dateFrom || new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const toStr = dateTo || new Date().toISOString().slice(0, 10);
      const { from, to } = parseDateRange(fromStr, toStr);

      const dealershipId = (req as any).user?.dealershipId as string | undefined;

      // Fetch a simplified claim list for export
      const rows = await db
        .select({
          claimNumber: claims.claimNumber,
          manufacturer: claims.manufacturer,
          type: claims.type,
          status: claims.status,
          estimatedAmount: claims.estimatedAmount,
          approvedAmount: claims.approvedAmount,
          submittedAt: claims.submittedAt,
          completedAt: claims.completedAt,
          createdAt: claims.createdAt,
        })
        .from(claims)
        .where(
          reportType === "operator"
            ? and(gte(claims.createdAt, from), lte(claims.createdAt, to))
            : and(
                eq(claims.dealershipId, dealershipId!),
                gte(claims.createdAt, from),
                lte(claims.createdAt, to),
              )
        )
        .orderBy(desc(claims.createdAt))
        .limit(1000);

      if (format === "csv") {
        const headers = ["Claim #", "Manufacturer", "Type", "Status", "Est Amount", "Approved Amount", "Submitted", "Completed", "Created"];
        const csvLines = [
          headers.join(","),
          ...rows.map((r) => [
            r.claimNumber,
            r.manufacturer,
            r.type,
            r.status,
            r.estimatedAmount ?? "",
            r.approvedAmount ?? "",
            r.submittedAt ? new Date(r.submittedAt).toISOString().slice(0, 10) : "",
            r.completedAt ? new Date(r.completedAt).toISOString().slice(0, 10) : "",
            new Date(r.createdAt).toISOString().slice(0, 10),
          ].map((v) => {
            const s = String(v ?? "");
            return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
          }).join(",")),
        ];
        const csv = csvLines.join("\r\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="analytics-export-${fromStr}-${toStr}.csv"`);
        return res.send(csv);
      }

      return res.json({ data: rows, dateFrom: fromStr, dateTo: toStr, reportType });
    } catch (err) {
      console.error("[analytics/export]", err);
      return res.status(500).json({ error: "Export failed" });
    }
  }
);

// ─── Schedule — GET ──────────────────────────────────────────────────────────
router.get(
  "/schedule",
  requireAuth,
  requireRole("dealer_owner"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = (req as any).user?.dealershipId as string | undefined;
      if (!dealershipId) return res.status(400).json({ error: "No dealership context" });

      const [schedule] = await db
        .select()
        .from(analyticsReportSchedules)
        .where(eq(analyticsReportSchedules.dealershipId, dealershipId))
        .limit(1);

      return res.json({ schedule: schedule ?? null });
    } catch (err) {
      console.error("[analytics/schedule GET]", err);
      return res.status(500).json({ error: "Failed to fetch schedule" });
    }
  }
);

// ─── Schedule — POST ─────────────────────────────────────────────────────────
router.post(
  "/schedule",
  requireAuth,
  requireRole("dealer_owner"),
  async (req: Request, res: Response) => {
    try {
      const dealershipId = (req as any).user?.dealershipId as string | undefined;
      if (!dealershipId) return res.status(400).json({ error: "No dealership context" });

      const bodySchema = z.object({
        frequency: z.enum(["daily", "weekly", "monthly"]),
        recipientEmails: z.array(z.string().email()).min(1),
        reportSections: z.array(z.string()),
        isActive: z.boolean().optional(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });

      const { frequency, recipientEmails, reportSections, isActive = true } = parsed.data;

      // Upsert
      const [existing] = await db
        .select({ id: analyticsReportSchedules.id })
        .from(analyticsReportSchedules)
        .where(eq(analyticsReportSchedules.dealershipId, dealershipId))
        .limit(1);

      if (existing) {
        await db
          .update(analyticsReportSchedules)
          .set({ frequency, recipientEmails, reportSections, isActive, updatedAt: new Date() })
          .where(eq(analyticsReportSchedules.dealershipId, dealershipId));
      } else {
        await db.insert(analyticsReportSchedules).values({
          dealershipId,
          frequency,
          recipientEmails,
          reportSections,
          isActive,
        });
      }

      const [updated] = await db
        .select()
        .from(analyticsReportSchedules)
        .where(eq(analyticsReportSchedules.dealershipId, dealershipId))
        .limit(1);

      return res.json({ schedule: updated });
    } catch (err) {
      console.error("[analytics/schedule POST]", err);
      return res.status(500).json({ error: "Failed to save schedule" });
    }
  }
);

export default router;
