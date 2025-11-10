import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertNetworkWaitlistSchema } from "@shared/schema";
import { z } from "zod";
import { sendWaitlistNotification, sendContactFormNotification } from "./email";
import OpenAI from "openai";
import { CHATBOT_SYSTEM_PROMPT } from "./chatbot-knowledge";

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

  // Chat endpoint with streaming
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, language = 'en', conversationHistory = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Message is required" 
        });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Build conversation messages
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: CHATBOT_SYSTEM_PROMPT + `\n\nIMPORTANT: Respond in ${language === 'fr' ? 'French' : 'English'}.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      // Create streaming completion
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      console.error('Chat error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : "Failed to process chat message" 
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
        res.end();
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
