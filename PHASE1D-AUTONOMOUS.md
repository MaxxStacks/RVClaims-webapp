# PHASE1D-AUTONOMOUS.md
## DS360 Phase 1 Run 1D — Event Bus + Claims Workflow + Notifications

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE1D-DEPLOY-REPORT.md`.**

**This is the largest run yet. It builds the event bus infrastructure, the full Claims workflow as the first real working domain, and the Notifications Center across all 4 portals.**

---

## What this run delivers

A user with the right role can:
- Submit a new claim (dealer)
- See it appear in the operator's queue with a notification badge
- Operator assigns it to a staff member who gets notified
- Staff transitions through statuses (in review → submitted to mfr → approved/denied)
- Dealer sees status changes in real time, gets emails for action-required transitions
- Client sees the simplified status on their portal
- Photos can be uploaded, messages can be exchanged in a thread
- Notification bell updates in real time across all 4 portals

All of this is wired through the event bus (`events` table → `notification_deliveries` table → WebSocket + email).

---

## Inputs (in project root)

This run is self-contained — no external file inputs needed. Everything builds against:
- `shared/schema.ts` (already has events + notification_deliveries + claims tables from 1A)
- `server/routes/clerk-webhook.ts` (1B)
- `client/src/pages/*PortalV6.tsx` (1C)
- `DS360_Events_Catalog.json` for reference if it's still in project root

---

## Architecture overview

**The event bus pattern:**

```
User action (e.g. dealer submits claim)
  → server/routes/claims.ts handler runs
  → claim record created in DB
  → emitEvent("claim.submitted", payload) fires
  → server/lib/event-bus.ts:
     1. Inserts row into `events` table
     2. Reads claim catalog metadata to determine fan-out
     3. For each recipient role, finds users to notify
     4. Inserts rows into `notification_deliveries` (one per channel per user)
     5. Pushes in-app notifications via WebSocket
     6. Queues email via existing email service (sendgrid/resend/whatever's wired)
  → response returned to user
  → all recipients see badge updates instantly via WS
  → emails arrive within seconds
```

---

## Step 1 — Backup files about to be modified

```bash
mkdir -p .pre-phase1d-bak
cp shared/schema.ts .pre-phase1d-bak/schema.ts
cp -r client/src/pages/*PortalV6.tsx .pre-phase1d-bak/ 2>/dev/null || true
cp -r server/routes .pre-phase1d-bak/server-routes-bak 2>/dev/null || true
echo "Backups complete"
```

---

## Step 2 — Build the event bus library

Create `server/lib/event-bus.ts`:

```ts
// server/lib/event-bus.ts — Central event dispatcher
//
// Every business action calls emitEvent(). The bus:
//   1. Persists to events table
//   2. Computes fan-out from CATALOG
//   3. Writes notification_deliveries rows
//   4. Pushes in-app via WebSocket
//   5. Queues email via existing email-service

import { db } from "../db";
import { events, notificationDeliveries, users } from "@shared/schema";
import { eq, and, or, inArray, sql } from "drizzle-orm";

// Static catalog of fan-out rules per event id.
// This is the v7 catalog distilled to what the bus needs to dispatch.
// Keep in sync with DS360_Events_Catalog.json.
type FanOut = {
  to_roles: string[];          // recipient roles
  in_app: boolean;
  email: boolean | "opt_in";
  sms: boolean | "default_on" | "opt_in";
  priority: "informational" | "action_required" | "urgent";
  cta?: { label: string; route: string };
  // Derive in-app surface from event id at render time
  body_template: (payload: any) => { title: string; body: string };
};

const CATALOG: Record<string, FanOut[]> = {
  "claim.submitted": [
    {
      to_roles: ["operator_admin", "operator_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Assign or Work Claim", route: "/operator-v6" },
      body_template: (p) => ({
        title: "New claim submitted",
        body: `${p.dealerName || "A dealer"} submitted claim ${p.claimNumber} on VIN ${p.vin}`,
      }),
    },
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim submitted",
        body: `Your claim ${p.claimNumber} was received and is being reviewed`,
      }),
      // dealer_id scoped — set by emitEvent caller via dealershipId
    },
  ],
  "claim.assigned_to_staff": [
    {
      to_roles: ["operator_staff"],   // FILTER to assigned user only — handled in dispatch
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Work this claim", route: "/operator-v6" },
      body_template: (p) => ({
        title: "Claim assigned to you",
        body: `Claim ${p.claimNumber} (${p.dealerName}) was assigned to you for review`,
      }),
    },
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: false, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim under review",
        body: `Your claim ${p.claimNumber} has been assigned and is being reviewed`,
      }),
    },
  ],
  "claim.put_in_review": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim status updated",
        body: `Claim ${p.claimNumber} is now in review`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim status updated",
        body: `Your claim is now in review`,
      }),
    },
  ],
  "claim.info_requested": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Respond to operator", route: "/dealer-v6" },
      body_template: (p) => ({
        title: "Information requested",
        body: `Operator needs more info on claim ${p.claimNumber}: ${p.message?.slice(0, 100) || ""}`,
      }),
    },
  ],
  "claim.dealer_responded": [
    {
      to_roles: ["operator_staff"],   // assigned user only
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Review reply", route: "/operator-v6" },
      body_template: (p) => ({
        title: "Dealer responded",
        body: `${p.dealerName} responded on claim ${p.claimNumber}`,
      }),
    },
  ],
  "claim.submitted_to_mfr": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Submitted to manufacturer",
        body: `Claim ${p.claimNumber} submitted to ${p.manufacturer}. Mfr#: ${p.mfrClaimNumber || "pending"}`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim submitted to manufacturer",
        body: `Your claim has been submitted to the manufacturer`,
      }),
    },
  ],
  "claim.approved": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Order Parts", route: "/dealer-v6" },
      body_template: (p) => ({
        title: "Claim APPROVED",
        body: `Claim ${p.claimNumber} approved for $${p.approvedAmount}. Order parts to begin repair.`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim approved",
        body: `Your claim has been approved by the manufacturer`,
      }),
    },
  ],
  "claim.denied": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "urgent",
      cta: { label: "Discuss with operator", route: "/dealer-v6" },
      body_template: (p) => ({
        title: "Claim DENIED",
        body: `Claim ${p.claimNumber} was denied. Reason: ${p.denialReason || "see details"}`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Contact your dealer", route: "/client-v6" },
      body_template: (p) => ({
        title: "Claim update",
        body: `Your claim has an update — please contact your dealer for details`,
      }),
    },
  ],
  "claim.partial_approval": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "action_required",
      cta: { label: "Review breakdown", route: "/dealer-v6" },
      body_template: (p) => ({
        title: "Partial approval",
        body: `Claim ${p.claimNumber} partially approved. Some FRC lines approved, others denied.`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim update",
        body: `Your claim has been partially approved`,
      }),
    },
  ],
  "claim.message_added": [
    {
      // Counterparty notification — handled specially in dispatch
      to_roles: ["__COUNTERPARTY__"],
      in_app: true, email: false, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: `New message on claim ${p.claimNumber}`,
        body: `${p.senderName}: ${p.message?.slice(0, 80) || ""}`,
      }),
    },
  ],
  "claim.photo_added": [
    {
      to_roles: ["operator_admin", "operator_staff"],
      in_app: true, email: false, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Photo added to claim",
        body: `${p.dealerName} added a photo to claim ${p.claimNumber}`,
      }),
    },
  ],
  "claim.completed": [
    {
      to_roles: ["dealer_owner", "dealer_staff"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim completed",
        body: `Claim ${p.claimNumber} closed`,
      }),
    },
    {
      to_roles: ["client"],
      in_app: true, email: true, sms: "opt_in",
      priority: "informational",
      body_template: (p) => ({
        title: "Claim completed",
        body: `Your claim has been completed`,
      }),
    },
  ],
};

// ---------------------------------------------------------------------------
// emitEvent — public API
// ---------------------------------------------------------------------------

export interface EmitEventInput {
  eventId: string;
  domain: string;                 // "Claims", "Parts", etc.
  actorUserId?: string;            // null = system event
  actorRole?: string;
  dealershipId?: string;           // scopes dealer/client/etc. lookups
  targetEntityType?: string;       // "claim", "listing", etc.
  targetEntityId?: string;
  payload?: Record<string, any>;   // arbitrary data for body templates
  stateChanges?: string[];         // documentation of what changed
  // Optional override — for events with __COUNTERPARTY__ etc.
  forceRecipientUserIds?: string[];
}

export async function emitEvent(input: EmitEventInput): Promise<void> {
  const fanOutRules = CATALOG[input.eventId] || [];

  // 1. Persist event row
  const [eventRow] = await db.insert(events).values({
    eventId: input.eventId,
    domain: input.domain,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    dealershipId: input.dealershipId,
    targetEntityType: input.targetEntityType,
    targetEntityId: input.targetEntityId,
    payload: input.payload || {},
    stateChanges: input.stateChanges || [],
    priority: fanOutRules[0]?.priority || "informational",
    fanOutComplete: false,
  }).returning();

  if (fanOutRules.length === 0) {
    // No fan-out for this event id — log and return
    console.log(`[event-bus] ${input.eventId} fired (no fan-out rules)`);
    await db.update(events).set({ fanOutComplete: true }).where(eq(events.id, eventRow.id));
    return;
  }

  // 2. Dispatch to each fan-out rule
  for (const rule of fanOutRules) {
    let recipientUsers: { id: string; email: string }[] = [];

    if (input.forceRecipientUserIds && input.forceRecipientUserIds.length > 0) {
      // Explicit recipients (used for assigned-staff filtering)
      const found = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(and(
          inArray(users.id, input.forceRecipientUserIds),
          eq(users.isActive, true)
        ));
      recipientUsers = found;
    } else if (rule.to_roles.includes("__COUNTERPARTY__")) {
      // Skip — caller must use forceRecipientUserIds for counterparty
      continue;
    } else {
      // Look up users by role
      const baseQuery = db
        .select({ id: users.id, email: users.email })
        .from(users);

      // Build role filter via roles JSONB array containment
      // SQL: roles @> '["operator_admin"]' — matches users with that role
      const roleConditions = rule.to_roles.map(r =>
        sql`${users.roles}::jsonb @> ${JSON.stringify([r])}::jsonb`
      );

      // Scope by dealership if applicable
      const isOperatorRole = rule.to_roles.some(r => r.startsWith("operator_"));
      const where = isOperatorRole
        ? and(or(...roleConditions), eq(users.isActive, true))
        : input.dealershipId
          ? and(or(...roleConditions), eq(users.dealershipId, input.dealershipId), eq(users.isActive, true))
          : and(or(...roleConditions), eq(users.isActive, true));

      recipientUsers = await baseQuery.where(where);
    }

    // 3. Render body
    const { title, body } = rule.body_template(input.payload || {});

    // 4. Insert notification_deliveries rows
    for (const user of recipientUsers) {
      const channels: { channel: "in_app" | "email" | "sms"; on: boolean }[] = [];
      if (rule.in_app) channels.push({ channel: "in_app", on: true });
      if (rule.email === true) channels.push({ channel: "email", on: true });
      // SMS deferred — schema is ready but no sender wired yet
      // if (rule.sms === "default_on") channels.push({ channel: "sms", on: true });

      for (const ch of channels.filter(c => c.on)) {
        await db.insert(notificationDeliveries).values({
          eventId: eventRow.id,
          recipientUserId: user.id,
          channel: ch.channel,
          status: "pending",
          surface: input.eventId,
          title,
          body,
          ctaLabel: rule.cta?.label || null,
          ctaRoute: rule.cta?.route || null,
          isRead: false,
        });

        // 5. Fire WebSocket push for in-app
        if (ch.channel === "in_app") {
          pushInAppNotification(user.id, {
            eventId: input.eventId,
            title,
            body,
            cta: rule.cta,
            priority: rule.priority,
          });
        }
        // Email/SMS workers pick up "pending" deliveries from notification_deliveries
        // Email is fire-and-forget here for v1 — see step 5 of this run.
      }
    }
  }

  // 6. Mark fan-out complete
  await db.update(events).set({ fanOutComplete: true }).where(eq(events.id, eventRow.id));
}

// ---------------------------------------------------------------------------
// WebSocket push — uses existing /ws server (already initialized in 1B)
// ---------------------------------------------------------------------------

const userSockets = new Map<string, Set<WebSocket>>();

export function registerUserSocket(userId: string, ws: WebSocket) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId)!.add(ws);
}

export function unregisterUserSocket(userId: string, ws: WebSocket) {
  userSockets.get(userId)?.delete(ws);
}

function pushInAppNotification(userId: string, data: any) {
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return;
  const message = JSON.stringify({ type: "notification", data });
  for (const ws of sockets) {
    if (ws.readyState === 1 /* OPEN */) ws.send(message);
  }
}
```

---

## Step 3 — Wire WebSocket auth to event-bus user sockets

Find the existing WS server (likely `server/websocket/index.ts` or similar — the log earlier mentioned `[WS] WebSocket server initialized at /ws`).

Inside the connection handler, after authenticating the connection's user (Clerk JWT verification), call:

```ts
import { registerUserSocket, unregisterUserSocket } from "../lib/event-bus";

// when a new client connects and is authenticated:
registerUserSocket(authenticatedUserId, ws);

ws.on("close", () => {
  unregisterUserSocket(authenticatedUserId, ws);
});
```

If the WS server doesn't currently authenticate connections, add Clerk JWT verification to the upgrade handler. The token will arrive as a query param: `wss://dealersuite360.com/ws?token=<clerk_jwt>`.

---

## Step 4 — Build the Claims API

Create or replace `server/routes/claims.ts`:

```ts
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  claims, claimFrcLines, units, dealerships, users, photoBatches, photos
} from "@shared/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

// Generate a claim number CLM-NNNNN
async function nextClaimNumber(): Promise<string> {
  const all = await db.select({ n: claims.claimNumber }).from(claims);
  const max = all.reduce((m, r) => {
    const n = parseInt((r.n || "").replace(/\D/g, ""), 10);
    return !isNaN(n) && n > m ? n : m;
  }, 0);
  return `CLM-${String(max + 1).padStart(5, "0")}`;
}

// ---------- LIST claims (scoped by role) ----------
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  let rows;
  if (u.role === "operator_admin" || u.role === "operator_staff") {
    rows = await db.select().from(claims).orderBy(desc(claims.createdAt)).limit(200);
  } else if (u.role === "dealer_owner" || u.role === "dealer_staff") {
    rows = await db.select().from(claims)
      .where(eq(claims.dealershipId, u.dealershipId!))
      .orderBy(desc(claims.createdAt)).limit(200);
  } else if (u.role === "client") {
    // Client sees claims tied to their owned units
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
});

// ---------- GET single claim with details ----------
router.get("/:id", async (req: Request, res: Response) => {
  const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
  if (!claim) return res.status(404).json({ error: "Not found" });

  // RBAC scope check
  const u = req.user!;
  if (u.role === "dealer_owner" || u.role === "dealer_staff") {
    if (claim.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (u.role === "client") {
    const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
    if (!unit || unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
  }

  const frcLines = await db.select().from(claimFrcLines).where(eq(claimFrcLines.claimId, claim.id));
  const [unit] = await db.select().from(units).where(eq(units.id, claim.unitId)).limit(1);
  const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

  res.json({ claim, frcLines, unit, dealership });
});

// ---------- CREATE claim (dealer submits) ----------
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Only dealers can submit claims" });
  }

  const { unitId, type, manufacturer, dealerNotes, estimatedAmount } = req.body;
  if (!unitId || !type || !manufacturer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Verify unit belongs to dealer
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
    dealerNotes: dealerNotes || null,
    estimatedAmount: estimatedAmount || null,
    submittedAt: new Date(),
  }).returning();

  // Look up dealership name for the notification body
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
});

// ---------- ASSIGN claim to operator staff ----------
router.post("/:id/assign", async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") {
    return res.status(403).json({ error: "Only operator admin can assign" });
  }

  const { assignedToUserId } = req.body;
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
    forceRecipientUserIds: [assignedToUserId],  // narrow to assigned user only
    stateChanges: ["claim.status: new_unassigned → assigned"],
  });

  res.json({ ok: true });
});

// ---------- TRANSITION status (in_review, approved, denied, etc.) ----------
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

  const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.id)).limit(1);
  if (!claim) return res.status(404).json({ error: "Not found" });

  const updates: Record<string, any> = { status: toStatus };
  if (toStatus === "in_review") updates.reviewStartedAt = new Date();
  if (toStatus === "submitted_to_mfr") {
    updates.submittedToMfrAt = new Date();
    updates.manufacturerClaimNumber = mfrClaimNumber || null;
  }
  if (toStatus === "approved") {
    updates.approvedAt = new Date();
    updates.approvedAmount = approvedAmount || null;
  }
  if (toStatus === "denied") {
    updates.deniedAt = new Date();
    updates.denialReason = denialReason || null;
  }
  if (toStatus === "completed") updates.completedAt = new Date();

  await db.update(claims).set(updates).where(eq(claims.id, claim.id));

  const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, claim.dealershipId)).limit(1);

  // Map status → event id
  const eventIdMap: Record<string, string> = {
    in_review: "claim.put_in_review",
    info_requested: "claim.info_requested",
    submitted_to_mfr: "claim.submitted_to_mfr",
    approved: "claim.approved",
    denied: "claim.denied",
    partial_approval: "claim.partial_approval",
    completed: "claim.completed",
    reopened: "claim.reopened",
  };

  await emitEvent({
    eventId: eventIdMap[toStatus],
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

  res.json({ ok: true });
});

export default router;
```

Mount in `server/routes/index.ts` (or wherever routes are mounted):

```ts
import claimsV6Router from "./claims";
app.use("/api/v6/claims", claimsV6Router);
```

Use `/api/v6/claims` to keep separate from any existing `/api/claims` route until validation is complete.

---

## Step 5 — Build the Notifications API

Create `server/routes/notifications.ts`:

```ts
import { Router } from "express";
import { db } from "../db";
import { notificationDeliveries } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/notifications — last 50, unread first
router.get("/", async (req, res) => {
  const rows = await db.select().from(notificationDeliveries)
    .where(and(
      eq(notificationDeliveries.recipientUserId, req.user!.id),
      eq(notificationDeliveries.channel, "in_app"),
    ))
    .orderBy(desc(notificationDeliveries.createdAt))
    .limit(50);
  res.json(rows);
});

// GET /api/notifications/unread-count
router.get("/unread-count", async (req, res) => {
  const rows = await db.select().from(notificationDeliveries)
    .where(and(
      eq(notificationDeliveries.recipientUserId, req.user!.id),
      eq(notificationDeliveries.channel, "in_app"),
      eq(notificationDeliveries.isRead, false),
    ));
  res.json({ count: rows.length });
});

// POST /api/notifications/:id/read
router.post("/:id/read", async (req, res) => {
  await db.update(notificationDeliveries)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notificationDeliveries.id, req.params.id),
      eq(notificationDeliveries.recipientUserId, req.user!.id),
    ));
  res.json({ ok: true });
});

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", async (req, res) => {
  await db.update(notificationDeliveries)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notificationDeliveries.recipientUserId, req.user!.id),
      eq(notificationDeliveries.isRead, false),
    ));
  res.json({ ok: true });
});

export default router;
```

Mount at `/api/notifications`.

---

## Step 6 — Build the Notification Bell component

Create `client/src/components/NotificationBell.tsx`:

```tsx
import { useEffect, useState, useRef } from "react";
import { useApiFetch } from "@/lib/api";
import { useAuth } from "@clerk/clerk-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  isRead: boolean;
  createdAt: string;
  surface?: string;
}

export default function NotificationBell() {
  const apiFetch = useApiFetch();
  const { getToken } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  async function refresh() {
    try {
      const list = await apiFetch<Notification[]>("/api/notifications");
      setNotifs(list);
      const { count } = await apiFetch<{ count: number }>("/api/notifications/unread-count");
      setUnreadCount(count);
    } catch (err) {
      console.error("[NotificationBell] refresh failed", err);
    }
  }

  useEffect(() => { refresh(); }, []);

  // WebSocket for real-time pushes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token || cancelled) return;
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws?token=${token}`);
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "notification") refresh();
        } catch {}
      };
      ws.onerror = () => {};
    })();
    return () => { cancelled = true; wsRef.current?.close(); };
  }, []);

  async function markAllRead() {
    await apiFetch("/api/notifications/mark-all-read", { method: "POST" });
    await refresh();
  }

  return (
    <div style={{position: "relative"}}>
      <button
        onClick={() => setOpen(!open)}
        style={{background: "transparent", border: 0, cursor: "pointer", padding: 8, position: "relative"}}
        aria-label="Notifications"
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: "#c0392b", color: "white",
            borderRadius: 10, fontSize: 10, fontWeight: 600,
            padding: "1px 6px", minWidth: 18, textAlign: "center",
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 38, right: 0,
          width: 360, maxHeight: 480, overflowY: "auto",
          background: "white", border: "1px solid #e5eaf2", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1000,
        }}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #eee"}}>
            <strong style={{fontSize: 13}}>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{background: "none", border: 0, color: "#033280", fontSize: 11, cursor: "pointer"}}>
                Mark all read
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div style={{padding: 20, textAlign: "center", color: "#888", fontSize: 12}}>No notifications</div>
          ) : notifs.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (n.ctaRoute) window.location.href = n.ctaRoute;
              }}
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #f3f3f3",
                cursor: n.ctaRoute ? "pointer" : "default",
                background: n.isRead ? "white" : "#f0f5ff",
              }}
            >
              <div style={{fontSize: 12, fontWeight: 600, marginBottom: 2}}>{n.title}</div>
              <div style={{fontSize: 11, color: "#555"}}>{n.body}</div>
              {n.ctaLabel && (
                <div style={{fontSize: 11, color: "#033280", marginTop: 4, fontWeight: 500}}>{n.ctaLabel} ›</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 7 — Wire NotificationBell into all 4 V6 portals

In each of the 4 portal files (`OperatorPortalV6.tsx`, `DealerPortalV6.tsx`, `ClientPortalV6.tsx`, `BidderPortalV6.tsx`), find the sidebar logo block. After the `<span className="sidebar-badge">` line, add:

```tsx
import NotificationBell from "@/components/NotificationBell";
```

at the top of the file. Then near the top of the rendered sidebar (or wherever's natural — easiest is just before the user-info block in the sidebar-footer):

```tsx
<div style={{padding: "8px 12px", borderTop: "1px solid #eee"}}>
  <NotificationBell />
</div>
```

Place it consistently across all 4 portals.

---

## Step 8 — Build real Claims pages for each portal

This is where the scaffolds get replaced with working UI. Each portal needs a Claims page tailored to its role.

### 8A. Operator Portal — Claim Queue

Replace the `master.ops.claim_queue` page case in `OperatorPortalV6.tsx`. Find the `case 'master.ops.claim_queue':` line in `renderPage()`. Replace its return with a real component:

Create `client/src/components/operator/ClaimQueuePage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_COLUMNS = [
  { key: "new_unassigned", label: "New / Unassigned", color: "#1e88e5" },
  { key: "assigned", label: "Assigned", color: "#0891b2" },
  { key: "in_review", label: "In Review", color: "#f48120" },
  { key: "submitted_to_mfr", label: "Submitted to Mfr", color: "#9b59b6" },
  { key: "approved", label: "Approved", color: "#16a34a" },
  { key: "denied", label: "Denied", color: "#c0392b" },
  { key: "completed", label: "Completed", color: "#666" },
];

export default function ClaimQueuePage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiFetch<any[]>("/api/v6/claims");
      setClaims(list);
      // Fetch operator staff for assignment dropdown — endpoint may need to be added
      try {
        const staffList = await apiFetch<any[]>("/api/v6/users?role=operator_staff");
        setStaff(staffList);
      } catch {}
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function assignClaim(claimId: string, userId: string) {
    await apiFetch(`/api/v6/claims/${claimId}/assign`, {
      method: "POST", body: JSON.stringify({ assignedToUserId: userId }),
    });
    await refresh();
  }

  async function transition(claimId: string, toStatus: string, extras: any = {}) {
    await apiFetch(`/api/v6/claims/${claimId}/transition`, {
      method: "POST", body: JSON.stringify({ toStatus, ...extras }),
    });
    await refresh();
  }

  return (
    <div style={{padding: 24}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
        <div>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>Operations</div>
          <h1 style={{margin: "4px 0 0", fontSize: 22, fontWeight: 600}}>Claim Queue</h1>
        </div>
        <button onClick={refresh} style={{padding: "6px 14px", border: "1px solid #d5dbe5", borderRadius: 6, background: "white", fontSize: 12, cursor: "pointer"}}>
          Refresh
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12}}>
          {STATUS_COLUMNS.map(col => {
            const colClaims = claims.filter(c => c.status === col.key);
            return (
              <div key={col.key} style={{background: "#fafbfd", borderRadius: 8, padding: 10, minHeight: 200}}>
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
                  <strong style={{fontSize: 12, color: col.color}}>{col.label}</strong>
                  <span style={{fontSize: 11, color: "#888"}}>{colClaims.length}</span>
                </div>
                {colClaims.map(c => (
                  <div key={c.id} style={{background: "white", padding: 10, marginBottom: 6, borderRadius: 6, borderLeft: `3px solid ${col.color}`}}>
                    <div style={{fontSize: 11, fontWeight: 600}}>{c.claimNumber}</div>
                    <div style={{fontSize: 10, color: "#888"}}>{c.manufacturer} · {c.type}</div>
                    {c.status === "new_unassigned" && staff.length > 0 && (
                      <select
                        onChange={e => e.target.value && assignClaim(c.id, e.target.value)}
                        defaultValue=""
                        style={{marginTop: 6, fontSize: 10, padding: 4, width: "100%"}}
                      >
                        <option value="">Assign to...</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                      </select>
                    )}
                    {c.status === "assigned" && (
                      <button
                        onClick={() => transition(c.id, "in_review")}
                        style={{marginTop: 6, fontSize: 10, padding: 4, width: "100%", background: "#033280", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}
                      >Start review</button>
                    )}
                    {c.status === "in_review" && (
                      <div style={{display: "flex", gap: 4, marginTop: 6}}>
                        <button onClick={() => transition(c.id, "submitted_to_mfr", { mfrClaimNumber: prompt("Mfr claim #?") })} style={{flex: 1, fontSize: 9, padding: 4, background: "#9b59b6", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>To Mfr</button>
                      </div>
                    )}
                    {c.status === "submitted_to_mfr" && (
                      <div style={{display: "flex", gap: 4, marginTop: 6}}>
                        <button onClick={() => transition(c.id, "approved", { approvedAmount: prompt("Approved $?") })} style={{flex: 1, fontSize: 9, padding: 4, background: "#16a34a", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>Approve</button>
                        <button onClick={() => transition(c.id, "denied", { denialReason: prompt("Reason?") })} style={{flex: 1, fontSize: 9, padding: 4, background: "#c0392b", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>Deny</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

In `OperatorPortalV6.tsx` `renderPage()` switch, replace the `master.ops.claim_queue` case:

```tsx
import ClaimQueuePage from "@/components/operator/ClaimQueuePage";
// ...
case "master.ops.claim_queue": return <ClaimQueuePage />;
```

### 8B. Dealer Portal — Claims List + New Claim

Create `client/src/components/dealer/DealerClaimsPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

export default function DealerClaimsPage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ unitId: "", type: "", manufacturer: "", dealerNotes: "" });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiFetch<any[]>("/api/v6/claims");
      setClaims(list);
      try {
        const u = await apiFetch<any[]>("/api/units");
        setUnits(u);
      } catch {}
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function submit() {
    if (!form.unitId || !form.type || !form.manufacturer) {
      alert("Fill all required fields");
      return;
    }
    await apiFetch("/api/v6/claims", { method: "POST", body: JSON.stringify(form) });
    setShowNew(false);
    setForm({ unitId: "", type: "", manufacturer: "", dealerNotes: "" });
    await refresh();
  }

  const STATUS_COLOR: Record<string, string> = {
    new_unassigned: "#1e88e5", assigned: "#0891b2", in_review: "#f48120",
    submitted_to_mfr: "#9b59b6", approved: "#16a34a", denied: "#c0392b",
    partial_approval: "#b8860b", completed: "#666",
  };

  return (
    <div style={{padding: 24}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
        <div>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>Operations</div>
          <h1 style={{margin: "4px 0 0", fontSize: 22, fontWeight: 600}}>Claims</h1>
        </div>
        <button onClick={() => setShowNew(true)} style={{padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer"}}>
          + New Claim
        </button>
      </div>

      {showNew && (
        <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000}}>
          <div style={{background: "white", padding: 24, borderRadius: 8, minWidth: 480}}>
            <h2 style={{margin: "0 0 16px"}}>Submit New Claim</h2>
            <div style={{display: "grid", gap: 10}}>
              <label style={{fontSize: 12}}>Unit (VIN)
                <select value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4}}>
                  <option value="">Select a unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.vin} — {u.year} {u.manufacturer} {u.model}</option>)}
                </select>
              </label>
              <label style={{fontSize: 12}}>Manufacturer
                <input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4}} />
              </label>
              <label style={{fontSize: 12}}>Type
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4}}>
                  <option value="">Select type</option>
                  <option value="warranty">Warranty</option>
                  <option value="extended_warranty">Extended Warranty</option>
                  <option value="pdi">PDI</option>
                  <option value="daf">DAF</option>
                </select>
              </label>
              <label style={{fontSize: 12}}>Notes
                <textarea value={form.dealerNotes} onChange={e => setForm({...form, dealerNotes: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4, minHeight: 80}} />
              </label>
              <div style={{display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end"}}>
                <button onClick={() => setShowNew(false)} style={{padding: "8px 14px", border: "1px solid #ccc", background: "white", borderRadius: 6, cursor: "pointer"}}>Cancel</button>
                <button onClick={submit} style={{padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer"}}>Submit Claim</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? <div>Loading...</div> : (
        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
            <tr style={{borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888"}}>
              <th style={{padding: 10}}>Claim #</th>
              <th>Unit</th>
              <th>Type</th>
              <th>Manufacturer</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id} style={{borderBottom: "1px solid #f3f3f3", fontSize: 12}}>
                <td style={{padding: 10, fontWeight: 600}}>{c.claimNumber}</td>
                <td>{c.unitId?.slice(0, 8)}...</td>
                <td>{c.type}</td>
                <td>{c.manufacturer}</td>
                <td>
                  <span style={{padding: "2px 8px", borderRadius: 10, background: STATUS_COLOR[c.status] || "#888", color: "white", fontSize: 10, fontWeight: 600}}>
                    {c.status}
                  </span>
                </td>
                <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

In `DealerPortalV6.tsx` switch, replace the `dealer.ops.claims` case:

```tsx
import DealerClaimsPage from "@/components/dealer/DealerClaimsPage";
// ...
case "dealer.ops.claims": return <DealerClaimsPage />;
```

### 8C. Client Portal — Simplified Claims View

Create `client/src/components/client/ClientClaimsPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

export default function ClientClaimsPage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/api/v6/claims").then(setClaims).catch(() => setClaims([]));
  }, []);

  const STATUS_LABEL: Record<string, string> = {
    new_unassigned: "Submitted",
    assigned: "Being assigned",
    in_review: "Under review",
    submitted_to_mfr: "Sent to manufacturer",
    approved: "Approved",
    denied: "Not approved",
    partial_approval: "Partially approved",
    completed: "Completed",
  };

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 600, marginBottom: 16}}>My Claims</h1>
      {claims.length === 0 ? (
        <div style={{padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8}}>
          You have no active claims.
        </div>
      ) : (
        <div style={{display: "grid", gap: 10}}>
          {claims.map(c => (
            <div key={c.id} style={{padding: 16, border: "1px solid #e5eaf2", borderRadius: 8}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontSize: 14, fontWeight: 600}}>Claim {c.claimNumber}</div>
                  <div style={{fontSize: 12, color: "#888", marginTop: 2}}>{c.manufacturer}</div>
                </div>
                <div style={{padding: "4px 10px", background: "#eaf1fb", color: "#033280", borderRadius: 12, fontSize: 11, fontWeight: 600}}>
                  {STATUS_LABEL[c.status] || c.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

In `ClientPortalV6.tsx` switch, replace the `client.main.claims` case:

```tsx
import ClientClaimsPage from "@/components/client/ClientClaimsPage";
// ...
case "client.main.claims": return <ClientClaimsPage />;
```

### 8D. Bidder Portal — leave Claims-related pages as scaffolds (Bidder doesn't see claims)

---

## Step 9 — Add a small users endpoint for assignment dropdown

In `server/routes/users.ts` (create if missing), or in a new file, add:

```ts
import { Router } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/v6/users?role=operator_staff
router.get("/", async (req, res) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const role = req.query.role as string;
  if (!role) return res.json([]);
  const rows = await db.select({
    id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email,
  }).from(users).where(and(
    sql`${users.roles}::jsonb @> ${JSON.stringify([role])}::jsonb`,
    eq(users.isActive, true),
  ));
  res.json(rows);
});

export default router;
```

Mount at `/api/v6/users` in the main routes file.

---

## Step 10 — Verify build

```bash
npm run check 2>&1 | tee phase1d-typecheck.log | tail -40
```

Filter for new files specifically:
```bash
npm run check 2>&1 | grep -E "event-bus|notifications|claims|NotificationBell|ClaimQueue|DealerClaimsPage|ClientClaimsPage" | head -30
```

Fix any errors in NEW files. Pre-existing errors in `server/routes/marketplace.ts`, `server/routes/membership.ts`, `server/websocket/auctions.ts` can be ignored — they're from before this run.

```bash
npm run build 2>&1 | tee phase1d-build.log | tail -20
```

---

## Step 11 — Commit and push

```bash
git add -A
git commit -m "Phase 1D: event bus + Claims workflow end-to-end + Notifications Center across all 4 portals"
git push origin main
```

Wait ~3 min for Railway to redeploy.

---

## Step 12 — Smoke test

```bash
curl -I https://dealersuite360.com/api/v6/claims  # 401 without auth — that's fine
curl -I https://dealersuite360.com/api/notifications/unread-count
curl -I https://dealersuite360.com/operator-v6
curl -I https://dealersuite360.com/dealer-v6
```

All should return 200 (for HTML routes) or 401 (for protected APIs).

---

## Step 13 — Write the deploy report

Create `PHASE1D-DEPLOY-REPORT.md`:

```markdown
# Phase 1D Deploy Report

## Summary
- Event bus library at server/lib/event-bus.ts
- 12 Claims events wired with full fan-out (catalog hardcoded inline)
- Notifications API: GET /api/notifications, GET /api/notifications/unread-count, POST /api/notifications/:id/read, POST /api/notifications/mark-all-read
- Claims API at /api/v6/claims (list, get, create, assign, transition)
- Users helper API at /api/v6/users
- WebSocket extended to register sockets per user for in-app push
- NotificationBell component on all 4 portals
- ClaimQueuePage real component (Operator, replaces scaffold)
- DealerClaimsPage real component (Dealer, replaces scaffold)
- ClientClaimsPage real component (Client, replaces scaffold)

## Files added
- server/lib/event-bus.ts
- server/routes/claims.ts (new — uses /api/v6/claims namespace)
- server/routes/notifications.ts
- server/routes/users.ts (or extension)
- client/src/components/NotificationBell.tsx
- client/src/components/operator/ClaimQueuePage.tsx
- client/src/components/dealer/DealerClaimsPage.tsx
- client/src/components/client/ClientClaimsPage.tsx

## Files modified
- server/websocket/* (registered user sockets)
- server/routes/index.ts (or main routes mount)
- client/src/pages/OperatorPortalV6.tsx (NotificationBell + claim_queue case)
- client/src/pages/DealerPortalV6.tsx (NotificationBell + claims case)
- client/src/pages/ClientPortalV6.tsx (NotificationBell + claims case)
- client/src/pages/BidderPortalV6.tsx (NotificationBell only)

## Verification
- npm run check: [pass/fail; new-file errors only count]
- npm run build: [pass/fail]
- Smoke test routes: [pass/fail]

## Manual test for Jonathan
1. Sign in as operator (your account)
2. Open https://dealersuite360.com/portal-select-v6 → click Operator
3. Visit Claim Queue — should show empty board
4. Use Clerk dashboard to assign a 2nd test user the dealer_owner role with a dealershipId
5. Sign in as that test user → submit a claim
6. Switch back to operator account → claim appears in New/Unassigned with notification bell ping

## Known issues / deferred
- SMS delivery: schema-ready but no sender wired (Twilio/etc deferred to Phase 2)
- Email delivery: notification_deliveries marks email as 'pending' but no email worker yet — Phase 2 wires sendgrid/resend
- Photo upload UI: deferred (claim photos need S3/storage integration)
- Message thread UI: deferred — claim.message_added event is in catalog but the thread UI is not in this run
- All other domains (Parts, Marketplace, etc.): scaffolds only — Phase 2

## Ready for Phase 2
[yes/no]
```

---

## Constraints

- Do NOT modify existing `/api/claims` route (if it exists) — use `/api/v6/claims` namespace
- Do NOT replace existing portal files (`OperatorPortal.tsx`, etc.) — only modify V6 files
- Do NOT touch the schema — all tables already exist from 1A
- Do NOT add SMS provider integration — deferred
- Do NOT add email worker — `notification_deliveries` rows are written but no sender; this is intentional
- If the WS server doesn't have Clerk auth on upgrade, add it minimally — don't over-engineer
- Pre-existing TypeScript errors in marketplace.ts/membership.ts/auctions.ts are NOT this run's problem; ignore them

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE1D-AUTONOMOUS.md in the project root. Execute all 13 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE1D-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 60-90 minutes.
