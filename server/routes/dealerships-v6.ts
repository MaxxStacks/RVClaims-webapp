import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { dealerships, users, units, claims, dealershipModules, moduleCatalog } from "@shared/schema";
import { eq, and, ilike, desc, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

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

// GET /api/v6/dealerships/catalog/modules — must be BEFORE /:id
router.get("/catalog/modules", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const rows = await db.select().from(moduleCatalog).where(eq(moduleCatalog.active, true)).orderBy(moduleCatalog.sortOrder);
  res.json(rows);
});

// GET /api/v6/dealerships/pending-count — must be BEFORE /:id
router.get("/pending-count", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const [row] = await db.select({ c: count() }).from(dealerships).where(eq(dealerships.reviewStatus, "pending_review"));
  res.json({ count: Number(row?.c || 0) });
});

// GET /api/v6/branding/me — dealer's branding (must be BEFORE /:id)
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

// PATCH /api/v6/branding/me
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

// GET /api/v6/dealerships — list with filters + KPIs
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

// GET /api/v6/dealerships/:id — full detail
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

// POST /api/v6/dealerships — create new dealership
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

// PATCH /api/v6/dealerships/:id — update
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

// POST /api/v6/dealerships/:id/approve
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

// POST /api/v6/dealerships/:id/reject
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

// POST /api/v6/dealerships/:id/modules/:moduleKey — enable
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

// DELETE /api/v6/dealerships/:id/modules/:moduleKey — disable
router.delete("/:id/modules/:moduleKey", async (req: Request, res: Response) => {
  if (!requireOperator(req, res)) return;
  const { id, moduleKey } = req.params;
  await db.update(dealershipModules)
    .set({ status: "disabled", disabledAt: new Date() })
    .where(and(eq(dealershipModules.dealershipId, id), eq(dealershipModules.moduleKey, moduleKey as any)));
  res.json({ ok: true });
});

export default router;
