// server/routes/dealJackets.ts — Deal Jacket API endpoints
//
// GET    /api/deal-jackets                        — list jackets (role-filtered)
// GET    /api/deal-jackets/:id                    — full jacket detail
// POST   /api/deal-jackets                        — create jacket (calls createDealJacket)
// PATCH  /api/deal-jackets/:id                    — update notes/status/saleDate
// POST   /api/deal-jackets/:id/documents          — add document to jacket
// DELETE /api/deal-jackets/:id/documents/:docId   — remove document from jacket
// GET    /api/deal-jackets/by-unit/:unitId         — all jackets for a unit
// GET    /api/deal-jackets/by-customer/:customerId — all jackets for a customer
// GET    /api/deal-jackets/:id/permissions         — permissions for current user's role
// PATCH  /api/deal-jackets/permissions             — update a permission (dealer_owner)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  dealJackets,
  dealJacketDocuments,
  dealJacketPermissions,
  signatures,
  units,
  users,
} from "@shared/schema";
import { eq, and, desc, ilike, or, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { createDealJacket, recalculateCompleteness } from "../lib/dealJacket";

const router = Router();

// ─── Helper: get dealershipId for the current user ────────────────────────────
function getUserDealershipId(req: Request): string | null {
  return (req.user as any)?.dealershipId || null;
}

function isOperator(req: Request): boolean {
  const role = (req.user as any)?.role;
  return role === "operator_admin" || role === "operator_staff";
}

function isDealerOwner(req: Request): boolean {
  return (req.user as any)?.role === "dealer_owner";
}

// ─── GET /api/deal-jackets ────────────────────────────────────────────────────
router.get("/deal-jackets", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit: limitParam = "20",
      search = "",
      status,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limitParam, 10)));
    const offset = (pageNum - 1) * pageSize;

    // Build base query with joins
    let rows = await db
      .select({
        jacket: dealJackets,
        unitVin: units.vin,
        unitYear: units.year,
        unitMake: units.manufacturer,
        unitModel: units.model,
        customerFirst: users.firstName,
        customerLast: users.lastName,
        customerEmail: users.email,
      })
      .from(dealJackets)
      .leftJoin(units, eq(dealJackets.unitId, units.id))
      .leftJoin(users, eq(dealJackets.customerId, users.id))
      .orderBy(desc(dealJackets.createdAt));

    // Scope to dealership for non-operators
    if (!isOperator(req)) {
      const dealershipId = getUserDealershipId(req);
      if (!dealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      rows = rows.filter((r) => r.jacket.dealershipId === dealershipId);
    }

    // Filter by status
    if (status) {
      rows = rows.filter((r) => r.jacket.status === status);
    }

    // Search by customer name or VIN
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => {
        const name = `${r.customerFirst || ""} ${r.customerLast || ""}`.toLowerCase();
        const vin = (r.unitVin || "").toLowerCase();
        return name.includes(q) || vin.includes(q);
      });
    }

    const total = rows.length;
    const sliced = rows.slice(offset, offset + pageSize);

    const jackets = sliced.map((r) => ({
      ...r.jacket,
      customerName: r.customerFirst
        ? `${r.customerFirst} ${r.customerLast}`.trim()
        : r.customerEmail || "Unknown",
      unitVin: r.unitVin,
      unitLabel: [r.unitYear, r.unitMake, r.unitModel].filter(Boolean).join(" "),
    }));

    res.json({ success: true, jackets, total, page: pageNum, limit: pageSize });
  } catch (err: any) {
    console.error("List deal jackets error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /api/deal-jackets/by-unit/:unitId ────────────────────────────────────
router.get("/deal-jackets/by-unit/:unitId", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        jacket: dealJackets,
        customerFirst: users.firstName,
        customerLast: users.lastName,
        customerEmail: users.email,
      })
      .from(dealJackets)
      .leftJoin(users, eq(dealJackets.customerId, users.id))
      .where(eq(dealJackets.unitId, req.params.unitId))
      .orderBy(desc(dealJackets.createdAt));

    // Scope check for dealer role
    if (!isOperator(req)) {
      const dealershipId = getUserDealershipId(req);
      const filtered = rows.filter((r) => r.jacket.dealershipId === dealershipId);
      const result = filtered.map((r) => ({
        ...r.jacket,
        customerName: r.customerFirst
          ? `${r.customerFirst} ${r.customerLast}`.trim()
          : r.customerEmail || "Unknown",
      }));
      return res.json({ success: true, jackets: result });
    }

    const result = rows.map((r) => ({
      ...r.jacket,
      customerName: r.customerFirst
        ? `${r.customerFirst} ${r.customerLast}`.trim()
        : r.customerEmail || "Unknown",
    }));

    res.json({ success: true, jackets: result });
  } catch (err: any) {
    console.error("Get jackets by unit error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /api/deal-jackets/by-customer/:customerId ───────────────────────────
router.get("/deal-jackets/by-customer/:customerId", requireAuth, async (req: Request, res: Response) => {
  try {
    // Client role: can only see their own jackets
    const userRole = (req.user as any)?.role;
    const userId = (req.user as any)?.id;
    if (userRole === "client" && userId !== req.params.customerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const rows = await db
      .select({
        jacket: dealJackets,
        unitVin: units.vin,
        unitYear: units.year,
        unitMake: units.manufacturer,
        unitModel: units.model,
      })
      .from(dealJackets)
      .leftJoin(units, eq(dealJackets.unitId, units.id))
      .where(eq(dealJackets.customerId, req.params.customerId))
      .orderBy(desc(dealJackets.createdAt));

    const result = rows.map((r) => ({
      ...r.jacket,
      unitVin: r.unitVin,
      unitLabel: [r.unitYear, r.unitMake, r.unitModel].filter(Boolean).join(" "),
    }));

    res.json({ success: true, jackets: result });
  } catch (err: any) {
    console.error("Get jackets by customer error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /api/deal-jackets/:id ────────────────────────────────────────────────
router.get("/deal-jackets/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [jacket] = await db
      .select()
      .from(dealJackets)
      .where(eq(dealJackets.id, req.params.id))
      .limit(1);

    if (!jacket) {
      return res.status(404).json({ success: false, message: "Deal jacket not found" });
    }

    // Scope check
    if (!isOperator(req)) {
      const dealershipId = getUserDealershipId(req);
      const userRole = (req.user as any)?.role;
      const userId = (req.user as any)?.id;

      if (userRole === "client") {
        // Client can only see their own jacket
        if (jacket.customerId !== userId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      } else if (jacket.dealershipId !== dealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    // Load documents
    const docs = await db
      .select()
      .from(dealJacketDocuments)
      .where(eq(dealJacketDocuments.jacketId, jacket.id))
      .orderBy(dealJacketDocuments.documentType);

    // Load signatures
    const sigs = await db
      .select()
      .from(signatures)
      .where(
        and(
          eq(signatures.parentType, "deal_jacket"),
          eq(signatures.parentId, jacket.id)
        )
      );

    // Load permissions for current user's role
    const userRole = (req.user as any)?.role;
    let permissions: typeof dealJacketPermissions.$inferSelect[] = [];
    if (userRole && userRole !== "dealer_owner" && !isOperator(req)) {
      permissions = await db
        .select()
        .from(dealJacketPermissions)
        .where(
          and(
            eq(dealJacketPermissions.dealershipId, jacket.dealershipId),
            eq(dealJacketPermissions.role, userRole)
          )
        );
    }

    // Load unit and customer info
    const [unit] = await db.select().from(units).where(eq(units.id, jacket.unitId)).limit(1);
    const [customer] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
    }).from(users).where(eq(users.id, jacket.customerId)).limit(1);

    res.json({
      success: true,
      jacket,
      documents: docs,
      signatures: sigs,
      permissions,
      unit: unit || null,
      customer: customer || null,
    });
  } catch (err: any) {
    console.error("Get deal jacket error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── POST /api/deal-jackets ───────────────────────────────────────────────────
router.post("/deal-jackets", requireAuth, async (req: Request, res: Response) => {
  try {
    const { unitId, customerId, dealershipId, saleDate } = req.body;

    if (!unitId || !customerId) {
      return res.status(400).json({ success: false, message: "unitId and customerId are required" });
    }

    const effectiveDealershipId =
      dealershipId || getUserDealershipId(req);

    if (!effectiveDealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    const userId = (req.user as any)?.id || "";
    const jacket = await createDealJacket(
      unitId,
      customerId,
      effectiveDealershipId,
      userId,
      saleDate
    );

    res.status(201).json({ success: true, jacket });
  } catch (err: any) {
    console.error("Create deal jacket error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /api/deal-jackets/:id ─────────────────────────────────────────────
router.patch("/deal-jackets/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db
      .select()
      .from(dealJackets)
      .where(eq(dealJackets.id, req.params.id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Deal jacket not found" });
    }

    // Scope check
    if (!isOperator(req)) {
      const dealershipId = getUserDealershipId(req);
      if (existing.dealershipId !== dealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const { notes, status, saleDate } = req.body;
    const updates: Partial<typeof dealJackets.$inferInsert> = { updatedAt: new Date() };
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;
    if (saleDate !== undefined) updates.saleDate = saleDate;

    const [updated] = await db
      .update(dealJackets)
      .set(updates)
      .where(eq(dealJackets.id, req.params.id))
      .returning();

    res.json({ success: true, jacket: updated });
  } catch (err: any) {
    console.error("Update deal jacket error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── POST /api/deal-jackets/:id/documents ────────────────────────────────────
router.post("/deal-jackets/:id/documents", requireAuth, async (req: Request, res: Response) => {
  try {
    const [jacket] = await db
      .select()
      .from(dealJackets)
      .where(eq(dealJackets.id, req.params.id))
      .limit(1);

    if (!jacket) {
      return res.status(404).json({ success: false, message: "Deal jacket not found" });
    }

    // Scope check
    if (!isOperator(req)) {
      const dealershipId = getUserDealershipId(req);
      if (jacket.dealershipId !== dealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const {
      documentType = "custom",
      documentName,
      fileUrl,
      sourceType = "uploaded",
      sourceId,
      isRequired = false,
    } = req.body;

    if (!documentName) {
      return res.status(400).json({ success: false, message: "documentName is required" });
    }

    const userId = (req.user as any)?.id;
    const status = fileUrl || sourceId ? "present" : "missing";

    const [doc] = await db
      .insert(dealJacketDocuments)
      .values({
        jacketId: jacket.id,
        documentType,
        documentName,
        sourceType,
        sourceId: sourceId || null,
        fileUrl: fileUrl || null,
        isRequired,
        status,
        uploadedBy: userId || null,
        uploadedAt: status === "present" ? new Date() : null,
      })
      .returning();

    // Recalculate completeness
    await recalculateCompleteness(jacket.id);

    res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    console.error("Add document to jacket error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── DELETE /api/deal-jackets/:id/documents/:docId ───────────────────────────
router.delete(
  "/deal-jackets/:id/documents/:docId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const [jacket] = await db
        .select()
        .from(dealJackets)
        .where(eq(dealJackets.id, req.params.id))
        .limit(1);

      if (!jacket) {
        return res.status(404).json({ success: false, message: "Deal jacket not found" });
      }

      // Scope check
      if (!isOperator(req)) {
        const dealershipId = getUserDealershipId(req);
        if (jacket.dealershipId !== dealershipId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }

      await db
        .delete(dealJacketDocuments)
        .where(
          and(
            eq(dealJacketDocuments.id, req.params.docId),
            eq(dealJacketDocuments.jacketId, jacket.id)
          )
        );

      const score = await recalculateCompleteness(jacket.id);

      const [updated] = await db
        .select()
        .from(dealJackets)
        .where(eq(dealJackets.id, jacket.id))
        .limit(1);

      res.json({ success: true, jacket: updated });
    } catch (err: any) {
      console.error("Delete jacket document error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

// ─── GET /api/deal-jackets/:id/permissions ───────────────────────────────────
router.get("/deal-jackets/:id/permissions", requireAuth, async (req: Request, res: Response) => {
  try {
    const [jacket] = await db
      .select()
      .from(dealJackets)
      .where(eq(dealJackets.id, req.params.id))
      .limit(1);

    if (!jacket) {
      return res.status(404).json({ success: false, message: "Deal jacket not found" });
    }

    const userRole = (req.user as any)?.role;
    const perms = await db
      .select()
      .from(dealJacketPermissions)
      .where(
        and(
          eq(dealJacketPermissions.dealershipId, jacket.dealershipId),
          eq(dealJacketPermissions.role, userRole || "")
        )
      );

    res.json({ success: true, permissions: perms });
  } catch (err: any) {
    console.error("Get jacket permissions error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── GET /api/deal-jackets/permissions-by-dealership ─────────────────────────
// Returns ALL permission rows for a dealership (used by DealerSettings permissions grid)
router.get("/deal-jackets/permissions-by-dealership", requireAuth, async (req: Request, res: Response) => {
  try {
    const { dealershipId } = req.query as { dealershipId?: string };

    if (!dealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    // Scope check — dealer owner can only read their own dealership permissions
    if (!isOperator(req)) {
      const userDealershipId = getUserDealershipId(req);
      if (dealershipId !== userDealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const perms = await db
      .select()
      .from(dealJacketPermissions)
      .where(eq(dealJacketPermissions.dealershipId, dealershipId));

    res.json({ success: true, permissions: perms });
  } catch (err: any) {
    console.error("Get permissions by dealership error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─── PATCH /api/deal-jackets/permissions ─────────────────────────────────────
router.patch("/deal-jackets/permissions", requireAuth, async (req: Request, res: Response) => {
  try {
    // Only dealer_owner can manage permissions
    if (!isDealerOwner(req) && !isOperator(req)) {
      return res.status(403).json({ success: false, message: "Access denied — dealer owner only" });
    }

    const { dealershipId, role, section, allowed } = req.body;

    if (!dealershipId || !role || !section || allowed === undefined) {
      return res.status(400).json({
        success: false,
        message: "dealershipId, role, section, and allowed are required",
      });
    }

    // Scope check for dealer owner
    if (isDealerOwner(req)) {
      const userDealershipId = getUserDealershipId(req);
      if (dealershipId !== userDealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    // Upsert: check if exists first
    const existing = await db
      .select()
      .from(dealJacketPermissions)
      .where(
        and(
          eq(dealJacketPermissions.dealershipId, dealershipId),
          eq(dealJacketPermissions.role, role),
          eq(dealJacketPermissions.section, section)
        )
      )
      .limit(1);

    let perm;
    if (existing.length > 0) {
      [perm] = await db
        .update(dealJacketPermissions)
        .set({ allowed, updatedAt: new Date() })
        .where(eq(dealJacketPermissions.id, existing[0].id))
        .returning();
    } else {
      [perm] = await db
        .insert(dealJacketPermissions)
        .values({ dealershipId, role, section, allowed })
        .returning();
    }

    res.json({ success: true, permission: perm });
  } catch (err: any) {
    console.error("Update jacket permission error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
