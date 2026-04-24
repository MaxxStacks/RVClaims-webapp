import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import {
  users,
  dealerships,
  sessions,
  registerSchema,
  loginSchema,
  type PublicUser,
} from "@shared/schema";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
  verifyAccessToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from "./auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { z } from "zod";

// Strip passwordHash before returning to client
function toPublicUser(user: typeof users.$inferSelect): PublicUser {
  const { passwordHash: _ph, ...pub } = user;
  return pub;
}

export function registerAuthRoutes(app: Express) {
  // ─── POST /api/auth/register ─────────────────────────────────────────────
  // Public self-registration. Creates a dealership + dealer_owner account.
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const body = registerSchema.parse(req.body);

      // Check for existing email
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, body.email.toLowerCase()))
        .limit(1);

      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      }

      const passwordHash = await hashPassword(body.password);

      // Create dealership record
      const [dealership] = await db
        .insert(dealerships)
        .values({
          name: body.dealershipName,
          email: body.dealershipEmail,
          phone: body.dealershipPhone,
          status: "active",
        })
        .returning();

      // Create dealer_owner user
      const [user] = await db
        .insert(users)
        .values({
          email: body.email.toLowerCase(),
          passwordHash,
          firstName: body.firstName,
          lastName: body.lastName,
          role: "dealer_owner",
          dealershipId: dealership.id,
          isActive: true,
        })
        .returning();

      const accessToken = signAccessToken({
        userId: user.id,
        role: user.role,
        dealerId: user.dealershipId,
      });

      // Create session record for refresh token
      const sessionId = generateRefreshToken();
      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      });

      res.cookie(REFRESH_COOKIE_NAME, sessionId, refreshCookieOptions);

      return res.status(201).json({
        success: true,
        accessToken,
        user: toPublicUser(user),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, message: "Validation error", errors: err.errors });
      }
      console.error("[auth] register error:", err);
      return res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  // ─── POST /api/auth/login ────────────────────────────────────────────────
  // Accepts an optional `portal` field: "dealer" | "operator".
  // When supplied, the user's role must match the portal — wrong-door
  // attempts return the same 401 as a bad password to prevent enumeration.
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const body = loginSchema
        .extend({
          portal: z.enum(["dealer", "operator"]).optional(),
        })
        .parse(req.body);

      const DEALER_ROLES = ["dealer_owner", "dealer_staff"] as const;
      const OPERATOR_ROLES = ["operator_admin", "operator_staff"] as const;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email.toLowerCase()))
        .limit(1);

      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const passwordOk = await verifyPassword(body.password, user.passwordHash);
      if (!passwordOk) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Portal door check — same generic 401 so we don't reveal the account exists on the other side
      if (body.portal === "dealer" && !(DEALER_ROLES as readonly string[]).includes(user.role)) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }
      if (body.portal === "operator" && !(OPERATOR_ROLES as readonly string[]).includes(user.role)) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Update last login timestamp (fire and forget)
      db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id))
        .catch((e) => console.error("[auth] lastLoginAt update failed:", e));

      const accessToken = signAccessToken({
        userId: user.id,
        role: user.role,
        dealerId: user.dealershipId,
      });

      // Create session record for refresh token
      const sessionId = generateRefreshToken();
      await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      });

      res.cookie(REFRESH_COOKIE_NAME, sessionId, refreshCookieOptions);

      return res.json({
        success: true,
        accessToken,
        user: toPublicUser(user),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, message: "Validation error", errors: err.errors });
      }
      console.error("[auth] login error:", err);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // ─── POST /api/auth/refresh ──────────────────────────────────────────────
  // Reads httpOnly refresh token cookie (session ID), rotates it, returns a new access token.
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    const sessionId: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!sessionId) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    try {
      const [stored] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      if (!stored) {
        res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
        return res
          .status(401)
          .json({ success: false, message: "Session invalid or expired" });
      }

      if (stored.expiresAt < new Date()) {
        // Clean up expired session
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
        return res
          .status(401)
          .json({ success: false, message: "Session expired" });
      }

      // Fetch current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, stored.userId))
        .limit(1);

      if (!user || !user.isActive) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
        return res
          .status(401)
          .json({ success: false, message: "User account is inactive" });
      }

      // Rotate session (delete old, create new)
      await db.delete(sessions).where(eq(sessions.id, sessionId));

      const newSessionId = generateRefreshToken();
      await db.insert(sessions).values({
        id: newSessionId,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
      });

      const accessToken = signAccessToken({
        userId: user.id,
        role: user.role,
        dealerId: user.dealershipId,
      });

      res.cookie(REFRESH_COOKIE_NAME, newSessionId, refreshCookieOptions);

      return res.json({ success: true, accessToken, user: toPublicUser(user) });
    } catch (err) {
      console.error("[auth] refresh error:", err);
      return res.status(500).json({ success: false, message: "Token refresh failed" });
    }
  });

  // ─── POST /api/auth/logout ───────────────────────────────────────────────
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const sessionId: string | undefined = req.cookies?.[REFRESH_COOKIE_NAME];

    if (sessionId) {
      await db
        .delete(sessions)
        .where(eq(sessions.id, sessionId))
        .catch((e) => console.error("[auth] session delete on logout failed:", e));
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: refreshCookieOptions.path });
    return res.json({ success: true, message: "Logged out" });
  });

  // ─── GET /api/auth/me ────────────────────────────────────────────────────
  // Returns the currently authenticated user. Requires a valid access token.
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user!.userId))
        .limit(1);

      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "User not found or inactive" });
      }

      return res.json({ success: true, user: toPublicUser(user) });
    } catch (err) {
      console.error("[auth] me error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
  });

  // ─── POST /api/auth/create-user ──────────────────────────────────────────
  // Operator-only: create any user type (operator_staff, dealer_owner, dealer_staff).
  // Dealer owners can also call this to create dealer_staff under their dealership.
  app.post(
    "/api/auth/create-user",
    requireAuth,
    async (req: Request, res: Response) => {
      const caller = req.user!;

      const createUserSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.enum(["dealer_owner", "dealer_staff", "operator_admin", "operator_staff"]),
        dealershipId: z.string().optional(),
      });

      try {
        const body = createUserSchema.parse(req.body);

        // Access control
        if (caller.role === "dealer_owner") {
          // Can only create dealer_staff within their own dealership
          if (body.role !== "dealer_staff") {
            return res.status(403).json({
              success: false,
              message: "Dealer owners can only create dealer staff accounts",
            });
          }
          body.dealershipId = caller.dealerId ?? undefined;
        } else if (caller.role === "operator_admin") {
          // Can create any role; dealershipId required for dealer roles
          if (
            (body.role === "dealer_owner" || body.role === "dealer_staff") &&
            !body.dealershipId
          ) {
            return res.status(400).json({
              success: false,
              message: "dealershipId is required for dealer roles",
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: "Insufficient permissions to create users",
          });
        }

        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, body.email.toLowerCase()))
          .limit(1);

        if (existing) {
          return res
            .status(409)
            .json({ success: false, message: "Email already registered" });
        }

        const passwordHash = await hashPassword(body.password);

        const [newUser] = await db
          .insert(users)
          .values({
            email: body.email.toLowerCase(),
            passwordHash,
            firstName: body.firstName,
            lastName: body.lastName,
            role: body.role,
            dealershipId: body.dealershipId ?? null,
            isActive: true,
          })
          .returning();

        return res.status(201).json({
          success: true,
          user: toPublicUser(newUser),
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ success: false, message: "Validation error", errors: err.errors });
        }
        console.error("[auth] create-user error:", err);
        return res.status(500).json({ success: false, message: "Failed to create user" });
      }
    }
  );
}
