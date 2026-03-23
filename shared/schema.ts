// shared/schema.ts — DealerSuite360 / RVClaims.ca Database Schema
// 22 tables · Drizzle ORM · Neon PostgreSQL

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, uuid, jsonb, date, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== ROLE & STATUS ENUMS ====================

export const USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "customer", "bidder"] as const;
export const INVITE_ROLES = ["dealer_owner", "dealer_staff", "customer"] as const;
export const DEALERSHIP_PLANS = ["plan_a", "plan_b", "custom"] as const;
export const DEALERSHIP_STATUSES = ["active", "suspended", "pending"] as const;
export const RV_TYPES = ["travel_trailer", "fifth_wheel", "class_a", "class_c", "toy_hauler", "pop_up", "van_camper", "truck_camper"] as const;
export const UNIT_STATUSES = ["on_lot", "delivered", "in_service", "sold"] as const;
export const CLAIM_TYPES = ["daf", "pdi", "warranty", "extended_warranty", "insurance"] as const;
export const CLAIM_STATUSES = ["draft", "submitted", "processing", "authorized", "denied", "parts_ordered", "repair", "completed", "payment_requested", "paid", "closed"] as const;
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
export const TICKET_STATUSES = ["open", "waiting_dealer", "waiting_customer", "action_needed", "resolved", "closed"] as const;
export const NOTIFICATION_TYPES = ["claim_update", "invoice", "payment", "financing", "parts", "fi", "ticket", "system", "announcement"] as const;
export const FEATURE_PRIORITIES = ["low", "medium", "high"] as const;
export const FEATURE_STATUSES = ["backlog", "under_review", "planned", "in_progress", "completed"] as const;

// ==================== 1. USERS ====================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: USER_ROLES }).notNull(),
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
  portalType: z.enum(["operator", "dealer", "customer", "bidder"]).optional(),
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
