// server/lib/notifications.ts — Unified notification service
// Creates in-app notification + sends email + pushes via WebSocket

import { db } from "../db";
import { notifications, users } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { emitNotification } from "./websocket";
import {
  sendClaimStatusEmail,
  sendInvoiceEmail,
  sendTicketNotificationEmail,
  sendWarrantyExpiryEmail,
} from "./email-service";

type NotificationType = "claim_update" | "invoice" | "payment" | "financing" | "parts" | "fi" | "ticket" | "system" | "announcement";

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  linkTo?: string;
  sendEmail?: boolean;
  emailData?: any;
}

/**
 * Create an in-app notification, push it via WebSocket, and optionally send an email.
 */
export async function createNotification(options: CreateNotificationOptions): Promise<void> {
  const { userId, type, title, message, linkTo, sendEmail: shouldEmail, emailData } = options;

  try {
    // 1. Insert into database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        linkTo,
        emailSent: false,
      })
      .returning();

    // 2. Push via WebSocket (real-time)
    emitNotification(userId, {
      id: notification.id,
      type,
      title,
      message,
      linkTo,
    });

    // 3. Send email if requested
    if (shouldEmail && emailData) {
      const [user] = await db
        .select({ email: users.email, firstName: users.firstName, language: users.language })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user) {
        let emailSent = false;
        const lang = (user.language as "en" | "fr") || "en";

        switch (type) {
          case "claim_update":
            emailSent = await sendClaimStatusEmail(user.email, {
              firstName: user.firstName,
              claimNumber: emailData.claimNumber,
              status: emailData.status,
              lang,
            });
            break;

          case "invoice":
            emailSent = await sendInvoiceEmail(user.email, {
              firstName: user.firstName,
              invoiceNumber: emailData.invoiceNumber,
              total: emailData.total,
              currency: emailData.currency || "CAD",
              dueDate: emailData.dueDate,
              lang,
            });
            break;

          case "ticket":
            emailSent = await sendTicketNotificationEmail(user.email, {
              firstName: user.firstName,
              ticketNumber: emailData.ticketNumber,
              subject: emailData.subject,
              message: emailData.message,
              isDealer: emailData.isDealer,
              lang,
            });
            break;

          default:
            // Generic email not implemented for this type
            break;
        }

        if (emailSent) {
          await db
            .update(notifications)
            .set({ emailSent: true })
            .where(eq(notifications.id, notification.id));
        }
      }
    }
  } catch (error) {
    console.error("[NOTIFICATION] Failed to create notification:", error);
  }
}

/**
 * Notify all users in a dealership about an event.
 */
export async function notifyDealership(
  dealershipId: string,
  options: Omit<CreateNotificationOptions, "userId">
): Promise<void> {
  const dealerUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.dealershipId, dealershipId), eq(users.isActive, true)));

  for (const user of dealerUsers) {
    await createNotification({ ...options, userId: user.id });
  }
}

/**
 * Notify all operator users about an event.
 */
export async function notifyOperators(
  options: Omit<CreateNotificationOptions, "userId">
): Promise<void> {
  const operatorUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.isActive, true),
        inArray(users.role, ["operator_admin", "operator_staff"])
      )
    );

  for (const user of operatorUsers) {
    await createNotification({ ...options, userId: user.id });
  }
}

/**
 * Claim status change notification — notifies dealer + operator.
 */
export async function notifyClaimUpdate(data: {
  claimNumber: string;
  status: string;
  dealershipId: string;
  updatedBy: string;
}): Promise<void> {
  const { claimNumber, status, dealershipId, updatedBy } = data;

  const title = `Claim ${claimNumber} — ${status.replace(/_/g, " ")}`;
  const linkTo = "/dealer"; // portals handle internal routing

  // Notify dealer team
  await notifyDealership(dealershipId, {
    type: "claim_update",
    title,
    message: `Claim ${claimNumber} status updated to ${status}`,
    linkTo,
    sendEmail: true,
    emailData: { claimNumber, status },
  });
}

/**
 * Invoice issued notification — notifies dealer owner.
 */
export async function notifyInvoiceIssued(data: {
  invoiceNumber: string;
  total: string;
  currency: string;
  dueDate?: string;
  dealershipId: string;
}): Promise<void> {
  const { invoiceNumber, total, currency, dueDate, dealershipId } = data;

  // Find dealer owner
  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.dealershipId, dealershipId),
        eq(users.role, "dealer_owner"),
        eq(users.isActive, true)
      )
    )
    .limit(1);

  if (owner) {
    await createNotification({
      userId: owner.id,
      type: "invoice",
      title: `Invoice ${invoiceNumber} — $${total} ${currency}`,
      message: dueDate ? `Due: ${dueDate}` : undefined,
      linkTo: "/dealer",
      sendEmail: true,
      emailData: { invoiceNumber, total, currency, dueDate },
    });
  }
}

/**
 * New ticket notification — notifies dealer when customer creates ticket.
 */
export async function notifyNewTicket(data: {
  ticketNumber: string;
  subject: string;
  dealershipId: string;
  customerId: string;
}): Promise<void> {
  const { ticketNumber, subject, dealershipId, customerId } = data;

  await notifyDealership(dealershipId, {
    type: "ticket",
    title: `New ticket: ${ticketNumber}`,
    message: subject,
    linkTo: "/dealer",
    sendEmail: true,
    emailData: { ticketNumber, subject, message: subject, isDealer: true },
  });
}

/**
 * Photo batch uploaded — notifies operators.
 */
export async function notifyBatchUploaded(data: {
  batchNumber: string;
  dealershipName: string;
  photoCount: number;
}): Promise<void> {
  const { batchNumber, dealershipName, photoCount } = data;

  await notifyOperators({
    type: "system",
    title: `New photo batch: ${batchNumber}`,
    message: `${dealershipName} uploaded ${photoCount} photos`,
    linkTo: "/operator",
  });
}
