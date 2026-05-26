// server/routes/pdi.ts — PDI Inspection API
//
// GET    /api/pdi/templates?unitType=X           — template items by unitType
// POST   /api/pdi/templates                      — create template item (operator_admin)
// PATCH  /api/pdi/templates/:id                  — update template item (operator_admin)
// DELETE /api/pdi/templates/:id                  — delete template item (operator_admin)
// GET    /api/pdi                                — list inspections (role-filtered)
// GET    /api/pdi/:id                            — full inspection with items + signatures
// POST   /api/pdi                                — create inspection from template
// PATCH  /api/pdi/:id                            — update inspection record
// POST   /api/pdi/:id/items                      — batch update checklist items
// POST   /api/pdi/:id/items/:itemId/photo        — update item photo URL
// GET    /api/units/:unitId/pdi                  — all PDIs for a unit

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  pdiTemplates,
  pdiInspections,
  pdiChecklistItems,
  signatures,
  units,
} from "@shared/schema";
import { eq, and, asc, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function groupBySection(items: typeof pdiTemplates.$inferSelect[]): {
  name: string;
  items: typeof pdiTemplates.$inferSelect[];
}[] {
  const map = new Map<string, typeof pdiTemplates.$inferSelect[]>();
  for (const item of items) {
    const list = map.get(item.section) || [];
    list.push(item);
    map.set(item.section, list);
  }
  return Array.from(map.entries()).map(([name, sectionItems]) => ({
    name,
    items: sectionItems.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

function groupChecklistBySection(
  items: typeof pdiChecklistItems.$inferSelect[]
): { name: string; items: typeof pdiChecklistItems.$inferSelect[] }[] {
  const map = new Map<string, typeof pdiChecklistItems.$inferSelect[]>();
  for (const item of items) {
    const list = map.get(item.section) || [];
    list.push(item);
    map.set(item.section, list);
  }
  return Array.from(map.entries()).map(([name, sectionItems]) => ({
    name,
    items: sectionItems.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

// ─── GET /api/pdi/templates ───────────────────────────────────────────────────

router.get("/pdi/templates", requireAuth, async (req: Request, res: Response) => {
  const { unitType } = req.query as { unitType?: string };

  try {
    let rows = await db
      .select()
      .from(pdiTemplates)
      .orderBy(asc(pdiTemplates.section), asc(pdiTemplates.sortOrder));

    if (unitType) {
      rows = rows.filter((r) => r.unitType === unitType);
    }

    return res.json({ sections: groupBySection(rows) });
  } catch (err: any) {
    console.error("[pdi] GET templates error:", err);
    return res.status(500).json({ error: "Failed to fetch PDI templates", message: err.message });
  }
});

// ─── POST /api/pdi/templates ──────────────────────────────────────────────────

router.post("/pdi/templates", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }

  const { unitType, section, itemName, sortOrder } = req.body;
  if (!unitType || !section || !itemName) {
    return res.status(400).json({ error: "unitType, section, and itemName are required" });
  }

  try {
    const [created] = await db
      .insert(pdiTemplates)
      .values({ unitType, section, itemName, sortOrder: sortOrder ?? 0, isDefault: false })
      .returning();
    return res.status(201).json({ template: created });
  } catch (err: any) {
    console.error("[pdi] POST template error:", err);
    return res.status(500).json({ error: "Failed to create template", message: err.message });
  }
});

// ─── PATCH /api/pdi/templates/:id ────────────────────────────────────────────

router.patch("/pdi/templates/:id", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }

  const { id } = req.params;
  const { itemName, sortOrder, section } = req.body;

  const updates: Partial<typeof pdiTemplates.$inferInsert> = {};
  if (itemName !== undefined) updates.itemName = itemName;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (section !== undefined) updates.section = section;

  try {
    const [updated] = await db
      .update(pdiTemplates)
      .set(updates)
      .where(eq(pdiTemplates.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Template not found" });
    return res.json({ template: updated });
  } catch (err: any) {
    console.error("[pdi] PATCH template error:", err);
    return res.status(500).json({ error: "Failed to update template", message: err.message });
  }
});

// ─── DELETE /api/pdi/templates/:id ───────────────────────────────────────────

router.delete("/pdi/templates/:id", requireAuth, async (req: Request, res: Response) => {
  if (req.user?.role !== "operator_admin") {
    return res.status(403).json({ error: "operator_admin role required" });
  }

  const { id } = req.params;

  try {
    await db.delete(pdiTemplates).where(eq(pdiTemplates.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[pdi] DELETE template error:", err);
    return res.status(500).json({ error: "Failed to delete template", message: err.message });
  }
});

// ─── GET /api/pdi ─────────────────────────────────────────────────────────────

router.get("/pdi", requireAuth, async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "25", 10);
  const offset = (page - 1) * limit;

  const isOperator =
    req.user?.role === "operator_admin" || req.user?.role === "operator_staff";

  try {
    let query = db.select().from(pdiInspections) as any;

    if (!isOperator && req.user?.dealershipId) {
      query = db
        .select()
        .from(pdiInspections)
        .where(eq(pdiInspections.dealershipId, req.user.dealershipId));
    }

    const rows = await db
      .select()
      .from(pdiInspections)
      .where(
        isOperator
          ? undefined
          : eq(pdiInspections.dealershipId, req.user?.dealershipId ?? "")
      )
      .orderBy(desc(pdiInspections.createdAt))
      .limit(limit)
      .offset(offset);

    // Enrich with unit info
    const unitIds = [...new Set(rows.map((r) => r.unitId).filter(Boolean))];
    let unitMap: Record<string, any> = {};
    if (unitIds.length > 0) {
      const unitRows = await db
        .select({
          id: units.id,
          vin: units.vin,
          year: units.year,
          manufacturer: units.manufacturer,
          model: units.model,
        })
        .from(units)
        .where(inArray(units.id, unitIds));
      for (const u of unitRows) unitMap[u.id] = u;
    }

    const enriched = rows.map((r) => ({
      ...r,
      unit: unitMap[r.unitId] || null,
    }));

    return res.json({ inspections: enriched, page, limit });
  } catch (err: any) {
    console.error("[pdi] GET list error:", err);
    return res.status(500).json({ error: "Failed to fetch PDI inspections", message: err.message });
  }
});

// ─── GET /api/pdi/:id ─────────────────────────────────────────────────────────

router.get("/pdi/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [inspection] = await db
      .select()
      .from(pdiInspections)
      .where(eq(pdiInspections.id, id))
      .limit(1);

    if (!inspection) return res.status(404).json({ error: "PDI inspection not found" });

    // Dealer role: must own this inspection
    const isOperator =
      req.user?.role === "operator_admin" || req.user?.role === "operator_staff";
    if (!isOperator && inspection.dealershipId !== req.user?.dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch checklist items
    const items = await db
      .select()
      .from(pdiChecklistItems)
      .where(eq(pdiChecklistItems.inspectionId, id))
      .orderBy(asc(pdiChecklistItems.section), asc(pdiChecklistItems.sortOrder));

    // Fetch unit info
    const [unit] = await db
      .select({
        id: units.id,
        vin: units.vin,
        year: units.year,
        manufacturer: units.manufacturer,
        model: units.model,
        rvType: units.rvType,
      })
      .from(units)
      .where(eq(units.id, inspection.unitId))
      .limit(1);

    // Fetch signatures
    const sigs = await db
      .select()
      .from(signatures)
      .where(
        and(
          eq(signatures.parentType, "pdi"),
          eq(signatures.parentId, id)
        )
      )
      .orderBy(asc(signatures.timestamp));

    return res.json({
      inspection,
      sections: groupChecklistBySection(items),
      items,
      unit: unit || null,
      signatures: sigs,
    });
  } catch (err: any) {
    console.error("[pdi] GET :id error:", err);
    return res.status(500).json({ error: "Failed to fetch PDI inspection", message: err.message });
  }
});

// ─── POST /api/pdi ────────────────────────────────────────────────────────────

router.post("/pdi", requireAuth, async (req: Request, res: Response) => {
  const { unitId, unitType, dealershipId } = req.body;

  if (!unitId || !unitType || !dealershipId) {
    return res.status(400).json({ error: "unitId, unitType, and dealershipId are required" });
  }

  // Dealer role: enforce their dealership
  const isOperator =
    req.user?.role === "operator_admin" || req.user?.role === "operator_staff";
  const effectiveDealershipId = isOperator ? dealershipId : req.user?.dealershipId;

  if (!effectiveDealershipId) {
    return res.status(400).json({ error: "dealershipId required" });
  }

  try {
    // Load templates for this unitType
    const templates = await db
      .select()
      .from(pdiTemplates)
      .where(eq(pdiTemplates.unitType, unitType))
      .orderBy(asc(pdiTemplates.section), asc(pdiTemplates.sortOrder));

    // If no templates for this unitType, fall back to travel_trailer
    const effectiveTemplates =
      templates.length > 0
        ? templates
        : await db
            .select()
            .from(pdiTemplates)
            .where(eq(pdiTemplates.unitType, "travel_trailer"))
            .orderBy(asc(pdiTemplates.section), asc(pdiTemplates.sortOrder));

    // Create inspection
    const [inspection] = await db
      .insert(pdiInspections)
      .values({
        unitId,
        dealershipId: effectiveDealershipId,
        unitType,
        status: "in_progress",
        failedItemCount: 0,
      })
      .returning();

    // Create checklist items from templates
    if (effectiveTemplates.length > 0) {
      await db.insert(pdiChecklistItems).values(
        effectiveTemplates.map((t) => ({
          inspectionId: inspection.id,
          section: t.section,
          itemName: t.itemName,
          status: "pending" as const,
          sortOrder: t.sortOrder,
        }))
      );
    }

    // Re-fetch items for response
    const items = await db
      .select()
      .from(pdiChecklistItems)
      .where(eq(pdiChecklistItems.inspectionId, inspection.id))
      .orderBy(asc(pdiChecklistItems.section), asc(pdiChecklistItems.sortOrder));

    return res.status(201).json({
      inspection,
      sections: groupChecklistBySection(items),
      items,
    });
  } catch (err: any) {
    console.error("[pdi] POST create error:", err);
    return res.status(500).json({ error: "Failed to create PDI inspection", message: err.message });
  }
});

// ─── PATCH /api/pdi/:id ───────────────────────────────────────────────────────

router.patch("/pdi/:id", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [existing] = await db
      .select()
      .from(pdiInspections)
      .where(eq(pdiInspections.id, id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "PDI inspection not found" });

    const isOperator =
      req.user?.role === "operator_admin" || req.user?.role === "operator_staff";
    if (!isOperator && existing.dealershipId !== req.user?.dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const {
      status,
      notes,
      overallPassRate,
      failedItemCount,
      techSignedAt,
      customerSignedAt,
      technicianName,
      technicianId,
    } = req.body;

    const updates: Partial<typeof pdiInspections.$inferInsert> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (overallPassRate !== undefined) updates.overallPassRate = String(overallPassRate);
    if (failedItemCount !== undefined) updates.failedItemCount = failedItemCount;
    if (techSignedAt !== undefined) updates.techSignedAt = new Date(techSignedAt);
    if (customerSignedAt !== undefined) updates.customerSignedAt = new Date(customerSignedAt);
    if (technicianName !== undefined) updates.technicianName = technicianName;
    if (technicianId !== undefined) updates.technicianId = technicianId;

    const [updated] = await db
      .update(pdiInspections)
      .set(updates)
      .where(eq(pdiInspections.id, id))
      .returning();

    return res.json({ inspection: updated });
  } catch (err: any) {
    console.error("[pdi] PATCH :id error:", err);
    return res.status(500).json({ error: "Failed to update PDI inspection", message: err.message });
  }
});

// ─── POST /api/pdi/:id/items (batch update) ───────────────────────────────────

router.post("/pdi/:id/items", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { items } = req.body as {
    items: { id: string; status: string; note?: string; photoUrl?: string }[];
  };

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required" });
  }

  try {
    const [inspection] = await db
      .select()
      .from(pdiInspections)
      .where(eq(pdiInspections.id, id))
      .limit(1);

    if (!inspection) return res.status(404).json({ error: "PDI inspection not found" });

    const isOperator =
      req.user?.role === "operator_admin" || req.user?.role === "operator_staff";
    if (!isOperator && inspection.dealershipId !== req.user?.dealershipId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update each item
    for (const item of items) {
      const patch: Partial<typeof pdiChecklistItems.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (item.status !== undefined) patch.status = item.status as any;
      if (item.note !== undefined) patch.note = item.note;
      if (item.photoUrl !== undefined) patch.photoUrl = item.photoUrl;

      await db
        .update(pdiChecklistItems)
        .set(patch)
        .where(
          and(
            eq(pdiChecklistItems.id, item.id),
            eq(pdiChecklistItems.inspectionId, id)
          )
        );
    }

    // Recalculate pass rate and failed count
    const allItems = await db
      .select()
      .from(pdiChecklistItems)
      .where(eq(pdiChecklistItems.inspectionId, id));

    const evaluated = allItems.filter((i) => i.status !== "pending");
    const passed = allItems.filter((i) => i.status === "pass" || i.status === "na");
    const failed = allItems.filter((i) => i.status === "fail");

    const passRate =
      evaluated.length > 0
        ? Math.round((passed.length / evaluated.length) * 100)
        : 0;

    await db
      .update(pdiInspections)
      .set({
        overallPassRate: String(passRate),
        failedItemCount: failed.length,
        updatedAt: new Date(),
      })
      .where(eq(pdiInspections.id, id));

    return res.json({
      success: true,
      overallPassRate: passRate,
      failedItemCount: failed.length,
    });
  } catch (err: any) {
    console.error("[pdi] POST items batch error:", err);
    return res.status(500).json({ error: "Failed to update checklist items", message: err.message });
  }
});

// ─── POST /api/pdi/:id/items/:itemId/photo ────────────────────────────────────

router.post("/pdi/:id/items/:itemId/photo", requireAuth, async (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const { photoUrl } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ error: "photoUrl is required" });
  }

  try {
    const [updated] = await db
      .update(pdiChecklistItems)
      .set({ photoUrl, updatedAt: new Date() })
      .where(
        and(
          eq(pdiChecklistItems.id, itemId),
          eq(pdiChecklistItems.inspectionId, id)
        )
      )
      .returning();

    if (!updated) return res.status(404).json({ error: "Item not found" });
    return res.json({ item: updated });
  } catch (err: any) {
    console.error("[pdi] POST item photo error:", err);
    return res.status(500).json({ error: "Failed to update item photo", message: err.message });
  }
});

// ─── GET /api/units/:unitId/pdi ───────────────────────────────────────────────

router.get("/units/:unitId/pdi", requireAuth, async (req: Request, res: Response) => {
  const { unitId } = req.params;

  try {
    const rows = await db
      .select()
      .from(pdiInspections)
      .where(eq(pdiInspections.unitId, unitId))
      .orderBy(desc(pdiInspections.createdAt));

    return res.json({ inspections: rows });
  } catch (err: any) {
    console.error("[pdi] GET units/:unitId/pdi error:", err);
    return res.status(500).json({ error: "Failed to fetch PDIs for unit", message: err.message });
  }
});

export default router;
