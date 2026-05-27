// server/routes/locations.ts — Multi-location Management API
// Registered at /api/dealerships/:id/locations (and settings sub-path)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  dealerships,
  dealershipLocations,
  users,
  units,
  claims,
  workOrders,
} from "@shared/schema";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { deductFromWallet } from "../lib/wallet";

const router = Router({ mergeParams: true });
router.use(requireAuth);

// ─── GET /api/dealerships/:id/locations ──────────────────────────────────────
// List active locations for a dealership (any dealer role, operator)
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId } = req.params;

  // Auth: dealer can only see their own; operators can see all
  if (["dealer_owner", "dealer_staff", "technician", "service_manager", "shop_manager", "parts_dept", "financial_manager"].includes(u.role)) {
    if (u.dealershipId !== dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const locations = await db
    .select()
    .from(dealershipLocations)
    .where(
      and(
        eq(dealershipLocations.dealershipId, dealershipId),
        eq(dealershipLocations.isActive, true),
      ),
    )
    .orderBy(dealershipLocations.isMain, dealershipLocations.name);

  res.json({ locations });
});

// ─── POST /api/dealerships/:id/locations ─────────────────────────────────────
// Create a new location (dealer_owner only)
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId } = req.params;

  if (u.role !== "dealer_owner" && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer owner access required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, address, city, province, postalCode, phone, email, managerUserId } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Location name is required" });
  }

  const [location] = await db
    .insert(dealershipLocations)
    .values({
      dealershipId,
      name: name.trim(),
      address: address || null,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
      phone: phone || null,
      email: email || null,
      managerUserId: managerUserId || null,
      isMain: false,
      isActive: true,
    })
    .returning();

  // Non-blocking wallet deduction of $149 for new additional location
  // TODO: Set up monthly recurring charge via Stripe subscription
  deductFromWallet(
    dealershipId,
    149,
    "subscription_fee",
    `Additional location fee — ${name.trim()}`,
    "manual",
    location.id,
    u.id,
  ).catch((err) => {
    console.error("[LOCATIONS] Wallet deduction failed for new location:", err);
  });

  // Enable multi-location on the dealership if not already
  await db
    .update(dealerships)
    .set({ multiLocationEnabled: true, updatedAt: new Date() })
    .where(eq(dealerships.id, dealershipId));

  res.status(201).json({ location });
});

// ─── PATCH /api/dealerships/:id/locations/:locationId ────────────────────────
// Update location (dealer_owner)
router.patch("/:locationId", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId, locationId } = req.params;

  if (u.role !== "dealer_owner" && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer owner access required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, address, city, province, postalCode, phone, email, managerUserId } = req.body;

  const [updated] = await db
    .update(dealershipLocations)
    .set({
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(province !== undefined ? { province } : {}),
      ...(postalCode !== undefined ? { postalCode } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(managerUserId !== undefined ? { managerUserId } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dealershipLocations.id, locationId),
        eq(dealershipLocations.dealershipId, dealershipId),
      ),
    )
    .returning();

  if (!updated) return res.status(404).json({ error: "Location not found" });

  res.json({ location: updated });
});

// ─── DELETE /api/dealerships/:id/locations/:locationId ───────────────────────
// Deactivate location (cannot deactivate isMain = true)
router.delete("/:locationId", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId, locationId } = req.params;

  if (u.role !== "dealer_owner" && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer owner access required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const [loc] = await db
    .select()
    .from(dealershipLocations)
    .where(
      and(
        eq(dealershipLocations.id, locationId),
        eq(dealershipLocations.dealershipId, dealershipId),
      ),
    )
    .limit(1);

  if (!loc) return res.status(404).json({ error: "Location not found" });
  if (loc.isMain) return res.status(400).json({ error: "Cannot deactivate the main location" });

  await db
    .update(dealershipLocations)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(dealershipLocations.id, locationId));

  res.json({ success: true });
});

// ─── PATCH /api/dealerships/:id/locations/:locationId/staff ──────────────────
// Assign staff to a location
router.patch("/:locationId/staff", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId, locationId } = req.params;

  if (u.role !== "dealer_owner" && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer owner access required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { userId, assignedLocationId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  // assignedLocationId = null means unassign (default to main)
  const [updated] = await db
    .update(users)
    .set({ locationId: assignedLocationId ?? null, updatedAt: new Date() })
    .where(
      and(
        eq(users.id, userId),
        eq(users.dealershipId, dealershipId),
      ),
    )
    .returning({ id: users.id, locationId: users.locationId });

  if (!updated) return res.status(404).json({ error: "User not found" });

  res.json({ success: true, user: updated });
});

// ─── GET /api/dealerships/:id/locations/:locationId/stats ────────────────────
// Per-location stats
router.get("/:locationId/stats", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId, locationId } = req.params;

  if (["dealer_owner", "dealer_staff", "service_manager"].includes(u.role)) {
    if (u.dealershipId !== dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const [unitsCount, claimsCount, workOrdersCount, staffCount] = await Promise.all([
    db
      .select({ cnt: count() })
      .from(units)
      .where(and(eq(units.dealershipId, dealershipId), eq(units.locationId, locationId)))
      .then((r) => r[0]?.cnt ?? 0),
    db
      .select({ cnt: count() })
      .from(claims)
      .where(and(eq(claims.dealershipId, dealershipId), eq(claims.locationId, locationId)))
      .then((r) => r[0]?.cnt ?? 0),
    db
      .select({ cnt: count() })
      .from(workOrders)
      .where(and(eq(workOrders.dealershipId, dealershipId), eq(workOrders.locationId, locationId)))
      .then((r) => r[0]?.cnt ?? 0),
    db
      .select({ cnt: count() })
      .from(users)
      .where(and(eq(users.dealershipId, dealershipId), eq(users.locationId, locationId), eq(users.isActive, true)))
      .then((r) => r[0]?.cnt ?? 0),
  ]);

  res.json({ units: Number(unitsCount), claims: Number(claimsCount), workOrders: Number(workOrdersCount), activeStaff: Number(staffCount) });
});

// ─── PATCH /api/dealerships/:id/settings/multi-location ──────────────────────
// Toggle multi-location settings
router.patch("/settings/multi-location", async (req: Request, res: Response) => {
  const u = req.user!;
  const { id: dealershipId } = req.params;

  if (u.role !== "dealer_owner" && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer owner access required" });
  }
  if (u.role === "dealer_owner" && u.dealershipId !== dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { multiLocationEnabled, crossLocationInventory } = req.body;

  const [updated] = await db
    .update(dealerships)
    .set({
      ...(multiLocationEnabled !== undefined ? { multiLocationEnabled } : {}),
      ...(crossLocationInventory !== undefined ? { crossLocationInventory } : {}),
      updatedAt: new Date(),
    })
    .where(eq(dealerships.id, dealershipId))
    .returning({ multiLocationEnabled: dealerships.multiLocationEnabled, crossLocationInventory: dealerships.crossLocationInventory });

  if (!updated) return res.status(404).json({ error: "Dealership not found" });

  res.json({ success: true, settings: updated });
});

export default router;
