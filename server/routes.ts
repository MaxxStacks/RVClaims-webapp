import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNetworkWaitlistSchema } from "@shared/schema";
import { z } from "zod";
import { sendWaitlistNotification, sendContactFormNotification } from "./email";
import { findBestResponse } from "./chatbot-responses";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      // Send email notification to hello@rvclaims.ca
      await sendContactFormNotification({
        dealershipName: validatedData.dealershipName,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        language: validatedData.language || 'en',
      });
      
      res.status(201).json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all contacts (admin endpoint)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch contacts" 
      });
    }
  });

  // Network waitlist submission
  app.post("/api/network-waitlist", async (req, res) => {
    try {
      const validatedData = insertNetworkWaitlistSchema.parse(req.body);
      const waitlist = await storage.createNetworkWaitlist(validatedData);
      
      // Send email notification to dealer@rvclaims.ca
      await sendWaitlistNotification({
        email: validatedData.email,
        dealershipName: validatedData.dealershipName,
      });
      
      res.status(201).json({ success: true, waitlist });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get network waitlist (admin endpoint)
  app.get("/api/network-waitlist", async (req, res) => {
    try {
      const waitlist = await storage.getNetworkWaitlist();
      res.json({ success: true, waitlist });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch waitlist" 
      });
    }
  });

  // Chat endpoint - uses pattern matching from site knowledge base only
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language = 'en' } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Message is required" 
        });
      }

      // Find best response from knowledge base
      const response = findBestResponse(message, language as 'en' | 'fr');

      // Return simple JSON response
      res.json({
        success: true,
        response
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process chat message" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
