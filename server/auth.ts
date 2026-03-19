import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import type { UserRole } from "@shared/constants";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required");
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET env var is required");
  return secret;
}

// ─── Bcrypt ───────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: UserRole;
  dealerId: string | null;
}

// ─── Access tokens (15 min) ───────────────────────────────────────────────────

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "rvclaims",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    issuer: "rvclaims",
  }) as jwt.JwtPayload & JwtPayload;

  return {
    userId: decoded.userId,
    role: decoded.role,
    dealerId: decoded.dealerId,
  };
}

// ─── Refresh tokens (7 days) ──────────────────────────────────────────────────

/**
 * Generate a cryptographically random refresh token string.
 * The caller is responsible for hashing before DB storage.
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
}

// ─── Cookie constants (shared between auth-routes and anywhere that clears it) ─

export const REFRESH_COOKIE_NAME = "rv_rt";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
  maxAge: REFRESH_TOKEN_EXPIRY_MS,
};
