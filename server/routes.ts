import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNetworkWaitlistSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
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

  const httpServer = createServer(app);
  return httpServer;
}
