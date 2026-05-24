// shared/schema-remote-support.ts — Remote Support / Screen Share database schema

import { pgTable, text, varchar, timestamp, boolean, uuid, jsonb, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ==================== REMOTE SESSIONS ====================

export const remoteSessions = pgTable("remote_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  accessCode: varchar("access_code", { length: 7 }).notNull().unique(),
  dealerId: uuid("dealer_id").notNull(),
  dealerUserId: varchar("dealer_user_id", { length: 255 }).notNull(),
  operatorUserId: varchar("operator_user_id", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending"),
  takeoverGranted: boolean("takeover_granted").default(false),
  takeoverGrantedAt: timestamp("takeover_granted_at"),
  takeoverRevokedAt: timestamp("takeover_revoked_at"),
  livekitRoomName: varchar("livekit_room_name", { length: 255 }),
  recordingEnabled: boolean("recording_enabled").default(false),
  recordingUrl: varchar("recording_url", { length: 500 }),
  codeExpiresAt: timestamp("code_expires_at").notNull(),
  connectedAt: timestamp("connected_at"),
  endedAt: timestamp("ended_at"),
  endedBy: varchar("ended_by", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("remote_sessions_code_idx").on(table.accessCode),
  index("remote_sessions_dealer_idx").on(table.dealerId),
  index("remote_sessions_status_idx").on(table.status),
]);

// ==================== REMOTE SESSION EVENTS ====================

export const remoteSessionEvents = pgTable("remote_session_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  actor: varchar("actor", { length: 20 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("remote_events_session_idx").on(table.sessionId),
]);

// ==================== DOCUMENT TRANSFERS ====================

export const documentTransfers = pgTable("document_transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: uuid("dealer_id").notNull(),
  senderType: varchar("sender_type", { length: 20 }).notNull(), // 'dealer' | 'operator'
  senderUserId: varchar("sender_user_id", { length: 255 }).notNull(),
  senderName: varchar("sender_name", { length: 255 }),
  recipientType: varchar("recipient_type", { length: 20 }).notNull(), // 'dealer' | 'operator'
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("sent"),
  downloadedAt: timestamp("downloaded_at"),
  expiresAt: timestamp("expires_at").default(sql`NOW() + INTERVAL '30 days'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("doc_transfers_dealer_idx").on(table.dealerId),
  index("doc_transfers_sender_idx").on(table.senderUserId),
]);

// ==================== TYPE EXPORTS ====================

export type RemoteSession = typeof remoteSessions.$inferSelect;
export type RemoteSessionEvent = typeof remoteSessionEvents.$inferSelect;
export type DocumentTransfer = typeof documentTransfers.$inferSelect;
