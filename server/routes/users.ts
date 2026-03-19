// server/routes/users.ts — User management and invitation endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { users, invitations, auditLog, insertInvitationSchema } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole, requireOperator, scopeToDealership, canAccessDealership } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateSecureToken, getInviteExpiry, hashPassword } from "../lib/auth";
import { OPERATOR_ROLES, DEALER_ROLES } from "@shared/constants";
import { sendInvitationEmail } from "../lib/email-service";
import { z } from "zod";

const router = Router();

// ==================== GET /api/users ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const conditions = [];

    if (OPERATOR_ROLES.includes(req.user!.role as any)) {
      // Operators see all users, optionally filtered by dealership
      if (req.scopedDealershipId) {
        conditions.push(eq(users.dealershipId, req.scopedDealershipId));
      }
    } else if (req.user!.role === "dealer_owner") {
      // Dealer owners see their own staff
      conditions.push(eq(users.dealershipId, req.user!.dealershipId!));
    } else {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        dealershipId: users.dealershipId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(users.firstName);

    res.json({ success: true, users: allUsers });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/users/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
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
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.params.id))
      .limit(1);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Users can view themselves, operators can view anyone, dealer owners can view their staff
    const isSelf = req.user!.id === user.id;
    const isOperator = OPERATOR_ROLES.includes(req.user!.role as any);
    const isDealerOwner = req.user!.role === "dealer_owner" && user.dealershipId === req.user!.dealershipId;

    if (!isSelf && !isOperator && !isDealerOwner) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/users/:id ====================
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    // Users can update themselves, operators can update anyone
    const isSelf = req.user!.id === req.params.id;
    const isOperator = OPERATOR_ROLES.includes(req.user!.role as any);

    if (!isSelf && !isOperator) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const allowedFields: any = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      timezone: req.body.timezone,
      language: req.body.language,
      updatedAt: new Date(),
    };

    // Only operators can change roles and active status
    if (isOperator) {
      if (req.body.role) allowedFields.role = req.body.role;
      if (req.body.isActive !== undefined) allowedFields.isActive = req.body.isActive;
    }

    // Password change
    if (req.body.password) {
      allowedFields.passwordHash = await hashPassword(req.body.password);
    }

    const [updated] = await db
      .update(users)
      .set(allowedFields)
      .where(eq(users.id, req.params.id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      });

    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== DELETE /api/users/:id ====================
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const isOperator = OPERATOR_ROLES.includes(req.user!.role as any);
    const isDealerOwner = req.user!.role === "dealer_owner";

    if (!isOperator && !isDealerOwner) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    // Can't deactivate yourself
    if (req.user!.id === req.params.id) {
      return res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
    }

    const [deactivated] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning();

    if (!deactivated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deactivated" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/users/invite ====================
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["dealer_owner", "dealer_staff", "customer"]),
  dealershipId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
});

router.post("/invite", requireAuth, validateBody(inviteSchema), async (req: Request, res: Response) => {
  try {
    const { email, role, dealershipId, unitId } = req.body;

    // Permission checks
    const isOperator = OPERATOR_ROLES.includes(req.user!.role as any);
    const isDealerOwner = req.user!.role === "dealer_owner";

    if (!isOperator && !isDealerOwner) {
      return res.status(403).json({ success: false, message: "Cannot send invitations" });
    }

    // Dealer owners can only invite staff/customers to their own dealership
    const targetDealershipId = isDealerOwner ? req.user!.dealershipId! : dealershipId;

    if (!targetDealershipId && role !== "customer") {
      return res.status(400).json({ success: false, message: "Dealership ID required for this role" });
    }

    // Check if email already registered
    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const token = generateSecureToken();
    const expiresAt = getInviteExpiry();

    const [invitation] = await db
      .insert(invitations)
      .values({
        email: email.toLowerCase(),
        role,
        dealershipId: targetDealershipId,
        unitId,
        invitedBy: req.user!.id,
        token,
        expiresAt,
      })
      .returning();

    await sendInvitationEmail(email, {
      dealershipName: "RV Claims Dealer",
      role,
      token,
      lang: "en",
    });

    await db.insert(auditLog).values({
      userId: req.user!.id,
      action: "user.invited",
      entityType: "invitation",
      entityId: invitation.id,
      metadata: { email, role, dealershipId: targetDealershipId },
      ipAddress: req.ip || null,
    });

    res.status(201).json({ success: true, invitation: { id: invitation.id, email, role, expiresAt } });
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
