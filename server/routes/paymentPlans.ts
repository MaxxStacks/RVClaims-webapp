// server/routes/paymentPlans.ts — Service Payment Plans module
//
// Tables used:
//   service_payment_plans  — plan applications and lifecycle
//   financing_partners     — partner registry (CA/US)
//   dealerships            — for country/currency detection
//
// Mount: app.use('/api/payment-plans', paymentPlansRouter)
//        app.use('/api/financing-partners', financingPartnersRouter)

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  servicePaymentPlans,
  financingPartners,
  dealerships,
  serviceModules,
  dealerModuleSubscriptions,
} from "@shared/schema";
import { eq, and, desc, or, count, sum } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { getDealerCountry } from "../lib/locale";

const router = Router();
const partnersRouter = Router();

// ─── Role helpers ──────────────────────────────────────────────────────────────

const OPERATOR_ROLES = ["operator_admin", "operator_staff"] as const;
const DEALER_PLAN_ROLES = ["dealer_owner", "financial_manager"] as const;
const DEALER_VIEW_ROLES = ["dealer_owner", "financial_manager", "dealer_staff"] as const;
const CLIENT_ROLES = ["client"] as const;

function isOperator(role: string): boolean {
  return OPERATOR_ROLES.includes(role as any);
}
function canOfferPlan(role: string): boolean {
  return DEALER_PLAN_ROLES.includes(role as any);
}
function canViewDealerPlans(role: string): boolean {
  return DEALER_VIEW_ROLES.includes(role as any);
}

function generatePlanNumber(): string {
  const seq = String(Math.floor(Math.random() * 999999) + 1).padStart(6, "0");
  return `SPP-${seq}`;
}

// ==================== PAYMENT PLANS ====================

// GET /api/payment-plans — list plans (role-scoped)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId, id: userId } = req.user!;
    const { status, country } = req.query as Record<string, string>;

    if (isOperator(role)) {
      // Operator sees all plans
      let query = db
        .select({
          plan: servicePaymentPlans,
          partner: financingPartners,
          dealership: { id: dealerships.id, name: dealerships.name, country: dealerships.country, stateProvince: dealerships.stateProvince },
        })
        .from(servicePaymentPlans)
        .leftJoin(financingPartners, eq(servicePaymentPlans.financingPartnerId, financingPartners.id))
        .leftJoin(dealerships, eq(servicePaymentPlans.dealershipId, dealerships.id))
        .orderBy(desc(servicePaymentPlans.createdAt));

      const rows = await query;

      // Optional country filter
      let filtered = rows;
      if (country === 'CA' || country === 'US') {
        filtered = rows.filter(r => {
          const d = r.dealership ? { country: r.dealership.country, stateProvince: r.dealership.stateProvince } : null;
          return getDealerCountry(d) === country;
        });
      }
      if (status) {
        filtered = filtered.filter(r => r.plan.status === status);
      }

      return res.json({ success: true, plans: filtered });
    }

    if (canViewDealerPlans(role) && dealershipId) {
      const rows = await db
        .select({
          plan: servicePaymentPlans,
          partner: financingPartners,
        })
        .from(servicePaymentPlans)
        .leftJoin(financingPartners, eq(servicePaymentPlans.financingPartnerId, financingPartners.id))
        .where(eq(servicePaymentPlans.dealershipId, dealershipId))
        .orderBy(desc(servicePaymentPlans.createdAt));

      return res.json({ success: true, plans: rows });
    }

    if (CLIENT_ROLES.includes(role as any)) {
      const rows = await db
        .select({
          plan: servicePaymentPlans,
          partner: financingPartners,
        })
        .from(servicePaymentPlans)
        .leftJoin(financingPartners, eq(servicePaymentPlans.financingPartnerId, financingPartners.id))
        .where(eq(servicePaymentPlans.customerId, userId))
        .orderBy(desc(servicePaymentPlans.createdAt));

      return res.json({ success: true, plans: rows });
    }

    return res.status(403).json({ success: false, message: "Insufficient permissions" });
  } catch (err: any) {
    console.error("GET /api/payment-plans error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch payment plans" });
  }
});

// GET /api/payment-plans/stats — referral revenue stats (operator_admin only)
router.get("/stats", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(servicePaymentPlans)
      .where(or(
        eq(servicePaymentPlans.status, "approved"),
        eq(servicePaymentPlans.status, "active"),
        eq(servicePaymentPlans.status, "completed"),
      ));

    const totalApplications = await db.select({ count: count() }).from(servicePaymentPlans);
    const approvedCount = rows.filter(r => r.status === "approved" || r.status === "active" || r.status === "completed").length;
    const totalFinanced = rows.reduce((acc, r) => acc + parseFloat(r.amount || "0"), 0);
    const totalReferralFee = rows.reduce((acc, r) => acc + parseFloat(r.referralFee || "0"), 0);

    const byStatus = await db
      .select({ status: servicePaymentPlans.status, count: count() })
      .from(servicePaymentPlans)
      .groupBy(servicePaymentPlans.status);

    return res.json({
      success: true,
      stats: {
        totalApplications: totalApplications[0]?.count ?? 0,
        approvedCount,
        totalFinanced: totalFinanced.toFixed(2),
        totalReferralFee: totalReferralFee.toFixed(2),
        byStatus,
      },
    });
  } catch (err: any) {
    console.error("GET /api/payment-plans/stats error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// GET /api/payment-plans/by-customer/:customerId
router.get("/by-customer/:customerId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId, id: userId } = req.user!;
    const { customerId } = req.params;

    // Clients can only see their own; operators and dealer owners can see any
    if (CLIENT_ROLES.includes(role as any) && userId !== customerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const rows = await db
      .select({
        plan: servicePaymentPlans,
        partner: financingPartners,
      })
      .from(servicePaymentPlans)
      .leftJoin(financingPartners, eq(servicePaymentPlans.financingPartnerId, financingPartners.id))
      .where(eq(servicePaymentPlans.customerId, customerId))
      .orderBy(desc(servicePaymentPlans.createdAt));

    return res.json({ success: true, plans: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch customer plans" });
  }
});

// GET /api/payment-plans/:id — single plan
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId, id: userId } = req.user!;
    const { id } = req.params;

    const [row] = await db
      .select({
        plan: servicePaymentPlans,
        partner: financingPartners,
        dealership: { id: dealerships.id, name: dealerships.name },
      })
      .from(servicePaymentPlans)
      .leftJoin(financingPartners, eq(servicePaymentPlans.financingPartnerId, financingPartners.id))
      .leftJoin(dealerships, eq(servicePaymentPlans.dealershipId, dealerships.id))
      .where(eq(servicePaymentPlans.id, id))
      .limit(1);

    if (!row) return res.status(404).json({ success: false, message: "Payment plan not found" });

    // Access check
    if (!isOperator(role)) {
      if (canViewDealerPlans(role) && row.plan.dealershipId !== dealershipId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if (CLIENT_ROLES.includes(role as any) && row.plan.customerId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    return res.json({ success: true, plan: row.plan, partner: row.partner, dealership: row.dealership });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch payment plan" });
  }
});

// POST /api/payment-plans — create/submit application
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId } = req.user!;

    if (!canOfferPlan(role) && !isOperator(role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions to offer payment plans" });
    }

    const {
      customerId,
      unitId,
      invoiceId,
      workOrderId,
      financingPartnerId,
      amount,
      currency,
      term,
      customerName,
      customerEmail,
      incomeRange,
      consentGiven,
      serviceDescription,
      applicationData,
    } = req.body;

    if (!amount || !term || !consentGiven) {
      return res.status(400).json({ success: false, message: "amount, term, and consentGiven are required" });
    }

    const planDealershipId = isOperator(role) ? (req.body.dealershipId || dealershipId) : dealershipId;
    if (!planDealershipId) {
      return res.status(400).json({ success: false, message: "dealershipId is required" });
    }

    // Determine currency from dealership if not provided
    let planCurrency = currency || "CAD";
    if (!currency) {
      const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, planDealershipId)).limit(1);
      if (dealership) {
        planCurrency = getDealerCountry(dealership) === "US" ? "USD" : "CAD";
      }
    }

    // Calculate referral fee if partner provided
    let referralFee: string | null = null;
    if (financingPartnerId) {
      const [partner] = await db.select().from(financingPartners).where(eq(financingPartners.id, financingPartnerId)).limit(1);
      if (partner && partner.referralFeePercent) {
        const fee = parseFloat(amount) * parseFloat(partner.referralFeePercent) / 100;
        referralFee = fee.toFixed(2);
      }
    }

    const [plan] = await db.insert(servicePaymentPlans).values({
      dealershipId: planDealershipId,
      customerId: customerId || null,
      unitId: unitId || null,
      invoiceId: invoiceId || null,
      workOrderId: workOrderId || null,
      financingPartnerId: financingPartnerId || null,
      amount: String(amount),
      currency: planCurrency,
      term: parseInt(term),
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      incomeRange: incomeRange || null,
      consentGiven: !!consentGiven,
      serviceDescription: serviceDescription || null,
      applicationData: applicationData || {},
      status: "submitted",
      referralFee,
      submittedAt: new Date(),
    }).returning();

    return res.status(201).json({ success: true, plan });
  } catch (err: any) {
    console.error("POST /api/payment-plans error:", err);
    return res.status(500).json({ success: false, message: "Failed to create payment plan" });
  }
});

// PATCH /api/payment-plans/:id — update status (operator manually approves/declines)
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId } = req.user!;
    const { id } = req.params;
    const { status, monthlyPayment, interestRate, approvalData, term, partnerApplicationId } = req.body;

    // Dealer owners can only cancel their own plans
    if (!isOperator(role) && !canOfferPlan(role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const [existing] = await db.select().from(servicePaymentPlans).where(eq(servicePaymentPlans.id, id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Plan not found" });

    if (!isOperator(role) && existing.dealershipId !== dealershipId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updateData: Partial<typeof servicePaymentPlans.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (monthlyPayment) updateData.monthlyPayment = String(monthlyPayment);
    if (interestRate) updateData.interestRate = String(interestRate);
    if (approvalData) updateData.approvalData = approvalData;
    if (term) updateData.term = parseInt(term);
    if (partnerApplicationId) updateData.partnerApplicationId = partnerApplicationId;

    if (status === "approved") updateData.approvedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();

    const [updated] = await db
      .update(servicePaymentPlans)
      .set(updateData)
      .where(eq(servicePaymentPlans.id, id))
      .returning();

    return res.json({ success: true, plan: updated });
  } catch (err: any) {
    console.error("PATCH /api/payment-plans/:id error:", err);
    return res.status(500).json({ success: false, message: "Failed to update payment plan" });
  }
});

// ==================== FINANCING PARTNERS ====================

// GET /api/financing-partners — list partners, filtered by ?country=CA|US
partnersRouter.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { country } = req.query as Record<string, string>;

    const allPartners = await db
      .select()
      .from(financingPartners)
      .where(eq(financingPartners.isActive, true))
      .orderBy(financingPartners.name);

    const filtered = country
      ? allPartners.filter(p => p.country === country || p.country === 'BOTH')
      : allPartners;

    return res.json({ success: true, partners: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch financing partners" });
  }
});

// POST /api/financing-partners — create partner (operator_admin only)
partnersRouter.post("/", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const { name, country, apiEndpoint, referralFeePercent, minAmount, maxAmount, availableTerms } = req.body;

    if (!name || !country) {
      return res.status(400).json({ success: false, message: "name and country are required" });
    }

    const [partner] = await db.insert(financingPartners).values({
      name,
      country,
      apiEndpoint: apiEndpoint || null,
      referralFeePercent: referralFeePercent ? String(referralFeePercent) : "0",
      minAmount: minAmount ? String(minAmount) : "500",
      maxAmount: maxAmount ? String(maxAmount) : "25000",
      availableTerms: availableTerms || [3, 6, 12, 24],
      isActive: true,
    }).returning();

    return res.status(201).json({ success: true, partner });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to create financing partner" });
  }
});

// PATCH /api/financing-partners/:id — update partner (operator_admin only)
partnersRouter.patch("/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, country, apiEndpoint, isActive, referralFeePercent, minAmount, maxAmount, availableTerms } = req.body;

    const updateData: Partial<typeof financingPartners.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country;
    if (apiEndpoint !== undefined) updateData.apiEndpoint = apiEndpoint;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (referralFeePercent !== undefined) updateData.referralFeePercent = String(referralFeePercent);
    if (minAmount !== undefined) updateData.minAmount = String(minAmount);
    if (maxAmount !== undefined) updateData.maxAmount = String(maxAmount);
    if (availableTerms !== undefined) updateData.availableTerms = availableTerms;

    const [updated] = await db
      .update(financingPartners)
      .set(updateData)
      .where(eq(financingPartners.id, id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "Partner not found" });
    return res.json({ success: true, partner: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: "Failed to update financing partner" });
  }
});

export { partnersRouter };
export default router;
