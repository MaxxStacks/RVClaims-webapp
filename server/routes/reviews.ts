// server/routes/reviews.ts — Reputation Management module
// Mount: app.use('/api/reviews', reviewsRouter)
//
// Endpoints:
//   GET    /api/reviews              — list reviews (dealer: own; operator: all)
//   GET    /api/reviews/stats        — aggregate stats
//   GET    /api/reviews/nps          — NPS score
//   GET    /api/reviews/config       — dealer review_config record
//   GET    /api/reviews/:id          — single review
//   PUT    /api/reviews/config       — upsert review_config (dealer_owner)
//   PATCH  /api/reviews/:id          — update status / dealerResponse
//   POST   /api/reviews/:id/approve  — approve for publish (dealer_owner)
//   POST   /api/reviews/:id/flag     — flag for follow-up, create ticket
//   POST   /api/reviews/send-survey  — manually send survey
//   POST   /api/reviews/:id/respond  — customer submits rating + comment

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  customerReviews,
  reviewConfig,
  dealerships,
  tickets,
  users,
  notifications,
} from "@shared/schema";
import { eq, and, desc, sql, count, avg, gte, lte, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

function isOperator(role: string) {
  return OPERATOR_ROLES.includes(role as any);
}

function isDealerOwner(role: string) {
  return role === "dealer_owner";
}

// NPS using star-based proxy:
// Promoters: rating 5
// Neutrals:  rating 4
// Detractors: rating 1-3
// NPS = ((promoters / total) - (detractors / total)) * 100, rounded to integer
function calcNps(reviews: { rating: number | null }[]): number | null {
  const rated = reviews.filter(r => r.rating !== null);
  if (rated.length === 0) return null;
  const total = rated.length;
  const promoters = rated.filter(r => r.rating === 5).length;
  const detractors = rated.filter(r => r.rating !== null && r.rating <= 3).length;
  return Math.round(((promoters / total) - (detractors / total)) * 100);
}

function generateTicketNumber(): string {
  return `TKT-REV-${Date.now().toString(36).toUpperCase()}`;
}

// ==================== GET /api/reviews ====================
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const { status, rating } = req.query as Record<string, string>;

    let rows: (typeof customerReviews.$inferSelect)[];

    if (isOperator(role)) {
      rows = await db.select().from(customerReviews).orderBy(desc(customerReviews.createdAt)).limit(1000);
    } else {
      const did = req.user!.dealershipId;
      if (!did) return res.json([]);
      rows = await db.select().from(customerReviews)
        .where(eq(customerReviews.dealershipId, did))
        .orderBy(desc(customerReviews.createdAt))
        .limit(500);
    }

    if (status) rows = rows.filter(r => r.status === status);
    if (rating) rows = rows.filter(r => r.rating === parseInt(rating, 10));

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load reviews" });
  }
});

// ==================== GET /api/reviews/stats ====================
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    let rows: (typeof customerReviews.$inferSelect)[];

    if (isOperator(role)) {
      rows = await db.select().from(customerReviews);
    } else {
      const did = req.user!.dealershipId;
      if (!did) return res.json({ avgRating: null, nps: null, responseRate: 0, totalSent: 0, pending: 0, byStar: {} });
      rows = await db.select().from(customerReviews).where(eq(customerReviews.dealershipId, did));
    }

    const rated = rows.filter(r => r.rating !== null);
    const avgRating = rated.length > 0
      ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length
      : null;

    const totalSent = rows.length;
    const responded = rows.filter(r => r.respondedAt !== null).length;
    const responseRate = totalSent > 0 ? Math.round((responded / totalSent) * 100) : 0;
    const pending = rows.filter(r => r.status === "pending").length;
    const nps = calcNps(rows);

    // Reviews this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = rows.filter(r => new Date(r.createdAt) >= startOfMonth).length;

    const byStar: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rated) {
      const s = r.rating as number;
      if (s >= 1 && s <= 5) byStar[s]++;
    }

    res.json({ avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null, nps, responseRate, totalSent, pending, thisMonth, byStar });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load stats" });
  }
});

// ==================== GET /api/reviews/nps ====================
router.get("/nps", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    let rows: { rating: number | null }[];

    if (isOperator(role)) {
      rows = await db.select({ rating: customerReviews.rating }).from(customerReviews);
    } else {
      const did = req.user!.dealershipId;
      if (!did) return res.json({ nps: null });
      rows = await db.select({ rating: customerReviews.rating }).from(customerReviews)
        .where(eq(customerReviews.dealershipId, did));
    }

    res.json({ nps: calcNps(rows) });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to compute NPS" });
  }
});

// ==================== GET /api/reviews/config ====================
router.get("/config", requireAuth, async (req: Request, res: Response) => {
  try {
    const did = req.user!.dealershipId;
    if (!did) return res.json(null);

    const [cfg] = await db.select().from(reviewConfig).where(eq(reviewConfig.dealershipId, did)).limit(1);
    res.json(cfg || null);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load config" });
  }
});

// ==================== GET /api/reviews/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [review] = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const role = req.user!.role as string;
    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      // Allow customer access for survey page (public endpoint is /respond below)
      if (role !== "client" && did && review.dealershipId !== did) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(review);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load review" });
  }
});

// ==================== PUT /api/reviews/config ====================
router.put("/config", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDealerOwner(req.user!.role as string) && !isOperator(req.user!.role as string)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const did = req.user!.dealershipId;
    if (!did) return res.status(400).json({ message: "dealershipId required" });

    const {
      isActive, sendDelayHours, googlePlaceId, facebookPageUrl,
      customThankYouMessage, autoSendOnWorkOrderComplete, autoSendOnClaimClose,
    } = req.body;

    const [existing] = await db.select().from(reviewConfig).where(eq(reviewConfig.dealershipId, did)).limit(1);

    if (existing) {
      const [updated] = await db.update(reviewConfig).set({
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sendDelayHours: sendDelayHours !== undefined ? sendDelayHours : existing.sendDelayHours,
        googlePlaceId: googlePlaceId !== undefined ? googlePlaceId : existing.googlePlaceId,
        facebookPageUrl: facebookPageUrl !== undefined ? facebookPageUrl : existing.facebookPageUrl,
        customThankYouMessage: customThankYouMessage !== undefined ? customThankYouMessage : existing.customThankYouMessage,
        autoSendOnWorkOrderComplete: autoSendOnWorkOrderComplete !== undefined ? autoSendOnWorkOrderComplete : existing.autoSendOnWorkOrderComplete,
        autoSendOnClaimClose: autoSendOnClaimClose !== undefined ? autoSendOnClaimClose : existing.autoSendOnClaimClose,
        updatedAt: new Date(),
      }).where(eq(reviewConfig.id, existing.id)).returning();
      return res.json(updated);
    }

    const [created] = await db.insert(reviewConfig).values({
      dealershipId: did,
      isActive: isActive ?? true,
      sendDelayHours: sendDelayHours ?? 24,
      googlePlaceId: googlePlaceId ?? null,
      facebookPageUrl: facebookPageUrl ?? null,
      customThankYouMessage: customThankYouMessage ?? null,
      autoSendOnWorkOrderComplete: autoSendOnWorkOrderComplete ?? true,
      autoSendOnClaimClose: autoSendOnClaimClose ?? true,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to save config" });
  }
});

// ==================== PATCH /api/reviews/:id ====================
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    if (!isDealerOwner(role) && role !== "service_manager" && !isOperator(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [existing] = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Review not found" });

    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) return res.status(403).json({ message: "Access denied" });
    }

    const { status, dealerResponse } = req.body;
    const patch: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) patch.status = status;
    if (dealerResponse !== undefined) patch.dealerResponse = dealerResponse;

    const [updated] = await db.update(customerReviews).set(patch).where(eq(customerReviews.id, id)).returning();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update review" });
  }
});

// ==================== POST /api/reviews/:id/approve ====================
router.post("/:id/approve", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    if (!isDealerOwner(role) && !isOperator(role)) {
      return res.status(403).json({ message: "Only dealer owners can approve reviews for publishing" });
    }

    const [existing] = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Review not found" });

    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) return res.status(403).json({ message: "Access denied" });
    }

    // Safety guard: NEVER allow negative reviews to be approved for publishing
    if (existing.rating !== null && existing.rating <= 3) {
      return res.status(400).json({ message: "Reviews with a rating of 1-3 cannot be approved for external publishing" });
    }

    const { publishTarget } = req.body;

    const [updated] = await db.update(customerReviews).set({
      status: "approved_for_publish",
      publishTarget: publishTarget || "google",
      updatedAt: new Date(),
    }).where(eq(customerReviews.id, id)).returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to approve review" });
  }
});

// ==================== POST /api/reviews/:id/flag ====================
router.post("/:id/flag", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    if (!isDealerOwner(role) && role !== "service_manager" && !isOperator(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [existing] = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Review not found" });

    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) return res.status(403).json({ message: "Access denied" });
    }

    // Update review status to flagged
    const [updated] = await db.update(customerReviews).set({
      status: "flagged",
      updatedAt: new Date(),
    }).where(eq(customerReviews.id, id)).returning();

    // Auto-create support ticket
    try {
      await db.insert(tickets).values({
        ticketNumber: generateTicketNumber(),
        dealershipId: existing.dealershipId,
        customerId: existing.customerId,
        category: "feedback",
        subject: `Flagged Review Follow-Up — ${existing.rating ? `${existing.rating} Star` : 'No Rating'}`,
        status: "open",
        autoCreated: true,
      });
    } catch (ticketErr) {
      console.error("[reviews/flag] Failed to create ticket:", ticketErr);
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to flag review" });
  }
});

// ==================== POST /api/reviews/send-survey ====================
// Must be before /:id routes
router.post("/send-survey", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    if (!isDealerOwner(role) && !isOperator(role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { customerId, unitId } = req.body;
    if (!customerId) return res.status(400).json({ message: "customerId is required" });

    const did = req.user!.dealershipId || req.body.dealershipId;
    if (!did) return res.status(400).json({ message: "dealershipId required" });

    const [review] = await db.insert(customerReviews).values({
      dealershipId: did,
      customerId,
      unitId: unitId || null,
      triggerType: "manual",
      triggerReferenceId: null,
      status: "pending",
      sentAt: new Date(),
    }).returning();

    // Notify customer
    try {
      const [dealer] = await db.select({ name: dealerships.name })
        .from(dealerships)
        .where(eq(dealerships.id, did))
        .limit(1);

      await db.insert(notifications).values({
        userId: customerId,
        type: "system",
        title: "How was your experience?",
        message: `${dealer?.name ?? "Your dealer"} values your feedback. Tap to share.`,
        linkTo: `/${did}/client/review/${review.id}`,
      });
    } catch (notifErr) {
      console.error("[reviews/send-survey] notification failed:", notifErr);
    }

    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to send survey" });
  }
});

// ==================== POST /api/reviews/:id/respond ====================
// Customer submits their rating + comment (public-ish — auth still required)
router.post("/:id/respond", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, npsScore } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [existing] = await db.select().from(customerReviews).where(eq(customerReviews.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Review not found" });

    // Prevent duplicate response
    if (existing.respondedAt !== null) {
      return res.status(409).json({ message: "You have already submitted feedback for this review" });
    }

    // Validate the customer owns this review (unless operator)
    const role = req.user!.role as string;
    if (!isOperator(role)) {
      if (existing.customerId !== req.user!.id) {
        return res.status(403).json({ message: "This review does not belong to you" });
      }
    }

    const [updated] = await db.update(customerReviews).set({
      rating,
      comment: comment || null,
      npsScore: npsScore ?? null,
      respondedAt: new Date(),
      status: "reviewed",
      updatedAt: new Date(),
    }).where(eq(customerReviews.id, id)).returning();

    // If rating <= 3: auto-create support ticket
    if (rating <= 3) {
      try {
        await db.insert(tickets).values({
          ticketNumber: generateTicketNumber(),
          dealershipId: existing.dealershipId,
          customerId: existing.customerId,
          category: "feedback",
          subject: `Low-Rating Review Follow-Up — ${rating} Star`,
          status: "open",
          autoCreated: true,
        });
      } catch (ticketErr) {
        console.error("[reviews/respond] Failed to create low-rating ticket:", ticketErr);
      }
    }

    // Fetch dealership config for the response (needed by survey page)
    const [cfg] = await db.select().from(reviewConfig)
      .where(eq(reviewConfig.dealershipId, existing.dealershipId))
      .limit(1);

    res.json({ review: updated, config: cfg || null });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to submit feedback" });
  }
});

export default router;
