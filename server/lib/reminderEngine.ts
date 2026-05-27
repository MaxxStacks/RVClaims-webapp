// server/lib/reminderEngine.ts — Service Reminder Send Engine
// Processes a reminder: finds eligible customers, checks prefs, sends push notifications

import { db } from "../db";
import {
  serviceReminders,
  serviceReminderSends,
  customerNotificationPreferences,
  notifications,
  units,
  users,
  dealerships,
} from "@shared/schema";
import { eq, and, lte, sql as drizzleSql } from "drizzle-orm";

// ─── Template variable renderer ───────────────────────────────────────────────

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

// ─── Category lookup for template type ────────────────────────────────────────

function getCategoryForTemplate(
  templateType: string
): "service" | "warranty" | "seasonal" | "promotions" {
  if (["winterization", "de_winterization", "spring_prep"].includes(templateType)) return "seasonal";
  if (templateType === "warranty_expiry") return "warranty";
  if (templateType === "annual_service") return "service";
  return "service";
}

// ─── processReminder ──────────────────────────────────────────────────────────

export async function processReminder(
  reminderId: string
): Promise<{ sent: number; skipped: number; failed: number }> {
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // 1. Load reminder
  const [reminder] = await db
    .select()
    .from(serviceReminders)
    .where(eq(serviceReminders.id, reminderId))
    .limit(1);

  if (!reminder || !reminder.isActive) {
    return { sent: 0, skipped: 0, failed: 0 };
  }

  // 2. Load dealership for branding
  const [dealership] = await db
    .select({ id: dealerships.id, name: dealerships.name })
    .from(dealerships)
    .where(eq(dealerships.id, reminder.dealershipId))
    .limit(1);

  const dealerName = dealership?.name ?? "Your Dealership";

  // 3. Build recipient query based on filter
  const filter = reminder.recipientFilter as Record<string, unknown>;
  const warrantyExpiring = filter?.warrantyExpiring === true;

  // Base: all customers linked to units at this dealership
  let unitsQuery = db
    .select({
      unitId: units.id,
      customerId: units.customerId,
      year: units.year,
      manufacturer: units.manufacturer,
      model: units.model,
      warrantyEnd: units.warrantyEnd,
    })
    .from(units)
    .where(
      and(
        eq(units.dealershipId, reminder.dealershipId),
        drizzleSql`${units.customerId} IS NOT NULL`
      )
    );

  const eligibleUnits = await unitsQuery;

  // Filter by warranty expiry if needed (within 90 days)
  const unitType = filter?.unitTypes as string[] | undefined;
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const filteredUnits = eligibleUnits.filter((u) => {
    if (warrantyExpiring && u.warrantyEnd) {
      const end = new Date(u.warrantyEnd);
      if (end > in90Days) return false;
    }
    if (unitType && unitType.length > 0) {
      // unitTypes filter not stored on units easily; skip for now
    }
    return true;
  });

  // De-duplicate by customerId (customer may have multiple units — use first)
  const seen = new Set<string>();
  const deduped = filteredUnits.filter((u) => {
    if (!u.customerId || seen.has(u.customerId)) return false;
    seen.add(u.customerId);
    return true;
  });

  // 4. Process each customer
  for (const unitRow of deduped) {
    if (!unitRow.customerId) continue;

    try {
      // Load customer
      const [customer] = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email })
        .from(users)
        .where(eq(users.id, unitRow.customerId))
        .limit(1);

      if (!customer) { skipped++; continue; }

      // Load or create notification preferences
      let [prefs] = await db
        .select()
        .from(customerNotificationPreferences)
        .where(eq(customerNotificationPreferences.userId, customer.id))
        .limit(1);

      if (!prefs) {
        const [created] = await db
          .insert(customerNotificationPreferences)
          .values({
            userId: customer.id,
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
            marketingOptIn: true,
            reminderCategories: { service: true, warranty: true, seasonal: true, promotions: true },
          })
          .returning();
        prefs = created;
      }

      // Check master opt-out
      if (!prefs.marketingOptIn) {
        await db.insert(serviceReminderSends).values({
          reminderId: reminder.id,
          customerId: customer.id,
          unitId: unitRow.unitId,
          channel: "push",
          status: "opted_out",
          sentAt: new Date(),
        });
        skipped++;
        continue;
      }

      // Check category opt-in
      const category = getCategoryForTemplate(reminder.templateType);
      const cats = prefs.reminderCategories as Record<string, boolean> | null;
      if (cats && cats[category] === false) {
        await db.insert(serviceReminderSends).values({
          reminderId: reminder.id,
          customerId: customer.id,
          unitId: unitRow.unitId,
          channel: "push",
          status: "opted_out",
          sentAt: new Date(),
        });
        skipped++;
        continue;
      }

      // Render template variables
      const templateVars: Record<string, string> = {
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        unitYear: String(unitRow.year ?? ""),
        unitMake: unitRow.manufacturer ?? "",
        unitModel: unitRow.model ?? "",
        dealerName,
        expiryDate: unitRow.warrantyEnd
          ? new Date(unitRow.warrantyEnd).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
          : "",
      };

      const renderedMessage = renderTemplate(reminder.message, templateVars);
      const renderedSubject = renderTemplate(reminder.subject, templateVars);

      let channelSent = false;

      // PUSH — insert into notifications (in-app)
      if (prefs.pushEnabled) {
        try {
          await db.insert(notifications).values({
            userId: customer.id,
            type: "system",
            title: renderedSubject,
            message: renderedMessage,
            isRead: false,
            emailSent: false,
          });

          await db.insert(serviceReminderSends).values({
            reminderId: reminder.id,
            customerId: customer.id,
            unitId: unitRow.unitId,
            channel: "push",
            status: "delivered",
            sentAt: new Date(),
          });
          channelSent = true;
        } catch {
          await db.insert(serviceReminderSends).values({
            reminderId: reminder.id,
            customerId: customer.id,
            unitId: unitRow.unitId,
            channel: "push",
            status: "failed",
            sentAt: new Date(),
          });
        }
      }

      // EMAIL — placeholder (Resend deferred)
      if (prefs.emailEnabled) {
        await db.insert(serviceReminderSends).values({
          reminderId: reminder.id,
          customerId: customer.id,
          unitId: unitRow.unitId,
          channel: "email",
          status: "queued", // not actually sent yet
          sentAt: new Date(),
        });
        // TODO: integrate Resend email provider
      }

      // SMS — placeholder (Twilio deferred)
      if (prefs.smsEnabled) {
        await db.insert(serviceReminderSends).values({
          reminderId: reminder.id,
          customerId: customer.id,
          unitId: unitRow.unitId,
          channel: "sms",
          status: "queued", // not actually sent yet
          sentAt: new Date(),
        });
        // TODO: integrate Twilio SMS provider
      }

      if (channelSent) sent++;
      else if (!prefs.pushEnabled && !prefs.emailEnabled && !prefs.smsEnabled) skipped++;
    } catch (err) {
      failed++;
      console.error("[reminderEngine] Error processing customer", unitRow.customerId, err);
    }
  }

  // 5. Update reminder stats
  await db
    .update(serviceReminders)
    .set({
      lastSentAt: new Date(),
      sendCount: (reminder.sendCount ?? 0) + sent,
      updatedAt: new Date(),
    })
    .where(eq(serviceReminders.id, reminderId));

  return { sent, skipped, failed };
}
