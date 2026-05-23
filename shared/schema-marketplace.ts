// server/db/schema-marketplace.ts — Database schema for Dealer Marketplace + Live Auctions
// Dealers pay $499/year to access. Dealer Suite 360 mediates all transactions.
// Dealer identity is HIDDEN in listings. $500 Stripe escrow hold. $250 flat commission.

import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ==================== ENUMS ====================

export const membershipStatusEnum = pgEnum('membership_status', [
  'pending',        // Form submitted, awaiting verification
  'under_review',   // Dealer Suite 360 staff is verifying
  'approved',       // Verified, payment pending
  'active',         // Paid and active
  'expired',        // Annual fee lapsed
  'suspended',      // Suspended by Dealer Suite 360
  'rejected',       // Application denied
]);

export const listingStatusEnum = pgEnum('listing_status', [
  'draft',          // Saved but not published
  'pending_review', // Submitted for review
  'active',         // Live on marketplace
  'on_hold',        // $500 deposit placed by a buyer
  'sold',           // Transaction completed
  'expired',        // Listing TTL reached
  'withdrawn',      // Seller pulled the listing
  'rejected',       // Dealer Suite 360 rejected the listing
]);

export const inquiryTypeEnum = pgEnum('inquiry_type', [
  'offer',          // Dealer wants to buy / make an offer
  'question',       // Question about the unit
]);

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'new',            // Just submitted
  'forwarded',      // Dealer Suite 360 forwarded to seller (anonymized)
  'responded',      // Seller responded through Dealer Suite 360
  'accepted',       // Offer accepted
  'declined',       // Offer declined
  'expired',        // No response within timeframe
]);

export const holdStatusEnum = pgEnum('hold_status', [
  'pending',        // Stripe PaymentIntent created, not yet captured
  'active',         // $500 authorized/held
  'released',       // Hold released (deal fell through)
  'captured',       // Hold captured (applied to transaction)
  'refunded',       // Refunded after capture
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',        // Hold placed, deal in progress
  'in_transit',     // Unit being transferred
  'inspection',     // Buyer inspecting
  'completed',      // Both parties confirmed, commission charged
  'disputed',       // Dispute raised
  'cancelled',      // Deal cancelled, hold released
]);

export const auctionStatusEnum = pgEnum('auction_status', [
  'draft',          // Created, not scheduled
  'scheduled',      // Scheduled for a future date
  'live',           // Currently accepting bids
  'ending',         // Final minutes, auto-extend active
  'ended',          // Bidding closed
  'sold',           // Winner confirmed, transaction started
  'no_sale',        // Reserve not met or no bids
  'cancelled',      // Cancelled by seller or Dealer Suite 360
]);

export const bidStatusEnum = pgEnum('bid_status', [
  'active',         // Current valid bid
  'outbid',         // Surpassed by a higher bid
  'winning',        // Currently the highest bid
  'won',            // Auction ended, this bid won
  'cancelled',      // Bid withdrawn (if allowed)
]);

// ==================== MARKETPLACE MEMBERSHIP ====================

export const marketplaceMembers = pgTable('marketplace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Link to existing dealer (if they're already on the platform)
  dealerId: uuid('dealer_id'),
  
  // Signup info
  dealershipName: text('dealership_name').notNull(),
  legalName: text('legal_name'),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('Canada'),
  website: text('website'),
  businessNumber: text('business_number'),
  
  // Verification
  status: membershipStatusEnum('status').notNull().default('pending'),
  verifiedBy: uuid('verified_by'),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  verificationNotes: text('verification_notes'),
  
  // Subscription
  annualFee: decimal('annual_fee', { precision: 10, scale: 2 }).notNull().default('499.00'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  
  // Permissions
  canList: boolean('can_list').notNull().default(true),
  canBrowse: boolean('can_browse').notNull().default(true),
  canAuction: boolean('can_auction').notNull().default(true),
  
  // Stats
  totalListings: integer('total_listings').notNull().default(0),
  totalPurchases: integer('total_purchases').notNull().default(0),
  totalSales: integer('total_sales').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== MARKETPLACE LISTINGS ====================

export const marketplaceListings = pgTable('marketplace_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingNumber: text('listing_number').notNull().unique(),
  
  sellerId: uuid('seller_id').notNull().references(() => marketplaceMembers.id),
  
  // Unit info
  vin: text('vin'),
  year: integer('year').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  rvType: text('rv_type').notNull(),
  
  // Specs
  lengthFt: decimal('length_ft', { precision: 5, scale: 1 }),
  slides: integer('slides'),
  bunks: integer('bunks'),
  sleeps: integer('sleeps'),
  dryWeightLbs: integer('dry_weight_lbs'),
  gvwr: integer('gvwr'),
  
  // Condition
  condition: text('condition').notNull(),
  mileage: integer('mileage'),
  hoursUsed: integer('hours_used'),
  
  // Pricing
  askingPrice: decimal('asking_price', { precision: 10, scale: 2 }).notNull(),
  minimumOffer: decimal('minimum_offer', { precision: 10, scale: 2 }),
  obo: boolean('obo').notNull().default(false),
  
  // Description
  title: text('title').notNull(),
  description: text('description').notNull(),
  highlights: text('highlights'),
  knownIssues: text('known_issues'),
  
  // Location (general area, not dealer address)
  locationCity: text('location_city').notNull(),
  locationProvince: text('location_province').notNull(),
  
  // Status
  status: listingStatusEnum('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  expiresAt: timestamp('expires_at'),
  
  // Stats
  viewCount: integer('view_count').notNull().default(0),
  inquiryCount: integer('inquiry_count').notNull().default(0),
  watchlistCount: integer('watchlist_count').notNull().default(0),
  
  // Hold
  heldBy: uuid('held_by').references(() => marketplaceMembers.id),
  heldAt: timestamp('held_at'),
  holdTransactionId: uuid('hold_transaction_id'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== LISTING PHOTOS ====================

export const listingPhotos = pgTable('listing_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => marketplaceListings.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== WATCHLIST ====================

export const marketplaceWatchlist = pgTable('marketplace_watchlist', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').notNull().references(() => marketplaceMembers.id),
  listingId: uuid('listing_id').references(() => marketplaceListings.id, { onDelete: 'cascade' }),
  auctionId: uuid('auction_id').references(() => auctions.id, { onDelete: 'cascade' }),
  notifyOnPriceChange: boolean('notify_on_price_change').notNull().default(true),
  notifyOnBid: boolean('notify_on_bid').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== INQUIRIES ====================

export const marketplaceInquiries = pgTable('marketplace_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  inquiryNumber: text('inquiry_number').notNull().unique(),
  listingId: uuid('listing_id').notNull().references(() => marketplaceListings.id),
  buyerId: uuid('buyer_id').notNull().references(() => marketplaceMembers.id),
  
  type: inquiryTypeEnum('type').notNull(),
  status: inquiryStatusEnum('status').notNull().default('new'),
  
  offerAmount: decimal('offer_amount', { precision: 10, scale: 2 }),
  
  // Messages mediated by Dealer Suite 360
  messages: jsonb('messages').notNull().default('[]'),
  
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== ESCROW HOLDS ====================

export const marketplaceHolds = pgTable('marketplace_holds', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  listingId: uuid('listing_id').references(() => marketplaceListings.id),
  auctionId: uuid('auction_id').references(() => auctions.id),
  buyerId: uuid('buyer_id').notNull().references(() => marketplaceMembers.id),
  
  // Stripe
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default('500.00'),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  stripePaymentMethodId: text('stripe_payment_method_id'),
  
  status: holdStatusEnum('status').notNull().default('pending'),
  
  authorizedAt: timestamp('authorized_at'),
  capturedAt: timestamp('captured_at'),
  releasedAt: timestamp('released_at'),
  refundedAt: timestamp('refunded_at'),
  
  expiresAt: timestamp('expires_at'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== TRANSACTIONS ====================

export const marketplaceTransactions = pgTable('marketplace_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionNumber: text('transaction_number').notNull().unique(),
  
  sellerId: uuid('seller_id').notNull().references(() => marketplaceMembers.id),
  buyerId: uuid('buyer_id').notNull().references(() => marketplaceMembers.id),
  
  listingId: uuid('listing_id').references(() => marketplaceListings.id),
  auctionId: uuid('auction_id').references(() => auctions.id),
  
  // Financials
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  holdId: uuid('hold_id').references(() => marketplaceHolds.id),
  commission: decimal('commission', { precision: 10, scale: 2 }).notNull().default('250.00'),
  commissionPaid: boolean('commission_paid').notNull().default(false),
  stripeCommissionChargeId: text('stripe_commission_charge_id'),
  
  status: transactionStatusEnum('status').notNull().default('pending'),
  
  // Unit snapshot
  unitSnapshot: jsonb('unit_snapshot').notNull(),
  
  // Timeline
  holdPlacedAt: timestamp('hold_placed_at'),
  sellerConfirmedAt: timestamp('seller_confirmed_at'),
  buyerConfirmedAt: timestamp('buyer_confirmed_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: text('cancelled_by'),
  cancellationReason: text('cancellation_reason'),
  
  internalNotes: text('internal_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== LIVE AUCTIONS ====================

export const auctions = pgTable('auctions', {
  id: uuid('id').primaryKey().defaultRandom(),
  auctionNumber: text('auction_number').notNull().unique(),
  
  sellerId: uuid('seller_id').notNull().references(() => marketplaceMembers.id),
  
  // Unit
  vin: text('vin'),
  year: integer('year').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  rvType: text('rv_type').notNull(),
  lengthFt: decimal('length_ft', { precision: 5, scale: 1 }),
  slides: integer('slides'),
  bunks: integer('bunks'),
  sleeps: integer('sleeps'),
  dryWeightLbs: integer('dry_weight_lbs'),
  condition: text('condition').notNull(),
  
  title: text('title').notNull(),
  description: text('description').notNull(),
  highlights: text('highlights'),
  knownIssues: text('known_issues'),
  locationCity: text('location_city').notNull(),
  locationProvince: text('location_province').notNull(),
  
  // Auction config
  startingBid: decimal('starting_bid', { precision: 10, scale: 2 }).notNull(),
  reservePrice: decimal('reserve_price', { precision: 10, scale: 2 }),
  buyNowPrice: decimal('buy_now_price', { precision: 10, scale: 2 }),
  bidIncrement: decimal('bid_increment', { precision: 10, scale: 2 }).notNull().default('100.00'),
  
  // Schedule
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),
  
  // Auto-extend
  autoExtendMinutes: integer('auto_extend_minutes').notNull().default(3),
  autoExtendThreshold: integer('auto_extend_threshold').notNull().default(5),
  extensionCount: integer('extension_count').notNull().default(0),
  
  // Current state
  status: auctionStatusEnum('status').notNull().default('draft'),
  currentBid: decimal('current_bid', { precision: 10, scale: 2 }),
  currentBidderId: uuid('current_bidder_id').references(() => marketplaceMembers.id),
  totalBids: integer('total_bids').notNull().default(0),
  uniqueBidders: integer('unique_bidders').notNull().default(0),
  
  // Winner
  winnerId: uuid('winner_id').references(() => marketplaceMembers.id),
  winningBid: decimal('winning_bid', { precision: 10, scale: 2 }),
  reserveMet: boolean('reserve_met').notNull().default(false),
  
  viewCount: integer('view_count').notNull().default(0),
  watcherCount: integer('watcher_count').notNull().default(0),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ==================== AUCTION PHOTOS ====================

export const auctionPhotos = pgTable('auction_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  auctionId: uuid('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== BIDS ====================

export const auctionBids = pgTable('auction_bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  auctionId: uuid('auction_id').notNull().references(() => auctions.id),
  bidderId: uuid('bidder_id').notNull().references(() => marketplaceMembers.id),
  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  isProxy: boolean('is_proxy').notNull().default(false),
  maxProxyAmount: decimal('max_proxy_amount', { precision: 10, scale: 2 }),
  
  status: bidStatusEnum('status').notNull().default('active'),
  isBuyNow: boolean('is_buy_now').notNull().default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== AUCTION WATCHERS ====================

export const auctionWatchers = pgTable('auction_watchers', {
  id: uuid('id').primaryKey().defaultRandom(),
  auctionId: uuid('auction_id').notNull().references(() => auctions.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => marketplaceMembers.id),
  notifyOnNewBid: boolean('notify_on_new_bid').notNull().default(true),
  notifyOnEnding: boolean('notify_on_ending').notNull().default(true),
  notifyOnResult: boolean('notify_on_result').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== SAVED SEARCHES ====================

export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').notNull().references(() => marketplaceMembers.id),
  name: text('name').notNull(),
  filters: jsonb('filters').notNull(),
  notifyOnMatch: boolean('notify_on_match').notNull().default(true),
  lastNotifiedAt: timestamp('last_notified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ==================== ZOD VALIDATORS ====================

export const membershipSignupSchema = z.object({
  dealershipName: z.string().min(2),
  legalName: z.string().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().default('Canada'),
  website: z.string().url().optional().or(z.literal('')),
  businessNumber: z.string().optional(),
});

export const insertListingSchema = z.object({
  vin: z.string().optional(),
  year: z.number().min(1990).max(2030),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  rvType: z.string().min(1),
  lengthFt: z.number().optional(),
  slides: z.number().optional(),
  bunks: z.number().optional(),
  sleeps: z.number().optional(),
  dryWeightLbs: z.number().optional(),
  gvwr: z.number().optional(),
  condition: z.string().min(1),
  mileage: z.number().optional(),
  askingPrice: z.number().positive(),
  minimumOffer: z.number().positive().optional(),
  obo: z.boolean().optional(),
  title: z.string().min(5),
  description: z.string().min(20),
  highlights: z.string().optional(),
  knownIssues: z.string().optional(),
  locationCity: z.string().min(2),
  locationProvince: z.string().min(2),
});

export const insertAuctionSchema = z.object({
  vin: z.string().optional(),
  year: z.number().min(1990).max(2030),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  rvType: z.string().min(1),
  lengthFt: z.number().optional(),
  slides: z.number().optional(),
  bunks: z.number().optional(),
  sleeps: z.number().optional(),
  dryWeightLbs: z.number().optional(),
  condition: z.string().min(1),
  title: z.string().min(5),
  description: z.string().min(20),
  highlights: z.string().optional(),
  knownIssues: z.string().optional(),
  locationCity: z.string().min(2),
  locationProvince: z.string().min(2),
  startingBid: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  bidIncrement: z.number().positive().optional(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  autoExtendMinutes: z.number().optional(),
  autoExtendThreshold: z.number().optional(),
});

export const placeBidSchema = z.object({
  auctionId: z.string().uuid(),
  amount: z.number().positive(),
  isProxy: z.boolean().optional().default(false),
  maxProxyAmount: z.number().positive().optional(),
  isBuyNow: z.boolean().optional().default(false),
});

export const placeHoldSchema = z.object({
  listingId: z.string().uuid().optional(),
  auctionId: z.string().uuid().optional(),
  paymentMethodId: z.string(),
});

export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  manufacturer: z.string().optional(),
  rvType: z.string().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  minLengthFt: z.number().optional(),
  maxLengthFt: z.number().optional(),
  minSlides: z.number().optional(),
  minBunks: z.number().optional(),
  minSleeps: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  condition: z.string().optional(),
  province: z.string().optional(),
  sortBy: z.enum(['newest', 'price_low', 'price_high', 'ending_soon']).optional().default('newest'),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(24),
});
