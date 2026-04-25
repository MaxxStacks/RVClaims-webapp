// server/lib/email-worker.ts — Sends pending email notification_deliveries via Resend
import { Resend } from "resend";
import { db } from "../db";
import { notificationDeliveries, emailEvents, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM || "notifications@dealersuite360.com";
const APP_URL = process.env.APP_URL || "https://dealersuite360.com";
const POLL_INTERVAL_MS = 30_000;
const BATCH_SIZE = 25;

let started = false;

function renderEmailHTML(opts: {
  title: string; body: string; ctaLabel?: string | null; ctaRoute?: string | null;
  recipientName?: string;
}): string {
  const ctaButton = opts.ctaLabel && opts.ctaRoute ? `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr><td bgcolor="#033280" style="border-radius:6px;">
        <a href="${APP_URL}${opts.ctaRoute}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-family:Inter,system-ui,sans-serif;font-size:14px;">${opts.ctaLabel}</a>
      </td></tr>
    </table>` : "";

  const greeting = opts.recipientName ? `<p style="margin:0 0 12px;font-size:14px;color:#333;">Hi ${opts.recipientName},</p>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(3,50,128,0.08);">
    <tr><td bgcolor="#033280" style="padding:20px 28px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;font-weight:600;letter-spacing:-0.2px;">DealerSuite 360</h1>
    </td></tr>
    <tr><td style="padding:28px;">
      ${greeting}
      <h2 style="margin:0 0 12px;font-size:16px;color:#033280;font-weight:600;">${opts.title}</h2>
      <div style="font-size:14px;color:#333;line-height:1.5;">${opts.body}</div>
      ${ctaButton}
      <p style="margin:24px 0 0;font-size:11px;color:#999;">You're receiving this because of activity on your DealerSuite 360 account. <a href="${APP_URL}" style="color:#033280;">Sign in</a> to manage notifications.</p>
    </td></tr>
    <tr><td bgcolor="#f4f6f9" style="padding:14px 28px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#888;">DealerSuite 360 — RV Dealership Operating System</p>
    </td></tr>
  </table>
</body></html>`;
}

async function processBatch(): Promise<{ sent: number; failed: number }> {
  const pending = await db.select({
    id: notificationDeliveries.id,
    recipientUserId: notificationDeliveries.recipientUserId,
    title: notificationDeliveries.title,
    body: notificationDeliveries.body,
    ctaLabel: notificationDeliveries.ctaLabel,
    ctaRoute: notificationDeliveries.ctaRoute,
  }).from(notificationDeliveries).where(and(
    eq(notificationDeliveries.channel, "email"),
    eq(notificationDeliveries.status, "pending"),
  )).limit(BATCH_SIZE);

  if (pending.length === 0) return { sent: 0, failed: 0 };

  let sent = 0, failed = 0;
  for (const d of pending) {
    try {
      const [user] = await db.select({
        email: users.email,
        firstName: users.firstName,
      }).from(users).where(eq(users.id, d.recipientUserId)).limit(1);

      if (!user || !user.email) {
        await db.update(notificationDeliveries).set({
          status: "failed",
          failureReason: "recipient not found or no email",
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        await db.insert(emailEvents).values({
          deliveryId: d.id,
          eventType: "send_failed",
          payload: { error: "recipient not found or no email" },
        });
        failed++;
        continue;
      }

      const html = renderEmailHTML({
        title: d.title || "Update from DealerSuite 360",
        body: d.body || "",
        ctaLabel: d.ctaLabel,
        ctaRoute: d.ctaRoute,
        recipientName: user.firstName || undefined,
      });

      const result = await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: d.title || "Update from DealerSuite 360",
        html,
      });

      if (result.error) {
        await db.update(notificationDeliveries).set({
          status: "failed",
          failureReason: String(result.error),
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        await db.insert(emailEvents).values({
          deliveryId: d.id,
          eventType: "send_failed",
          recipientEmail: user.email,
          payload: { error: String(result.error) },
        });
        failed++;
      } else {
        const msgId = (result.data as any)?.id || null;
        await db.update(notificationDeliveries).set({
          status: "sent",
          sentAt: new Date(),
          providerMessageId: msgId,
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        await db.insert(emailEvents).values({
          deliveryId: d.id,
          eventType: "sent",
          recipientEmail: user.email,
          providerMessageId: msgId,
        });
        sent++;
      }
    } catch (err: any) {
      await db.update(notificationDeliveries).set({
        status: "failed",
        failureReason: err.message || String(err),
        updatedAt: new Date(),
      }).where(eq(notificationDeliveries.id, d.id));
      failed++;
    }
  }
  return { sent, failed };
}

export function startEmailWorker() {
  if (started) return;
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email-worker] RESEND_API_KEY not set — worker disabled");
    return;
  }
  started = true;
  console.log("[email-worker] Started, polling every 30s");

  const tick = async () => {
    try {
      const { sent, failed } = await processBatch();
      if (sent + failed > 0) {
        console.log(`[email-worker] sent=${sent} failed=${failed}`);
      }
    } catch (err) {
      console.error("[email-worker] tick error:", err);
    }
  };

  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}
