// server/routes/auth.ts — Authentication endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { users, sessions, invitations, auditLog, loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, verifyToken, generateSecureToken, generateSessionId, getResetExpiry } from "../lib/auth";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { TOKEN_TYPES, OPERATOR_ROLES, DEALER_ROLES } from "@shared/constants";
import { sendPasswordResetEmail } from "../lib/email-service";

const router = Router();

// ==================== POST /api/auth/login ====================
router.post("/login", validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, portalType } = req.body;

    let user: typeof users.$inferSelect | undefined;
    try {
      const [found] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      user = found;
    } catch (dbErr: any) {
      const msg = dbErr?.message || "";
      if (msg.includes("DATABASE_URL") || msg.includes("connect")) {
        return res.status(503).json({ success: false, message: "Database not configured. Add DATABASE_URL to your environment and run db:push." });
      }
      if (msg.includes("does not exist") || msg.includes("relation")) {
        return res.status(503).json({ success: false, message: "Database schema not set up. Run: npm run db:push && npx tsx server/seed.ts" });
      }
      throw dbErr;
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Portal-type validation: never reveal role exists at wrong door
    if (portalType === "operator" && !OPERATOR_ROLES.includes(user.role as any)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (portalType === "dealer" && !DEALER_ROLES.includes(user.role as any)) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (portalType === "client" && user.role !== "client") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (portalType === "bidder" && user.role !== "bidder") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.role as any, user.dealershipId || undefined);
    const refreshToken = await generateRefreshToken(user.id, user.role as any, user.dealershipId || undefined);

    // Create session
    const sessionId = generateSessionId();
    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip || null,
    });

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Audit log
    await db.insert(auditLog).values({
      userId: user.id,
      action: "user.login",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip || null,
    });

    // Store refresh token in httpOnly cookie so page reloads restore the session
    res.cookie("ds360_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Determine redirect based on role
    let redirectTo = "/dealer/dashboard";
    if (OPERATOR_ROLES.includes(user.role as any)) redirectTo = "/operator/dashboard";
    else if (user.role === "client") redirectTo = "/client/dashboard";
    else if (user.role === "bidder") redirectTo = "/bidder/dashboard";

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dealershipId: user.dealershipId,
        language: user.language,
        avatarUrl: user.avatarUrl,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/auth/register (from invitation) ====================
router.post("/register", validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { token, password, firstName, lastName, phone } = req.body;

    // Find valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.token, token), eq(invitations.acceptedAt, null as any)))
      .limit(1);

    if (!invitation) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation" });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ success: false, message: "Invitation has expired" });
    }

    // Check if email already registered
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, invitation.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email: invitation.email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role: invitation.role,
        dealershipId: invitation.dealershipId,
      })
      .returning();

    // Mark invitation as accepted
    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    // Generate tokens
    const accessToken = await generateAccessToken(newUser.id, newUser.role as any, newUser.dealershipId || undefined);
    const refreshToken = await generateRefreshToken(newUser.id, newUser.role as any, newUser.dealershipId || undefined);

    // Audit log
    await db.insert(auditLog).values({
      userId: newUser.id,
      action: "user.registered",
      entityType: "user",
      entityId: newUser.id,
      metadata: { invitationId: invitation.id, role: invitation.role },
      ipAddress: req.ip || null,
    });

    let redirectTo = "/dealer/dashboard";
    if (OPERATOR_ROLES.includes(newUser.role as any)) redirectTo = "/operator/dashboard";
    else if (newUser.role === "client") redirectTo = "/client/dashboard";
    else if (newUser.role === "bidder") redirectTo = "/bidder/dashboard";

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        dealershipId: newUser.dealershipId,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/auth/refresh ====================
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    // Read refresh token from httpOnly cookie (set at login) or body (legacy)
    const refreshToken = req.cookies?.ds360_refresh || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No session" });
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== TOKEN_TYPES.REFRESH) {
      res.clearCookie("ds360_refresh", { path: "/" });
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    // Verify user still exists and is active
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      res.clearCookie("ds360_refresh", { path: "/" });
      return res.status(401).json({ success: false, message: "Account not found or deactivated" });
    }

    // Generate new access token
    const accessToken = await generateAccessToken(user.id, user.role as any, user.dealershipId || undefined);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dealershipId: user.dealershipId,
        language: user.language,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/auth/forgot-password ====================
router.post("/forgot-password", validateBody(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user && user.isActive) {
      const resetToken = generateSecureToken();
      const expiresAt = getResetExpiry();

      // Store reset token in invitations table (reuse for simplicity)
      await db.insert(invitations).values({
        email: user.email,
        role: user.role as any,
        invitedBy: user.id,
        token: resetToken,
        expiresAt,
      });

      await sendPasswordResetEmail(user.email, {
        firstName: user.firstName,
        token: resetToken,
        lang: (user.language as "en" | "fr") || "en",
      });
    }

    res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/auth/reset-password ====================
router.post("/reset-password", validateBody(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.token, token), eq(invitations.acceptedAt, null as any)))
      .limit(1);

    if (!invitation || new Date() > invitation.expiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, invitation.email))
      .limit(1);

    if (!user) {
      return res.status(400).json({ success: false, message: "Account not found" });
    }

    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

    // Mark token as used
    await db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, invitation.id));

    // Invalidate all existing sessions
    await db.delete(sessions).where(eq(sessions.userId, user.id));

    // Audit log
    await db.insert(auditLog).values({
      userId: user.id,
      action: "user.password_reset",
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip || null,
    });

    res.json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/auth/logout ====================
router.post("/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    // Delete all sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, req.user!.id));

    res.clearCookie("ds360_refresh", { path: "/" });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/auth/me ====================
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        dealershipId: users.dealershipId,
        timezone: users.timezone,
        language: users.language,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
