// server/routes/claims-v6.ts — v6 Claims API (/api/v6/claims)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { claims, units, dealerships, v6Uploads, users, customerReviews, reviewConfig, notifications } from "@shared/schema";
import { eq, and, desc, inArray, ilike, or, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { emitEvent } from "../lib/event-bus";

const router = Router();

// ─── FRC codes lookup (static library — no DB table yet) ──────────────────────
// Mounted at /api/v6/frc-codes (registered separately in index.ts below)
// However, also accessible via a sub-path on the main claims router for convenience.
const FRC_CODE_LIBRARY: Record<string, Array<{code: string; description: string; category: string; laborHours: number}>> = {
  Jayco: [
    { code: 'JC-WAR-1042', description: 'Delamination, Sidewall', category: 'Structural', laborHours: 2.5 },
    { code: 'JC-WAR-2018', description: 'Water Leak, Roof Vent', category: 'Plumbing', laborHours: 1.5 },
    { code: 'JC-WAR-3055', description: 'Slide-Out Seal, Replace', category: 'Exterior', laborHours: 1.0 },
    { code: 'JC-WAR-4012', description: 'Cabinet Door, Hinge', category: 'Interior', laborHours: 0.5 },
    { code: 'JC-WAR-5001', description: 'Furnace, No Ignition', category: 'HVAC', laborHours: 2.0 },
    { code: 'JC-WAR-6001', description: 'Fresh Water Tank, Crack', category: 'Plumbing', laborHours: 1.5 },
  ],
  'Forest River': [
    { code: 'FR-WAR-1001', description: 'Roof Seam, Re-seal', category: 'Structural', laborHours: 2.0 },
    { code: 'FR-WAR-2005', description: 'Shower Drain Leak', category: 'Plumbing', laborHours: 1.0 },
    { code: 'FR-WAR-3012', description: 'Awning, Retract Failure', category: 'Exterior', laborHours: 1.5 },
    { code: 'FR-WAR-4008', description: 'Slide-Out Motor Replace', category: 'Electrical', laborHours: 3.0 },
  ],
  Heartland: [
    { code: 'HL-WAR-1010', description: 'Floor Delamination', category: 'Structural', laborHours: 3.0 },
    { code: 'HL-WAR-2002', description: 'City Water Inlet Leak', category: 'Plumbing', laborHours: 0.5 },
    { code: 'HL-WAR-3001', description: 'Slide-Out Topper Tear', category: 'Exterior', laborHours: 1.0 },
    { code: 'HL-WAR-4001', description: 'A/C Compressor Fail', category: 'HVAC', laborHours: 2.5 },
  ],
  Keystone: [
    { code: 'KS-WAR-1005', description: 'Sidewall Puncture Repair', category: 'Structural', laborHours: 2.0 },
    { code: 'KS-WAR-2010', description: 'Toilet Valve Replace', category: 'Plumbing', laborHours: 0.5 },
    { code: 'KS-WAR-3008', description: 'Entry Door Latch', category: 'Exterior', laborHours: 0.5 },
  ],
  'Columbia NW': [
    { code: 'CN-WAR-1001', description: 'Wall Seam Separation', category: 'Structural', laborHours: 2.5 },
    { code: 'CN-WAR-2001', description: 'Fresh Tank Fitting Leak', category: 'Plumbing', laborHours: 1.0 },
    { code: 'CN-WAR-3001', description: 'Slide-Out Wiper Seal', category: 'Exterior', laborHours: 0.5 },
  ],
};

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

    // ── Auto-trigger review survey on claim close (non-blocking) ──
    if (toStatus === "closed" || toStatus === "completed") {
      // TODO: Implement sendDelayHours — currently sends immediately; needs cron job to delay by config.sendDelayHours
      ;(async () => {
        try {
          const [cfg] = await db.select().from(reviewConfig)
            .where(eq(reviewConfig.dealershipId, claim.dealershipId))
            .limit(1);
          if (!cfg?.isActive || !cfg.autoSendOnClaimClose) return;

          // Get customer from unit
          const [unit] = await db.select({ customerId: units.customerId })
            .from(units).where(eq(units.id, claim.unitId)).limit(1);
          if (!unit?.customerId) return;

          const [review] = await db.insert(customerReviews).values({
            dealershipId: claim.dealershipId,
            customerId: unit.customerId,
            unitId: claim.unitId,
            triggerType: "claim_closed",
            triggerReferenceId: claim.id,
            status: "pending",
            sentAt: new Date(),
          }).returning();

          const [dealer] = await db.select({ name: dealerships.name })
            .from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

          await db.insert(notifications).values({
            userId: unit.customerId,
            type: "system",
            title: "How was your experience?",
            message: `${dealer?.name ?? "Your dealer"} values your feedback. Tap to share.`,
            linkTo: `/${claim.dealershipId}/client/review/${review.id}`,
          });
        } catch (reviewErr) {
          console.error("[claims-v6/transition] review trigger failed:", reviewErr);
        }
      })();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/transition]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/v6/claims/:id — general status/notes update (alias for common field updates)
router.patch("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Operator role required" });
  }
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (req.body.status) updates.status = req.body.status;
    if (req.body.operatorNotes !== undefined) updates.operatorNotes = req.body.operatorNotes;
    if (req.body.assignedToUserId !== undefined) updates.assignedToUserId = req.body.assignedToUserId;
    if (req.body.manufacturerClaimNumber !== undefined) updates.manufacturerClaimNumber = req.body.manufacturerClaimNumber;
    if (req.body.denialReason !== undefined) updates.denialReason = req.body.denialReason;
    if (req.body.approvedAmount !== undefined) updates.approvedAmount = req.body.approvedAmount;

    await db.update(claims).set(updates).where(eq(claims.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 PATCH /:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
