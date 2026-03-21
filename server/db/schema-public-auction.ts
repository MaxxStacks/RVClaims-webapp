// schema-public-auction.ts — Extends marketplace schema for monthly public auctions
// Public users create free accounts to browse, add credit card to bid.
// Dealers pay $299/year (on top of $499 marketplace) to list units in public events.

import { pgTable, text, integer, boolean, timestamp, decimal, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==================== ENUMS ====================

export const publicBidderStatusEnum = pgEnum('public_bidder_status', [
  'registered',     // Free account created
  'card_on_file',   // Credit card added — can bid
  'suspended',      // Blocked by Dealer Suite 360
]);

export const publicAuctionStatusEnum = pgEnum('public_auction_status', [
  'scheduled',      // Date set, not yet live
  'accepting_units', // Dealers can submit units for showcase
  'live',           // 24-hour window is active
  'ended',          // Bidding closed, settling winners
  'settled',        // All transactions complete
  'cancelled',      // Event cancelled
]);

export const showcaseStatusEnum = pgEnum('showcase_status', [
  'submitted',      // Dealer submitted unit for this event
  'approved',       // Dealer Suite 360 approved the listing
  'rejected',       // Dealer Suite 360 rejected (bad photos, incomplete, etc.)
  'live',           // Currently in the public auction
  'sold',           // Won by a bidder
  'unsold',         // Auction ended, no winner / reserve not met
]);

// ==================== PUBLIC BIDDERS ====================
// Anyone can create a free account. Credit card required to place bids.

export const publicBidders = pgTable('public_bidders', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  province: text('province'),
  city: text('city'),
  passwordHash: text('password_hash').notNull(),
  status: publicBidderStatusEnum('status').default('registered').notNull(),
  stripeCustomerId: text('stripe_customer_id'),       // Created when they add card
  hasCardOnFile: boolean('has_card_on_file').default(false).notNull(),
  lastCardFour: text('last_card_four'),                // e.g. "4242"
  emailVerified: boolean('email_verified').default(false).notNull(),
  totalBids: integer('total_bids').default(0).notNull(),
  totalWins: integer('total_wins').default(0).notNull(),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// ==================== PUBLIC AUCTION EVENTS ====================
// One per month. Operator schedules the date. 24-hour window.

export const publicAuctionEvents = pgTable('public_auction_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),                        // e.g. "April 2026 Public Auction"
  description: text('description'),                     // Promo text for the event
  scheduledDate: timestamp('scheduled_date').notNull(), // Start of 24-hour window
  endsAt: timestamp('ends_at').notNull(),               // scheduledDate + 24hrs
  status: publicAuctionStatusEnum('status').default('scheduled').notNull(),
  unitSubmissionDeadline: timestamp('unit_submission_deadline'), // Cutoff for dealers to submit
  totalUnits: integer('total_units').default(0).notNull(),
  totalBids: integer('total_bids').default(0).notNull(),
  totalSold: integer('total_sold').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  totalCommission: decimal('total_commission', { precision: 12, scale: 2 }).default('0'),
  registeredBidders: integer('registered_bidders').default(0).notNull(),
  notificationSentAt: timestamp('notification_sent_at'), // When dealers were notified
  createdBy: text('created_by').notNull(),               // Operator user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== DEALER SHOWCASE MEMBERSHIP ====================
// $299/year add-on. Required to list units in public auctions.

export const showcaseMemberships = pgTable('showcase_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  dealerId: text('dealer_id').notNull(),                // References dealers table
  dealerName: text('dealer_name').notNull(),
  status: text('status').notNull().default('active'),    // active | expired | cancelled
  stripeSubscriptionId: text('stripe_subscription_id'),
  annualFee: decimal('annual_fee', { precision: 8, scale: 2 }).default('299.00').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  renewalDate: timestamp('renewal_date').notNull(),
  unitsShowcased: integer('units_showcased').default(0).notNull(),
  unitsSold: integer('units_sold').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== SHOWCASE UNITS ====================
// Units submitted by dealers for a specific public auction event.

export const showcaseUnits = pgTable('showcase_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull(),                  // References publicAuctionEvents
  dealerId: text('dealer_id').notNull(),
  listingId: uuid('listing_id'),                        // Optional: link to marketplace listing
  // Unit details
  vin: text('vin').notNull(),
  year: integer('year').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  rvType: text('rv_type').notNull(),
  lengthFt: integer('length_ft'),
  slides: integer('slides'),
  bunks: integer('bunks'),
  sleeps: integer('sleeps'),
  weightLbs: integer('weight_lbs'),
  condition: text('condition'),
  description: text('description'),
  // Pricing
  startingBid: decimal('starting_bid', { precision: 12, scale: 2 }).notNull(),
  reservePrice: decimal('reserve_price', { precision: 12, scale: 2 }),  // Hidden minimum
  buyNowPrice: decimal('buy_now_price', { precision: 12, scale: 2 }),   // Optional instant buy
  // Status
  status: showcaseStatusEnum('status').default('submitted').notNull(),
  currentBid: decimal('current_bid', { precision: 12, scale: 2 }),
  totalBids: integer('total_bids').default(0).notNull(),
  winnerId: uuid('winner_id'),                          // References publicBidders
  winnerEmail: text('winner_email'),
  soldPrice: decimal('sold_price', { precision: 12, scale: 2 }),
  commission: decimal('commission', { precision: 12, scale: 2 }),  // $250
  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  soldAt: timestamp('sold_at'),
});

// ==================== SHOWCASE PHOTOS ====================

export const showcasePhotos = pgTable('showcase_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  showcaseUnitId: uuid('showcase_unit_id').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// ==================== PUBLIC BIDS ====================

export const publicBids = pgTable('public_bids', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull(),
  showcaseUnitId: uuid('showcase_unit_id').notNull(),
  bidderId: uuid('bidder_id').notNull(),                // References publicBidders
  bidderEmail: text('bidder_email').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  isWinning: boolean('is_winning').default(false).notNull(),
  isBuyNow: boolean('is_buy_now').default(false).notNull(),
  stripeHoldId: text('stripe_hold_id'),                  // $500 hold on winning bid
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== EVENT WATCHERS ====================
// Public users who want to be notified about upcoming events

export const publicEventWatchers = pgTable('public_event_watchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  bidderId: uuid('bidder_id'),                           // If registered
  notifyEmail: boolean('notify_email').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== ZOD VALIDATORS ====================

export const insertPublicBidderSchema = createInsertSchema(publicBidders).omit({
  id: true, createdAt: true, lastLoginAt: true, totalBids: true, totalWins: true, totalSpent: true,
});

export const insertPublicAuctionEventSchema = createInsertSchema(publicAuctionEvents).omit({
  id: true, createdAt: true, updatedAt: true, totalUnits: true, totalBids: true, totalSold: true,
  totalRevenue: true, totalCommission: true, registeredBidders: true, notificationSentAt: true,
});

export const insertShowcaseUnitSchema = createInsertSchema(showcaseUnits).omit({
  id: true, submittedAt: true, approvedAt: true, soldAt: true, currentBid: true, totalBids: true,
  winnerId: true, winnerEmail: true, soldPrice: true, commission: true, status: true,
});

export const insertPublicBidSchema = createInsertSchema(publicBids).omit({
  id: true, createdAt: true, isWinning: true, stripeHoldId: true,
});

export const publicBidPlacementSchema = z.object({
  showcaseUnitId: z.string().uuid(),
  amount: z.number().positive(),
  isBuyNow: z.boolean().optional(),
});

export const publicBidderRegistrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  province: z.string().optional(),
  password: z.string().min(8),
});
