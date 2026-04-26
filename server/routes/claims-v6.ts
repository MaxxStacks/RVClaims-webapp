// server/routes/claims-v6.ts — v6 Claims API (/api/v6/claims)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { claims, units, dealerships, v6Uploads, users } from "@shared/schema";
import { eq, and, desc, inArray, ilike, or, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

async function nextClaimNumber(): Promise<string> {
  const all = await db.select({ n: claims.claimNumber }).from(claims);
  const max = all.reduce((m, r) => {
    const n = parseInt((r.n || "").replace(/\D/g, ""), 10);
    return !isNaN(n) && n > m ? n : m;
  }, 0);
  return `CLM-${String(max + 1).padStart(5, "0")}`;
}

// GET /api/v6/claims — scoped by role with filters
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const { status, type, manufacturer, dealershipId: filterDealershipId, search } = req.query as Record<string, string>;

  try {
    const conditions: any[] = [];

    if (["operator_admin", "operator_staff"].includes(u.role)) {
      if (filterDealershipId) conditions.push(eq(claims.dealershipId, filterDealershipId));
    } else if (["dealer_owner", "dealer_staff"].includes(u.role)) {
      if (!u.dealershipId) return res.json([]);
      conditions.push(eq(claims.dealershipId, u.dealershipId));
    } else if (u.role === "client") {
      if (!u.id) return res.json([]);
      const clientUnits = await db.select({ id: units.id }).from(units).where(eq(units.customerId, u.id));
      const unitIds = clientUnits.map(cu => cu.id);
      if (unitIds.length === 0) return res.json([]);
      conditions.push(inArray(claims.unitId, unitIds));
    } else {
      return res.json([]);
    }

    if (status) conditions.push(eq(claims.status, status as any));
    if (type) conditions.push(eq(claims.type, type as any));
    if (manufacturer) conditions.push(ilike(claims.manufacturer, `%${manufacturer}%`));
    if (search) {
      conditions.push(or(
        ilike(claims.claimNumber, `%${search}%`),
        ilike(claims.manufacturer, `%${search}%`)
      ));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db.select().from(claims).where(where).orderBy(desc(claims.createdAt)).limit(500);

    if (u.role === "client") {
      const minimal = rows.map(c => ({
        id: c.id,
        claimNumber: c.claimNumber,
        type: c.type,
        status: c.status,
        unitId: c.unitId,
        createdAt: c.createdAt,
      }));
      return res.json(minimal);
    }

    // For operators: enrich with unit + dealership display names for kanban cards
    if (["operator_admin", "operator_staff"].includes(u.role)) {
      const nonDraft = rows.filter(c => c.status !== "draft");
      const enriched = await Promise.all(nonDraft.map(async (c) => {
        let unitYear = null, unitModel = null, dealershipName = null, unitMake = null;
        if (c.unitId) {
          const [unit] = await db.select({ year: units.year, model: units.model, manufacturer: units.manufacturer })
            .from(units).where(eq(units.id, c.unitId)).limit(1);
          if (unit) { unitYear = unit.year; unitModel = unit.model; unitMake = unit.manufacturer; }
        }
        if (c.dealershipId) {
          const [d] = await db.select({ name: dealerships.name }).from(dealerships).where(eq(dealerships.id, c.dealershipId)).limit(1);
          if (d) { dealershipName = d.name; }
        }
        return { ...c, unitYear, unitModel, unitMake, dealershipName };
      }));
      return res.json(enriched);
    }

    res.json(rows);
  } catch (err) {
    console.error("[claims-v6 GET /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v6/claims/:id — full unit context for operator
router.get("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    if (["dealer_owner", "dealer_staff"].includes(u.role)) {
      if (claim.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
    } else if (u.role === "client") {
      if (!claim.unitId) return res.status(403).json({ error: "Forbidden" });
      const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
      if (!unit || unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
      return res.json({
        claim: { id: claim.id, claimNumber: claim.claimNumber, type: claim.type, status: claim.status, createdAt: claim.createdAt },
      });
    } else if (!["operator_admin", "operator_staff"].includes(u.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let unitData = null;
    let unitClaims: any[] = [];
    let unitPhotos: any[] = [];
    let claimPhotos: any[] = [];
    let customer = null;
    let dealership = null;

    if (claim.unitId) {
      const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
      if (unit) {
        unitData = unit;
        unitClaims = await db.select().from(claims)
          .where(eq(claims.unitId, unit.id))
          .orderBy(desc(claims.createdAt));
        unitPhotos = await db.select().from(v6Uploads)
          .where(and(eq(v6Uploads.scope, "units"), eq(v6Uploads.scopeId, unit.id)));
        claimPhotos = await db.select().from(v6Uploads)
          .where(and(eq(v6Uploads.scope, "claims"), eq(v6Uploads.scopeId, claim.id)));
        if (unit.customerId) {
          const [c] = await db.select({
            id: users.id, firstName: users.firstName, lastName: users.lastName,
            email: users.email, phone: users.phone,
          }).from(users).where(eq(users.id, unit.customerId)).limit(1);
          customer = c || null;
        }
        const [d] = await db.select().from(dealerships).where(eq(dealerships.id, unit.dealershipId)).limit(1);
        dealership = d || null;
      }
    }

    if (!dealership && claim.dealershipId) {
      const [d] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);
      dealership = d || null;
    }

    res.json({ claim, unit: unitData, unitClaims, unitPhotos, claimPhotos, customer, dealership });
  } catch (err) {
    console.error("[claims-v6 GET /:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims — create draft claim (Approach A: draft first, then submit)
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Only dealers can create claims" });
  }

  const { unitId, type, dealerNotes, estimatedAmount, customManufacturer } = req.body;
  if (!unitId || !type) {
    return res.status(400).json({ error: "Missing required fields: unitId, type" });
  }

  try {
    const [unit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!unit || unit.dealershipId !== u.dealershipId) {
      return res.status(403).json({ error: "Unit not found in your dealership" });
    }

    const manufacturer = customManufacturer || unit.manufacturer || "";
    const claimNumber = await nextClaimNumber();

    const [created] = await db.insert(claims).values({
      claimNumber,
      dealershipId: u.dealershipId!,
      unitId,
      manufacturer,
      type,
      status: "draft",
      dealerNotes: dealerNotes ?? null,
      estimatedAmount: estimatedAmount ?? null,
    }).returning();

    res.status(201).json(created);
  } catch (err) {
    console.error("[claims-v6 POST /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/submit — transitions draft → new_unassigned (requires photos)
router.post("/:id/submit", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer role required" });
  }
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });
    if (claim.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
    if (claim.status !== "draft") return res.status(400).json({ error: "Can only submit draft claims" });

    const photos = await db.select({ id: v6Uploads.id }).from(v6Uploads)
      .where(and(eq(v6Uploads.scope, "claims"), eq(v6Uploads.scopeId, claim.id)));
    if (photos.length === 0) {
      return res.status(400).json({ error: "At least 1 photo required before submitting" });
    }

    await db.update(claims).set({
      status: "new_unassigned",
      submittedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(claims.id, req.params.id));

    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);
    const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);

    await emitEvent({
      eventId: "claim.submitted",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: u.dealershipId!,
      targetEntityType: "claim",
      targetEntityId: claim.id,
      payload: {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        vin: unit?.vin || "",
        manufacturer: claim.manufacturer,
        dealerName: dealership?.name || "Dealer",
      },
      stateChanges: ["claim.status: draft → new_unassigned"],
    });

    res.json({ ok: true, claimId: claim.id });
  } catch (err) {
    console.error("[claims-v6 POST /:id/submit]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/v6/claims/:id — delete draft claim on cancel
router.delete("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });
    if (claim.status !== "draft") return res.status(400).json({ error: "Can only delete draft claims" });
    if (claim.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });

    await db.delete(v6Uploads).where(and(eq(v6Uploads.scope, "claims"), eq(v6Uploads.scopeId, claim.id)));
    await db.delete(claims).where(eq(claims.id, claim.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 DELETE /:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/assign — operator assigns claim to self or staff
router.post("/:id/assign", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Operator role required" });
  }
  const { assignedToUserId } = req.body;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    await db.update(claims).set({
      assignedToUserId: assignedToUserId || u.id,
      assignedAt: new Date(),
      status: "assigned",
      updatedAt: new Date(),
    }).where(eq(claims.id, claim.id));

    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

    await emitEvent({
      eventId: "claim.assigned_to_staff",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: claim.dealershipId,
      targetEntityType: "claim",
      targetEntityId: claim.id,
      payload: { claimNumber: claim.claimNumber, dealerName: dealership?.name || "Dealer" },
      forceRecipientUserIds: [assignedToUserId || u.id],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/assign]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/request-info
router.post("/:id/request-info", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Operator role required" });
  }
  const { message } = req.body;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    await db.update(claims).set({
      status: "info_requested",
      awaitingDealerResponse: true,
      updatedAt: new Date(),
    }).where(eq(claims.id, req.params.id));

    await emitEvent({
      eventId: "claim.info_requested",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: claim.dealershipId,
      targetEntityType: "claim",
      targetEntityId: claim.id,
      payload: { claimNumber: claim.claimNumber, message: message || "" },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/request-info]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/approve
router.post("/:id/approve", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Operator role required" });
  }
  const { approvedAmount } = req.body;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    await db.update(claims).set({
      status: "approved",
      approvedAt: new Date(),
      approvedAmount: approvedAmount ?? null,
      updatedAt: new Date(),
    }).where(eq(claims.id, req.params.id));

    await emitEvent({
      eventId: "claim.approved",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: claim.dealershipId,
      targetEntityType: "claim",
      targetEntityId: claim.id,
      payload: { claimNumber: claim.claimNumber, approvedAmount },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/approve]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/deny
router.post("/:id/deny", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Operator role required" });
  }
  const { reason } = req.body;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    await db.update(claims).set({
      status: "denied",
      deniedAt: new Date(),
      denialReason: reason ?? null,
      updatedAt: new Date(),
    }).where(eq(claims.id, req.params.id));

    await emitEvent({
      eventId: "claim.denied",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: claim.dealershipId,
      targetEntityType: "claim",
      targetEntityId: claim.id,
      payload: { claimNumber: claim.claimNumber, denialReason: reason },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/deny]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/transition — operator transitions status (full state machine)
router.post("/:id/transition", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { toStatus, denialReason, approvedAmount, mfrClaimNumber } = req.body;
  const validTransitions = [
    "in_review", "info_requested", "submitted_to_mfr",
    "approved", "denied", "partial_approval",
    "completed", "reopened",
  ];
  if (!validTransitions.includes(toStatus)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    const updates: Record<string, any> = { status: toStatus, updatedAt: new Date() };
    if (toStatus === "in_review") updates.reviewStartedAt = new Date();
    if (toStatus === "submitted_to_mfr") {
      updates.submittedToMfrAt = new Date();
      if (mfrClaimNumber) updates.manufacturerClaimNumber = mfrClaimNumber;
    }
    if (toStatus === "approved") {
      updates.approvedAt = new Date();
      if (approvedAmount) updates.approvedAmount = approvedAmount;
    }
    if (toStatus === "denied") {
      updates.deniedAt = new Date();
      if (denialReason) updates.denialReason = denialReason;
    }
    if (toStatus === "completed") updates.completedAt = new Date();

    await db.update(claims).set(updates).where(eq(claims.id, claim.id));

    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

    const eventIdMap: Record<string, string> = {
      in_review: "claim.put_in_review",
      info_requested: "claim.info_requested",
      submitted_to_mfr: "claim.submitted_to_mfr",
      approved: "claim.approved",
      denied: "claim.denied",
      partial_approval: "claim.partial_approval",
      completed: "claim.completed",
    };

    const eventId = eventIdMap[toStatus];
    if (eventId) {
      await emitEvent({
        eventId,
        domain: "Claims",
        actorUserId: u.id,
        actorRole: u.role,
        dealershipId: claim.dealershipId,
        targetEntityType: "claim",
        targetEntityId: claim.id,
        payload: {
          claimNumber: claim.claimNumber,
          manufacturer: claim.manufacturer,
          mfrClaimNumber,
          approvedAmount,
          denialReason,
          dealerName: dealership?.name || "Dealer",
        },
        stateChanges: [`claim.status: ${claim.status} → ${toStatus}`],
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/transition]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
