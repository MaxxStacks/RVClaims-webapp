// server/lib/websocket-auctions.ts — WebSocket event handlers for live auction bidding
// Extends the existing lib-websocket.ts with auction-specific rooms and events.
//
// ROOMS:
//   auction:{auctionId}  — All watchers of a specific auction
//   auctions:live         — Lobby showing all currently live auctions
//   marketplace:updates   — General marketplace notifications
//
// EVENTS (server → client):
//   auction:new_bid       — New bid placed (amount, totalBids, timeLeft)
//   auction:auto_bid      — Auto-bid triggered
//   auction:outbid        — You've been outbid (sent to specific user)
//   auction:started       — Auction went live
//   auction:ending_soon   — Less than 2 minutes remaining
//   auction:extended      — Time extended due to late bid
//   auction:ended         — Auction finished (winner, final price)
//   auction:buy_now       — Someone used buy-now
//   auction:cancelled     — Auction cancelled by operator
//   listing:new           — New listing published on marketplace
//   listing:sold          — Listing sold
//   listing:hold_placed   — Hold placed on a listing
//
// EVENTS (client → server):
//   auction:join          — Join an auction room to receive updates
//   auction:leave         — Leave an auction room
//   auction:bid           — Place a bid (validated server-side)

import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { db } from "../db";
import { auctions, auctionWatchers } from "@shared/schema-marketplace";
import { eq } from "drizzle-orm";

let io: Server | null = null;

/**
 * Initialize auction WebSocket handlers.
 * Call this from your existing WebSocket setup in lib-websocket.ts,
 * or separately if you're adding auction support.
 */
export function initAuctionWebSocket(server: HttpServer) {
  // If you already have a Socket.IO instance, reuse it.
  // Otherwise, create a new one on a namespace.
  io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || "http://localhost:3001",
      methods: ["GET", "POST"],
    },
    path: "/ws/auctions",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WS:Auction] Client connected: ${socket.id}`);

    // Join auction room
    socket.on("auction:join", async (data: { auctionId: string; memberId?: string }) => {
      const room = `auction:${data.auctionId}`;
      socket.join(room);
      console.log(`[WS:Auction] ${socket.id} joined ${room}`);

      // Send current auction state
      try {
        const [auction] = await db.select().from(auctions)
          .where(eq(auctions.id, data.auctionId)).limit(1);
        if (auction) {
          socket.emit("auction:state", {
            auctionId: auction.id,
            status: auction.status,
            currentBid: auction.currentBid,
            totalBids: auction.totalBids,
            uniqueBidders: auction.uniqueBidders,
            reserveMet: auction.reserveMet,
            scheduledEnd: auction.scheduledEnd,
            buyNowPrice: auction.buyNowPrice,
          });
        }
      } catch (err) {
        console.error("[WS:Auction] Error fetching state:", err);
      }
    });

    // Leave auction room
    socket.on("auction:leave", (data: { auctionId: string }) => {
      socket.leave(`auction:${data.auctionId}`);
    });

    // Join marketplace lobby
    socket.on("marketplace:join", () => {
      socket.join("marketplace:updates");
    });

    socket.on("disconnect", () => {
      console.log(`[WS:Auction] Client disconnected: ${socket.id}`);
    });
  });

  // Start auction timer checker (runs every 10 seconds)
  setInterval(checkAuctionTimers, 10000);

  console.log("[WS:Auction] WebSocket initialized on /ws/auctions");
  return io;
}

// ==================== BROADCAST FUNCTIONS ====================
// Call these from your route handlers after database updates.

/**
 * Broadcast a new bid to all watchers of an auction.
 */
export function broadcastNewBid(auctionId: string, data: {
  amount: number;
  totalBids: number;
  uniqueBidders: number;
  reserveMet: boolean;
  newEndTime?: Date;
}) {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("auction:new_bid", {
    auctionId,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify a specific user they've been outbid.
 */
export function notifyOutbid(memberId: string, data: {
  auctionId: string;
  auctionTitle: string;
  newAmount: number;
}) {
  if (!io) return;
  // Find socket(s) for this member and emit directly
  // In production, you'd map memberId → socketId(s)
  io.emit("auction:outbid", { ...data, memberId });
}

/**
 * Broadcast auction started.
 */
export function broadcastAuctionStarted(auctionId: string) {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("auction:started", {
    auctionId,
    timestamp: new Date().toISOString(),
  });
  io.to("marketplace:updates").emit("auction:started", { auctionId });
}

/**
 * Broadcast auction ended.
 */
export function broadcastAuctionEnded(auctionId: string, data: {
  status: string;
  winningBid?: string | null;
  winnerId?: string | null;
}) {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("auction:ended", {
    auctionId,
    ...data,
    timestamp: new Date().toISOString(),
  });
  io.to("marketplace:updates").emit("auction:ended", { auctionId, status: data.status });
}

/**
 * Broadcast time extension.
 */
export function broadcastTimeExtended(auctionId: string, newEndTime: Date) {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("auction:extended", {
    auctionId,
    newEndTime: newEndTime.toISOString(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast new marketplace listing.
 */
export function broadcastNewListing(listingId: string, title: string) {
  if (!io) return;
  io.to("marketplace:updates").emit("listing:new", {
    listingId,
    title,
    timestamp: new Date().toISOString(),
  });
}

// ==================== TIMER MANAGEMENT ====================

/**
 * Check auctions that should start or end.
 * Runs on a 10-second interval.
 */
async function checkAuctionTimers() {
  try {
    const now = new Date();

    // Start scheduled auctions whose start time has passed
    const toStart = await db.select().from(auctions)
      .where(eq(auctions.status, "scheduled"));

    for (const auction of toStart) {
      if (auction.scheduledStart && auction.scheduledStart <= now) {
        await db.update(auctions).set({
          status: "live",
          actualStart: now,
          updatedAt: now,
        }).where(eq(auctions.id, auction.id));

        broadcastAuctionStarted(auction.id);
        console.log(`[Auction] Auto-started: ${auction.id}`);
      }
    }

    // End live auctions whose end time has passed
    const toEnd = await db.select().from(auctions)
      .where(eq(auctions.status, "live"));

    for (const auction of toEnd) {
      if (auction.scheduledEnd && auction.scheduledEnd <= now) {
        // Trigger end via the route logic (or inline it here)
        const hasWinner = auction.currentBidderId && auction.currentBid;
        const reserveMet = !auction.reservePrice || auction.reserveMet;
        const finalStatus = hasWinner && reserveMet ? "completed" : "no_sale";

        await db.update(auctions).set({
          status: finalStatus,
          actualEnd: now,
          winnerId: hasWinner && reserveMet ? auction.currentBidderId : null,
          winningBid: hasWinner && reserveMet ? auction.currentBid : null,
          updatedAt: now,
        }).where(eq(auctions.id, auction.id));

        broadcastAuctionEnded(auction.id, {
          status: finalStatus,
          winningBid: hasWinner && reserveMet ? auction.currentBid : null,
          winnerId: hasWinner && reserveMet ? auction.currentBidderId : null,
        });

        console.log(`[Auction] Auto-ended: ${auction.id} → ${finalStatus}`);
      }
    }

    // Warn auctions ending in < 2 minutes
    const endingSoon = await db.select().from(auctions)
      .where(eq(auctions.status, "live"));

    for (const auction of endingSoon) {
      if (auction.scheduledEnd) {
        const timeLeft = auction.scheduledEnd.getTime() - now.getTime();
        if (timeLeft > 0 && timeLeft < 120000) {
          // Update status to ending_soon if not already
          if (auction.status !== "ending_soon") {
            await db.update(auctions).set({ status: "ending_soon" }).where(eq(auctions.id, auction.id));
          }
          io?.to(`auction:${auction.id}`).emit("auction:ending_soon", {
            auctionId: auction.id,
            secondsLeft: Math.floor(timeLeft / 1000),
          });
        }
      }
    }
  } catch (err) {
    console.error("[Auction] Timer check error:", err);
  }
}
