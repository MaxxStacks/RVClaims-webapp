// server/middleware/assist-rate-limit.ts — In-memory rate limiting for DS360 Assist + Remote Support
// Uses rate-limiter-flexible with in-memory backend (no Redis dependency)

import { RateLimiterMemory } from "rate-limiter-flexible";
import type { Request, Response, NextFunction } from "express";

// ── Limiters ─────────────────────────────────────────────────────────────────

// AI assist messages: 60/hour + 10/minute burst per user
const assistHourlyLimiter = new RateLimiterMemory({
  points: 60,
  duration: 3600, // 1 hour
  keyPrefix: "assist_hourly",
});

const assistBurstLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, // 1 minute
  keyPrefix: "assist_burst",
});

// Live chat messages: 30/minute per user
const liveChatLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
  keyPrefix: "live_chat",
});

// Remote support session code generation: 5/hour per dealer
const remoteSessionLimiter = new RateLimiterMemory({
  points: 5,
  duration: 3600,
  keyPrefix: "remote_session",
});

// KB operations (operator only): 100/hour per user
const kbOpsLimiter = new RateLimiterMemory({
  points: 100,
  duration: 3600,
  keyPrefix: "kb_ops",
});

// ── Helper: extract key from request ─────────────────────────────────────────

function userKey(req: Request): string {
  return req.user?.clerkUserId ?? req.ip ?? "anonymous";
}

// ── Helper: build 429 response ────────────────────────────────────────────────

function tooMany(res: Response, retryAfterSecs: number, message: string) {
  res.set("Retry-After", String(Math.ceil(retryAfterSecs)));
  return res.status(429).json({
    success: false,
    error: "rate_limited",
    message,
    retryAfter: Math.ceil(retryAfterSecs),
  });
}

// ── Exported middleware functions ─────────────────────────────────────────────

/**
 * Rate limit the AI assist /message endpoint.
 * Checks both hourly quota and per-minute burst.
 */
export async function assistMessageRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = userKey(req);
  try {
    await assistHourlyLimiter.consume(key);
    await assistBurstLimiter.consume(key);
    next();
  } catch (err: any) {
    const retryAfter = err?.msBeforeNext ? err.msBeforeNext / 1000 : 60;
    tooMany(res, retryAfter, "Too many assist messages. Please wait before sending another.");
  }
}

/**
 * Rate limit live chat message sends (30/minute).
 */
export async function liveChatRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = userKey(req);
  try {
    await liveChatLimiter.consume(key);
    next();
  } catch (err: any) {
    const retryAfter = err?.msBeforeNext ? err.msBeforeNext / 1000 : 30;
    tooMany(res, retryAfter, "You're sending messages too quickly. Please slow down.");
  }
}

/**
 * Rate limit remote support session creation (5 codes/hour per dealer).
 */
export async function remoteSessionRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = userKey(req);
  try {
    await remoteSessionLimiter.consume(key);
    next();
  } catch (err: any) {
    const retryAfter = err?.msBeforeNext ? err.msBeforeNext / 1000 : 600;
    tooMany(
      res,
      retryAfter,
      "Too many screen share sessions created. Please wait before generating a new code."
    );
  }
}

/**
 * Rate limit KB article CRUD operations (100/hour per operator).
 */
export async function kbOpsRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = userKey(req);
  try {
    await kbOpsLimiter.consume(key);
    next();
  } catch (err: any) {
    const retryAfter = err?.msBeforeNext ? err.msBeforeNext / 1000 : 60;
    tooMany(res, retryAfter, "Too many knowledge base operations. Please wait before continuing.");
  }
}
