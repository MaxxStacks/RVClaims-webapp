// server/lib/auth.ts — Non-JWT auth utilities still used post-Clerk migration
// Clerk manages passwords and session tokens; this file keeps invite/reset helpers.

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { PLATFORM_DEFAULTS } from "@shared/constants";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  return timingSafeEqual(derived, keyBuffer);
}

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function getInviteExpiry(): Date {
  const expires = new Date();
  expires.setHours(expires.getHours() + PLATFORM_DEFAULTS.inviteExpiryHours);
  return expires;
}

export function getResetExpiry(): Date {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + PLATFORM_DEFAULTS.passwordResetExpiryMinutes);
  return expires;
}

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

// verifyToken stub — WS JWT auth superseded by Clerk in Phase 1B.
// Returns null for all tokens; WebSocket Clerk auth in a future phase.
export async function verifyToken(_token: string): Promise<{
  type: string;
  userId: string;
  role: string;
  dealershipId?: string;
} | null> {
  return null;
}
