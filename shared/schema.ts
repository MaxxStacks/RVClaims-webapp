import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const networkWaitlist = pgTable("network_waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  dealershipName: text("dealership_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNetworkWaitlistSchema = createInsertSchema(networkWaitlist).omit({
  id: true,
  createdAt: true,
});

export type InsertNetworkWaitlist = z.infer<typeof insertNetworkWaitlistSchema>;
export type NetworkWaitlist = typeof networkWaitlist.$inferSelect;
