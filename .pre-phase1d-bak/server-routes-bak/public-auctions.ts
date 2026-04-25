// routes-public-auctions.ts — API routes for monthly public auction events
// Handles: event scheduling, dealer showcase submissions, public bidder registration, bidding

import { Router } from 'express';
import { db } from '../db';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import {
  publicAuctionEvents, showcaseUnits, showcasePhotos,
  publicBidders, publicBids, showcaseMemberships,
  publicEventWatchers, insertPublicAuctionEventSchema,
  insertShowcaseUnitSchema, publicBidPlacementSchema,
  publicBidderRegistrationSchema,
} from '../db/schema-public-auction';
import { requireAuth } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { authorizeHold, captureHold, releaseHold } from '../lib/stripe-escrow';

const authMiddleware = requireAuth;
const operatorOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !['operator_admin', 'operator_staff'].includes(user.role)) {
    return res.status(403).json({ error: 'Operator access required' });
  }
  next();
};
import bcrypt from 'bcryptjs';

const router = Router();

// ==========================================
// PUBLIC AUCTION EVENTS (Operator)
// ==========================================

// GET /api/public-auctions/events — List all events
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = await db.select().from(publicAuctionEvents).orderBy(desc(publicAuctionEvents.scheduledDate));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/public-auctions/events — Schedule new event (operator only)
router.post('/events', authMiddleware, operatorOnly, async (req, res) => {
  try {
    const data = insertPublicAuctionEventSchema.parse(req.body);
    const [event] = await db.insert(publicAuctionEvents).values(data).returning();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

// PATCH /api/public-auctions/events/:id/status — Update event status
router.patch('/events/:id/status', authMiddleware, operatorOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const [event] = await db.update(publicAuctionEvents)
      .set({ status, updatedAt: new Date() })
      .where(eq(publicAuctionEvents.id, req.params.id))
      .returning();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// POST /api/public-auctions/events/:id/notify — Notify dealers about upcoming event
router.post('/events/:id/notify', authMiddleware, operatorOnly, async (req, res) => {
  try {
    // TODO: Send email to all dealers with active showcase membership
    const [event] = await db.update(publicAuctionEvents)
      .set({ notificationSentAt: new Date(), updatedAt: new Date() })
      .where(eq(publicAuctionEvents.id, req.params.id))
      .returning();
    res.json({ message: 'Notifications sent', event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// ==========================================
// SHOWCASE MEMBERSHIPS (Dealer $299/year)
// ==========================================

// GET /api/public-auctions/showcase/status — Check dealer's showcase membership
router.get('/showcase/status', authMiddleware, async (req, res) => {
  try {
    const dealerId = (req as any).user.dealerId;
    const membership = await db.select().from(showcaseMemberships)
      .where(eq(showcaseMemberships.dealerId, dealerId))
      .orderBy(desc(showcaseMemberships.createdAt))
      .limit(1);
    res.json(membership[0] || { status: 'none' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// POST /api/public-auctions/showcase/subscribe — Subscribe to showcase ($299/year)
router.post('/showcase/subscribe', authMiddleware, async (req, res) => {
  try {
    const dealerId = (req as any).user.dealerId;
    const dealerName = (req as any).user.dealerName;
    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    // TODO: Create Stripe subscription for $299/year
    const [membership] = await db.insert(showcaseMemberships).values({
      dealerId,
      dealerName,
      renewalDate,
    }).returning();
    res.status(201).json(membership);
  } catch (err) {
    res.status(400).json({ error: 'Failed to subscribe' });
  }
});

// ==========================================
// SHOWCASE UNITS (Dealer submits for event)
// ==========================================

// GET /api/public-auctions/events/:eventId/units — Get all units for an event
router.get('/events/:eventId/units', async (req, res) => {
  try {
    const units = await db.select().from(showcaseUnits)
      .where(eq(showcaseUnits.eventId, req.params.eventId))
      .orderBy(desc(showcaseUnits.submittedAt));
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

// POST /api/public-auctions/events/:eventId/units — Submit unit for showcase
router.post('/events/:eventId/units', authMiddleware, async (req, res) => {
  try {
    const data = insertShowcaseUnitSchema.parse({
      ...req.body,
      eventId: req.params.eventId,
      dealerId: (req as any).user.dealerId,
    });
    const [unit] = await db.insert(showcaseUnits).values(data).returning();
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit unit' });
  }
});

// PATCH /api/public-auctions/units/:id/approve — Operator approves showcase unit
router.patch('/units/:id/approve', authMiddleware, operatorOnly, async (req, res) => {
  try {
    const [unit] = await db.update(showcaseUnits)
      .set({ status: 'approved', approvedAt: new Date() })
      .where(eq(showcaseUnits.id, req.params.id))
      .returning();
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: 'Failed to approve' });
  }
});

// PATCH /api/public-auctions/units/:id/reject — Operator rejects showcase unit
router.patch('/units/:id/reject', authMiddleware, operatorOnly, async (req, res) => {
  try {
    const [unit] = await db.update(showcaseUnits)
      .set({ status: 'rejected' })
      .where(eq(showcaseUnits.id, req.params.id))
      .returning();
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: 'Failed to reject' });
  }
});

// ==========================================
// PUBLIC BIDDERS (Registration + Card)
// ==========================================

// POST /api/public-auctions/register — Create free public account
router.post('/register', async (req, res) => {
  try {
    const data = publicBidderRegistrationSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [bidder] = await db.insert(publicBidders).values({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      province: data.province,
      passwordHash,
      status: 'registered',
    }).returning();
    // TODO: Send email verification
    res.status(201).json({ id: bidder.id, email: bidder.email, status: bidder.status });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(400).json({ error: 'Registration failed' });
  }
});

// POST /api/public-auctions/add-card — Add credit card (enables bidding)
router.post('/add-card', async (req, res) => {
  try {
    const { bidderId, stripePaymentMethodId } = req.body;
    // TODO: Attach payment method to Stripe customer, create customer if needed
    const [bidder] = await db.update(publicBidders).set({
      hasCardOnFile: true,
      status: 'card_on_file',
      lastCardFour: req.body.lastFour || '****',
    }).where(eq(publicBidders.id, bidderId)).returning();
    res.json(bidder);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add card' });
  }
});

// ==========================================
// PUBLIC BIDDING
// ==========================================

// GET /api/public-auctions/live — Get currently live event with all units
router.get('/live', async (req, res) => {
  try {
    const now = new Date();
    const [event] = await db.select().from(publicAuctionEvents)
      .where(and(
        eq(publicAuctionEvents.status, 'live'),
        lte(publicAuctionEvents.scheduledDate, now),
        gte(publicAuctionEvents.endsAt, now),
      ))
      .limit(1);

    if (!event) return res.json({ live: false });

    const units = await db.select().from(showcaseUnits)
      .where(and(
        eq(showcaseUnits.eventId, event.id),
        eq(showcaseUnits.status, 'live'),
      ));

    res.json({ live: true, event, units });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live auction' });
  }
});

// GET /api/public-auctions/upcoming — Get next scheduled event
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const [event] = await db.select().from(publicAuctionEvents)
      .where(and(
        eq(publicAuctionEvents.status, 'scheduled'),
        gte(publicAuctionEvents.scheduledDate, now),
      ))
      .orderBy(publicAuctionEvents.scheduledDate)
      .limit(1);
    res.json(event || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch upcoming' });
  }
});

// POST /api/public-auctions/bid — Place a bid (requires card on file)
router.post('/bid', async (req, res) => {
  try {
    const { showcaseUnitId, amount, bidderId } = publicBidPlacementSchema
      .extend({ bidderId: z.string().uuid() })
      .parse(req.body);

    // Verify bidder has card on file
    const [bidder] = await db.select().from(publicBidders)
      .where(eq(publicBidders.id, bidderId));
    if (!bidder || bidder.status !== 'card_on_file') {
      return res.status(403).json({ error: 'Credit card required to bid. Add a card first.' });
    }

    // Verify unit exists and auction is live
    const [unit] = await db.select().from(showcaseUnits)
      .where(eq(showcaseUnits.id, showcaseUnitId));
    if (!unit || unit.status !== 'live') {
      return res.status(400).json({ error: 'Unit is not available for bidding' });
    }

    // Verify bid is higher than current
    const currentBid = parseFloat(unit.currentBid || '0');
    if (amount <= currentBid) {
      return res.status(400).json({ error: `Bid must be higher than current bid of $${currentBid}` });
    }

    // Clear previous winning bid
    await db.update(publicBids)
      .set({ isWinning: false })
      .where(and(
        eq(publicBids.showcaseUnitId, showcaseUnitId),
        eq(publicBids.isWinning, true),
      ));

    // Place bid
    const [bid] = await db.insert(publicBids).values({
      eventId: unit.eventId,
      showcaseUnitId,
      bidderId,
      bidderEmail: bidder.email,
      amount: amount.toString(),
      isWinning: true,
    }).returning();

    // Update unit current bid
    await db.update(showcaseUnits).set({
      currentBid: amount.toString(),
      totalBids: unit.totalBids + 1,
    }).where(eq(showcaseUnits.id, showcaseUnitId));

    // Update bidder stats
    await db.update(publicBidders).set({
      totalBids: bidder.totalBids + 1,
    }).where(eq(publicBidders.id, bidderId));

    // TODO: Emit WebSocket event for real-time bid updates
    // TODO: Notify outbid users

    res.status(201).json(bid);
  } catch (err) {
    res.status(400).json({ error: 'Failed to place bid' });
  }
});

// POST /api/public-auctions/watch — Sign up for event notifications
router.post('/watch', async (req, res) => {
  try {
    const { email, bidderId } = req.body;
    const [watcher] = await db.insert(publicEventWatchers).values({
      email,
      bidderId,
    }).returning();
    res.status(201).json(watcher);
  } catch (err) {
    res.status(400).json({ error: 'Failed to register' });
  }
});

// ==========================================
// SETTLE AUCTION (Operator)
// ==========================================

// POST /api/public-auctions/events/:id/settle — End event and process winners
router.post('/events/:id/settle', authMiddleware, operatorOnly, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Get all live units for this event
    const units = await db.select().from(showcaseUnits)
      .where(and(
        eq(showcaseUnits.eventId, eventId),
        eq(showcaseUnits.status, 'live'),
      ));

    let totalSold = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    for (const unit of units) {
      // Get winning bid
      const [winningBid] = await db.select().from(publicBids)
        .where(and(
          eq(publicBids.showcaseUnitId, unit.id),
          eq(publicBids.isWinning, true),
        ));

      if (winningBid) {
        const soldPrice = parseFloat(winningBid.amount);
        const reserve = parseFloat(unit.reservePrice || '0');

        if (soldPrice >= reserve) {
          // Reserve met — sale complete
          await db.update(showcaseUnits).set({
            status: 'sold',
            winnerId: winningBid.bidderId,
            winnerEmail: winningBid.bidderEmail,
            soldPrice: winningBid.amount,
            commission: '250.00',
            soldAt: new Date(),
          }).where(eq(showcaseUnits.id, unit.id));

          // Place $500 hold on winner's card
          // TODO: createEscrowHold for the winner

          totalSold++;
          totalRevenue += soldPrice;
          totalCommission += 250;
        } else {
          // Reserve not met
          await db.update(showcaseUnits).set({ status: 'unsold' })
            .where(eq(showcaseUnits.id, unit.id));
        }
      } else {
        // No bids
        await db.update(showcaseUnits).set({ status: 'unsold' })
          .where(eq(showcaseUnits.id, unit.id));
      }
    }

    // Update event
    const [event] = await db.update(publicAuctionEvents).set({
      status: 'settled',
      totalSold,
      totalRevenue: totalRevenue.toString(),
      totalCommission: totalCommission.toString(),
      updatedAt: new Date(),
    }).where(eq(publicAuctionEvents.id, eventId)).returning();

    res.json({ event, totalSold, totalRevenue, totalCommission });
  } catch (err) {
    res.status(500).json({ error: 'Failed to settle auction' });
  }
});

export default router;
