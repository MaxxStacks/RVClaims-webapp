// server/routes/customers.ts — Customer (client-role user) management
// GET  /api/customers         — list customers for a dealership
// GET  /api/customers/:id     — single customer + linked unit
// POST /api/customers/invite  — send portal invitation to a customer (dealer_owner / operator_admin)
// DELETE /api/customers/:id   — revoke portal access

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { users, units, invitations } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole, canAccessDealership } from "../middleware/rbac";
import { generateSecureToken, getInviteExpiry } from "../lib/auth";
import { sendInvitationEmail } from "../lib/email-service";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();
router.use(requireAuth);

// ==================== GET /api/customers ====================
router.get("/", async (req: Request, res: Response) => {
  try {
    const u = req.user!;
    const isOperator = OPERATOR_ROLES.includes(u.role as any);

    // Build conditions
    const conditions: any[] = [eq(users.role, "client")];

    if (isOperator) {
      // Operator can optionally filter by dealership
      const dealershipId = req.query.dealershipId as string;
      if (dealershipId) conditions.push(eq(users.dealershipId, dealershipId));
    } else if (u.role === "dealer_owner" || u.role === "dealer_staff") {
      // Dealers only see customers in their own dealership
      if (!u.dealershipId) return res.json({ success: true, customers: [] });
      conditions.push(eq(users.dealershipId, u.dealershipId));
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const customers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        dealershipId: users.dealershipId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt));

    // Enrich each customer with their linked unit
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const linkedUnit = await db
          .select({
            id: units.id,
            vin: units.vin,
            year: units.year,
            manufacturer: units.manufacturer,
            model: units.model,
          })
          .from(units)
          .where(eq(units.customerId, c.id))
          .limit(1);

        return {
          ...c,
          name: `${c.firstName} ${c.lastName}`.trim(),
          unit: linkedUnit[0] || null,
        };
      })
    );

    res.json({ success: true, customers: enriched });
  } catch (error) {
    console.error("List customers error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/customers/invite ====================
// Must be before /:id so it is not swallowed by the param route
router.post("/invite", requireRole("dealer_owner", "operator_admin"), async (req: Request, res: Response) => {
  try {
    const { email, unitId, dealershipId: bodyDealershipId, personalMessage } = req.body;

    if (!email || !unitId) {
      return res.status(400).json({ success: false, message: "email and unitId are required" });
    }

    const u = req.user!;
    const dealershipId = OPERATOR_ROLES.includes(u.role as any)
      ? bodyDealershipId
      : u.dealershipId;

    if (!dealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    // Verify unit belongs to the dealership
    const [unit] = await db
      .select({ id: units.id, vin: units.vin, year: units.year, manufacturer: units.manufacturer, model: units.model })
      .from(units)
      .where(and(eq(units.id, unitId), eq(units.dealershipId, dealershipId)))
      .limit(1);

    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found or does not belong to this dealership" });
    }

    // Check for existing pending invitation
    const existing = await db
      .select({ id: invitations.id })
      .from(invitations)
      .where(and(eq(invitations.email, email), eq(invitations.role, "client")))
      .limit(1);

    if (existing.length > 0) {
      // Update the existing invitation with a fresh token
      const newToken = generateSecureToken();
      await db
        .update(invitations)
        .set({ token: newToken, unitId, dealershipId, invitedBy: u.id, expiresAt: getInviteExpiry(), acceptedAt: null })
        .where(eq(invitations.id, existing[0].id));

      await sendInvitationEmail(email, { dealershipName: dealershipId, role: "client", token: newToken });
      return res.json({ success: true, message: "Invitation resent" });
    }

    const token = generateSecureToken();
    const [invitation] = await db
      .insert(invitations)
      .values({
        email,
        role: "client",
        dealershipId,
        unitId,
        invitedBy: u.id,
        token,
        expiresAt: getInviteExpiry(),
      })
      .returning();

    await sendInvitationEmail(email, { dealershipName: dealershipId, role: "client", token });

    res.status(201).json({ success: true, invitation: { id: invitation.id, email, token } });
  } catch (error) {
    console.error("Invite customer error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/customers/:id ====================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const u = req.user!;
    const [customer] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        dealershipId: users.dealershipId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.id, req.params.id), eq(users.role, "client")))
      .limit(1);

    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    // Access check
    if (!OPERATOR_ROLES.includes(u.role as any) && !canAccessDealership(customer.dealershipId!, u)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const linkedUnit = await db
      .select()
      .from(units)
      .where(eq(units.customerId, customer.id))
      .limit(1);

    res.json({
      success: true,
      customer: {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        unit: linkedUnit[0] || null,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== DELETE /api/customers/:id ====================
router.delete("/:id", requireRole("dealer_owner", "operator_admin"), async (req: Request, res: Response) => {
  try {
    const u = req.user!;
    const [customer] = await db
      .select({ id: users.id, dealershipId: users.dealershipId, email: users.email })
      .from(users)
      .where(and(eq(users.id, req.params.id), eq(users.role, "client")))
      .limit(1);

    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    if (!canAccessDealership(customer.dealershipId!, u)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Deactivate rather than hard delete to preserve audit trail
    await db.update(users).set({ isActive: false }).where(eq(users.id, customer.id));

    res.json({ success: true, message: "Customer access revoked" });
  } catch (error) {
    console.error("Revoke customer access error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
