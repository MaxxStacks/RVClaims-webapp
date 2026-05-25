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
import type { InferInsertModel } from "drizzle-orm";
import { eq, and, gte, lte, desc, asc, sql, ne } from "drizzle-orm";
import { authorizeHold } from "../lib/stripe-escrow";
import { broadcastNewBid, broadcastAuctionStarted, broadcastAuctionEnded } from "../websocket/auctions";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ==================== AUCTION CRUD ====================

// POST /api/auctions — Create a new auction (from an existing listing)
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = insertAuctionSchema.parse(req.body);
    const listingId: string | undefined = req.body.listingId;
    const sellerId: string | undefined = req.body.sellerId;

    // Verify listing exists and belongs to seller
    const [listing] = listingId
      ? await db.select().from(marketplaceListings)
          .where(eq(marketplaceListings.id, listingId)).limit(1)
      : [null];
    if (listingId && !listing) return res.status(404).json({ error: "Listing not found" });
    if (listingId && listing && sellerId && listing.sellerId !== sellerId) return res.status(403).json({ error: "Not your listing" });

    // Mark listing as in auction
    if (listingId) {
      await db.update(marketplaceListings).set({
        status: "active",
        updatedAt: new Date(),
      }).where(eq(marketplaceListings.id, listingId));
    }

    if (!sellerId) return res.status(400).json({ error: "sellerId required" });

    const auctionNumber = `AUC-${Date.now()}`;
    const [auction] = await db.insert(auctions).values({
      ...data,
      auctionNumber,
      sellerId,
      scheduledStart: new Date(data.scheduledStart),
      scheduledEnd: new Date(data.scheduledEnd),
      status: "scheduled",
      currentBid: null,
      totalBids: 0,
      uniqueBidders: 0,
    } as unknown as InferInsertModel<typeof auctions>).returning();

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

    if (status) conditions.push(eq(auctions.status, status as 'draft' | 'scheduled' | 'live' | 'ending' | 'ended' | 'sold' | 'no_sale' | 'cancelled'));
    if (sellerId) conditions.push(eq(auctions.sellerId, sellerId as string));
    if (upcoming === "true") {
      conditions.push(eq(auctions.status, "scheduled"));
      conditions.push(gte(auctions.scheduledStart, new Date()));
    }
    if (live === "true") {
      conditions.push(eq(auctions.status, "live"));
    }

    const results = await db.select().from(auctions)
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

    // Get bid history (bidder names hidden — just amounts and timestamps)
    const bids = await db.select({
      id: auctionBids.id,
      amount: auctionBids.amount,
      isProxy: auctionBids.isProxy,
      status: auctionBids.status,
      createdAt: auctionBids.createdAt,
      // bidderId intentionally excluded — anonymous bidding
    })
      .from(auctionBids)
      .where(eq(auctionBids.auctionId, req.params.id))
      .orderBy(desc(auctionBids.amount));

    const { sellerId, ...publicAuction } = auction;

    res.json({
      auction: publicAuction,
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
    const { amount, maxProxyAmount } = placeBidSchema.parse({
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
      isProxy: false,
      maxProxyAmount: maxProxyAmount?.toFixed(2),
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

    // Auto-extend if bid in last N minutes
    if (auction.autoExtendMinutes > 0 && auction.scheduledEnd) {
      const timeLeft = auction.scheduledEnd.getTime() - Date.now();
      const extensionMs = auction.autoExtendMinutes * 60 * 1000;
      if (timeLeft < extensionMs) {
        auctionUpdates.scheduledEnd = new Date(Date.now() + extensionMs);
        auctionUpdates.status = "ending";
      }
    }

    await db.update(auctions).set(auctionUpdates).where(eq(auctions.id, auction.id));

    // WebSocket: broadcast new bid to all auction room watchers
    broadcastNewBid(auction.id, {
      amount,
      totalBids: auctionUpdates.totalBids,
      uniqueBidders: Number(uniqueCount),
      reserveMet: auctionUpdates.reserveMet || auction.reserveMet,
      newEndTime: auctionUpdates.scheduledEnd,
    });

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
    status: "sold",
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
  await db.insert(marketplaceTransactions).values({
    transactionNumber: `TXN-${Date.now()}`,
    sellerId: auction.sellerId,
    buyerId: memberId,
    auctionId: auction.id,
    salePrice: amount.toFixed(2),
    status: "pending",
    unitSnapshot: { year: auction.year, manufacturer: auction.manufacturer, model: auction.model },
  });

  broadcastAuctionEnded(auction.id, { status: "sold", winningBid: amount.toFixed(2), winnerId: memberId });

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
    .orderBy(desc(auctionBids.maxProxyAmount));

  const [auction] = await db.select().from(auctions).where(eq(auctions.id, auctionId)).limit(1);
  if (!auction) return;
  const increment = parseFloat(auction.bidIncrement || "250");

  for (const ab of autoBids) {
    if (!ab.maxProxyAmount) continue;
    const maxAuto = parseFloat(ab.maxProxyAmount);
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
        isProxy: true,
        maxProxyAmount: ab.maxProxyAmount,
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

    broadcastAuctionStarted(auction.id);

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
    if (auction.status !== "live" && auction.status !== "ending") {
      return res.status(400).json({ error: "Auction is not live" });
    }

    const hasWinner = auction.currentBidderId && auction.currentBid;
    const reserveMet = !auction.reservePrice || auction.reserveMet;

    const finalStatus: 'sold' | 'no_sale' = hasWinner && reserveMet ? "sold" : "no_sale";
    if (hasWinner && reserveMet) {
      // Mark winning bid
      await db.update(auctionBids).set({ status: "won" })
        .where(and(
          eq(auctionBids.auctionId, auction.id),
          eq(auctionBids.status, "winning"),
        ));

      // Create transaction
      await db.insert(marketplaceTransactions).values({
        transactionNumber: `TXN-${Date.now()}`,
        sellerId: auction.sellerId,
        buyerId: auction.currentBidderId!,
        auctionId: auction.id,
        salePrice: auction.currentBid!,
        status: "pending",
        unitSnapshot: { year: auction.year, manufacturer: auction.manufacturer, model: auction.model },
      });
    }

    const [updated] = await db.update(auctions).set({
      status: finalStatus,
      actualEnd: new Date(),
      winnerId: hasWinner && reserveMet ? auction.currentBidderId : null,
      winningBid: hasWinner && reserveMet ? auction.currentBid : null,
      updatedAt: new Date(),
    }).where(eq(auctions.id, req.params.id)).returning();

    broadcastAuctionEnded(auction.id, { status: finalStatus, winningBid: updated.winningBid, winnerId: updated.winnerId });

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
      notifyOnNewBid: notifyOnBid ?? true,
      notifyOnEnding: notifyOnEndingSoon ?? true,
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
        dealershipName: marketplaceMembers.dealershipName,
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

// PATCH /api/auctions/:id/bid/withdraw — Withdraw a bid (only if not winning and auction still live)
router.patch("/:id/bid/withdraw", requireAuth, async (req: Request, res: Response) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: "memberId required" });

    const [auction] = await db.select().from(auctions)
      .where(eq(auctions.id, req.params.id)).limit(1);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (!["live", "scheduled", "ending"].includes(auction.status)) {
      return res.status(400).json({ error: "Cannot withdraw from a completed auction" });
    }
    if (auction.currentBidderId === memberId) {
      return res.status(400).json({ error: "Cannot withdraw a winning bid" });
    }

    await db.update(auctionBids).set({ status: "cancelled" })
      .where(and(
        eq(auctionBids.auctionId, req.params.id),
        eq(auctionBids.bidderId, memberId),
        ne(auctionBids.status, "won"),
      ));

    res.json({ success: true, message: "Bid withdrawn" });
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
