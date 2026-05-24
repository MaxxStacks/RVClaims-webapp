// shared/schema-assist.ts — DS360 Assist AI Agent database schema
// Requires pgvector extension: CREATE EXTENSION IF NOT EXISTS vector

import { pgTable, text, varchar, timestamp, boolean, integer, uuid, jsonb, index, customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== PGVECTOR CUSTOM TYPE ====================

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(val: number[]): string {
    return JSON.stringify(val);
  },
  fromDriver(val: unknown): number[] {
    if (typeof val === "string") return JSON.parse(val);
    return val as number[];
  },
});

// ==================== KB ARTICLES ====================

export const kbArticles = pgTable("kb_articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  tags: text("tags").array(),
  rolesVisible: text("roles_visible").array().default(["dealer_owner", "dealer_staff"]),
  status: varchar("status", { length: 20 }).default("published"),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("kb_articles_category_idx").on(table.category),
  index("kb_articles_status_idx").on(table.status),
  index("kb_articles_slug_idx").on(table.slug),
]);

// ==================== ASSIST CONVERSATIONS ====================

export const assistConversations = pgTable("assist_conversations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: uuid("dealer_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userRole: varchar("user_role", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  escalationType: varchar("escalation_type", { length: 50 }),
  escalatedTo: varchar("escalated_to", { length: 255 }),
  satisfactionRating: integer("satisfaction_rating"),
  thumbsUpCount: integer("thumbs_up_count").default(0),
  thumbsDownCount: integer("thumbs_down_count").default(0),
  messageCount: integer("message_count").default(0),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("assist_conv_dealer_idx").on(table.dealerId),
  index("assist_conv_user_idx").on(table.userId),
  index("assist_conv_status_idx").on(table.status),
]);

// ==================== ASSIST MESSAGES ====================

export const assistMessages = pgTable("assist_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  feedback: varchar("feedback", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("assist_msg_conv_idx").on(table.conversationId),
]);

// ==================== SUPPORT TICKETS ====================

export const assistSupportTickets = pgTable("assist_support_tickets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull().unique(),
  dealerId: uuid("dealer_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  conversationId: uuid("conversation_id"),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("open"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("assist_ticket_dealer_idx").on(table.dealerId),
  index("assist_ticket_status_idx").on(table.status),
  index("assist_ticket_number_idx").on(table.ticketNumber),
]);

// ==================== KNOWLEDGE GAPS ====================

export const assistKnowledgeGaps = pgTable("assist_knowledge_gaps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: uuid("conversation_id"),
  messageId: uuid("message_id"),
  question: text("question").notNull(),
  frequency: integer("frequency").default(1),
  status: varchar("status", { length: 20 }).default("new"),
  kbArticleId: uuid("kb_article_id"),
  reviewedBy: varchar("reviewed_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("assist_gaps_status_idx").on(table.status),
]);

// ==================== DEALER ACCOUNT MANAGERS ====================

export const dealerAccountManagers = pgTable("dealer_account_managers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: uuid("dealer_id").notNull().unique(),
  operatorUserId: varchar("operator_user_id", { length: 255 }).notNull(),
  operatorName: varchar("operator_name", { length: 255 }).notNull(),
  operatorEmail: varchar("operator_email", { length: 255 }).notNull(),
  operatorPhone: varchar("operator_phone", { length: 50 }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => [
  index("acct_mgr_dealer_idx").on(table.dealerId),
]);

// ==================== ZOD SCHEMAS ====================

export const insertKbArticleSchema = createInsertSchema(kbArticles, {
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
  category: z.enum(["workflow", "faq", "terminology", "troubleshooting", "manufacturer"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
}).omit({ id: true, embedding: true, createdAt: true, updatedAt: true });

export const updateKbArticleSchema = insertKbArticleSchema.partial();

export type KbArticle = typeof kbArticles.$inferSelect;
export type InsertKbArticle = typeof kbArticles.$inferInsert;
export type AssistConversation = typeof assistConversations.$inferSelect;
export type AssistMessage = typeof assistMessages.$inferSelect;
export type AssistSupportTicket = typeof assistSupportTickets.$inferSelect;
