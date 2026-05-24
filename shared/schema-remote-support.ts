// shared/schema-remote-support.ts — Remote Support / Screen Share database schema

import { pgTable, text, varchar, timestamp, boolean, uuid, jsonb, index } from "drizzle-orm/pg-core";
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

// ==================== TYPE EXPORTS ====================

export type RemoteSession = typeof remoteSessions.$inferSelect;
export type RemoteSessionEvent = typeof remoteSessionEvents.$inferSelect;
