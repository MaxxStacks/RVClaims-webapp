// server/routes/index.ts — Register all API route modules

import express, { type Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./auth";
import userRoutes from "./users";
import dealershipRoutes from "./dealerships";
import unitRoutes from "./units";
import claimRoutes from "./claims";
import productRoutes from "./products";
import batchRoutes from "./batches";
import serviceRoutes from "./services";
import documentRoutes from "./documents";
import invoiceRoutes from "./invoices";
import ticketRoutes from "./tickets";
import platformRoutes from "./platform";
import paymentRoutes from "./payments";
import quickChatRoutes from "./quick-chat";
import aiRoutes from "./ai";
import marketplaceRoutes from './marketplace';
import auctionRoutes from './auctions';
import membershipRoutes from './membership';
import publicAuctionRoutes from './public-auctions';
import blogRoutes from './blog';

// Import existing routes for backward compat
import { storage } from "../storage";
import { insertContactSchema, insertNetworkWaitlistSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { sendWaitlistNotification, sendContactFormNotification, sendBookingNotification } from "../email";
import { findBestResponse } from "../chatbot-responses";

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== HEALTH CHECK ====================
  app.get("/api/health", async (_req, res) => {
    const checks: Record<string, string> = {};
    checks.server = "ok";
    checks.database_url = process.env.DATABASE_URL ? "set" : "MISSING";
    checks.jwt_secret = process.env.JWT_SECRET ? "set" : "using_fallback";

    if (process.env.DATABASE_URL) {
      try {
        const { db } = await import("../db");
        await (db as any).execute("SELECT 1");
        checks.database_connection = "ok";
      } catch (e: any) {
        checks.database_connection = `error: ${e.message}`;
      }
    } else {
      checks.database_connection = "skipped (no DATABASE_URL)";
    }

    const allOk = checks.database_url === "set" && checks.database_connection === "ok";
    res.status(allOk ? 200 : 503).json({ status: allOk ? "ok" : "degraded", checks });
  });

  // ==================== STRIPE WEBHOOK (raw body — must be before express.json parses it) ====================
  app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

  // ==================== v2.1 API ROUTES ====================
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/dealerships", dealershipRoutes);
  app.use("/api/units", unitRoutes);
  app.use("/api/claims", claimRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/batches", batchRoutes);
  app.use("/api", serviceRoutes);          // /api/financing, /api/fi-deals, /api/warranty-plans, /api/parts-orders
  app.use("/api/documents", documentRoutes);
  app.use("/api/invoices", invoiceRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api", platformRoutes);          // /api/settings, /api/feature-requests, /api/notifications
  app.use("/api/payments", paymentRoutes);
  app.use("/api/quick-chat", quickChatRoutes);
  app.use("/api/ai", aiRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/membership', membershipRoutes);
  app.use('/api/public-auctions', publicAuctionRoutes);
  app.use('/api/blog', blogRoutes);

  // ==================== EXISTING ROUTES (backward compat) ====================

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      await sendContactFormNotification({
        dealershipName: validatedData.dealershipName,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        language: validatedData.language || "en",
      });
      res.status(201).json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch contacts" });
    }
  });

  // Network waitlist
  app.post("/api/network-waitlist", async (req, res) => {
    try {
      const validatedData = insertNetworkWaitlistSchema.parse(req.body);
      const waitlist = await storage.createNetworkWaitlist(validatedData);
      await sendWaitlistNotification({
        email: validatedData.email,
        dealershipName: validatedData.dealershipName,
      });
      res.status(201).json({ success: true, waitlist });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/network-waitlist", async (req, res) => {
    try {
      const waitlist = await storage.getNetworkWaitlist();
      res.json({ success: true, waitlist });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch waitlist" });
    }
  });

  // Discovery call booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      await sendBookingNotification({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone ?? undefined,
        dealershipName: validatedData.dealershipName,
        province: validatedData.province,
        serviceInterest: validatedData.serviceInterest ?? [],
        scheduledDate: validatedData.scheduledDate,
        scheduledTime: validatedData.scheduledTime,
        notes: validatedData.notes ?? undefined,
        language: validatedData.language ?? 'en',
      });
      res.status(201).json({ success: true, booking });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language = "en" } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ success: false, message: "Message is required" });
      }
      const response = findBestResponse(message, language as "en" | "fr");
      res.json({ success: true, response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ success: false, message: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
