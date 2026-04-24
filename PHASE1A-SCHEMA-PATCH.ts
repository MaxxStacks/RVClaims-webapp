// PHASE1A-SCHEMA-PATCH.ts
// DealerSuite360 — Phase 1A schema additions
//
// This file is ADDITIVE ONLY. It defines:
//   · New enum values to extend USER_ROLES
//   · New tables (events, notification_deliveries, user_notification_preferences,
//     technicians, consignors, consignment_agreements, work_orders,
//     work_order_labor, service_appointments, client_parts_orders,
//     lenders, lender_integrations, financing_applications, lender_submissions,
//     loan_deals, campaigns, campaign_templates, leads, landing_pages,
//     email_events)
//   · Column additions to existing tables (users, dealerships, claims)
//
// CC instructions are in PHASE1A-AUTONOMOUS.md. Do not hand-merge;
// follow the spec. CC will integrate this into shared/schema.ts via
// str_replace operations, preserving all existing table definitions.
//
// DESTRUCTIVE: nothing. No DROP, no RENAME. All new columns are nullable
// or have defaults. All new tables reference existing tables by FK only.

import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, timestamp, boolean, integer, decimal, uuid, jsonb,
  date, index, serial,
} from "drizzle-orm/pg-core";

// ============================================================================
// ENUM EXTENSIONS
// ============================================================================
//
// Existing enum in shared/schema.ts (line 12):
//   USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner",
//                 "dealer_staff", "client", "bidder"]
//
// REPLACE WITH:
//   USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner",
//                 "dealer_staff", "technician", "public_bidder",
//                 "consignor", "client", "bidder"]
//
// `bidder` retained as Option B: bidder = independent bidder (Live Monthly
// public auctions + public showcase). `public_bidder` is the new
// dealer-sponsored variant with scoped dealer portal access.
//
// NEW ENUMS TO ADD:

export const EVENT_PRIORITIES = ["informational", "action_required", "urgent"] as const;
export const DELIVERY_CHANNELS = ["in_app", "email", "sms", "webhook"] as const;
export const DELIVERY_STATUSES = ["pending", "sent", "delivered", "failed", "skipped"] as const;
export const WORK_ORDER_STATUSES = [
  "unassigned", "assigned", "en_route", "arrived", "in_progress",
  "blocked_parts", "paused", "completed", "invoiced", "cancelled",
] as const;
export const SERVICE_APPT_STATUSES = [
  "requested", "scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show",
] as const;
export const CONSIGNMENT_AGREEMENT_STATUSES = [
  "pending_signature", "active", "expired", "terminated", "sold",
] as const;
export const CLIENT_PARTS_ORDER_STATUSES = [
  "cart", "checkout", "paid", "fulfilling", "shipped", "delivered", "returned", "refunded",
] as const;
export const LENDER_SUBMISSION_STATUSES = [
  "draft", "submitted", "pending_review", "approved", "declined",
  "counter_offered", "withdrawn", "accepted", "funded",
] as const;
export const LOAN_DEAL_STATUSES = ["pending_funding", "funded", "past_due", "default", "paid_off"] as const;
export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent", "paused", "archived"] as const;
export const LEAD_STATUSES = ["new", "assigned", "contacted", "qualified", "converted", "disqualified", "lost"] as const;
export const EMAIL_EVENT_TYPES = ["sent", "delivered", "opened", "clicked", "bounced", "unsubscribed", "complained"] as const;

// ============================================================================
// COLUMN ADDITIONS TO EXISTING TABLES
// ============================================================================

// ---- USERS table — add `roles` multi-role column ----
// Add to existing users pgTable definition (after `role`):
//   roles: jsonb("roles").$type<string[]>().default(sql`'[]'::jsonb`),
//
// Migration: populate roles from role field:
//   UPDATE users SET roles = jsonb_build_array(role) WHERE roles = '[]'::jsonb;
//
// All auth checks should prefer `roles` array but fall back to `role` text.
// Existing `role` column stays as canonical primary role for display.

// ---- DEALERSHIPS table — add Stripe Connect + Cloudflare + TechFlow fields ----
// Add to existing dealerships pgTable:
//   stripeConnectAccountId: text("stripe_connect_account_id"),
//   stripeConnectStatus: text("stripe_connect_status"),  // null | pending | verified
//   cloudflareZoneId: text("cloudflare_zone_id"),
//   cloudflareVerificationToken: text("cloudflare_verification_token"),
//   customDomainStatus: text("custom_domain_status"),    // null | pending | verified | failed
//   techflowEnabled: boolean("techflow_enabled").default(false),
//   marketingEnabled: boolean("marketing_enabled").default(false),
//   consignmentEnabled: boolean("consignment_enabled").default(false),
//   partsStoreEnabled: boolean("parts_store_enabled").default(false),

// ---- CLAIMS table — add assignment + workflow tracking fields ----
// Add to existing claims pgTable:
//   assignedToUserId: uuid("assigned_to_user_id"),
//   assignedAt: timestamp("assigned_at"),
//   reviewStartedAt: timestamp("review_started_at"),
//   awaitingDealerResponse: boolean("awaiting_dealer_response").default(false),
//   denialReason: text("denial_reason"),
//   deniedAt: timestamp("denied_at"),
//   appealOpenedAt: timestamp("appeal_opened_at"),
//   stuck: boolean("stuck").default(false),
//   stuckSince: timestamp("stuck_since"),
//   submittedToMfrAt: timestamp("submitted_to_mfr_at"),
//   approvedAt: timestamp("approved_at"),

// ============================================================================
// NEW TABLES — EVENT BUS (3 tables)
// ============================================================================

export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),                  // canonical ID from catalog, e.g. "claim.submitted"
  domain: text("domain").notNull(),                     // Claims | Parts | Financing | etc.
  triggerPage: text("trigger_page"),                    // v6 page.sub_item that fired it
  actorUserId: uuid("actor_user_id"),                   // who fired it (null = system)
  actorRole: text("actor_role"),                        // role snapshot at fire time
  dealershipId: uuid("dealership_id"),                  // scoped dealership if any
  targetEntityType: text("target_entity_type"),         // e.g. "claim", "listing", "work_order"
  targetEntityId: uuid("target_entity_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  stateChanges: jsonb("state_changes").$type<string[]>().default([]),
  priority: text("priority", { enum: EVENT_PRIORITIES }).default("informational"),
  fanOutComplete: boolean("fan_out_complete").default(false),
  firedAt: timestamp("fired_at").defaultNow().notNull(),
}, (table) => [
  index("events_event_id_idx").on(table.eventId),
  index("events_domain_idx").on(table.domain),
  index("events_actor_user_idx").on(table.actorUserId),
  index("events_dealership_idx").on(table.dealershipId),
  index("events_target_entity_idx").on(table.targetEntityType, table.targetEntityId),
  index("events_fired_at_idx").on(table.firedAt),
]);

export const notificationDeliveries = pgTable("notification_deliveries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").notNull(),                  // FK events.id
  recipientUserId: uuid("recipient_user_id").notNull(), // FK users.id
  channel: text("channel", { enum: DELIVERY_CHANNELS }).notNull(),
  status: text("status", { enum: DELIVERY_STATUSES }).default("pending"),
  surface: text("surface"),                             // in-app: which page/component surfaces this
  title: text("title"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaRoute: text("cta_route"),
  externalId: text("external_id"),                      // email msg ID, SMS SID, etc.
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notif_deliveries_event_idx").on(table.eventId),
  index("notif_deliveries_recipient_idx").on(table.recipientUserId),
  index("notif_deliveries_status_idx").on(table.status),
  index("notif_deliveries_unread_idx").on(table.recipientUserId, table.isRead),
  index("notif_deliveries_channel_idx").on(table.channel),
]);

export const userNotificationPreferences = pgTable("user_notification_preferences", {
  userId: uuid("user_id").primaryKey(),
  // Category-level toggles. Each category: { in_app: bool, email: bool, sms: bool }
  // Categories: Claims, Parts, Sales, Financing, Marketplace, Bidder, TechFlow,
  //             Consignment, ClientActions, Billing, Users, Platform, Marketing,
  //             Messages, Inventory, Settings, Errors
  preferences: jsonb("preferences").$type<Record<string, {
    in_app?: boolean; email?: boolean; sms?: boolean;
  }>>().default({}),
  smsPhone: text("sms_phone"),                          // verified phone for SMS
  smsVerified: boolean("sms_verified").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// NEW TABLES — TECHFLOW (3 tables)
// ============================================================================

export const technicians = pgTable("technicians", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),           // FK users.id (role=technician)
  dealershipId: uuid("dealership_id").notNull(),        // FK dealerships.id
  specializations: jsonb("specializations").$type<string[]>().default([]),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  serviceAreaRadiusKm: integer("service_area_radius_km").default(50),
  baseLocation: jsonb("base_location").$type<{
    lat?: number; lng?: number; address?: string;
  }>(),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  isAvailable: boolean("is_available").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("technicians_user_idx").on(table.userId),
  index("technicians_dealership_idx").on(table.dealershipId),
  index("technicians_available_idx").on(table.isAvailable),
]);

export const workOrders = pgTable("work_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderNumber: text("work_order_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  claimId: uuid("claim_id"),                            // nullable: not all WOs from claims
  unitId: uuid("unit_id").notNull(),
  customerId: uuid("customer_id"),                      // FK users.id where role=client
  assignedTechId: uuid("assigned_tech_id"),             // FK technicians.id
  status: text("status", { enum: WORK_ORDER_STATUSES }).default("unassigned"),
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  arrivedAt: timestamp("arrived_at"),
  completedAt: timestamp("completed_at"),
  laborEstimateHours: decimal("labor_estimate_hours", { precision: 5, scale: 2 }),
  laborActualHours: decimal("labor_actual_hours", { precision: 5, scale: 2 }),
  partsNeeded: jsonb("parts_needed").$type<string[]>().default([]),
  notes: text("notes"),
  techNotes: text("tech_notes"),
  gpsTrack: jsonb("gps_track").$type<{ lat: number; lng: number; ts: string }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("work_orders_dealership_idx").on(table.dealershipId),
  index("work_orders_tech_idx").on(table.assignedTechId),
  index("work_orders_claim_idx").on(table.claimId),
  index("work_orders_status_idx").on(table.status),
  index("work_orders_scheduled_idx").on(table.scheduledFor),
]);

export const workOrderLabor = pgTable("work_order_labor", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: uuid("work_order_id").notNull(),
  techId: uuid("tech_id").notNull(),
  description: text("description").notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  syncedToClaimId: uuid("synced_to_claim_id"),          // if linked to a warranty claim
  performedAt: timestamp("performed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("wo_labor_wo_idx").on(table.workOrderId),
  index("wo_labor_tech_idx").on(table.techId),
]);

export const serviceAppointments = pgTable("service_appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentNumber: text("appointment_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id").notNull(),            // FK users.id (client)
  unitId: uuid("unit_id").notNull(),
  workOrderId: uuid("work_order_id"),                   // linked WO after dealer accepts
  status: text("status", { enum: SERVICE_APPT_STATUSES }).default("requested"),
  preferredDates: jsonb("preferred_dates").$type<string[]>().default([]),
  confirmedDate: timestamp("confirmed_date"),
  issueDescription: text("issue_description"),
  locationAddress: text("location_address"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  clientRating: integer("client_rating"),               // 1-5, filled after completion
  clientReview: text("client_review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("svc_appt_dealership_idx").on(table.dealershipId),
  index("svc_appt_customer_idx").on(table.customerId),
  index("svc_appt_unit_idx").on(table.unitId),
  index("svc_appt_status_idx").on(table.status),
]);

// ============================================================================
// NEW TABLES — CONSIGNMENT (2 tables)
// ============================================================================

export const consignors = pgTable("consignors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),           // FK users.id (role=consignor)
  dealershipId: uuid("dealership_id").notNull(),        // the dealer sponsoring this consignor
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  addressStreet: text("address_street"),
  addressCity: text("address_city"),
  addressProvince: text("address_province"),
  addressPostalCode: text("address_postal_code"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectStatus: text("stripe_connect_status"),   // null | pending | verified | rejected
  taxIdType: text("tax_id_type"),                       // "sin" | "ein" | "gst" | etc.
  taxIdLast4: text("tax_id_last4"),                     // only last 4 stored
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("consignors_user_idx").on(table.userId),
  index("consignors_dealership_idx").on(table.dealershipId),
]);

export const consignmentAgreements = pgTable("consignment_agreements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  agreementNumber: text("agreement_number").notNull().unique(),
  consignorId: uuid("consignor_id").notNull(),
  dealershipId: uuid("dealership_id").notNull(),
  unitId: uuid("unit_id").notNull(),
  splitPct: decimal("split_pct", { precision: 5, scale: 2 }).notNull(),  // consignor's share %
  durationDays: integer("duration_days").default(90),
  startDate: date("start_date"),
  endDate: date("end_date"),
  minListPrice: decimal("min_list_price", { precision: 10, scale: 2 }),
  status: text("status", { enum: CONSIGNMENT_AGREEMENT_STATUSES }).default("pending_signature"),
  signedAt: timestamp("signed_at"),
  signedDocumentUrl: text("signed_document_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("consignment_agree_consignor_idx").on(table.consignorId),
  index("consignment_agree_dealership_idx").on(table.dealershipId),
  index("consignment_agree_unit_idx").on(table.unitId),
  index("consignment_agree_status_idx").on(table.status),
]);

// ============================================================================
// NEW TABLES — CLIENT PARTS STORE (retail, distinct from existing partsOrders)
// ============================================================================

export const clientPartsOrders = pgTable("client_parts_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id").notNull(),            // FK users.id (client)
  unitId: uuid("unit_id"),                              // optional: fit-check
  status: text("status", { enum: CLIENT_PARTS_ORDER_STATUSES }).default("cart"),
  lineItems: jsonb("line_items").$type<{
    sku: string; description: string; qty: number; unit_price: number;
  }[]>().default([]),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  taxes: decimal("taxes", { precision: 10, scale: 2 }),
  shipping: decimal("shipping", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  shippingAddress: jsonb("shipping_address").$type<Record<string, string>>(),
  trackingCarrier: text("tracking_carrier"),
  trackingNumber: text("tracking_number"),
  placedAt: timestamp("placed_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("client_parts_dealership_idx").on(table.dealershipId),
  index("client_parts_customer_idx").on(table.customerId),
  index("client_parts_status_idx").on(table.status),
]);

// ============================================================================
// NEW TABLES — FULL FINANCING (5 tables)
// ============================================================================

export const lenders = pgTable("lenders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  country: text("country").default("Canada"),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  active: boolean("active").default(true),
  apiEndpoint: text("api_endpoint"),
  apiKeyRef: text("api_key_ref"),                       // reference to vault key, not the key itself
  minLoanAmount: decimal("min_loan_amount", { precision: 10, scale: 2 }),
  maxLoanAmount: decimal("max_loan_amount", { precision: 10, scale: 2 }),
  minTermMonths: integer("min_term_months"),
  maxTermMonths: integer("max_term_months"),
  minCreditScore: integer("min_credit_score"),
  approvalRules: jsonb("approval_rules").$type<Record<string, unknown>>().default({}),
  commissionStructure: jsonb("commission_structure").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("lenders_active_idx").on(table.active),
]);

export const lenderIntegrations = pgTable("lender_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  lenderId: uuid("lender_id").notNull().unique(),
  connectionStatus: text("connection_status").default("pending"),
  lastHealthCheckAt: timestamp("last_health_check_at"),
  healthStatus: text("health_status"),                  // ok | degraded | down
  rateSheetLastPulledAt: timestamp("rate_sheet_last_pulled_at"),
  rateSheetCache: jsonb("rate_sheet_cache").$type<Record<string, unknown>>().default({}),
  webhookSecretRef: text("webhook_secret_ref"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financingApplications = pgTable("financing_applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationNumber: text("application_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id").notNull(),            // FK users.id (client)
  unitId: uuid("unit_id"),
  submittedByUserId: uuid("submitted_by_user_id"),      // dealer staff who filed it
  amountRequested: decimal("amount_requested", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  preferredTermMonths: integer("preferred_term_months"),
  creditInfo: jsonb("credit_info").$type<Record<string, unknown>>().default({}),
  status: text("status").default("draft"),              // draft|submitted|approved|funded|withdrawn
  acceptedLenderId: uuid("accepted_lender_id"),
  acceptedTerms: jsonb("accepted_terms").$type<Record<string, unknown>>(),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawalReason: text("withdrawal_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("fin_apps_dealership_idx").on(table.dealershipId),
  index("fin_apps_customer_idx").on(table.customerId),
  index("fin_apps_status_idx").on(table.status),
]);

export const lenderSubmissions = pgTable("lender_submissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").notNull(),
  lenderId: uuid("lender_id").notNull(),
  status: text("status", { enum: LENDER_SUBMISSION_STATUSES }).default("draft"),
  submittedAt: timestamp("submitted_at"),
  respondedAt: timestamp("responded_at"),
  approvedRate: decimal("approved_rate", { precision: 5, scale: 3 }),
  approvedTermMonths: integer("approved_term_months"),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  approvedConditions: jsonb("approved_conditions").$type<Record<string, unknown>>(),
  declineReason: text("decline_reason"),
  counterTerms: jsonb("counter_terms").$type<Record<string, unknown>>(),
  lenderReferenceId: text("lender_reference_id"),
  rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("lender_sub_app_idx").on(table.applicationId),
  index("lender_sub_lender_idx").on(table.lenderId),
  index("lender_sub_status_idx").on(table.status),
]);

export const loanDeals = pgTable("loan_deals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").notNull(),
  lenderId: uuid("lender_id").notNull(),
  customerId: uuid("customer_id").notNull(),
  principalAmount: decimal("principal_amount", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 3 }).notNull(),
  termMonths: integer("term_months").notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  status: text("status", { enum: LOAN_DEAL_STATUSES }).default("pending_funding"),
  fundedAt: timestamp("funded_at"),
  nextPaymentDate: date("next_payment_date"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }),
  daysLate: integer("days_late").default(0),
  commissionEarnedByDs360: decimal("commission_earned_by_ds360", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("loan_deals_app_idx").on(table.applicationId),
  index("loan_deals_customer_idx").on(table.customerId),
  index("loan_deals_status_idx").on(table.status),
]);

// ============================================================================
// NEW TABLES — FULL MARKETING SUITE (5 tables)
// ============================================================================

export const campaignTemplates = pgTable("campaign_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),                         // email | landing_page | lead_form | sms
  subject: text("subject"),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  publishedByUserId: uuid("published_by_user_id"),      // operator who pushed it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("camp_tpl_type_idx").on(table.type),
  index("camp_tpl_active_idx").on(table.isActive),
]);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignNumber: text("campaign_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  createdByUserId: uuid("created_by_user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),                         // email | sms
  templateId: uuid("template_id"),
  subject: text("subject"),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  status: text("status", { enum: CAMPAIGN_STATUSES }).default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  recipientFilter: jsonb("recipient_filter").$type<Record<string, unknown>>().default({}),
  metrics: jsonb("metrics").$type<{
    sent?: number; delivered?: number; opened?: number; clicked?: number;
    bounced?: number; unsubscribed?: number;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("campaigns_dealership_idx").on(table.dealershipId),
  index("campaigns_status_idx").on(table.status),
  index("campaigns_scheduled_idx").on(table.scheduledFor),
]);

export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id"),                      // null for transactional
  transactionalId: uuid("transactional_id"),            // link to notification_deliveries.id
  recipientEmail: text("recipient_email").notNull(),
  eventType: text("event_type", { enum: EMAIL_EVENT_TYPES }).notNull(),
  linkUrl: text("link_url"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (table) => [
  index("email_events_campaign_idx").on(table.campaignId),
  index("email_events_recipient_idx").on(table.recipientEmail),
  index("email_events_type_idx").on(table.eventType),
  index("email_events_occurred_idx").on(table.occurredAt),
]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: uuid("dealership_id").notNull(),        // which dealer owns the lead
  sourcePage: text("source_page"),                      // landing_page slug / URL
  sourceCampaignId: uuid("source_campaign_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  status: text("status", { enum: LEAD_STATUSES }).default("new"),
  assignedToUserId: uuid("assigned_to_user_id"),
  convertedToCustomerId: uuid("converted_to_customer_id"),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("leads_dealership_idx").on(table.dealershipId),
  index("leads_status_idx").on(table.status),
  index("leads_assigned_idx").on(table.assignedToUserId),
  index("leads_email_idx").on(table.email),
]);

export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: uuid("dealership_id").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  contentHtml: text("content_html"),
  metaDescription: text("meta_description"),
  ogImageUrl: text("og_image_url"),
  templateId: uuid("template_id"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  views: integer("views").default(0),
  submissions: integer("submissions").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("landing_pages_dealership_idx").on(table.dealershipId),
  index("landing_pages_slug_idx").on(table.dealershipId, table.slug),
  index("landing_pages_published_idx").on(table.isPublished),
]);

// ============================================================================
// END OF PHASE 1A PATCHES
// ============================================================================
// Total new content:
//   · 10 new enums
//   · 18 new tables (events 3 + techflow 4 + consignment 2 + parts store 1 +
//                    financing 5 + marketing 5 + leads subset thereof)
//   · 3 column additions (users.roles, dealerships.* x8, claims.* x10)
//
// All additive. Zero destructive operations.
