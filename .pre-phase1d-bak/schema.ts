// shared/schema.ts — DealerSuite360 / RVClaims.ca Database Schema
// 22 tables · Drizzle ORM · Neon PostgreSQL

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, uuid, jsonb, date, index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== ROLE & STATUS ENUMS ====================

export const USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor", "client", "bidder"] as const;
export const INVITE_ROLES = ["operator_staff", "dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor", "client"] as const;
export const DEALERSHIP_PLANS = ["plan_a", "plan_b", "custom"] as const;
export const DEALERSHIP_STATUSES = ["active", "suspended", "pending"] as const;
export const RV_TYPES = ["travel_trailer", "fifth_wheel", "class_a", "class_c", "toy_hauler", "pop_up", "van_camper", "truck_camper"] as const;
export const UNIT_STATUSES = ["on_lot", "delivered", "in_service", "sold"] as const;
export const CLAIM_TYPES = ["daf", "pdi", "warranty", "extended_warranty", "insurance"] as const;
export const CLAIM_STATUSES = ["draft", "submitted", "new_unassigned", "assigned", "in_review", "info_requested", "submitted_to_mfr", "processing", "authorized", "approved", "partial_approval", "denied", "appeal_pending", "reopened", "awaiting_parts", "parts_ordered", "ready_for_repair", "repair", "completed", "payment_requested", "awaiting_payment", "paid", "closed"] as const;
export const FRC_LINE_STATUSES = ["pending", "approved", "denied"] as const;
export const BATCH_STATUSES = ["uploaded", "in_review", "processed", "rejected"] as const;
export const PHOTO_CATEGORIES = ["daf", "pdi", "warranty", "general", "unit_display"] as const;
export const DOCUMENT_TYPES = ["warranty_cert", "ext_warranty", "inspection", "contract", "invoice", "report", "other"] as const;
export const INVOICE_STATUSES = ["draft", "sent", "pending", "paid", "overdue", "cancelled"] as const;
export const PAYMENT_METHODS = ["stripe_card", "email_invoice", "wallet", "etransfer", "cheque"] as const;
export const RECURRING_TYPES = ["one_time", "monthly", "quarterly", "annual"] as const;
export const PRODUCT_CATEGORIES = ["subscription", "claim_fee", "service_addon", "part", "custom"] as const;
export const PRICING_TYPES = ["fixed", "percentage", "variable"] as const;
export const BILLING_FREQUENCIES = ["one_time", "monthly", "quarterly", "annual", "per_claim", "per_unit"] as const;
export const FINANCING_STATUSES = ["submitted", "shopping", "approved", "declined", "completed"] as const;
export const FI_DEAL_STATUSES = ["flagged", "recommending", "presented", "completed"] as const;
export const WARRANTY_PLAN_STATUSES = ["active", "expiring", "expired", "cancelled"] as const;
export const PARTS_ORDER_STATUSES = ["requested", "sourcing", "quoted", "ordered", "shipped", "delivered"] as const;
export const PARTS_PRIORITIES = ["normal", "urgent"] as const;
export const TICKET_CATEGORIES = ["claim_warranty", "billing", "parts_order", "general", "warranty_expiry", "fi_protection", "feedback"] as const;
export const TICKET_STATUSES = ["open", "waiting_dealer", "waiting_client", "action_needed", "resolved", "closed"] as const;
export const NOTIFICATION_TYPES = ["claim_update", "invoice", "payment", "financing", "parts", "fi", "ticket", "system", "announcement"] as const;
export const FEATURE_PRIORITIES = ["low", "medium", "high"] as const;
export const FEATURE_STATUSES = ["backlog", "under_review", "planned", "in_progress", "completed"] as const;

// ==================== PHASE 1A NEW ENUMS ====================

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

// ==================== 1. USERS ====================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: USER_ROLES }).notNull(),
  roles: jsonb("roles").$type<string[]>().default(sql`'[]'::jsonb`),
  clerkUserId: text("clerk_user_id").unique(),
  dealershipId: uuid("dealership_id"),
  timezone: text("timezone").default("America/Toronto"),
  language: text("language").default("en"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_dealership_idx").on(table.dealershipId),
  index("users_role_idx").on(table.role),
]);

// ==================== 2. SESSIONS ====================

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sessions_user_idx").on(table.userId),
]);

// ==================== 3. INVITATIONS ====================

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: text("role", { enum: INVITE_ROLES }).notNull(),
  dealershipId: uuid("dealership_id"),
  unitId: uuid("unit_id"),
  invitedBy: uuid("invited_by").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("invitations_token_idx").on(table.token),
  index("invitations_email_idx").on(table.email),
]);

// ==================== 4. DEALERSHIPS ====================

export const dealerships = pgTable("dealerships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  businessNumber: text("business_number"),
  street: text("street"),
  suite: text("suite"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("Canada"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactTitle: text("contact_title"),
  plan: text("plan", { enum: DEALERSHIP_PLANS }).default("plan_a"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("349.00"),
  billingCycle: text("billing_cycle").default("monthly"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  claimFeePercent: decimal("claim_fee_percent", { precision: 5, scale: 2 }),
  claimFeeMin: decimal("claim_fee_min", { precision: 10, scale: 2 }),
  claimFeeMax: decimal("claim_fee_max", { precision: 10, scale: 2 }),
  dafFee: decimal("daf_fee", { precision: 10, scale: 2 }),
  pdiFee: decimal("pdi_fee", { precision: 10, scale: 2 }),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#08235d"),
  accentColor: text("accent_color").default("#22c55e"),
  customDomain: text("custom_domain"),
  domainVerified: boolean("domain_verified").default(false),
  welcomeMessage: text("welcome_message"),
  manufacturers: jsonb("manufacturers").$type<string[]>().default(["Jayco"]),
  status: text("status", { enum: DEALERSHIP_STATUSES }).default("pending"),
  notes: text("notes"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectStatus: text("stripe_connect_status"),
  cloudflareZoneId: text("cloudflare_zone_id"),
  cloudflareVerificationToken: text("cloudflare_verification_token"),
  customDomainStatus: text("custom_domain_status"),
  techflowEnabled: boolean("techflow_enabled").default(false),
  marketingEnabled: boolean("marketing_enabled").default(false),
  consignmentEnabled: boolean("consignment_enabled").default(false),
  partsStoreEnabled: boolean("parts_store_enabled").default(false),
  clerkOrgId: text("clerk_org_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== 5. UNITS ====================

export const units = pgTable("units", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: uuid("dealership_id").notNull(),
  vin: varchar("vin", { length: 17 }).notNull().unique(),
  stockNumber: text("stock_number"),
  year: integer("year"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  rvType: text("rv_type", { enum: RV_TYPES }),
  customerId: uuid("customer_id"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerCity: text("customer_city"),
  displayPhotoUrl: text("display_photo_url"),
  deliveryDate: date("delivery_date"),
  warrantyStart: date("warranty_start"),
  warrantyEnd: date("warranty_end"),
  extWarrantyProvider: text("ext_warranty_provider"),
  extWarrantyEnd: date("ext_warranty_end"),
  extWarrantyCoverage: text("ext_warranty_coverage"),
  dafCompleted: boolean("daf_completed").default(false),
  dafDate: date("daf_date"),
  pdiCompleted: boolean("pdi_completed").default(false),
  pdiDate: date("pdi_date"),
  status: text("status", { enum: UNIT_STATUSES }).default("on_lot"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("units_vin_idx").on(table.vin),
  index("units_dealership_idx").on(table.dealershipId),
]);

// ==================== 6. CLAIMS ====================

export const claims = pgTable("claims", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: text("claim_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  unitId: uuid("unit_id").notNull(),
  manufacturer: text("manufacturer").notNull(),
  type: text("type", { enum: CLAIM_TYPES }).notNull(),
  status: text("status", { enum: CLAIM_STATUSES }).default("draft"),
  manufacturerClaimNumber: text("manufacturer_claim_number"),
  preauthNumber: text("preauth_number"),
  estimatedAmount: decimal("estimated_amount", { precision: 10, scale: 2 }),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  dealerNotes: text("dealer_notes"),
  operatorNotes: text("operator_notes"),
  submittedAt: timestamp("submitted_at"),
  authorizedAt: timestamp("authorized_at"),
  completedAt: timestamp("completed_at"),
  paidAt: timestamp("paid_at"),
  assignedToUserId: uuid("assigned_to_user_id"),
  assignedAt: timestamp("assigned_at"),
  reviewStartedAt: timestamp("review_started_at"),
  awaitingDealerResponse: boolean("awaiting_dealer_response").default(false),
  denialReason: text("denial_reason"),
  deniedAt: timestamp("denied_at"),
  appealOpenedAt: timestamp("appeal_opened_at"),
  stuck: boolean("stuck").default(false),
  stuckSince: timestamp("stuck_since"),
  submittedToMfrAt: timestamp("submitted_to_mfr_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("claims_number_idx").on(table.claimNumber),
  index("claims_dealership_idx").on(table.dealershipId),
  index("claims_unit_idx").on(table.unitId),
  index("claims_status_idx").on(table.status),
]);

// ==================== 7. CLAIM FRC LINES ====================

export const claimFrcLines = pgTable("claim_frc_lines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: uuid("claim_id").notNull(),
  frcCode: text("frc_code"),
  description: text("description").notNull(),
  laborHours: decimal("labor_hours", { precision: 5, scale: 2 }),
  laborRate: decimal("labor_rate", { precision: 10, scale: 2 }),
  partsAmount: decimal("parts_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  status: text("status", { enum: FRC_LINE_STATUSES }).default("pending"),
  denialReason: text("denial_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("frc_lines_claim_idx").on(table.claimId),
]);

// ==================== 8. PHOTO BATCHES ====================

export const photoBatches = pgTable("photo_batches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: text("batch_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  unitId: uuid("unit_id").notNull(),
  claimType: text("claim_type", { enum: CLAIM_TYPES }).notNull(),
  claimId: uuid("claim_id"),
  dealerNotes: text("dealer_notes"),
  photoCount: integer("photo_count").default(0),
  status: text("status", { enum: BATCH_STATUSES }).default("uploaded"),
  uploadedBy: uuid("uploaded_by").notNull(),
  processedBy: uuid("processed_by"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("batches_dealership_idx").on(table.dealershipId),
  index("batches_status_idx").on(table.status),
]);

// ==================== 9. PHOTOS ====================

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: uuid("batch_id"),
  unitId: uuid("unit_id").notNull(),
  category: text("category", { enum: PHOTO_CATEGORIES }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  filename: text("filename"),
  sizeBytes: integer("size_bytes"),
  mimeType: text("mime_type"),
  uploadedBy: uuid("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("photos_batch_idx").on(table.batchId),
  index("photos_unit_idx").on(table.unitId),
]);

// ==================== 10. DOCUMENTS ====================

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: uuid("unit_id"),
  dealershipId: uuid("dealership_id"),
  type: text("type", { enum: DOCUMENT_TYPES }).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  sizeBytes: integer("size_bytes"),
  mimeType: text("mime_type"),
  uploadedBy: uuid("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 11. INVOICES ====================

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  claimId: uuid("claim_id"),
  status: text("status", { enum: INVOICE_STATUSES }).default("draft"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("CAD"),
  paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }),
  paymentTerms: text("payment_terms").default("net_15"),
  notes: text("notes"),
  recurring: text("recurring", { enum: RECURRING_TYPES }).default("one_time"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  issuedAt: timestamp("issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("invoices_dealership_idx").on(table.dealershipId),
  index("invoices_status_idx").on(table.status),
]);

// ==================== 12. INVOICE LINE ITEMS ====================

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").notNull(),
  productId: uuid("product_id"),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ==================== 13. PRODUCTS & SERVICES ====================

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category", { enum: PRODUCT_CATEGORIES }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  pricingType: text("pricing_type", { enum: PRICING_TYPES }).default("fixed"),
  billingFrequency: text("billing_frequency", { enum: BILLING_FREQUENCIES }).default("one_time"),
  taxRate: text("tax_rate").default("hst_13"),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 14. FINANCING REQUESTS ====================

export const financingRequests = pgTable("financing_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: text("request_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  unitId: uuid("unit_id"),
  customerName: text("customer_name").notNull(),
  creditScore: integer("credit_score"),
  amountRequested: decimal("amount_requested", { precision: 10, scale: 2 }),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  preferredTerm: integer("preferred_term"),
  dealerNotes: text("dealer_notes"),
  status: text("status", { enum: FINANCING_STATUSES }).default("submitted"),
  bestRate: decimal("best_rate", { precision: 5, scale: 2 }),
  bestLender: text("best_lender"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== 15. F&I DEALS ====================

export const fiDeals = pgTable("fi_deals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealNumber: text("deal_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  unitId: uuid("unit_id"),
  customerName: text("customer_name").notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  financing: text("financing"),
  productsOffered: integer("products_offered").default(0),
  productsSold: integer("products_sold").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  dealerNotes: text("dealer_notes"),
  status: text("status", { enum: FI_DEAL_STATUSES }).default("flagged"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== 16. WARRANTY PLANS ====================

export const warrantyPlans = pgTable("warranty_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planNumber: text("plan_number").notNull().unique(),
  unitId: uuid("unit_id").notNull(),
  dealershipId: uuid("dealership_id").notNull(),
  provider: text("provider").notNull(),
  coverage: text("coverage"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  soldByPlatform: boolean("sold_by_platform").default(false),
  status: text("status", { enum: WARRANTY_PLAN_STATUSES }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 17. PARTS ORDERS ====================

export const partsOrders = pgTable("parts_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  claimId: uuid("claim_id"),
  items: text("items").notNull(),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  status: text("status", { enum: PARTS_ORDER_STATUSES }).default("requested"),
  eta: date("eta"),
  priority: text("priority", { enum: PARTS_PRIORITIES }).default("normal"),
  operatorNotes: text("operator_notes"),
  dealerNotes: text("dealer_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== 18. TICKETS ====================

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id"),
  claimId: uuid("claim_id"),
  partsOrderId: uuid("parts_order_id"),
  category: text("category", { enum: TICKET_CATEGORIES }).notNull(),
  subject: text("subject").notNull(),
  status: text("status", { enum: TICKET_STATUSES }).default("open"),
  autoCreated: boolean("auto_created").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("tickets_dealership_idx").on(table.dealershipId),
  index("tickets_status_idx").on(table.status),
]);

// ==================== 19. TICKET MESSAGES ====================

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: uuid("ticket_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  isAutoMessage: boolean("is_auto_message").default(false),
  attachmentUrls: jsonb("attachment_urls").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 20. QUICK CHAT MESSAGES ====================

export const quickChatMessages = pgTable("quick_chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 21. NOTIFICATIONS ====================

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  type: text("type", { enum: NOTIFICATION_TYPES }).notNull(),
  title: text("title").notNull(),
  message: text("message"),
  linkTo: text("link_to"),
  isRead: boolean("is_read").default(false),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_idx").on(table.userId),
  index("notifications_read_idx").on(table.isRead),
]);

// ==================== 22. PLATFORM SETTINGS ====================

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== 23. FEATURE REQUESTS ====================

export const featureRequests = pgTable("feature_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  requestedBy: text("requested_by"),
  dealershipId: uuid("dealership_id"),
  priority: text("priority", { enum: FEATURE_PRIORITIES }).default("medium"),
  status: text("status", { enum: FEATURE_STATUSES }).default("under_review"),
  targetVersion: text("target_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== 24. AUDIT LOG ====================

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_user_idx").on(table.userId),
  index("audit_entity_idx").on(table.entityType, table.entityId),
]);

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ one, many }) => ({
  dealership: one(dealerships, { fields: [users.dealershipId], references: [dealerships.id] }),
  sessions: many(sessions),
  notifications: many(notifications),
}));

export const dealershipsRelations = relations(dealerships, ({ many }) => ({
  users: many(users),
  units: many(units),
  claims: many(claims),
  invoices: many(invoices),
  tickets: many(tickets),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  dealership: one(dealerships, { fields: [units.dealershipId], references: [dealerships.id] }),
  customer: one(users, { fields: [units.customerId], references: [users.id] }),
  claims: many(claims),
  photos: many(photos),
  documents: many(documents),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  dealership: one(dealerships, { fields: [claims.dealershipId], references: [dealerships.id] }),
  unit: one(units, { fields: [claims.unitId], references: [units.id] }),
  frcLines: many(claimFrcLines),
  photoBatches: many(photoBatches),
}));

export const claimFrcLinesRelations = relations(claimFrcLines, ({ one }) => ({
  claim: one(claims, { fields: [claimFrcLines.claimId], references: [claims.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  dealership: one(dealerships, { fields: [invoices.dealershipId], references: [dealerships.id] }),
  claim: one(claims, { fields: [invoices.claimId], references: [claims.id] }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
  product: one(products, { fields: [invoiceLineItems.productId], references: [products.id] }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  dealership: one(dealerships, { fields: [tickets.dealershipId], references: [dealerships.id] }),
  customer: one(users, { fields: [tickets.customerId], references: [users.id] }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
  sender: one(users, { fields: [ticketMessages.senderId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ==================== ZOD SCHEMAS & TYPES ====================

// Auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  portalType: z.enum(["operator", "dealer", "client", "bidder"]).optional(),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDealershipSchema = createInsertSchema(dealerships).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaimSchema = createInsertSchema(claims).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaimFrcLineSchema = createInsertSchema(claimFrcLines).omit({ id: true, createdAt: true });
export const insertPhotoBatchSchema = createInsertSchema(photoBatches).omit({ id: true, createdAt: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertFinancingRequestSchema = createInsertSchema(financingRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFiDealSchema = createInsertSchema(fiDeals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWarrantyPlanSchema = createInsertSchema(warrantyPlans).omit({ id: true, createdAt: true });
export const insertPartsOrderSchema = createInsertSchema(partsOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertFeatureRequestSchema = createInsertSchema(featureRequests).omit({ id: true, createdAt: true });
export const insertInvitationSchema = createInsertSchema(invitations).omit({ id: true, createdAt: true });

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dealership = typeof dealerships.$inferSelect;
export type InsertDealership = z.infer<typeof insertDealershipSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type ClaimFrcLine = typeof claimFrcLines.$inferSelect;
export type InsertClaimFrcLine = z.infer<typeof insertClaimFrcLineSchema>;
export type PhotoBatch = typeof photoBatches.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type FinancingRequest = typeof financingRequests.$inferSelect;
export type FiDeal = typeof fiDeals.$inferSelect;
export type WarrantyPlan = typeof warrantyPlans.$inferSelect;
export type PartsOrder = typeof partsOrders.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type FeatureRequest = typeof featureRequests.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;

// Backward compat with existing codebase
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipName: text("dealership_name").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const networkWaitlist = pgTable("network_waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  dealershipName: text("dealership_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNetworkWaitlistSchema = createInsertSchema(networkWaitlist).omit({ id: true, createdAt: true });
export type InsertNetworkWaitlist = z.infer<typeof insertNetworkWaitlistSchema>;
export type NetworkWaitlist = typeof networkWaitlist.$inferSelect;

// ==================== BOOKINGS (public demo/discovery call booking) ====================

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dealershipName: text("dealership_name").notNull(),
  province: text("province").notNull(),
  serviceInterest: text("service_interest").array().notNull().default(sql`'{}'`),
  scheduledDate: text("scheduled_date").notNull(), // "YYYY-MM-DD"
  scheduledTime: text("scheduled_time").notNull(), // "09:00"
  notes: text("notes"),
  language: text("language").default("en"),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ==================== 25. BLOG POSTS ====================

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  metaKeywords: varchar('meta_keywords', { length: 500 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags').array(),
  targetKeyword: varchar('target_keyword', { length: 200 }),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),
  generatedBy: varchar('generated_by', { length: 50 }).default('anthropic'),
  promptTemplate: varchar('prompt_template', { length: 100 }),
  generationModel: varchar('generation_model', { length: 50 }).default('claude-sonnet-4-20250514'),
  wordCount: integer('word_count'),
  readTimeMinutes: integer('read_time_minutes'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== 26. BLOG CATEGORIES ====================

export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
});

// ==================== 27. CONTENT QUEUE ====================

export const contentQueue = pgTable('content_queue', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  targetKeyword: varchar('target_keyword', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  promptTemplate: varchar('prompt_template', { length: 100 }).notNull(),
  customContext: text('custom_context'),
  scheduledGeneration: timestamp('scheduled_generation').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('queued'),
  generatedPostId: integer('generated_post_id').references(() => blogPosts.id),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({ id: true });
export const insertContentQueueSchema = createInsertSchema(contentQueue).omit({ id: true, createdAt: true, updatedAt: true });

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type ContentQueueItem = typeof contentQueue.$inferSelect;

// ==================== 28. DEALER LISTINGS ====================

export const dealerListings = pgTable('dealer_listings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  website: varchar('website', { length: 500 }),
  address: varchar('address', { length: 500 }),
  city: varchar('city', { length: 100 }),
  stateProvince: varchar('state_province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 2 }).notNull().default('CA'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  description: text('description'),
  brandsCarried: text('brands_carried').array(),
  servicesOffered: text('services_offered').array(),
  dealerType: varchar('dealer_type', { length: 50 }).default('rv'),
  numberOfLocations: integer('number_of_locations').default(1),
  estimatedUnitVolume: varchar('estimated_unit_volume', { length: 50 }),
  yearEstablished: integer('year_established'),
  businessHours: jsonb('business_hours'),
  logoUrl: varchar('logo_url', { length: 500 }),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  galleryImages: text('gallery_images').array(),
  listingStatus: varchar('listing_status', { length: 20 }).notNull().default('active'),
  isVerified: boolean('is_verified').notNull().default(false),
  isClaimed: boolean('is_claimed').notNull().default(false),
  claimedAt: timestamp('claimed_at'),
  claimedByUserId: integer('claimed_by_user_id'),
  listingTier: varchar('listing_tier', { length: 20 }).notNull().default('basic'),
  premiumExpiresAt: timestamp('premium_expires_at'),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  pageViews: integer('page_views').notNull().default(0),
  searchAppearances: integer('search_appearances').notNull().default(0),
  contactClicks: integer('contact_clicks').notNull().default(0),
  websiteClicks: integer('website_clicks').notNull().default(0),
  dataSource: varchar('data_source', { length: 100 }),
  externalId: varchar('external_id', { length: 255 }),
  dataQuality: varchar('data_quality', { length: 20 }).default('imported'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_dealer_listings_country').on(table.country),
  index('idx_dealer_listings_province').on(table.stateProvince),
  index('idx_dealer_listings_city').on(table.city),
  index('idx_dealer_listings_slug').on(table.slug),
  index('idx_dealer_listings_claimed').on(table.isClaimed),
  index('idx_dealer_listings_status').on(table.listingStatus),
]);

// ==================== 29. CRM PIPELINE ====================

export const crmPipeline = pgTable('crm_pipeline', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  stage: varchar('stage', { length: 30 }).notNull().default('prospect'),
  assignedTo: varchar('assigned_to', { length: 255 }),
  nextFollowUp: timestamp('next_follow_up'),
  followUpNote: text('follow_up_note'),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  lostReason: varchar('lost_reason', { length: 255 }),
  leadSource: varchar('lead_source', { length: 50 }).default('imported'),
  stageChangedAt: timestamp('stage_changed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== 30. CRM ACTIVITIES ====================

export const crmActivities = pgTable('crm_activities', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  activityType: varchar('activity_type', { length: 30 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: varchar('created_by', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== 31. CRM TAGS ====================

export const crmTags = pgTable('crm_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#4f8cff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const crmDealerTags = pgTable('crm_dealer_tags', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  tagId: integer('tag_id').references(() => crmTags.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== 32. CRM ATTACHMENTS ====================

export const crmAttachments = pgTable('crm_attachments', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  fileSizeBytes: integer('file_size_bytes'),
  uploadedBy: varchar('uploaded_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== 33. DEALER REVIEWS ====================

export const dealerReviews = pgTable('dealer_reviews', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  reviewerName: varchar('reviewer_name', { length: 100 }).notNull(),
  reviewerEmail: varchar('reviewer_email', { length: 255 }),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 200 }),
  body: text('body'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  dealerResponse: text('dealer_response'),
  dealerRespondedAt: timestamp('dealer_responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== 34. DEALER MESSAGES ====================

export const dealerMessages = pgTable('dealer_messages', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  senderName: varchar('sender_name', { length: 100 }).notNull(),
  senderEmail: varchar('sender_email', { length: 255 }).notNull(),
  senderPhone: varchar('sender_phone', { length: 30 }),
  messageType: varchar('message_type', { length: 20 }).notNull().default('general'),
  subject: varchar('subject', { length: 255 }),
  body: text('body').notNull(),
  interestedBrand: varchar('interested_brand', { length: 100 }),
  interestedModel: varchar('interested_model', { length: 200 }),
  status: varchar('status', { length: 20 }).notNull().default('unread'),
  dealerReply: text('dealer_reply'),
  dealerRepliedAt: timestamp('dealer_replied_at'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== 35. QUOTE REQUESTS ====================

export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  dealerListingId: integer('dealer_listing_id').references(() => dealerListings.id).notNull(),
  dealerMessageId: integer('dealer_message_id').references(() => dealerMessages.id),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 30 }),
  requestType: varchar('request_type', { length: 30 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 200 }),
  yearRange: varchar('year_range', { length: 20 }),
  budgetRange: varchar('budget_range', { length: 50 }),
  additionalNotes: text('additional_notes'),
  preferredContactMethod: varchar('preferred_contact_method', { length: 20 }).default('email'),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DealerListing = typeof dealerListings.$inferSelect;
export type CrmPipelineEntry = typeof crmPipeline.$inferSelect;
export type CrmActivity = typeof crmActivities.$inferSelect;
export type CrmTag = typeof crmTags.$inferSelect;
export type DealerReview = typeof dealerReviews.$inferSelect;
export type DealerMessage = typeof dealerMessages.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;

// Re-export UserRole for client-side consumers that import from @shared/schema
export type { UserRole } from "./constants";

// PublicUser — safe user shape returned by auth endpoints (no passwordHash)
export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: import("./constants").UserRole;
  dealershipId: string | null;
  timezone: string | null;
  language: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
};

// ==================== PHASE 1A NEW TABLES ====================

// ---- EVENT BUS (3 tables) ----

export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  domain: text("domain").notNull(),
  triggerPage: text("trigger_page"),
  actorUserId: uuid("actor_user_id"),
  actorRole: text("actor_role"),
  dealershipId: uuid("dealership_id"),
  targetEntityType: text("target_entity_type"),
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
  eventId: uuid("event_id").notNull(),
  recipientUserId: uuid("recipient_user_id").notNull(),
  channel: text("channel", { enum: DELIVERY_CHANNELS }).notNull(),
  status: text("status", { enum: DELIVERY_STATUSES }).default("pending"),
  surface: text("surface"),
  title: text("title"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaRoute: text("cta_route"),
  externalId: text("external_id"),
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
  preferences: jsonb("preferences").$type<Record<string, {
    in_app?: boolean; email?: boolean; sms?: boolean;
  }>>().default({}),
  smsPhone: text("sms_phone"),
  smsVerified: boolean("sms_verified").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---- TECHFLOW (4 tables) ----

export const technicians = pgTable("technicians", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
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
  claimId: uuid("claim_id"),
  unitId: uuid("unit_id").notNull(),
  customerId: uuid("customer_id"),
  assignedTechId: uuid("assigned_tech_id"),
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
  syncedToClaimId: uuid("synced_to_claim_id"),
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
  customerId: uuid("customer_id").notNull(),
  unitId: uuid("unit_id").notNull(),
  workOrderId: uuid("work_order_id"),
  status: text("status", { enum: SERVICE_APPT_STATUSES }).default("requested"),
  preferredDates: jsonb("preferred_dates").$type<string[]>().default([]),
  confirmedDate: timestamp("confirmed_date"),
  issueDescription: text("issue_description"),
  locationAddress: text("location_address"),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  clientRating: integer("client_rating"),
  clientReview: text("client_review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("svc_appt_dealership_idx").on(table.dealershipId),
  index("svc_appt_customer_idx").on(table.customerId),
  index("svc_appt_unit_idx").on(table.unitId),
  index("svc_appt_status_idx").on(table.status),
]);

// ---- CONSIGNMENT (2 tables) ----

export const consignors = pgTable("consignors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  addressStreet: text("address_street"),
  addressCity: text("address_city"),
  addressProvince: text("address_province"),
  addressPostalCode: text("address_postal_code"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectStatus: text("stripe_connect_status"),
  taxIdType: text("tax_id_type"),
  taxIdLast4: text("tax_id_last4"),
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
  splitPct: decimal("split_pct", { precision: 5, scale: 2 }).notNull(),
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

// ---- CLIENT PARTS STORE (1 table) ----

export const clientPartsOrders = pgTable("client_parts_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull(),
  customerId: uuid("customer_id").notNull(),
  unitId: uuid("unit_id"),
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

// ---- FULL FINANCING (5 tables) ----

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
  apiKeyRef: text("api_key_ref"),
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
  healthStatus: text("health_status"),
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
  customerId: uuid("customer_id").notNull(),
  unitId: uuid("unit_id"),
  submittedByUserId: uuid("submitted_by_user_id"),
  amountRequested: decimal("amount_requested", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  preferredTermMonths: integer("preferred_term_months"),
  creditInfo: jsonb("credit_info").$type<Record<string, unknown>>().default({}),
  status: text("status").default("draft"),
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

// ---- FULL MARKETING SUITE (5 tables) ----

export const campaignTemplates = pgTable("campaign_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  subject: text("subject"),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").default(true),
  publishedByUserId: uuid("published_by_user_id"),
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
  type: text("type").notNull(),
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
  campaignId: uuid("campaign_id"),
  transactionalId: uuid("transactional_id"),
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
  dealershipId: uuid("dealership_id").notNull(),
  sourcePage: text("source_page"),
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

// Phase 1A type exports
export type EventBusEvent = typeof events.$inferSelect;
export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type Technician = typeof technicians.$inferSelect;
export type WorkOrder = typeof workOrders.$inferSelect;
export type WorkOrderLabor = typeof workOrderLabor.$inferSelect;
export type ServiceAppointment = typeof serviceAppointments.$inferSelect;
export type Consignor = typeof consignors.$inferSelect;
export type ConsignmentAgreement = typeof consignmentAgreements.$inferSelect;
export type ClientPartsOrder = typeof clientPartsOrders.$inferSelect;
export type Lender = typeof lenders.$inferSelect;
export type LenderIntegration = typeof lenderIntegrations.$inferSelect;
export type FinancingApplication = typeof financingApplications.$inferSelect;
export type LenderSubmission = typeof lenderSubmissions.$inferSelect;
export type LoanDeal = typeof loanDeals.$inferSelect;
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type LandingPage = typeof landingPages.$inferSelect;
