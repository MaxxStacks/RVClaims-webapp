// server/routes/fi.ts — F&I dedicated routes (products catalog + commission report)
//
// Products: served from the existing `products` table, filtered by category='service_addon'
// Deals:    served from the existing `fiDeals` table (core CRUD already in services.ts)
// This file adds:
//   GET  /api/fi/products              — catalog (all roles with fi access)
//   POST /api/fi/products              — create product (operator_admin only)
//   PATCH /api/fi/products/:id         — update (operator_admin only)
//   DELETE /api/fi/products/:id        — deactivate (operator_admin only)
//   PATCH /api/fi/deals/:id/status     — status transition (role-scoped)
//   GET  /api/fi/reports/commission    — commission summary (operator_admin, financial_manager)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { products, fiDeals, dealerships } from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

// ─── Roles that may access F&I catalog ───────────────────────────────────────
const FI_ROLES = [
  "operator_admin", "operator_staff",
  "dealer_owner", "dealer_staff",
  "financial_manager",
] as const;

// ─── GET /api/fi/products ─────────────────────────────────────────────────────
// Returns all active service_addon products (F&I catalog).
// All F&I-enabled roles can view.
router.get("/products", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const hasAccess = (FI_ROLES as readonly string[]).includes(role);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const includeInactive = role === "operator_admin" && req.query.includeInactive === "true";

    const conditions: any[] = [eq(products.category, "service_addon")];
    if (!includeInactive) conditions.push(eq(products.isActive, true));

    const items = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name);

    res.json({ success: true, products: items });
  } catch (error) {
    console.error("List F&I products error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── POST /api/fi/products ────────────────────────────────────────────────────
// Create a new F&I product. operator_admin only.
router.post(
  "/products",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const { name, description, price, billingFrequency, taxRate } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Product name is required" });
      }

      const [item] = await db
        .insert(products)
        .values({
          name,
          category: "service_addon",
          description: description || null,
          price: price || null,
          pricingType: "fixed",
          billingFrequency: billingFrequency || "one_time",
          taxRate: taxRate || "hst_13",
          isActive: true,
        })
        .returning();

      res.status(201).json({ success: true, product: item });
    } catch (error) {
      console.error("Create F&I product error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ─── PATCH /api/fi/products/:id ───────────────────────────────────────────────
// Update a product. operator_admin only.
router.patch(
  "/products/:id",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, req.params.id), eq(products.category, "service_addon")))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const allowed = ["name", "description", "price", "billingFrequency", "taxRate", "isActive"];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const [updated] = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, req.params.id))
        .returning();

      res.json({ success: true, product: updated });
    } catch (error) {
      console.error("Update F&I product error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ─── DELETE /api/fi/products/:id ──────────────────────────────────────────────
// Soft-delete (set isActive=false). operator_admin only.
router.delete(
  "/products/:id",
  requireAuth,
  requireRole("operator_admin"),
  async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, req.params.id), eq(products.category, "service_addon")))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      await db
        .update(products)
        .set({ isActive: false })
        .where(eq(products.id, req.params.id));

      res.json({ success: true, message: "Product deactivated" });
    } catch (error) {
      console.error("Deactivate F&I product error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ─── PATCH /api/fi/deals/:id/status ──────────────────────────────────────────
// Transition a deal status.
// operator_admin: any → any
// dealer_owner: flagged → recommending, recommending → presented, presented → completed
// operator_staff: same as dealer_owner
router.patch(
  "/deals/:id/status",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const role = req.user!.role as string;
      const hasAccess = (FI_ROLES as readonly string[]).includes(role);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const [existing] = await db
        .select()
        .from(fiDeals)
        .where(eq(fiDeals.id, req.params.id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, message: "Deal not found" });
      }

      // Dealer roles must own this deal
      if (!OPERATOR_ROLES.includes(role as any)) {
        if (existing.dealershipId !== req.user!.dealershipId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }

      const { status, dealerNotes, productsOffered, productsSold, revenue } = req.body;
      const validStatuses = ["flagged", "recommending", "presented", "completed"];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (status) updates.status = status;
      if (dealerNotes !== undefined) updates.dealerNotes = dealerNotes;
      if (productsOffered !== undefined) updates.productsOffered = productsOffered;
      if (productsSold !== undefined) updates.productsSold = productsSold;
      if (revenue !== undefined) updates.revenue = revenue;

      const [updated] = await db
        .update(fiDeals)
        .set(updates)
        .where(eq(fiDeals.id, req.params.id))
        .returning();

      res.json({ success: true, fiDeal: updated });
    } catch (error) {
      console.error("Update F&I deal status error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ─── GET /api/fi/reports/commission ──────────────────────────────────────────
// Commission / revenue summary by deal + per-dealer breakdown.
// operator_admin and financial_manager only.
router.get(
  "/reports/commission",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const role = req.user!.role as string;
      const isOperatorAdmin = role === "operator_admin";
      const isFinancialManager = role === "financial_manager" || role === "dealer_owner";

      if (!isOperatorAdmin && !isFinancialManager) {
        return res.status(403).json({ success: false, message: "Insufficient permissions" });
      }

      // Build scope
      const conditions: any[] = [];
      if (!isOperatorAdmin && req.user!.dealershipId) {
        conditions.push(eq(fiDeals.dealershipId, req.user!.dealershipId));
      }

      const allDeals = await db
        .select()
        .from(fiDeals)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(fiDeals.createdAt));

      const totalDeals = allDeals.length;
      const completedDeals = allDeals.filter(d => d.status === "completed");
      const totalRevenue = completedDeals.reduce(
        (sum, d) => sum + parseFloat(d.revenue || "0"),
        0
      );
      const totalProductsSold = completedDeals.reduce(
        (sum, d) => sum + (d.productsSold || 0),
        0
      );
      const avgProductsPerDeal =
        completedDeals.length > 0
          ? (totalProductsSold / completedDeals.length).toFixed(1)
          : "0";

      // Status breakdown
      const statusBreakdown: Record<string, { count: number; revenue: number }> = {};
      for (const deal of allDeals) {
        const s = deal.status || "flagged";
        if (!statusBreakdown[s]) statusBreakdown[s] = { count: 0, revenue: 0 };
        statusBreakdown[s].count++;
        statusBreakdown[s].revenue += parseFloat(deal.revenue || "0");
      }

      // Per-dealer breakdown (operator_admin only)
      let dealerBreakdown: Array<{
        dealershipId: string;
        dealershipName: string;
        totalDeals: number;
        completedDeals: number;
        revenue: number;
      }> = [];

      if (isOperatorAdmin) {
        const dealerMap = new Map<
          string,
          { totalDeals: number; completedDeals: number; revenue: number }
        >();
        for (const deal of allDeals) {
          const existing = dealerMap.get(deal.dealershipId) || {
            totalDeals: 0,
            completedDeals: 0,
            revenue: 0,
          };
          existing.totalDeals++;
          if (deal.status === "completed") {
            existing.completedDeals++;
            existing.revenue += parseFloat(deal.revenue || "0");
          }
          dealerMap.set(deal.dealershipId, existing);
        }

        if (dealerMap.size > 0) {
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
            .sort((a, b) => b.revenue - a.revenue);
        }
      }

      res.json({
        success: true,
        summary: {
          totalDeals,
          completedDeals: completedDeals.length,
          totalRevenue: totalRevenue.toFixed(2),
          totalProductsSold,
          avgProductsPerDeal,
        },
        statusBreakdown,
        dealerBreakdown,
        recentDeals: allDeals.slice(0, 50),
      });
    } catch (error) {
      console.error("F&I commission report error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

export default router;
