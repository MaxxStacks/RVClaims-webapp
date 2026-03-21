// server/routes/routes-marketplace.ts — Marketplace & Membership API routes
// 32 endpoints for browsing, listing, inquiries, holds, and transactions

import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  marketplaceMembers, marketplaceListings, listingPhotos,
  marketplaceWatchlist, marketplaceInquiries, marketplaceHolds,
  marketplaceTransactions,
  insertListingSchema, membershipSignupSchema, placeHoldSchema,
} from "@shared/schema-marketplace";
import { eq, and, or, gte, lte, like, desc, asc, sql, ne } from "drizzle-orm";
import { authorizeHold, releaseHold, captureHold, chargeCommission, createMembershipSubscription } from "../lib/stripe-escrow";

const router = Router();

// ==================== MEMBERSHIP ====================

// POST /api/marketplace/signup — Apply for marketplace membership
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const data = membershipSignupSchema.parse(req.body);
    
    // Check for duplicate email
    const existing = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.businessEmail, data.businessEmail)).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

    const [member] = await db.insert(marketplaceMembers).values({
      ...data,
      status: "pending",
    }).returning();

    // TODO: Send notification to operator that a new signup needs review
    // TODO: Send confirmation email to applicant

    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/marketplace/membership/pay — Pay annual membership fee
router.post("/membership/pay", async (req: Request, res: Response) => {
  try {
    const { memberId, paymentMethodId } = req.body;
    if (!memberId || !paymentMethodId) return res.status(400).json({ error: "memberId and paymentMethodId required" });

    const result = await createMembershipSubscription(memberId, paymentMethodId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/marketplace/members — List all members (operator only)
router.get("/members", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const conditions = [];
    if (status) conditions.push(eq(marketplaceMembers.status, status as string));

    const members = await db.select().from(marketplaceMembers)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketplaceMembers.createdAt));

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/marketplace/members/:id/verify — Approve or reject a member (operator only)
router.patch("/members/:id/verify", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, verificationNotes } = req.body;
    if (!["approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [updated] = await db.update(marketplaceMembers).set({
      status,
      verifiedAt: status === "approved" ? new Date() : null,
      verifiedBy: req.body.operatorId || null,
      rejectionReason: status === "rejected" ? rejectionReason : null,
      verificationNotes,
      updatedAt: new Date(),
    }).where(eq(marketplaceMembers.id, id)).returning();

    // TODO: Send email notification to the dealer about their application status

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marketplace/members/:id — Get member details
router.get("/members/:id", async (req: Request, res: Response) => {
  try {
    const [member] = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.id, req.params.id)).limit(1);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== LISTINGS ====================

// POST /api/marketplace/listings — Create a new listing
router.post("/listings", async (req: Request, res: Response) => {
  try {
    const data = insertListingSchema.parse(req.body);

    // Verify seller is approved member
    const [seller] = await db.select().from(marketplaceMembers)
      .where(eq(marketplaceMembers.id, data.sellerId)).limit(1);
    if (!seller || seller.status !== "approved") {
      return res.status(403).json({ error: "Not an approved marketplace member" });
    }

    const [listing] = await db.insert(marketplaceListings).values({
      ...data,
      status: "draft",
    }).returning();

    res.status(201).json(listing);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/marketplace/listings/:id — Update a listing
router.patch("/listings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates.id;
    delete updates.sellerId;
    delete updates.createdAt;
    delete updates.viewCount;
    delete updates.inquiryCount;

    updates.updatedAt = new Date();

    const [updated] = await db.update(marketplaceListings)
      .set(updates)
      .where(eq(marketplaceListings.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/marketplace/listings/:id/publish — Publish a draft listing
router.patch("/listings/:id/publish", async (req: Request, res: Response) => {
  try {
    const [listing] = await db.select().from(marketplaceListings)
      .where(eq(marketplaceListings.id, req.params.id)).limit(1);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.status !== "draft") return res.status(400).json({ error: "Only draft listings can be published" });

    // Set expiry 90 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const [updated] = await db.update(marketplaceListings).set({
      status: "active",
      expiresAt,
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, req.params.id)).returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marketplace/listings — Search & filter listings (all approved members can access)
router.get("/listings", async (req: Request, res: Response) => {
  try {
    const {
      search, rvType, manufacturer, condition,
      minPrice, maxPrice, minYear, maxYear,
      slideOuts, bunks, sortBy, sortOrder,
      page = "1", limit = "20",
    } = req.query;

    const conditions = [eq(marketplaceListings.status, "active")];

    if (search) {
      conditions.push(or(
        like(marketplaceListings.title, `%${search}%`),
        like(marketplaceListings.model, `%${search}%`),
        like(marketplaceListings.manufacturer, `%${search}%`),
        like(marketplaceListings.description, `%${search}%`),
      )!);
    }
    if (rvType) conditions.push(eq(marketplaceListings.rvType, rvType as string));
    if (manufacturer) conditions.push(eq(marketplaceListings.manufacturer, manufacturer as string));
    if (condition) conditions.push(eq(marketplaceListings.condition, condition as string));
    if (minPrice) conditions.push(gte(marketplaceListings.askingPrice, minPrice as string));
    if (maxPrice) conditions.push(lte(marketplaceListings.askingPrice, maxPrice as string));
    if (minYear) conditions.push(gte(marketplaceListings.year, parseInt(minYear as string)));
    if (maxYear) conditions.push(lte(marketplaceListings.year, parseInt(maxYear as string)));
    if (slideOuts) conditions.push(gte(marketplaceListings.slideOuts, parseInt(slideOuts as string)));
    if (bunks) conditions.push(gte(marketplaceListings.bunks, parseInt(bunks as string)));

    // Sort
    const orderField = sortBy === "price" ? marketplaceListings.askingPrice
      : sortBy === "year" ? marketplaceListings.year
      : marketplaceListings.createdAt;
    const order = sortOrder === "asc" ? asc(orderField) : desc(orderField);

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const listings = await db.select({
      id: marketplaceListings.id,
      title: marketplaceListings.title,
      year: marketplaceListings.year,
      manufacturer: marketplaceListings.manufacturer,
      model: marketplaceListings.model,
      rvType: marketplaceListings.rvType,
      length: marketplaceListings.length,
      slideOuts: marketplaceListings.slideOuts,
      bunks: marketplaceListings.bunks,
      sleeps: marketplaceListings.sleeps,
      condition: marketplaceListings.condition,
      askingPrice: marketplaceListings.askingPrice,
      priceNegotiable: marketplaceListings.priceNegotiable,
      locationCity: marketplaceListings.locationCity,
      locationProvince: marketplaceListings.locationProvince,
      locationRegion: marketplaceListings.locationRegion,
      status: marketplaceListings.status,
      viewCount: marketplaceListings.viewCount,
      createdAt: marketplaceListings.createdAt,
      // NOTE: sellerId intentionally EXCLUDED — dealer identity hidden
    })
      .from(marketplaceListings)
      .where(and(...conditions))
      .orderBy(order)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(marketplaceListings)
      .where(and(...conditions));

    res.json({
      listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: Number(count),
        pages: Math.ceil(Number(count) / parseInt(limit as string)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marketplace/listings/:id — Get listing detail (no seller info)
router.get("/listings/:id", async (req: Request, res: Response) => {
  try {
    const [listing] = await db.select().from(marketplaceListings)
      .where(eq(marketplaceListings.id, req.params.id)).limit(1);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Increment view count
    await db.update(marketplaceListings).set({
      viewCount: (listing.viewCount || 0) + 1,
    }).where(eq(marketplaceListings.id, req.params.id));

    // Get photos
    const photos = await db.select().from(listingPhotos)
      .where(eq(listingPhotos.listingId, req.params.id))
      .orderBy(asc(listingPhotos.sortOrder));

    // Strip seller info
    const { sellerId, ...publicListing } = listing;

    res.json({ ...publicListing, photos });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marketplace/my-listings — Get seller's own listings
router.get("/my-listings", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    const listings = await db.select().from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, memberId as string))
      .orderBy(desc(marketplaceListings.createdAt));

    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/marketplace/listings/:id — Withdraw a listing
router.delete("/listings/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await db.update(marketplaceListings).set({
      status: "withdrawn",
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, req.params.id)).returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PHOTOS ====================

// POST /api/marketplace/listings/:id/photos — Add photos to listing
router.post("/listings/:id/photos", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { photos } = req.body;  // Array of { url, caption, sortOrder, isPrimary }

    const inserted = await db.insert(listingPhotos).values(
      photos.map((p: any) => ({
        listingId: id,
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        caption: p.caption,
        sortOrder: p.sortOrder || 0,
        isPrimary: p.isPrimary || false,
      }))
    ).returning();

    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== WATCHLIST ====================

// POST /api/marketplace/watchlist — Add to watchlist
router.post("/watchlist", async (req: Request, res: Response) => {
  try {
    const { memberId, listingId } = req.body;
    const [entry] = await db.insert(marketplaceWatchlist).values({ memberId, listingId }).returning();

    await db.update(marketplaceListings).set({
      watchlistCount: sql`${marketplaceListings.watchlistCount} + 1`,
    }).where(eq(marketplaceListings.id, listingId));

    res.status(201).json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/marketplace/watchlist/:listingId — Remove from watchlist
router.delete("/watchlist/:listingId", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    await db.delete(marketplaceWatchlist).where(
      and(
        eq(marketplaceWatchlist.listingId, req.params.listingId),
        eq(marketplaceWatchlist.memberId, memberId as string),
      )
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marketplace/watchlist — Get my watchlist
router.get("/watchlist", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    const items = await db.select({
      watchId: marketplaceWatchlist.id,
      addedAt: marketplaceWatchlist.createdAt,
      listing: marketplaceListings,
    })
      .from(marketplaceWatchlist)
      .innerJoin(marketplaceListings, eq(marketplaceWatchlist.listingId, marketplaceListings.id))
      .where(eq(marketplaceWatchlist.memberId, memberId as string))
      .orderBy(desc(marketplaceWatchlist.createdAt));

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== INQUIRIES & OFFERS ====================

// POST /api/marketplace/inquiries — Submit inquiry or offer (goes through Dealer Suite 360)
router.post("/inquiries", async (req: Request, res: Response) => {
  try {
    const { listingId, buyerId, type, message, offerAmount } = req.body;

    const [inquiry] = await db.insert(marketplaceInquiries).values({
      listingId,
      buyerId,
      type: type || "inquiry",
      message,
      offerAmount,
      status: "pending",
    }).returning();

    // Increment inquiry count on listing
    await db.update(marketplaceListings).set({
      inquiryCount: sql`${marketplaceListings.inquiryCount} + 1`,
    }).where(eq(marketplaceListings.id, listingId));

    // TODO: Notify operator of new inquiry
    // TODO: If offer, notify operator to relay to seller

    res.status(201).json(inquiry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/marketplace/inquiries — List inquiries (operator sees all, member sees own)
router.get("/inquiries", async (req: Request, res: Response) => {
  try {
    const { listingId, buyerId, status } = req.query;
    const conditions = [];
    if (listingId) conditions.push(eq(marketplaceInquiries.listingId, listingId as string));
    if (buyerId) conditions.push(eq(marketplaceInquiries.buyerId, buyerId as string));
    if (status) conditions.push(eq(marketplaceInquiries.status, status as string));

    const inquiries = await db.select().from(marketplaceInquiries)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketplaceInquiries.createdAt));

    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/marketplace/inquiries/:id — Respond to inquiry (operator)
router.patch("/inquiries/:id", async (req: Request, res: Response) => {
  try {
    const { status, operatorNotes } = req.body;
    const [updated] = await db.update(marketplaceInquiries).set({
      status,
      operatorNotes,
      respondedAt: new Date(),
      respondedBy: req.body.operatorId,
      updatedAt: new Date(),
    }).where(eq(marketplaceInquiries.id, req.params.id)).returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HOLDS / ESCROW ====================

// POST /api/marketplace/holds — Place $500 hold on a listing
router.post("/holds", async (req: Request, res: Response) => {
  try {
    const data = placeHoldSchema.parse(req.body);
    const memberId = req.body.memberId;
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    const result = await authorizeHold(data.listingId, memberId, data.paymentMethodId);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/marketplace/holds/:id/release — Release a hold (cancel)
router.post("/holds/:id/release", async (req: Request, res: Response) => {
  try {
    const result = await releaseHold(req.params.id, req.body.reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/marketplace/holds/:id/capture — Capture deposit (sale completing)
router.post("/holds/:id/capture", async (req: Request, res: Response) => {
  try {
    const result = await captureHold(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== TRANSACTIONS ====================

// POST /api/marketplace/transactions — Create transaction (operator initiates when deal agreed)
router.post("/transactions", async (req: Request, res: Response) => {
  try {
    const { listingId, sellerId, buyerId, holdId, salePrice, auctionId } = req.body;

    const [tx] = await db.insert(marketplaceTransactions).values({
      listingId,
      sellerId,
      buyerId,
      holdId,
      auctionId,
      salePrice,
      status: holdId ? "deposit_held" : "pending",
      depositHeldAt: holdId ? new Date() : null,
    }).returning();

    // Update listing status
    await db.update(marketplaceListings).set({
      status: "pending_sale",
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, listingId));

    res.status(201).json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/marketplace/transactions/:id — Update transaction status
router.patch("/transactions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, operatorNotes, cancelReason } = req.body;

    const updates: any = { status, updatedAt: new Date() };
    if (operatorNotes) updates.operatorNotes = operatorNotes;
    if (cancelReason) updates.cancelReason = cancelReason;

    if (status === "completed") {
      updates.completedAt = new Date();

      // Capture hold and charge commission
      const [tx] = await db.select().from(marketplaceTransactions).where(eq(marketplaceTransactions.id, id)).limit(1);
      if (tx?.holdId) await captureHold(tx.holdId);

      // Update listing to sold
      if (tx) {
        await db.update(marketplaceListings).set({ status: "sold", updatedAt: new Date() })
          .where(eq(marketplaceListings.id, tx.listingId));
      }
    }

    if (status === "cancelled") {
      updates.cancelledAt = new Date();
      // Release hold
      const [tx] = await db.select().from(marketplaceTransactions).where(eq(marketplaceTransactions.id, id)).limit(1);
      if (tx?.holdId) await releaseHold(tx.holdId, cancelReason);
    }

    const [updated] = await db.update(marketplaceTransactions)
      .set(updates)
      .where(eq(marketplaceTransactions.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/marketplace/transactions/:id/commission — Charge $250 commission
router.post("/transactions/:id/commission", async (req: Request, res: Response) => {
  try {
    const result = await chargeCommission(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/marketplace/transactions — List transactions
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const { sellerId, buyerId, status } = req.query;
    const conditions = [];
    if (sellerId) conditions.push(eq(marketplaceTransactions.sellerId, sellerId as string));
    if (buyerId) conditions.push(eq(marketplaceTransactions.buyerId, buyerId as string));
    if (status) conditions.push(eq(marketplaceTransactions.status, status as string));

    const transactions = await db.select().from(marketplaceTransactions)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketplaceTransactions.createdAt));

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
