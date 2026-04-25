// server/lib/event-bus.ts — Central event dispatcher
//
// Every business action calls emitEvent(). The bus:
//   1. Persists to events table
//   2. Computes fan-out from CATALOG
//   3. Writes notification_deliveries rows
//   4. Pushes in-app via WebSocket (delegates to websocket.ts)
//   5. Queues email via existing email-service (pending rows only — no sender yet)

import { db } from "../db";
import { events, notificationDeliveries, users } from "@shared/schema";
import { eq, and, or, inArray, sql } from "drizzle-orm";
import { sendToUser } from "./websocket";

type FanOut = {
  to_roles: string[];
  in_app: boolean;
  email: boolean | "opt_in";
  sms: boolean | "default_on" | "opt_in";
  priority: "informational" | "action_required" | "urgent";
  cta?: { label: string; route: string };
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
    },
  ],
  "claim.assigned_to_staff": [
    {
      to_roles: ["operator_staff"],
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
      to_roles: ["operator_staff"],
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
  domain: string;
  actorUserId?: string;
  actorRole?: string;
  dealershipId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  payload?: Record<string, any>;
  stateChanges?: string[];
  forceRecipientUserIds?: string[];
}

export async function emitEvent(input: EmitEventInput): Promise<void> {
  const fanOutRules = CATALOG[input.eventId] || [];

  const [eventRow] = await db.insert(events).values({
    eventId: input.eventId,
    domain: input.domain,
    actorUserId: input.actorUserId ?? null,
    actorRole: input.actorRole ?? null,
    dealershipId: input.dealershipId ?? null,
    targetEntityType: input.targetEntityType ?? null,
    targetEntityId: input.targetEntityId ?? null,
    payload: input.payload || {},
    stateChanges: input.stateChanges || [],
    priority: (fanOutRules[0]?.priority || "informational") as any,
    fanOutComplete: false,
  }).returning();

  if (fanOutRules.length === 0) {
    console.log(`[event-bus] ${input.eventId} fired (no fan-out rules)`);
    await db.update(events).set({ fanOutComplete: true }).where(eq(events.id, eventRow.id));
    return;
  }

  for (const rule of fanOutRules) {
    let recipientUsers: { id: string; email: string }[] = [];

    if (input.forceRecipientUserIds && input.forceRecipientUserIds.length > 0) {
      const found = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(and(
          inArray(users.id, input.forceRecipientUserIds),
          eq(users.isActive, true)
        ));
      recipientUsers = found;
    } else if (rule.to_roles.includes("__COUNTERPARTY__")) {
      continue;
    } else {
      const roleConditions = rule.to_roles.map(r =>
        sql`${users.roles}::jsonb @> ${JSON.stringify([r])}::jsonb`
      );

      const isOperatorRole = rule.to_roles.some(r => r.startsWith("operator_"));
      const where = isOperatorRole
        ? and(or(...roleConditions), eq(users.isActive, true))
        : input.dealershipId
          ? and(or(...roleConditions), eq(users.dealershipId, input.dealershipId), eq(users.isActive, true))
          : and(or(...roleConditions), eq(users.isActive, true));

      recipientUsers = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(where);
    }

    const { title, body } = rule.body_template(input.payload || {});

    for (const recipient of recipientUsers) {
      const channels: Array<"in_app" | "email"> = [];
      if (rule.in_app) channels.push("in_app");
      if (rule.email === true) channels.push("email");

      for (const channel of channels) {
        await db.insert(notificationDeliveries).values({
          eventId: eventRow.id,
          recipientUserId: recipient.id,
          channel,
          status: "pending",
          surface: input.eventId,
          title,
          body,
          ctaLabel: rule.cta?.label ?? null,
          ctaRoute: rule.cta?.route ?? null,
          isRead: false,
        });

        if (channel === "in_app") {
          sendToUser(recipient.id, {
            type: "notification",
            payload: {
              eventId: input.eventId,
              title,
              body,
              cta: rule.cta,
              priority: rule.priority,
            },
          });
        }
      }
    }
  }

  await db.update(events).set({ fanOutComplete: true }).where(eq(events.id, eventRow.id));
}
