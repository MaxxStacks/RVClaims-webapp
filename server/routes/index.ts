// server/routes/index.ts — Register all API route modules

import express, { type Express } from "express";
import { createServer, type Server } from "http";
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
import directoryRoutes from './directory';
import crmRoutes from './crm';
import claimsV6Router from './claims-v6';
import frcCodesV6Router from './frc-codes-v6';
import notificationsV6Router from './notifications-v6';
import usersV6Router from './users-v6';
import uploadsV6Router from './uploads-v6';
import partsV6Router from './parts-v6';
import unitsV6Router from './units-v6';
import dealershipsV6Router from './dealerships-v6';
import importRouter from './import';
import searchRouter from './search';
import assistKbRouter from './assist/kb';
import assistMessageRouter from './assist/message';
import assistConversationsRouter from './assist/conversations';
import assistFeedbackRouter from './assist/feedback';
import assistEscalateRouter from './assist/escalate';
import assistAnalyticsRouter from './assist/analytics';
import assistProactiveRouter from './assist/proactive';
import remoteSessionsRouter from './remote/sessions';
import transfersRouter from './remote/transfers';
import reportsRouter from './reports';
import fiRouter from './fi';
import financingRouter from './financing';
import customersRouter from './customers';
import workOrdersRouter from './work-orders';
import serviceAppointmentsRouter from './service-appointments';
import marketingRouter from './marketing';
import consignmentRouter from './consignment';
import modulesRouter from './modules';
import walletsRouter from './wallets';
import signaturesRouter from './signatures';
import pdiRouter from './pdi';
import dealJacketsRouter from './dealJackets';
import knowledgeBaseRouter from './knowledgeBase';
import paymentPlansRouter, { partnersRouter as financingPartnersRouter } from './paymentPlans';
import upsellRouter from './upsell';
import remindersRouter from './reminders';
import loyaltyRouter from './loyalty';
import reviewsRouter from './reviews';
import analyticsRouter from './analytics';
import complianceRouter from './compliance';
import locationsRouter from './locations';
import suppliersRouter from './suppliers';
import superadminRouter, { operatorsMeRouter } from './superadmin';

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
  app.use('/api/dealers', directoryRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/v6/claims', claimsV6Router);
  app.use('/api/v6/frc-codes', frcCodesV6Router);
  app.use('/api/frc-codes', frcCodesV6Router);
  app.use('/api/v6/notifications', notificationsV6Router);
  app.use('/api/v6/users', usersV6Router);
  app.use('/api/v6/uploads', uploadsV6Router);
  app.use('/api/v6/parts-orders', partsV6Router);
  app.use('/api/v6/units', unitsV6Router);
  app.use('/api/v6/dealerships', dealershipsV6Router);
  app.use('/api/import', importRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/assist/kb/articles', assistKbRouter);
  app.use('/api/assist/message', assistMessageRouter);
  app.use('/api/assist/conversations', assistConversationsRouter);
  app.use('/api/assist/conversations', assistFeedbackRouter);
  app.use('/api/assist/escalate', assistEscalateRouter);
  app.use('/api/assist/analytics', assistAnalyticsRouter);
  app.use('/api/assist/proactive', assistProactiveRouter);
  app.use('/api/remote', remoteSessionsRouter);
  app.use('/api/transfers', transfersRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/fi', fiRouter);           // /api/fi/products, /api/fi/deals/:id/status, /api/fi/reports/commission
  app.use('/api/financing', financingRouter); // /api/financing/lenders, /api/financing/applications, /api/financing/reports
  app.use('/api/customers', customersRouter); // /api/customers — customer (client-role) management
  app.use('/api/work-orders', workOrdersRouter);
  app.use('/api/service-appointments', serviceAppointmentsRouter);
  app.use('/api/marketing', marketingRouter);
  app.use('/api/consignment', consignmentRouter);
  app.use('/api', modulesRouter);    // /api/modules, /api/dealerships/:id/subscriptions
  app.use('/api', walletsRouter);    // /api/wallets, /api/wallets/my, /api/wallets/funding-tiers
  app.use('/api', signaturesRouter); // /api/signatures
  app.use('/api', pdiRouter);        // /api/pdi, /api/pdi/templates, /api/units/:unitId/pdi
  app.use('/api', dealJacketsRouter); // /api/deal-jackets, /api/deal-jackets/:id, etc.
  app.use('/api', knowledgeBaseRouter); // /api/knowledge-base, /api/units/:unitId/knowledge
  app.use('/api/payment-plans', paymentPlansRouter);       // /api/payment-plans
  app.use('/api/financing-partners', financingPartnersRouter); // /api/financing-partners
  app.use('/api/upsell', upsellRouter);                    // /api/upsell/*
  app.use('/api/reminders', remindersRouter);              // /api/reminders, /api/reminders/*/send, /api/customer-preferences
  app.use('/api/loyalty', loyaltyRouter);                  // /api/loyalty/program, /api/loyalty/rewards, /api/loyalty/points, /api/loyalty/stats
  app.use('/api/reviews', reviewsRouter);                  // /api/reviews, /api/reviews/stats, /api/reviews/config, /api/reviews/:id, /api/reviews/:id/approve, /api/reviews/:id/flag, /api/reviews/:id/respond
  app.use('/api/analytics', analyticsRouter);              // /api/analytics/operator, /api/analytics/dealer, /api/analytics/export, /api/analytics/schedule
  app.use('/api/compliance', complianceRouter);            // /api/compliance/check, /api/compliance/status, /api/compliance/exceptions, /api/compliance/report, /api/compliance/templates, /api/compliance/aggregate
  app.use('/api/dealerships/:id/locations', locationsRouter); // /api/dealerships/:id/locations + settings/multi-location
  app.use('/api/dealerships/:id/settings', locationsRouter);  // /api/dealerships/:id/settings/multi-location
  app.use('/api/suppliers', suppliersRouter);  // /api/suppliers, /api/suppliers/me, /api/suppliers/catalog, /api/suppliers/orders
  app.use('/api/supplier-catalog', suppliersRouter);   // alias for catalog browsing
  app.use('/api/supplier-orders', suppliersRouter);    // alias for order placement
  app.use('/api/superadmin', superadminRouter);        // /api/superadmin/* — ds360_superadmin only
  app.use('/api/operators', operatorsMeRouter);        // /api/operators/me — operator branding

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
