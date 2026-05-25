// server/routes/reports.ts — Revenue reporting endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { invoices, dealerships } from "@shared/schema";
import { eq, and, gte, lte, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const router = Router();

// Roles that can access financial reports
const REPORT_ROLES = ["operator_admin", "financial_manager"] as const;

// ==================== GET /api/reports/revenue ====================
// Query params: dealershipId, from (ISO date), to (ISO date)
router.get("/revenue", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role;
    const isOperatorAdmin = role === "operator_admin";
    // financial_manager is a UI role; in DB it may be stored as dealer_owner
    // dealer_owner with canViewFinancials=true also gets read-only revenue access
    const isFinancialManager = (role as string) === "financial_manager" || role === "dealer_owner";

    if (!isOperatorAdmin && !isFinancialManager) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const { dealershipId, from, to } = req.query as Record<string, string>;

    // Build WHERE conditions
    const conditions: any[] = [];
    if (dealershipId && isOperatorAdmin) conditions.push(eq(invoices.dealershipId, dealershipId));
    if (from) conditions.push(gte(invoices.createdAt, new Date(from)));
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(invoices.createdAt, toDate));
    }

    // For non-operator roles: always scope to their own dealership
    if (!isOperatorAdmin && req.user!.dealershipId) {
      conditions.push(eq(invoices.dealershipId, req.user!.dealershipId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // All invoices for aggregation
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.createdAt));

    // Aggregate totals
    const totalRevenue = allInvoices
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

    const outstanding = allInvoices
      .filter(i => ["sent", "pending", "overdue"].includes(i.status || ""))
      .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

    // Month-to-date collected
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const collectedMTD = allInvoices
      .filter(i => i.status === "paid" && i.paidAt && new Date(i.paidAt) >= mtdStart)
      .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

    // Breakdown by invoice count status
    const statusBreakdown: Record<string, { count: number; total: number }> = {};
    for (const inv of allInvoices) {
      const s = inv.status || "unknown";
      if (!statusBreakdown[s]) statusBreakdown[s] = { count: 0, total: 0 };
      statusBreakdown[s].count++;
      statusBreakdown[s].total += parseFloat(inv.total || "0");
    }

    // Per-dealer revenue (operator only)
    let dealerBreakdown: Array<{ dealershipId: string; dealershipName: string; total: number; count: number }> = [];

    if (isOperatorAdmin) {
      const dealerMap = new Map<string, { total: number; count: number }>();
      for (const inv of allInvoices.filter(i => i.status === "paid")) {
        const existing = dealerMap.get(inv.dealershipId) || { total: 0, count: 0 };
        existing.total += parseFloat(inv.total || "0");
        existing.count++;
        dealerMap.set(inv.dealershipId, existing);
      }

      if (dealerMap.size > 0) {
        const dealerIds = [...dealerMap.keys()];
        const dealerRecords = await db
          .select({ id: dealerships.id, name: dealerships.name })
          .from(dealerships)
          .where(inArray(dealerships.id, dealerIds))
          .catch(() => [] as { id: string; name: string }[]);

        dealerBreakdown = dealerIds.map(id => ({
          dealershipId: id,
          dealershipName: dealerRecords.find(d => d.id === id)?.name || id,
          total: dealerMap.get(id)!.total,
          count: dealerMap.get(id)!.count,
        })).sort((a, b) => b.total - a.total);
      }
    }

    res.json({
      success: true,
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        outstanding: outstanding.toFixed(2),
        collectedMTD: collectedMTD.toFixed(2),
        totalInvoices: allInvoices.length,
        paidInvoices: allInvoices.filter(i => i.status === "paid").length,
      },
      statusBreakdown,
      dealerBreakdown,
      invoices: allInvoices.slice(0, 100),
    });
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
