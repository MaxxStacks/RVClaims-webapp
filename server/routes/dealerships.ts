import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { dealerships, users, units, claims, dealershipModules, moduleCatalog, invitations } from "@shared/schema";
import { eq, and, ilike, desc, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import crypto from "crypto";

const router = Router();
router.use(requireAuth);

function requireOperator(req: Request, res: Response): boolean {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    res.status(403).json({ error: "Operator role required" });
    return false;
  }
  return true;
}

// GET /api/dealerships/catalog/modules — must be BEFORE /:id
router.get("/catalog/modules", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const rows = await db.select().from(moduleCatalog).where(eq(moduleCatalog.active, true)).orderBy(moduleCatalog.sortOrder);
  res.json(rows);
});

// GET /api/dealerships/pending-count — must be BEFORE /:id
router.get("/pending-count", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const [row] = await db.select({ c: count() }).from(dealerships).where(eq(dealerships.reviewStatus, "pending_review"));
  res.json({ count: Number(row?.c || 0) });
});

// GET /api/branding/me — dealer's branding (must be BEFORE /:id)
router.get("/branding/me", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!u.dealershipId) return res.json({ tier: "base", primaryColor: "#033280", secondaryColor: "#0cb22c", fontFamily: "Inter" });
  const [d] = await db.select().from(dealerships).where(eq(dealerships.id, u.dealershipId)).limit(1);
  if (!d) return res.json({ tier: "base" });
  res.json({
    tier: d.brandingTier || "base",
    name: d.name,
    logoUrl: d.logoUrl,
    primaryColor: d.primaryColor || "#033280",
    secondaryColor: d.secondaryColor || "#0cb22c",
    fontFamily: d.fontFamily || "Inter",
    emailFromName: d.emailFromName,
    customSubdomain: d.customSubdomain,
  });
});

// PATCH /api/branding/me
router.patch("/branding/me", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Dealer role required" });
  }
  if (!u.dealershipId) return res.status(400).json({ error: "No dealership" });
  const [d] = await db.select().from(dealerships).where(eq(dealerships.id, u.dealershipId)).limit(1);
  if (!d || d.brandingTier === "base") {
    return res.status(403).json({ error: "Branding requires Mid tier or higher" });
  }
  const allowed = ["logoUrl", "primaryColor", "secondaryColor", "fontFamily", "emailFromName"];
  if (d.brandingTier === "enterprise") allowed.push("customSubdomain");
  const updates: Record<string, any> = { updatedAt: new Date() };
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
  await db.update(dealerships).set(updates).where(eq(dealerships.id, u.dealershipId));
  res.json({ ok: true });
});

// GET /api/dealerships/my-modules — dealer-accessible, returns own enabled module keys
router.get("/my-modules", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!u.dealershipId) return res.json({ modules: [] });
  const rows = await db
    .select({ moduleKey: dealershipModules.moduleKey })
    .from(dealershipModules)
    .where(eq(dealershipModules.dealershipId, u.dealershipId));
  res.json({ modules: rows.map(r => r.moduleKey) });
});

// GET /api/dealerships — list with filters + KPIs
router.get("/", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const { status, search, reviewStatus } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (status) conditions.push(eq(dealerships.status, status as any));
  if (reviewStatus) conditions.push(eq(dealerships.reviewStatus, reviewStatus as any));
  if (search) conditions.push(ilike(dealerships.name, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db.select().from(dealerships).where(where).orderBy(desc(dealerships.createdAt)).limit(500);

  const enriched = await Promise.all(rows.map(async (d) => {
    const [unitCount] = await db.select({ c: count() }).from(units).where(eq(units.dealershipId, d.id));
    const [claimCount] = await db.select({ c: count() }).from(claims).where(eq(claims.dealershipId, d.id));
    return { ...d, unitCount: Number(unitCount?.c || 0), claimCount: Number(claimCount?.c || 0) };
  }));
  res.json(enriched);
});

// GET /api/dealerships/:id — full detail
router.get("/:id", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const [d] = await db.select().from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  if (!d) return res.status(404).json({ error: "Not found" });
  const dUsers = await db.select({
    id: users.id, firstName: users.firstName, lastName: users.lastName,
    email: users.email, role: users.role, roles: users.roles, isActive: users.isActive,
  }).from(users).where(eq(users.dealershipId, d.id));
  const enabledModules = await db.select().from(dealershipModules).where(eq(dealershipModules.dealershipId, d.id));
  const catalog = await db.select().from(moduleCatalog).where(eq(moduleCatalog.active, true)).orderBy(moduleCatalog.sortOrder);
  const [unitCount] = await db.select({ c: count() }).from(units).where(eq(units.dealershipId, d.id));
  const [claimCount] = await db.select({ c: count() }).from(claims).where(eq(claims.dealershipId, d.id));
  res.json({
    dealership: d, users: dUsers, modules: enabledModules, catalog,
    kpis: { unitCount: Number(unitCount?.c || 0), claimCount: Number(claimCount?.c || 0) },
  });
});

// POST /api/dealerships — create new dealership
router.post("/", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const {
    name, email, phone, addressLine1, addressLine2, city, stateProvince, postalCode, country,
    brandingTier,
  } = req.body;
  if (!name || !email) return res.status(400).json({ error: "name and email required" });

  const [created] = await db.insert(dealerships).values({
    name, email, phone: phone || null,
    addressLine1: addressLine1 || null, addressLine2: addressLine2 || null,
    city: city || null, stateProvince: stateProvince || null,
    postalCode: postalCode || null, country: country || "CA",
    brandingTier: brandingTier || "base",
    status: "active", reviewStatus: "active",
  }).returning();

  const baseModules = await db.select().from(moduleCatalog).where(eq(moduleCatalog.isBaseRequired, true));
  for (const mod of baseModules) {
    await db.insert(dealershipModules).values({
      dealershipId: created.id,
      moduleKey: mod.moduleKey,
      status: "enabled",
      enabledById: req.user!.id,
    });
  }

  res.status(201).json(created);
});

// PATCH /api/dealerships/:id — update
router.patch("/:id", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const allowed = [
    "name", "email", "phone", "addressLine1", "addressLine2", "city", "stateProvince", "postalCode", "country",
    "brandingTier", "status", "reviewStatus",
  ];
  const updates: Record<string, any> = { updatedAt: new Date() };
  for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
  await db.update(dealerships).set(updates).where(eq(dealerships.id, req.params.id));
  const [updated] = await db.select().from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  res.json(updated);
});

// POST /api/dealerships/:id/approve
router.post("/:id/approve", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  await db.update(dealerships).set({
    reviewStatus: "active",
    status: "active",
    reviewedAt: new Date(),
    reviewedById: req.user!.id,
    reviewNotes: req.body.notes || null,
  }).where(eq(dealerships.id, req.params.id));
  res.json({ ok: true });
});

// POST /api/dealerships/:id/reject
router.post("/:id/reject", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  await db.update(dealerships).set({
    reviewStatus: "rejected",
    reviewedAt: new Date(),
    reviewedById: req.user!.id,
    reviewNotes: req.body.notes || null,
  }).where(eq(dealerships.id, req.params.id));
  res.json({ ok: true });
});

// POST /api/dealerships/:id/modules/:moduleKey — enable
router.post("/:id/modules/:moduleKey", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const { id, moduleKey } = req.params;
  const { monthlyCents, setupCents, perUseCents, commissionBps, notes } = req.body;
  const [existing] = await db.select().from(dealershipModules)
    .where(and(eq(dealershipModules.dealershipId, id), eq(dealershipModules.moduleKey, moduleKey as any)));
  if (existing) {
    await db.update(dealershipModules).set({
      status: "enabled",
      monthlyCents, setupCents, perUseCents, commissionBps, notes,
      enabledAt: new Date(), enabledById: req.user!.id,
    }).where(eq(dealershipModules.id, existing.id));
  } else {
    await db.insert(dealershipModules).values({
      dealershipId: id, moduleKey: moduleKey as any, status: "enabled",
      monthlyCents, setupCents, perUseCents, commissionBps, notes,
      enabledById: req.user!.id,
    });
  }
  res.json({ ok: true });
});

// DELETE /api/dealerships/:id/modules/:moduleKey — disable
router.delete("/:id/modules/:moduleKey", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const { id, moduleKey } = req.params;
  await db.update(dealershipModules)
    .set({ status: "disabled", disabledAt: new Date() })
    .where(and(eq(dealershipModules.dealershipId, id), eq(dealershipModules.moduleKey, moduleKey as any)));
  res.json({ ok: true });
});

// ─── PATCH /api/dealerships/:id/status — change active/pending/suspended ───
router.patch("/:id/status", async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") return res.status(403).json({ error: "operator_admin only" });
  const { status } = req.body;
  const allowed = ["active", "pending", "suspended"];
  if (!status || !allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  await db.update(dealerships).set({ status: status as any, updatedAt: new Date() }).where(eq(dealerships.id, req.params.id));
  const [updated] = await db.select().from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  res.json(updated);
});

// ─── GET /api/dealerships/:id/staff — list users for a dealership ──────────
router.get("/:id/staff", async (req: Request, res: Response) => {
  const u = req.user!;
  const isOperator = ["operator_admin", "operator_staff"].includes(u.role);
  const isDealerAtThisShop = ["dealer_owner", "dealer_staff"].includes(u.role) && u.dealershipId === req.params.id;
  if (!isOperator && !isDealerAtThisShop) return res.status(403).json({ error: "Access denied" });

  const staff = await db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.dealershipId, req.params.id));

  res.json(staff);
});

// ─── POST /api/dealerships/:id/staff — invite staff member ─────────────────
router.post("/:id/staff", async (req: Request, res: Response) => {
  const u = req.user!;
  const isOperatorAdmin = u.role === "operator_admin";
  const isDealerOwnerHere = u.role === "dealer_owner" && u.dealershipId === req.params.id;
  if (!isOperatorAdmin && !isDealerOwnerHere) return res.status(403).json({ error: "Access denied" });

  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: "email and role required" });

  // Check if user already exists and is already at this dealership
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing && existing.dealershipId === req.params.id) {
    return res.status(409).json({ error: "User already a member of this dealership" });
  }

  // Create an invitation record
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const [invite] = await db.insert(invitations).values({
    email,
    role: role as any,
    dealershipId: req.params.id,
    invitedBy: u.id,
    token,
    expiresAt,
  }).returning();

  res.status(201).json({ ok: true, invitationId: invite.id, token, expiresAt });
});

// ─── DELETE /api/dealerships/:id/staff/:userId — remove staff member ───────
router.delete("/:id/staff/:userId", async (req: Request, res: Response) => {
  const u = req.user!;
  const isOperatorAdmin = u.role === "operator_admin";
  const isDealerOwnerHere = u.role === "dealer_owner" && u.dealershipId === req.params.id;
  if (!isOperatorAdmin && !isDealerOwnerHere) return res.status(403).json({ error: "Access denied" });

  const { userId } = req.params;
  // Cannot remove yourself
  if (userId === u.id) return res.status(400).json({ error: "Cannot remove yourself" });

  // Verify the user belongs to this dealership
  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target || target.dealershipId !== req.params.id) {
    return res.status(404).json({ error: "Staff member not found at this dealership" });
  }

  // Disassociate — set dealershipId to null and deactivate
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, userId));
  res.json({ ok: true });
});

// ─── PATCH /api/dealerships/:id/staff/:userId/role — change role ───────────
router.patch("/:id/staff/:userId/role", async (req: Request, res: Response) => {
  const u = req.user!;
  const isOperatorAdmin = u.role === "operator_admin";
  const isDealerOwnerHere = u.role === "dealer_owner" && u.dealershipId === req.params.id;
  if (!isOperatorAdmin && !isDealerOwnerHere) return res.status(403).json({ error: "Access denied" });

  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "role required" });

  const [target] = await db.select().from(users).where(eq(users.id, req.params.userId)).limit(1);
  if (!target || target.dealershipId !== req.params.id) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  await db.update(users).set({ role: role as any, updatedAt: new Date() }).where(eq(users.id, req.params.userId));
  const [updated] = await db.select().from(users).where(eq(users.id, req.params.userId)).limit(1);
  res.json(updated);
});

// ─── GET /api/dealerships/:id/pricing — per-dealer pricing overrides ───────
router.get("/:id/pricing", async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") return res.status(403).json({ error: "operator_admin only" });
  const [d] = await db.select({
    id: dealerships.id,
    plan: dealerships.plan,
    monthlyFee: dealerships.monthlyFee,
    claimFeePercent: dealerships.claimFeePercent,
    claimFeeMin: dealerships.claimFeeMin,
    claimFeeMax: dealerships.claimFeeMax,
    dafFee: dealerships.dafFee,
    pdiFee: dealerships.pdiFee,
  }).from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  if (!d) return res.status(404).json({ error: "Dealership not found" });
  res.json(d);
});

// ─── PATCH /api/dealerships/:id/pricing — save pricing overrides ───────────
router.patch("/:id/pricing", async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== "operator_admin") return res.status(403).json({ error: "operator_admin only" });
  const { monthlyFee, claimFeePercent, claimFeeMin, claimFeeMax, dafFee, pdiFee, plan } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (monthlyFee !== undefined) updates.monthlyFee = monthlyFee;
  if (claimFeePercent !== undefined) updates.claimFeePercent = claimFeePercent;
  if (claimFeeMin !== undefined) updates.claimFeeMin = claimFeeMin;
  if (claimFeeMax !== undefined) updates.claimFeeMax = claimFeeMax;
  if (dafFee !== undefined) updates.dafFee = dafFee;
  if (pdiFee !== undefined) updates.pdiFee = pdiFee;
  if (plan !== undefined) updates.plan = plan;
  await db.update(dealerships).set(updates).where(eq(dealerships.id, req.params.id));
  const [updated] = await db.select().from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  res.json(updated);
});

// ─── PATCH /api/dealerships/:id/branding — update branding ────────────────
router.patch("/:id/branding", async (req: Request, res: Response) => {
  const u = req.user!;
  const isOperatorAdmin = u.role === "operator_admin";
  const isDealerOwnerHere = u.role === "dealer_owner" && u.dealershipId === req.params.id;
  if (!isOperatorAdmin && !isDealerOwnerHere) return res.status(403).json({ error: "Access denied" });

  const { logoUrl, primaryColor, secondaryColor, accentColor, customDomain, welcomeMessage, fontFamily } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;
  if (primaryColor !== undefined) updates.primaryColor = primaryColor;
  if (secondaryColor !== undefined) updates.secondaryColor = secondaryColor;
  if (accentColor !== undefined) updates.accentColor = accentColor;
  if (customDomain !== undefined) updates.customDomain = customDomain;
  if (welcomeMessage !== undefined) updates.welcomeMessage = welcomeMessage;
  if (fontFamily !== undefined) updates.fontFamily = fontFamily;
  await db.update(dealerships).set(updates).where(eq(dealerships.id, req.params.id));
  const [updated] = await db.select().from(dealerships).where(eq(dealerships.id, req.params.id)).limit(1);
  res.json(updated);
});

export default router;
