// server/routes/claims-v6.ts — v6 Claims API (/api/v6/claims)
// Separate namespace from legacy /api/claims — used by v6 portals only.

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { claims, units, dealerships } from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
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

// GET /api/v6/claims — scoped by role
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  try {
    let rows;
    if (u.role === "operator_admin" || u.role === "operator_staff") {
      rows = await db.select().from(claims).orderBy(desc(claims.createdAt)).limit(200);
    } else if (u.role === "dealer_owner" || u.role === "dealer_staff") {
      rows = await db.select().from(claims)
        .where(eq(claims.dealershipId, u.dealershipId!))
        .orderBy(desc(claims.createdAt)).limit(200);
    } else if (u.role === "client") {
      const myUnits = await db.select({ id: units.id }).from(units).where(eq(units.customerId, u.id));
      const unitIds = myUnits.map(x => x.id);
      if (unitIds.length === 0) return res.json([]);
      rows = await db.select().from(claims)
        .where(inArray(claims.unitId, unitIds))
        .orderBy(desc(claims.createdAt));
    } else {
      return res.status(403).json({ error: "Role not permitted" });
    }
    res.json(rows);
  } catch (err) {
    console.error("[claims-v6 GET /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v6/claims/:id
router.get("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    if (u.role === "dealer_owner" || u.role === "dealer_staff") {
      if (claim.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
    } else if (u.role === "client") {
      const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
      if (!unit || unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
    }

    const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

    res.json({ claim, unit, dealership });
  } catch (err) {
    console.error("[claims-v6 GET /:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims — dealer submits new claim
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Only dealers can submit claims" });
  }

  const { unitId, type, manufacturer, dealerNotes, estimatedAmount } = req.body;
  if (!unitId || !type || !manufacturer) {
    return res.status(400).json({ error: "Missing required fields: unitId, type, manufacturer" });
  }

  try {
    const [unit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
    if (!unit || unit.dealershipId !== u.dealershipId) {
      return res.status(403).json({ error: "Unit not found in your dealership" });
    }

    const claimNumber = await nextClaimNumber();
    const [created] = await db.insert(claims).values({
      claimNumber,
      dealershipId: u.dealershipId!,
      unitId,
      manufacturer,
      type,
      status: "new_unassigned",
      dealerNotes: dealerNotes ?? null,
      estimatedAmount: estimatedAmount ?? null,
      submittedAt: new Date(),
    }).returning();

    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, u.dealershipId!)).limit(1);

    await emitEvent({
      eventId: "claim.submitted",
      domain: "Claims",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: u.dealershipId!,
      targetEntityType: "claim",
      targetEntityId: created.id,
      payload: {
        claimId: created.id,
        claimNumber: created.claimNumber,
        vin: unit.vin,
        manufacturer: created.manufacturer,
        dealerName: dealership?.name || "Dealer",
      },
      stateChanges: ["claim.status: null → new_unassigned"],
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("[claims-v6 POST /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/assign — operator admin assigns to staff
router.post("/:id/assign", async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "Only operator admin can assign" });
  }

  const { assignedToUserId } = req.body;
  if (!assignedToUserId) return res.status(400).json({ error: "assignedToUserId required" });

  try {
    const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
    if (!claim) return res.status(404).json({ error: "Not found" });

    await db.update(claims).set({
      assignedToUserId,
      assignedAt: new Date(),
      status: "assigned",
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
      payload: {
        claimNumber: claim.claimNumber,
        dealerName: dealership?.name || "Dealer",
      },
      forceRecipientUserIds: [assignedToUserId],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[claims-v6 POST /:id/assign]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v6/claims/:id/transition — operator transitions status
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

    const updates: Record<string, any> = { status: toStatus };
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
