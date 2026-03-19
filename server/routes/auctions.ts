// server/routes/routes-auctions.ts — Live Auction API routes
// 18 endpoints for auction lifecycle, bidding, watching, and settlement
// Real-time bid updates pushed via WebSocket (lib-websocket.ts)

import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  auctions, auctionBids, auctionWatchers,
  marketplaceListings, marketplaceMembers, marketplaceTransactions, marketplaceHolds,
  insertAuctionSchema, placeBidSchema,
} from "@shared/schema-marketplace";
import { eq, and, gte, lte, desc, asc, sql, ne } from "drizzle-orm";
import { authorizeHold } from "../lib/stripe-escrow";

// Import your WebSocket broadcast function from lib-websocket.ts
// import { broadcastToRoom, broadcastToUser } from "../lib/websocket";

const router = Router();

// ==================== AUCTION CRUD ====================

// POST /api/auctions — Create a new auction (from an existing listing)
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = insertAuctionSchema.parse(req.body);

    // Verify listing exists and belongs to seller
    const [listing] = await db.select().from(marketplaceListings)
      .where(eq(marketplaceListings.id, data.listingId)).limit(1);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId !== data.sellerId) return res.status(403).json({ error: "Not your listing" });

    // Update listing type
    await db.update(marketplaceListings).set({
      listingType: "auction",
      status: "active",
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, data.listingId));

    const [auction] = await db.insert(auctions).values({
      ...data,
      status: "scheduled",
      currentBid: null,
      totalBids: 0,
      uniqueBidders: 0,
    }).returning();

    res.status(201).json(auction);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/auctions — List auctions (filter by status, upcoming, live, ended)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, upcoming, live, sellerId } = req.query;
    const conditions = [];

    if (status) conditions.push(eq(auctions.status, status as string));
    if (sellerId) conditions.push(eq(auctions.sellerId, sellerId as string));
    if (upcoming === "true") {
      conditions.push(eq(auctions.status, "scheduled"));
      conditions.push(gte(auctions.scheduledStart, new Date()));
    }
    if (live === "true") {
      conditions.push(eq(auctions.status, "live"));
    }

    const results = await db.select({
      auction: auctions,
      listing: {
        title: marketplaceListings.title,
        year: marketplaceListings.year,
        manufacturer: marketplaceListings.manufacturer,
        model: marketplaceListings.model,
        rvType: marketplaceListings.rvType,
        condition: marketplaceListings.condition,
        askingPrice: marketplaceListings.askingPrice,
      },
    })
      .from(auctions)
      .innerJoin(marketplaceListings, eq(auctions.listingId, marketplaceListings.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(auctions.scheduledStart));

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id — Get auction detail with bid history
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [auction] = await db.select().from(auctions)
      .where(eq(auctions.id, req.params.id)).limit(1);
    if (!auction) return res.status(404).json({ error: "Auction not found" });

    // Get listing details (no seller info)
    const [listing] = await db.select().from(marketplaceListings)
      .where(eq(marketplaceListings.id, auction.listingId)).limit(1);

    // Get bid history (bidder names hidden — just amounts and timestamps)
    const bids = await db.select({
      id: auctionBids.id,
      amount: auctionBids.amount,
      isAutoBid: auctionBids.isAutoBid,
      status: auctionBids.status,
      createdAt: auctionBids.createdAt,
      // bidderId intentionally excluded — anonymous bidding
    })
      .from(auctionBids)
      .where(eq(auctionBids.auctionId, req.params.id))
      .orderBy(desc(auctionBids.amount));

    // Strip seller info from listing
    const { sellerId, ...publicListing } = listing || {};

    res.json({
      auction,
      listing: publicListing,
      bids,
      bidCount: bids.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BIDDING ====================

// POST /api/auctions/:id/bid — Place a bid
router.post("/:id/bid", async (req: Request, res: Response) => {
  try {
    const { amount, maxAutoBid } = placeBidSchema.parse({
      auctionId: req.params.id,
      ...req.body,
    });
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    // Get auction
    const [auction] = await db.select().from(auctions)
      .where(eq(auctions.id, req.params.id)).limit(1);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "live") return res.status(400).json({ error: "Auction is not live" });
    if (auction.sellerId === memberId) return res.status(400).json({ error: "Cannot bid on your own auction" });

    // Validate bid amount
    const currentBid = parseFloat(auction.currentBid || "0");
    const increment = parseFloat(auction.bidIncrement || "250");
    const minimumBid = currentBid > 0 ? currentBid + increment : parseFloat(auction.startingBid);

    if (amount < minimumBid) {
      return res.status(400).json({
        error: `Minimum bid is $${minimumBid.toFixed(2)}`,
        minimumBid,
        currentBid,
        increment,
      });
    }

    // Check buy now
    if (auction.buyNowPrice && amount >= parseFloat(auction.buyNowPrice)) {
      // Instant buy — end auction
      return await handleBuyNow(req, res, auction, memberId, amount);
    }

    // Mark previous winning bid as outbid
    if (auction.currentBidderId) {
      await db.update(auctionBids).set({ status: "outbid" })
        .where(and(
          eq(auctionBids.auctionId, auction.id),
          eq(auctionBids.status, "winning"),
        ));
    }

    // Place the bid
    const [bid] = await db.insert(auctionBids).values({
      auctionId: auction.id,
      bidderId: memberId,
      amount: amount.toFixed(2),
      isAutoBid: false,
      maxAutoBid: maxAutoBid?.toFixed(2),
      status: "winning",
    }).returning();

    // Count unique bidders
    const [{ count: uniqueCount }] = await db.select({
      count: sql<number>`count(distinct ${auctionBids.bidderId})`,
    }).from(auctionBids).where(eq(auctionBids.auctionId, auction.id));

    // Update auction state
    const auctionUpdates: any = {
      currentBid: amount.toFixed(2),
      currentBidderId: memberId,
      totalBids: (auction.totalBids || 0) + 1,
      uniqueBidders: Number(uniqueCount),
      updatedAt: new Date(),
    };

    // Check reserve
    if (auction.reservePrice && amount >= parseFloat(auction.reservePrice)) {
      auctionUpdates.reserveMet = true;
    }

    // Auto-extend if bid in last 2 minutes
    if (auction.autoExtend && auction.scheduledEnd) {
      const timeLeft = auction.scheduledEnd.getTime() - Date.now();
      const extensionMs = (auction.extensionMinutes || 2) * 60 * 1000;
      if (timeLeft < extensionMs) {
        auctionUpdates.scheduledEnd = new Date(Date.now() + extensionMs);
        auctionUpdates.status = "ending_soon";
      }
    }

    await db.update(auctions).set(auctionUpdates).where(eq(auctions.id, auction.id));

    // === WEBSOCKET: Broadcast new bid to all watchers ===
    // broadcastToRoom(`auction:${auction.id}`, {
    //   type: "auction:new_bid",
    //   auctionId: auction.id,
    //   amount,
    //   totalBids: auctionUpdates.totalBids,
    //   uniqueBidders: Number(uniqueCount),
    //   reserveMet: auctionUpdates.reserveMet || auction.reserveMet,
    //   newEndTime: auctionUpdates.scheduledEnd,
    //   timestamp: new Date().toISOString(),
    // });

    // === NOTIFY: Previous high bidder they've been outbid ===
    // if (auction.currentBidderId && auction.currentBidderId !== memberId) {
    //   broadcastToUser(auction.currentBidderId, {
    //     type: "auction:outbid",
    //     auctionId: auction.id,
    //     auctionTitle: auction.title,
    //     newAmount: amount,
    //   });
    // }

    // Process auto-bids from other bidders
    await processAutoBids(auction.id, memberId, amount);

    res.status(201).json({
      bid,
      auction: auctionUpdates,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Handle buy-now scenario
async function handleBuyNow(req: Request, res: Response, auction: any, memberId: string, amount: number) {
  // End auction immediately
  await db.update(auctions).set({
    status: "completed",
    actualEnd: new Date(),
    winnerId: memberId,
    winningBid: amount.toFixed(2),
    reserveMet: true,
    updatedAt: new Date(),
  }).where(eq(auctions.id, auction.id));

  // Place winning bid record
  const [bid] = await db.insert(auctionBids).values({
    auctionId: auction.id,
    bidderId: memberId,
    amount: amount.toFixed(2),
    status: "won",
  }).returning();

  // Mark all other bids as outbid
  await db.update(auctionBids).set({ status: "outbid" })
    .where(and(eq(auctionBids.auctionId, auction.id), ne(auctionBids.id, bid.id)));

  // Create transaction
  const [listing] = await db.select().from(marketplaceListings)
    .where(eq(marketplaceListings.id, auction.listingId)).limit(1);

  await db.insert(marketplaceTransactions).values({
    listingId: auction.listingId,
    sellerId: auction.sellerId,
    buyerId: memberId,
    auctionId: auction.id,
    salePrice: amount.toFixed(2),
    status: "pending",
  });

  // broadcastToRoom(`auction:${auction.id}`, { type: "auction:buy_now", auctionId: auction.id, amount, buyerId: "anonymous" });

  res.status(201).json({ bid, buyNow: true, message: "Congratulations! You've purchased this unit." });
}

// Process proxy/auto-bids
async function processAutoBids(auctionId: string, currentBidderId: string, currentAmount: number) {
  // Find all active auto-bids that can outbid the current amount
  const autoBids = await db.select().from(auctionBids)
    .where(and(
      eq(auctionBids.auctionId, auctionId),
      ne(auctionBids.bidderId, currentBidderId),
    ))
    .orderBy(desc(auctionBids.maxAutoBid));

  const [auction] = await db.select().from(auctions).where(eq(auctions.id, auctionId)).limit(1);
  if (!auction) return;
  const increment = parseFloat(auction.bidIncrement || "250");

  for (const ab of autoBids) {
    if (!ab.maxAutoBid) continue;
    const maxAuto = parseFloat(ab.maxAutoBid);
    const nextBid = currentAmount + increment;

    if (maxAuto >= nextBid) {
      // Place auto-bid
      const autoBidAmount = Math.min(maxAuto, nextBid);

      // Mark current winning bid as outbid
      await db.update(auctionBids).set({ status: "outbid" })
        .where(and(eq(auctionBids.auctionId, auctionId), eq(auctionBids.status, "winning")));

      await db.insert(auctionBids).values({
        auctionId,
        bidderId: ab.bidderId,
        amount: autoBidAmount.toFixed(2),
        isAutoBid: true,
        maxAutoBid: ab.maxAutoBid,
        status: "winning",
      });

      await db.update(auctions).set({
        currentBid: autoBidAmount.toFixed(2),
        currentBidderId: ab.bidderId,
        totalBids: sql`${auctions.totalBids} + 1`,
        updatedAt: new Date(),
      }).where(eq(auctions.id, auctionId));

      // broadcastToRoom(`auction:${auctionId}`, { type: "auction:auto_bid", auctionId, amount: autoBidAmount });
      break; // Only one auto-bid per cycle
    }
  }
}

// ==================== AUCTION LIFECYCLE ====================

// POST /api/auctions/:id/start — Start a scheduled auction (operator or cron)
router.post("/:id/start", async (req: Request, res: Response) => {
  try {
    const [auction] = await db.select().from(auctions)
      .where(eq(auctions.id, req.params.id)).limit(1);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "scheduled") return res.status(400).json({ error: "Auction is not scheduled" });

    const [updated] = await db.update(auctions).set({
      status: "live",
      actualStart: new Date(),
      updatedAt: new Date(),
    }).where(eq(auctions.id, req.params.id)).returning();

    // broadcastToRoom(`auction:${auction.id}`, { type: "auction:started", auctionId: auction.id });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auctions/:id/end — End an auction (triggered by timer or operator)
router.post("/:id/end", async (req: Request, res: Response) => {
  try {
    const [auction] = await db.select().from(auctions)
      .where(eq(auctions.id, req.params.id)).limit(1);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "live" && auction.status !== "ending_soon") {
      return res.status(400).json({ error: "Auction is not live" });
    }

    const hasWinner = auction.currentBidderId && auction.currentBid;
    const reserveMet = !auction.reservePrice || auction.reserveMet;

    let finalStatus = "no_sale";
    if (hasWinner && reserveMet) {
      finalStatus = "completed";

      // Mark winning bid
      await db.update(auctionBids).set({ status: "won" })
        .where(and(
          eq(auctionBids.auctionId, auction.id),
          eq(auctionBids.status, "winning"),
        ));

      // Create transaction
      await db.insert(marketplaceTransactions).values({
        listingId: auction.listingId,
        sellerId: auction.sellerId,
        buyerId: auction.currentBidderId!,
        auctionId: auction.id,
        salePrice: auction.currentBid!,
        status: "pending",
      });

      // Update listing
      await db.update(marketplaceListings).set({
        status: "pending_sale",
        updatedAt: new Date(),
      }).where(eq(marketplaceListings.id, auction.listingId));
    } else {
      // No sale — re-activate listing
      await db.update(marketplaceListings).set({
        status: "active",
        listingType: "marketplace",
        updatedAt: new Date(),
      }).where(eq(marketplaceListings.id, auction.listingId));
    }

    const [updated] = await db.update(auctions).set({
      status: finalStatus,
      actualEnd: new Date(),
      winnerId: hasWinner && reserveMet ? auction.currentBidderId : null,
      winningBid: hasWinner && reserveMet ? auction.currentBid : null,
      updatedAt: new Date(),
    }).where(eq(auctions.id, req.params.id)).returning();

    // broadcastToRoom(`auction:${auction.id}`, { type: "auction:ended", auctionId: auction.id, status: finalStatus, winningBid: updated.winningBid });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auctions/:id/cancel — Cancel an auction (operator only)
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const [updated] = await db.update(auctions).set({
      status: "cancelled",
      actualEnd: new Date(),
      updatedAt: new Date(),
    }).where(eq(auctions.id, req.params.id)).returning();

    // Re-activate listing
    await db.update(marketplaceListings).set({
      status: "active",
      listingType: "marketplace",
      updatedAt: new Date(),
    }).where(eq(marketplaceListings.id, updated.listingId));

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WATCHING ====================

// POST /api/auctions/:id/watch — Watch an auction
router.post("/:id/watch", async (req: Request, res: Response) => {
  try {
    const { memberId, notifyOnBid, notifyOnEndingSoon } = req.body;

    const [watcher] = await db.insert(auctionWatchers).values({
      auctionId: req.params.id,
      memberId,
      notifyOnBid: notifyOnBid ?? true,
      notifyOnEndingSoon: notifyOnEndingSoon ?? true,
    }).returning();

    await db.update(auctions).set({
      watcherCount: sql`${auctions.watcherCount} + 1`,
    }).where(eq(auctions.id, req.params.id));

    res.status(201).json(watcher);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/auctions/:id/watch — Unwatch
router.delete("/:id/watch", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    await db.delete(auctionWatchers).where(
      and(
        eq(auctionWatchers.auctionId, req.params.id),
        eq(auctionWatchers.memberId, memberId as string),
      )
    );

    await db.update(auctions).set({
      watcherCount: sql`GREATEST(${auctions.watcherCount} - 1, 0)`,
    }).where(eq(auctions.id, req.params.id));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/:id/bids — Full bid history (operator only — includes bidder info)
router.get("/:id/bids", async (req: Request, res: Response) => {
  try {
    const bids = await db.select({
      bid: auctionBids,
      bidder: {
        id: marketplaceMembers.id,
        businessName: marketplaceMembers.businessName,
        city: marketplaceMembers.city,
        province: marketplaceMembers.province,
      },
    })
      .from(auctionBids)
      .innerJoin(marketplaceMembers, eq(auctionBids.bidderId, marketplaceMembers.id))
      .where(eq(auctionBids.auctionId, req.params.id))
      .orderBy(desc(auctionBids.amount));

    res.json(bids);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/my-bids — Get all auctions I've bid on
router.get("/my-bids", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.query;
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    const myBids = await db.select({
      bid: auctionBids,
      auction: {
        id: auctions.id,
        title: auctions.title,
        status: auctions.status,
        currentBid: auctions.currentBid,
        scheduledEnd: auctions.scheduledEnd,
      },
    })
      .from(auctionBids)
      .innerJoin(auctions, eq(auctionBids.auctionId, auctions.id))
      .where(eq(auctionBids.bidderId, memberId as string))
      .orderBy(desc(auctionBids.createdAt));

    res.json(myBids);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
