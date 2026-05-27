// server/routes/superadmin.ts — DS360 Superadmin API
// All routes require role === 'ds360_superadmin'

import { Router } from "express";
import { db } from "../db";
import { operators, dealerships, users, units, claims, serviceModules } from "@shared/schema";
import { eq, isNull, count, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { calculateRevenueShare } from "../lib/revenueShare";
import { insertOperatorSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

const router = Router();

// Guard: only ds360_superadmin may access these routes
function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== "ds360_superadmin") {
    return res.status(403).json({ success: false, message: "DS360 Superadmin access required" });
  }
  next();
}

router.use(requireAuth, requireSuperAdmin);

// ── GET /api/superadmin/stats ──────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const [totalOperatorsRow] = await db.select({ count: count() }).from(operators);
    const [totalDealersRow] = await db.select({ count: count() }).from(dealerships);
    const [totalUnitsRow] = await db.select({ count: count() }).from(units);
    const [totalClaimsRow] = await db.select({ count: count() }).from(claims);

    // Total licensing revenue: sum of all active operators' monthly fees
    const activeOps = await db
      .select({ monthlyFee: operators.monthlyFee })
      .from(operators)
      .where(eq(operators.status, "active"));

    const totalRevenue = activeOps.reduce((sum, op) => sum + Number(op.monthlyFee ?? 0), 0);

    res.json({
      success: true,
      totalOperators: Number(totalOperatorsRow.count),
      totalDealers: Number(totalDealersRow.count),
      totalUnits: Number(totalUnitsRow.count),
      totalClaims: Number(totalClaimsRow.count),
      totalRevenue,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/superadmin/operators ─────────────────────────────────────────
router.get("/operators", async (_req, res) => {
  try {
    const allOperators = await db.select().from(operators).orderBy(operators.createdAt);

    // Enrich with dealer counts
    const enriched = await Promise.all(
      allOperators.map(async (op) => {
        const [{ cnt }] = await db
          .select({ cnt: count() })
          .from(dealerships)
          .where(eq(dealerships.operatorId, op.id));
        return { ...op, dealerCount: Number(cnt) };
      })
    );

    res.json({ success: true, operators: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/superadmin/operators/:id ────────────────────────────────────
router.get("/operators/:id", async (req, res) => {
  try {
    const [operator] = await db
      .select()
      .from(operators)
      .where(eq(operators.id, req.params.id))
      .limit(1);

    if (!operator) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }

    const dealerList = await db
      .select()
      .from(dealerships)
      .where(eq(dealerships.operatorId, operator.id));

    res.json({ success: true, operator, dealers: dealerList });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/superadmin/operators ───────────────────────────────────────
const createOperatorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().default("CA"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().default("#033280"),
  secondaryColor: z.string().default("#0cb22c"),
  customDomain: z.string().optional(),
  licenseTier: z.enum(["starter", "professional", "enterprise"]).default("starter"),
  maxDealers: z.number().default(25),
  monthlyFee: z.string().default("999.00"),
  revenueSharePercent: z.string().default("15.00"),
  // Initial admin user
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
  adminEmail: z.string().email(),
});

router.post("/operators", async (req, res) => {
  try {
    const data = createOperatorSchema.parse(req.body);

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: operators.id })
      .from(operators)
      .where(eq(operators.slug, data.slug))
      .limit(1);

    if (existing) {
      return res.status(409).json({ success: false, message: "Slug already in use" });
    }

    const tierDefaults: Record<string, { maxDealers: number; monthlyFee: string }> = {
      starter:      { maxDealers: 25,   monthlyFee: "999.00" },
      professional: { maxDealers: 50,   monthlyFee: "1499.00" },
      enterprise:   { maxDealers: 9999, monthlyFee: "2499.00" },
    };

    const tierConfig = tierDefaults[data.licenseTier];

    const [newOperator] = await db
      .insert(operators)
      .values({
        name: data.name,
        slug: data.slug,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address,
        country: data.country,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        customDomain: data.customDomain,
        licenseTier: data.licenseTier,
        maxDealers: tierConfig.maxDealers,
        monthlyFee: tierConfig.monthlyFee,
        revenueSharePercent: data.revenueSharePercent,
        status: "active",
        activatedAt: new Date(),
      })
      .returning();

    // Create initial operator_admin user
    const tempPassword = Math.random().toString(36).slice(-10) + "X9!";
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const [adminUser] = await db
      .insert(users)
      .values({
        email: data.adminEmail,
        passwordHash,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        role: "operator_admin",
        operatorId: newOperator.id,
        isActive: true,
      })
      .returning({ id: users.id, email: users.email });

    res.status(201).json({
      success: true,
      operator: newOperator,
      adminUser: { id: adminUser.id, email: adminUser.email },
      message: `Operator ${newOperator.name} activated! Admin account created.`,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/superadmin/operators/:id ──────────────────────────────────
router.patch("/operators/:id", async (req, res) => {
  try {
    const updateSchema = z.object({
      name: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      address: z.string().optional(),
      country: z.string().optional(),
      logoUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      customDomain: z.string().optional(),
      licenseTier: z.enum(["starter", "professional", "enterprise"]).optional(),
      maxDealers: z.number().optional(),
      monthlyFee: z.string().optional(),
      revenueSharePercent: z.string().optional(),
    });

    const data = updateSchema.parse(req.body);

    const [updated] = await db
      .update(operators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(operators.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }

    res.json({ success: true, operator: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/superadmin/operators/:id/status ───────────────────────────
router.patch("/operators/:id/status", async (req, res) => {
  try {
    const { status } = z
      .object({ status: z.enum(["active", "suspended", "cancelled", "pending"]) })
      .parse(req.body);

    const [updated] = await db
      .update(operators)
      .set({
        status,
        updatedAt: new Date(),
        activatedAt: status === "active" ? new Date() : undefined,
      })
      .where(eq(operators.id, req.params.id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Operator not found" });
    }

    res.json({ success: true, operator: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/superadmin/revenue ───────────────────────────────────────────
router.get("/revenue", async (req, res) => {
  try {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const allOperators = await db
      .select()
      .from(operators)
      .where(eq(operators.status, "active"));

    const reports = await Promise.all(
      allOperators.map(op => calculateRevenueShare(op.id, month, year).catch(() => null))
    );

    const validReports = reports.filter(Boolean);
    const totalLicensing = validReports.reduce((s, r) => s + (r?.licensingFee ?? 0), 0);
    const totalRevenueShare = validReports.reduce((s, r) => s + (r?.ds360ShareAmount ?? 0), 0);

    res.json({
      success: true,
      month,
      year,
      totalLicensing,
      totalRevenueShare,
      totalPlatformRevenue: totalLicensing + totalRevenueShare,
      operators: validReports,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/superadmin/dealers ──────────────────────────────────────────
router.get("/dealers", async (_req, res) => {
  try {
    const allDealers = await db.select().from(dealerships).orderBy(dealerships.createdAt);

    // Enrich with operator name
    const operatorMap: Record<string, string> = {};
    const allOps = await db.select({ id: operators.id, name: operators.name }).from(operators);
    for (const op of allOps) operatorMap[op.id] = op.name;

    const enriched = allDealers.map(d => ({
      ...d,
      operatorName: d.operatorId ? (operatorMap[d.operatorId] ?? "Unknown") : "DS360 Default",
    }));

    res.json({ success: true, dealers: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/superadmin/modules ──────────────────────────────────────────
router.get("/modules", async (_req, res) => {
  try {
    const modules = await db.select().from(serviceModules).orderBy(serviceModules.sortOrder);
    res.json({ success: true, modules });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/operators/me ─────────────────────────────────────────────────
// (exported separately — for operator_admin to get their own branding)
export const operatorsMeRouter = Router();

operatorsMeRouter.get("/me", requireAuth, async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false });

    if (!user.operatorId) {
      // Return DS360 defaults
      return res.json({
        success: true,
        operator: {
          name: "DS360 Operations",
          slug: "ds360",
          logoUrl: null,
          primaryColor: "#033280",
          secondaryColor: "#0cb22c",
        },
      });
    }

    const [operator] = await db
      .select({
        id: operators.id,
        name: operators.name,
        slug: operators.slug,
        logoUrl: operators.logoUrl,
        primaryColor: operators.primaryColor,
        secondaryColor: operators.secondaryColor,
        customDomain: operators.customDomain,
      })
      .from(operators)
      .where(eq(operators.id, user.operatorId))
      .limit(1);

    if (!operator) {
      return res.json({
        success: true,
        operator: {
          name: "DS360 Operations",
          slug: "ds360",
          logoUrl: null,
          primaryColor: "#033280",
          secondaryColor: "#0cb22c",
        },
      });
    }

    res.json({ success: true, operator });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
