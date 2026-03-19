// server/lib/auth.ts — JWT token management, password hashing, session management

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { PLATFORM_DEFAULTS, TOKEN_TYPES, type UserRole } from "@shared/constants";

const scryptAsync = promisify(scrypt);

// ==================== PASSWORD HASHING ====================

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

// ==================== JWT TOKENS ====================

interface TokenPayload extends JWTPayload {
  userId: string;
  role: UserRole;
  dealershipId?: string;
  type: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ds360-dev-secret-change-in-production-" + randomBytes(16).toString("hex")
);

export async function generateAccessToken(userId: string, role: UserRole, dealershipId?: string): Promise<string> {
  return new SignJWT({
    userId,
    role,
    dealershipId,
    type: TOKEN_TYPES.ACCESS,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PLATFORM_DEFAULTS.jwtAccessExpiryMinutes}m`)
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(userId: string, role: UserRole, dealershipId?: string): Promise<string> {
  return new SignJWT({
    userId,
    role,
    dealershipId,
    type: TOKEN_TYPES.REFRESH,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${PLATFORM_DEFAULTS.jwtRefreshExpiryDays}d`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

// ==================== INVITE & RESET TOKENS ====================

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

// ==================== SESSION ID ====================

export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}
