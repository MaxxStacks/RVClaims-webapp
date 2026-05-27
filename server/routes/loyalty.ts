// server/routes/loyalty.ts — Customer Loyalty Program API
// Module: customer_loyalty · $49/month per dealership

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  loyaltyPrograms,
  loyaltyRewards,
  loyaltyPoints,
  loyaltyReferrals,
  insertLoyaltyProgramSchema,
  insertLoyaltyRewardSchema,
  insertLoyaltyPointSchema,
  insertLoyaltyReferralSchema,
} from "@shared/schema";
import { eq, and, sum, count, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership } from "../middleware/rbac";

const router = Router();

// ── Auth helpers ──────────────────────────────────────────────────────────────
const DEALER_OWNER_ROLES = ["dealer_owner"] as const;
const DEALER_STAFF_ROLES = ["dealer_owner", "dealer_staff", "financial_manager"] as const;

function requireDealerOwner(req: Request, res: Response, next: () => void) {
  if (!req.user || !DEALER_OWNER_ROLES.includes(req.user.role as any)) {
    return res.status(403).json({ success: false, message: "Dealer owner access required" });
  }
  next();
}

// ── Resolve dealershipId from auth context ────────────────────────────────────
function getDealershipId(req: Request): string | null {
  return req.user?.dealershipId ?? req.scopedDealershipId ?? null;
}

// ==================== PROGRAM CONFIG ====================

// GET /api/loyalty/program — get loyalty program for the current dealer
router.get("/program", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) {
      return res.status(404).json({ success: false, message: "No loyalty program found" });
    }

    res.json({ success: true, program });
  } catch (error) {
    console.error("GET /api/loyalty/program error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/loyalty/program — create or upsert program config (dealer_owner)
router.post("/program", requireAuth, scopeToDealership, requireDealerOwner, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const validated = insertLoyaltyProgramSchema.safeParse({ ...req.body, dealershipId });
    if (!validated.success) {
      return res.status(400).json({ success: false, message: "Invalid data", errors: validated.error.errors });
    }

    const [existing] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    let program;
    if (existing) {
      [program] = await db
        .update(loyaltyPrograms)
        .set({ ...validated.data, updatedAt: new Date() })
        .where(eq(loyaltyPrograms.id, existing.id))
        .returning();
    } else {
      [program] = await db
        .insert(loyaltyPrograms)
        .values(validated.data)
        .returning();
    }

    res.json({ success: true, program });
  } catch (error) {
    console.error("POST /api/loyalty/program error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== REWARDS CATALOG ====================

// GET /api/loyalty/rewards — list rewards for dealer's program
router.get("/rewards", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.json({ success: true, rewards: [] });

    const rewards = await db
      .select()
      .from(loyaltyRewards)
      .where(eq(loyaltyRewards.programId, program.id))
      .orderBy(loyaltyRewards.pointCost);

    res.json({ success: true, rewards });
  } catch (error) {
    console.error("GET /api/loyalty/rewards error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/loyalty/rewards — create reward (dealer_owner)
router.post("/rewards", requireAuth, scopeToDealership, requireDealerOwner, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.status(404).json({ success: false, message: "Create a loyalty program first" });

    const validated = insertLoyaltyRewardSchema.safeParse({ ...req.body, programId: program.id });
    if (!validated.success) {
      return res.status(400).json({ success: false, message: "Invalid data", errors: validated.error.errors });
    }

    const [reward] = await db.insert(loyaltyRewards).values(validated.data).returning();
    res.status(201).json({ success: true, reward });
  } catch (error) {
    console.error("POST /api/loyalty/rewards error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/loyalty/rewards/:id — update reward
router.patch("/rewards/:id", requireAuth, scopeToDealership, requireDealerOwner, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    // Verify the reward belongs to this dealer's program
    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.status(404).json({ success: false, message: "Program not found" });

    const [existing] = await db
      .select({ id: loyaltyRewards.id })
      .from(loyaltyRewards)
      .where(and(eq(loyaltyRewards.id, req.params.id), eq(loyaltyRewards.programId, program.id)))
      .limit(1);

    if (!existing) return res.status(404).json({ success: false, message: "Reward not found" });

    const allowed = ["name", "description", "pointCost", "rewardType", "rewardValue", "isActive"];
    const updates: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const [reward] = await db
      .update(loyaltyRewards)
      .set(updates)
      .where(eq(loyaltyRewards.id, req.params.id))
      .returning();

    res.json({ success: true, reward });
  } catch (error) {
    console.error("PATCH /api/loyalty/rewards/:id error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/loyalty/rewards/:id — soft delete (set isActive=false)
router.delete("/rewards/:id", requireAuth, scopeToDealership, requireDealerOwner, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.status(404).json({ success: false, message: "Program not found" });

    await db
      .update(loyaltyRewards)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(loyaltyRewards.id, req.params.id), eq(loyaltyRewards.programId, program.id)));

    res.json({ success: true, message: "Reward deactivated" });
  } catch (error) {
    console.error("DELETE /api/loyalty/rewards/:id error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POINTS ====================

// GET /api/loyalty/points — customer's points history
router.get("/points", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.json({ success: true, points: [] });

    // Clients see only their own history; dealer staff see customer's history if customerId provided
    let customerId: string | null = null;
    if (req.user!.role === "client") {
      customerId = req.user!.id;
    } else if (req.query.customerId) {
      customerId = req.query.customerId as string;
    }

    const conditions = [eq(loyaltyPoints.programId, program.id)];
    if (customerId) conditions.push(eq(loyaltyPoints.customerId, customerId));

    const history = await db
      .select()
      .from(loyaltyPoints)
      .where(and(...conditions))
      .orderBy(desc(loyaltyPoints.createdAt))
      .limit(200);

    res.json({ success: true, points: history });
  } catch (error) {
    console.error("GET /api/loyalty/points error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/loyalty/points/balance — integer balance for current customer
router.get("/points/balance", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.json({ success: true, balance: 0 });

    const customerId = req.user!.role === "client" ? req.user!.id : (req.query.customerId as string);
    if (!customerId) return res.status(400).json({ success: false, message: "customerId required" });

    const [result] = await db
      .select({ total: sum(loyaltyPoints.points) })
      .from(loyaltyPoints)
      .where(and(eq(loyaltyPoints.programId, program.id), eq(loyaltyPoints.customerId, customerId)));

    const balance = parseInt(result?.total ?? "0", 10) || 0;
    res.json({ success: true, balance });
  } catch (error) {
    console.error("GET /api/loyalty/points/balance error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/loyalty/points/redeem — redeem points for a reward
router.post("/points/redeem", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const { rewardId } = req.body;
    if (!rewardId) return res.status(400).json({ success: false, message: "rewardId required" });

    const customerId = req.user!.role === "client" ? req.user!.id : (req.body.customerId as string);
    if (!customerId) return res.status(400).json({ success: false, message: "customerId required" });

    const [program] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program || !program.isActive) {
      return res.status(404).json({ success: false, message: "Loyalty program not active" });
    }

    const [reward] = await db
      .select()
      .from(loyaltyRewards)
      .where(and(eq(loyaltyRewards.id, rewardId), eq(loyaltyRewards.programId, program.id), eq(loyaltyRewards.isActive, true)))
      .limit(1);

    if (!reward) return res.status(404).json({ success: false, message: "Reward not found or inactive" });

    // Atomic balance check
    const [balResult] = await db
      .select({ total: sum(loyaltyPoints.points) })
      .from(loyaltyPoints)
      .where(and(eq(loyaltyPoints.programId, program.id), eq(loyaltyPoints.customerId, customerId)));

    const balance = parseInt(balResult?.total ?? "0", 10) || 0;
    if (balance < reward.pointCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. Need ${reward.pointCost}, have ${balance}.`,
        balance,
        required: reward.pointCost,
      });
    }

    // Insert negative points record
    const [pointRecord] = await db.insert(loyaltyPoints).values({
      programId: program.id,
      customerId,
      points: -reward.pointCost,
      type: "redemption",
      description: `Redeemed: ${reward.name}`,
      referenceType: "reward",
      referenceId: reward.id,
    }).returning();

    // Increment redemptionCount
    await db
      .update(loyaltyRewards)
      .set({ redemptionCount: reward.redemptionCount + 1, updatedAt: new Date() })
      .where(eq(loyaltyRewards.id, reward.id));

    const newBalance = balance - reward.pointCost;
    res.json({ success: true, pointRecord, newBalance, reward });
  } catch (error) {
    console.error("POST /api/loyalty/points/redeem error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/loyalty/points/credit — manual credit (dealer_owner only)
router.post("/points/credit", requireAuth, scopeToDealership, requireDealerOwner, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const { customerId, points, description } = req.body;
    if (!customerId || !points || typeof points !== "number" || points <= 0) {
      return res.status(400).json({ success: false, message: "customerId and positive points required" });
    }

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.status(404).json({ success: false, message: "Loyalty program not found" });

    const [pointRecord] = await db.insert(loyaltyPoints).values({
      programId: program.id,
      customerId,
      points,
      type: "manual_credit",
      description: description || "Manual credit",
    }).returning();

    res.status(201).json({ success: true, pointRecord });
  } catch (error) {
    console.error("POST /api/loyalty/points/credit error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== REFERRALS ====================

// POST /api/loyalty/referral — create referral record, return referral URL
router.post("/referral", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const { referredEmail } = req.body;
    if (!referredEmail) return res.status(400).json({ success: false, message: "referredEmail required" });

    const referrerId = req.user!.id;

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.status(404).json({ success: false, message: "Loyalty program not found" });

    const [referral] = await db.insert(loyaltyReferrals).values({
      programId: program.id,
      referrerId,
      referredEmail,
      status: "sent",
      pointsAwarded: false,
    }).returning();

    // Generate referral URL (front-end deep link)
    const baseUrl = process.env.APP_BASE_URL || "https://app.dealersuite360.com";
    const referralUrl = `${baseUrl}/signup?ref=${referral.id}&dealer=${dealershipId}`;

    res.status(201).json({ success: true, referral, referralUrl });
  } catch (error) {
    console.error("POST /api/loyalty/referral error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/loyalty/referrals — list referrals
router.get("/referrals", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select({ id: loyaltyPrograms.id })
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.json({ success: true, referrals: [] });

    const conditions = [eq(loyaltyReferrals.programId, program.id)];
    if (req.user!.role === "client") {
      conditions.push(eq(loyaltyReferrals.referrerId, req.user!.id));
    }

    const referrals = await db
      .select()
      .from(loyaltyReferrals)
      .where(and(...conditions))
      .orderBy(desc(loyaltyReferrals.createdAt));

    res.json({ success: true, referrals });
  } catch (error) {
    console.error("GET /api/loyalty/referrals error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== STATS ====================

// GET /api/loyalty/stats — program statistics
router.get("/stats", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    // Operator admin: aggregate across all programs
    if (req.user!.role === "operator_admin") {
      const programs = await db.select({ id: loyaltyPrograms.id, dealershipId: loyaltyPrograms.dealershipId, programName: loyaltyPrograms.programName, isActive: loyaltyPrograms.isActive }).from(loyaltyPrograms);

      const [pointsAgg] = await db
        .select({
          totalIssued: sql<number>`COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0)`,
          totalRedeemed: sql<number>`COALESCE(SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END), 0)`,
        })
        .from(loyaltyPoints);

      const [rewardsAgg] = await db
        .select({ totalRedemptions: sum(loyaltyRewards.redemptionCount) })
        .from(loyaltyRewards);

      return res.json({
        success: true,
        stats: {
          totalPrograms: programs.length,
          activePrograms: programs.filter(p => p.isActive).length,
          totalPointsIssued: pointsAgg?.totalIssued ?? 0,
          totalPointsRedeemed: pointsAgg?.totalRedeemed ?? 0,
          totalRewardsRedeemed: parseInt(rewardsAgg?.totalRedemptions ?? "0", 10) || 0,
        },
        programs,
      });
    }

    // Dealer view: own program stats
    const dealershipId = getDealershipId(req);
    if (!dealershipId) return res.status(400).json({ success: false, message: "No dealership context" });

    const [program] = await db
      .select()
      .from(loyaltyPrograms)
      .where(eq(loyaltyPrograms.dealershipId, dealershipId))
      .limit(1);

    if (!program) return res.json({ success: true, stats: { totalMembers: 0, totalPointsIssued: 0, totalPointsRedeemed: 0, totalRewardsRedeemed: 0 } });

    // Distinct members
    const [membersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT customer_id)` })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.programId, program.id));

    const [pointsAgg] = await db
      .select({
        totalIssued: sql<number>`COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0)`,
        totalRedeemed: sql<number>`COALESCE(SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END), 0)`,
      })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.programId, program.id));

    const [rewardsAgg] = await db
      .select({ totalRedemptions: sum(loyaltyRewards.redemptionCount) })
      .from(loyaltyRewards)
      .where(eq(loyaltyRewards.programId, program.id));

    // Members with balances for the members table
    const memberRows = await db
      .select({
        customerId: loyaltyPoints.customerId,
        balance: sql<number>`SUM(points)`,
        totalEarned: sql<number>`COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0)`,
        lastActivity: sql<string>`MAX(created_at)`,
      })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.programId, program.id))
      .groupBy(loyaltyPoints.customerId)
      .orderBy(sql`SUM(points) DESC`)
      .limit(100);

    res.json({
      success: true,
      stats: {
        totalMembers: parseInt(String(membersResult?.count ?? "0"), 10) || 0,
        totalPointsIssued: pointsAgg?.totalIssued ?? 0,
        totalPointsRedeemed: pointsAgg?.totalRedeemed ?? 0,
        totalRewardsRedeemed: parseInt(rewardsAgg?.totalRedemptions ?? "0", 10) || 0,
      },
      members: memberRows,
    });
  } catch (error) {
    console.error("GET /api/loyalty/stats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
