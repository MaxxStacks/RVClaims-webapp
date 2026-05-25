// server/utils/notifications.ts — Reusable server-side notification creator
// Usage: import { createNotification } from "../utils/notifications";
//        await createNotification(userId, "system", "Title", "Body", "/link/path");

import { db } from "../db";
import { notifications, NOTIFICATION_TYPES } from "@shared/schema";

type NotifType = typeof NOTIFICATION_TYPES[number];

export async function createNotification(
  userId: string,
  type: NotifType,
  title: string,
  message: string,
  linkTo?: string
): Promise<void> {
  try {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message: message || undefined,
      linkTo: linkTo || undefined,
    });
  } catch (e) {
    console.error("[createNotification] failed:", e);
  }
}
