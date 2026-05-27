// server/routes/ai.ts — AI-powered feature endpoints

import { Router, type Request, type Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "../middleware/auth";
import { requireOperator, scopeToDealership } from "../middleware/rbac";
import { scanDocument, autoFileDocument, scanUnitTag } from "../lib/ai-document-scanner";
import { suggestFrcCodes, suggestFrcFromPhoto } from "../lib/ai-frc-suggestions";
import {
  createFiPresenterSession,
  getPresenterResponse,
  getSession,
  acceptProduct,
  completeSession,
  listActiveSessions,
} from "../lib/ai-fi-presenter";
import { db } from "../db";
import {
  aiClaimFeedback,
  aiSupportConfig,
  aiSupportFaqs,
  aiChatConversations,
  aiChatMessages,
  units,
  claims,
  tickets,
  dealerships,
  unitKnowledgeLinks,
  knowledgeBaseEntries,
} from "@shared/schema";
import { eq, and, gte, desc, count, sql as drizzleSql } from "drizzle-orm";

const router = Router();

// ==================== DOCUMENT SCANNER ====================

// POST /api/ai/scan-document — upload a document for AI analysis
router.post("/scan-document", requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, filename } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ success: false, message: "fileBase64 and mimeType required" });
    }

    const extracted = await scanDocument(fileBase64, mimeType, filename);
    if (!extracted) {
      return res.status(503).json({ success: false, message: "AI scanner unavailable" });
    }

    // Auto-file if VIN detected and dealership context exists
    let filing = null;
    if (extracted.vin && req.user!.dealershipId) {
      filing = await autoFileDocument(
        extracted,
        req.body.documentUrl || "",
        filename || "Scanned document",
        req.user!.id,
        req.user!.dealershipId
      );
    }

    res.json({ success: true, extracted, filing });
  } catch (error) {
    console.error("Scan document error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/scan-unit-tag — scan a physical RV tag from photo
router.post("/scan-unit-tag", requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ success: false, message: "imageBase64 and mimeType required" });
    }

    const tagData = await scanUnitTag(imageBase64, mimeType);
    if (!tagData) {
      return res.status(503).json({ success: false, message: "AI tag scanner unavailable" });
    }

    res.json({ success: true, tagData });
  } catch (error) {
    console.error("Scan unit tag error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== FRC CODE SUGGESTIONS ====================

// POST /api/ai/suggest-frc — suggest FRC codes from text description
router.post("/suggest-frc", requireAuth, async (req: Request, res: Response) => {
  try {
    const { description, manufacturer, rvType, claimType } = req.body;

    if (!description || !manufacturer) {
      return res.status(400).json({ success: false, message: "description and manufacturer required" });
    }

    const result = await suggestFrcCodes(description, manufacturer, rvType, claimType);
    if (!result) {
      return res.status(503).json({ success: false, message: "AI suggestions unavailable" });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Suggest FRC error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/suggest-frc-photo — suggest FRC codes from damage photo
router.post("/suggest-frc-photo", requireAuth, async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, manufacturer, dealerNotes } = req.body;

    if (!imageBase64 || !mimeType || !manufacturer) {
      return res.status(400).json({ success: false, message: "imageBase64, mimeType, and manufacturer required" });
    }

    const result = await suggestFrcFromPhoto(imageBase64, mimeType, manufacturer, dealerNotes);
    if (!result) {
      return res.status(503).json({ success: false, message: "AI photo analysis unavailable" });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Suggest FRC from photo error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== F&I PRESENTER ====================

// POST /api/ai/fi-session — create a new F&I presenter session
router.post("/fi-session", requireAuth, async (req: Request, res: Response) => {
  try {
    const session = await createFiPresenterSession(req.body);
    if (!session) {
      return res.status(500).json({ success: false, message: "Failed to create session" });
    }

    // TODO: Send session link to customer via email
    console.log(`[AI F&I] Session created: ${session.sessionUrl}`);

    res.status(201).json({ success: true, session });
  } catch (error: any) {
    console.error("Create F&I session error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
});

// GET /api/ai/fi-session/:id — get session details
router.get("/fi-session/:id", async (req: Request, res: Response) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found or expired" });
    }

    // Public endpoint — customer accesses via session link (no auth required)
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        customerName: session.customerName,
        unitInfo: session.unitInfo,
        dealershipInfo: session.dealershipInfo,
        products: session.products,
        status: session.status,
        acceptedProducts: session.acceptedProducts,
      },
    });
  } catch (error) {
    console.error("Get F&I session error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/fi-session/:id/chat — send a message in the F&I conversation
router.post("/fi-session/:id/chat", async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "message required" });
    }

    const result = await getPresenterResponse(req.params.id, message, conversationHistory || []);
    if (!result) {
      return res.status(503).json({ success: false, message: "AI presenter unavailable" });
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("F&I chat error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/fi-session/:id/accept — customer accepts a product
router.post("/fi-session/:id/accept", async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId required" });

    const success = acceptProduct(req.params.id, productId);
    if (!success) return res.status(404).json({ success: false, message: "Session not found" });

    res.json({ success: true, message: "Product accepted" });
  } catch (error) {
    console.error("Accept product error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/fi-session/:id/complete — end the session and sync results
router.post("/fi-session/:id/complete", async (req: Request, res: Response) => {
  try {
    const session = await completeSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    res.json({
      success: true,
      session: {
        status: session.status,
        acceptedProducts: session.acceptedProducts,
        totalProducts: session.products.length,
      },
    });
  } catch (error) {
    console.error("Complete session error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/ai/fi-sessions — list active F&I sessions (operator/dealer)
router.get("/fi-sessions", requireAuth, async (req: Request, res: Response) => {
  try {
    const sessions = listActiveSessions();
    res.json({ success: true, sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      customerName: s.customerName,
      unitInfo: s.unitInfo,
      status: s.status,
      acceptedProducts: s.acceptedProducts.length,
      totalProducts: s.products.length,
      createdAt: s.createdAt,
    }))});
  } catch (error) {
    console.error("List F&I sessions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== AI CLAIM DRAFTING ====================

// POST /api/ai/analyze-claim-photos — analyze photos for CCC (operator only)
router.post("/analyze-claim-photos", requireAuth, requireOperator, async (req: Request, res: Response) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "AI service unavailable — ANTHROPIC_API_KEY not configured",
      fallback: true,
    });
  }

  try {
    const { photos, unitInfo, claimId } = req.body as {
      photos: Array<{ url: string; id?: string; category?: string }>;
      unitInfo?: { vin?: string; year?: string | number; manufacturer?: string; model?: string };
      claimId?: string;
    };

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, message: "photos array required" });
    }

    const MAX_PHOTOS_PER_BATCH = 20;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const SYSTEM_PROMPT = `You are an expert RV warranty claims inspector analyzing photos for warranty claim processing.
TASK: Examine all photos and identify distinct issues/defects. Multiple photos may show the SAME issue from different angles — group those together. For each DISTINCT issue, generate CCC descriptions.
RULES:
- If multiple photos show the same defect from different angles, that is ONE issue.
- If photos show clearly different problems, create separate issue entries.
- Use professional RV warranty claim language.
- Complaint: what is wrong (customer-reported issue with specific location)
- Cause: root cause of the problem
- Correction: repair action required
- Be specific about location (left/right, front/rear, interior/exterior)
RESPOND WITH ONLY a JSON array, no other text:
[{"issueNumber": 1, "photoIndices": [0], "complaint": "...", "cause": "...", "correction": "...", "severity": "minor|moderate|major", "category": "structural|plumbing|electrical|appliance|cosmetic|slide_out|hvac|exterior|interior|safety", "confidence": 0.0}]`;

    // Process in batches of MAX_PHOTOS_PER_BATCH if needed
    let allIssues: any[] = [];
    const photoChunks: typeof photos[] = [];
    for (let i = 0; i < photos.length; i += MAX_PHOTOS_PER_BATCH) {
      photoChunks.push(photos.slice(i, i + MAX_PHOTOS_PER_BATCH));
    }

    for (let chunkIdx = 0; chunkIdx < photoChunks.length; chunkIdx++) {
      const chunk = photoChunks[chunkIdx];
      const photoOffset = chunkIdx * MAX_PHOTOS_PER_BATCH;

      // Build content blocks for this chunk
      const contentBlocks: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

      for (const photo of chunk) {
        if (photo.url.startsWith("data:")) {
          // base64 data URL: data:<mime>;base64,<data>
          const [header, data] = photo.url.split(",");
          const mimeMatch = header.match(/data:([^;]+);base64/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: data,
            },
          });
        } else {
          // URL-based image
          contentBlocks.push({
            type: "image",
            source: {
              type: "url",
              url: photo.url,
            },
          } as any);
        }
      }

      const unitDesc = unitInfo
        ? `${unitInfo.year || ""} ${unitInfo.manufacturer || ""} ${unitInfo.model || ""} VIN: ${unitInfo.vin || "unknown"}`.trim()
        : "unknown unit";

      contentBlocks.push({
        type: "text",
        text: `Analyze these ${chunk.length} photos (indices ${photoOffset} to ${photoOffset + chunk.length - 1}) for warranty claim issues. Unit: ${unitDesc}. Group photos showing the same issue together. Use 0-based photo indices relative to the full photo set (starting at ${photoOffset}).`,
      });

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: contentBlocks }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") continue;

      let jsonStr = textBlock.text.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      let chunkIssues: any[];
      try {
        chunkIssues = JSON.parse(jsonStr);
        if (!Array.isArray(chunkIssues)) chunkIssues = [];
      } catch (_parseErr) {
        console.error("[AI] Failed to parse analyze-claim-photos response:", jsonStr.slice(0, 200));
        chunkIssues = [];
      }

      // Renumber issueNumbers across chunks
      const issueOffset = allIssues.length;
      for (const issue of chunkIssues) {
        allIssues.push({ ...issue, issueNumber: issueOffset + (issue.issueNumber || 1) });
      }
    }

    // Deduplicate: merge issue numbers sequentially
    allIssues = allIssues.map((issue, idx) => ({ ...issue, issueNumber: idx + 1 }));

    return res.json({
      success: true,
      issues: allIssues,
      photosAnalyzed: photos.length,
      issuesFound: allIssues.length,
      claimId: claimId || null,
    });
  } catch (error: any) {
    console.error("[AI] analyze-claim-photos error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "AI analysis failed",
      fallback: true,
    });
  }
});

// POST /api/ai/claim-feedback — log operator decision on AI-suggested CCC (operator only)
router.post("/claim-feedback", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const {
      claimId,
      issueNumber,
      photoIndices,
      aiOriginal,
      operatorFinal,
      action,
      claimLineId,
    } = req.body;

    if (!claimId || !issueNumber || !aiOriginal || !action) {
      return res.status(400).json({
        success: false,
        message: "claimId, issueNumber, aiOriginal, and action are required",
      });
    }

    const [record] = await db
      .insert(aiClaimFeedback)
      .values({
        claimId,
        issueNumber,
        photoIndices: photoIndices || [],
        aiOriginal,
        operatorFinal: operatorFinal || null,
        action,
        operatorId: req.user?.id || null,
        claimLineId: claimLineId || null,
      })
      .returning();

    return res.status(201).json({ success: true, id: record.id, createdAt: record.createdAt });
  } catch (error: any) {
    console.error("[AI] claim-feedback error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== AI CUSTOMER SUPPORT BOT ====================

// GET /api/ai/customer-chat/config — public config for widget render decision
router.get("/customer-chat/config", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.query.dealershipId as string || req.user?.dealershipId;
    if (!dealershipId) {
      return res.json({ isActive: false, greetingMessage: "", dealerName: "" });
    }

    const [config] = await db
      .select()
      .from(aiSupportConfig)
      .where(eq(aiSupportConfig.dealershipId, dealershipId))
      .limit(1);

    const [dealership] = await db
      .select({ name: dealerships.name })
      .from(dealerships)
      .where(eq(dealerships.id, dealershipId))
      .limit(1);

    return res.json({
      isActive: config?.isActive ?? false,
      greetingMessage: config?.greetingMessage ?? "Hi! I can help with questions about your warranty, claims, and service. How can I help?",
      dealerName: dealership?.name ?? "",
    });
  } catch (error) {
    console.error("[AI Support] config error:", error);
    return res.json({ isActive: false, greetingMessage: "", dealerName: "" });
  }
});

// POST /api/ai/customer-chat — send a customer message
router.post("/customer-chat", requireAuth, async (req: Request, res: Response) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    const { message, conversationId, dealershipId } = req.body as {
      message: string;
      conversationId?: string;
      dealershipId: string;
    };

    if (!message || !dealershipId) {
      return res.status(400).json({ success: false, message: "message and dealershipId required" });
    }

    const customerId = req.user!.id;

    // Rate limit: 50 messages/day per customer
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [msgCount] = await db
      .select({ count: count() })
      .from(aiChatMessages)
      .innerJoin(aiChatConversations, eq(aiChatMessages.conversationId, aiChatConversations.id))
      .where(
        and(
          eq(aiChatConversations.customerId, customerId),
          eq(aiChatConversations.dealershipId, dealershipId),
          eq(aiChatMessages.role, "customer"),
          gte(aiChatMessages.createdAt, today)
        )
      );

    if ((msgCount?.count ?? 0) >= 50) {
      return res.status(429).json({
        success: false,
        response: "Daily chat limit reached. Please create a support ticket for further assistance.",
        actions: [{ type: "suggest_ticket" }],
      });
    }

    // Load dealer config and FAQs
    const [config] = await db
      .select()
      .from(aiSupportConfig)
      .where(eq(aiSupportConfig.dealershipId, dealershipId))
      .limit(1);

    const faqs = await db
      .select()
      .from(aiSupportFaqs)
      .where(and(eq(aiSupportFaqs.dealershipId, dealershipId), eq(aiSupportFaqs.isActive, true)))
      .orderBy(aiSupportFaqs.sortOrder);

    // FAQ check first — skip Anthropic call if matched
    const msgLower = message.toLowerCase();
    const faqMatch = faqs.find(
      (f) =>
        msgLower.includes(f.question.toLowerCase()) ||
        f.question.toLowerCase().includes(msgLower) ||
        msgLower.split(" ").filter(w => w.length > 3).some(w => f.question.toLowerCase().includes(w))
    );

    // Load customer context
    const customerUnit = await db
      .select()
      .from(units)
      .where(eq(units.customerId, customerId))
      .limit(1);

    const unit = customerUnit[0] ?? null;

    const recentClaims = unit
      ? await db
          .select()
          .from(claims)
          .where(eq(claims.unitId, unit.id))
          .orderBy(desc(claims.createdAt))
          .limit(3)
      : [];

    const recentTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.customerId, customerId))
      .orderBy(desc(tickets.createdAt))
      .limit(3);

    // Load dealer info
    const [dealership] = await db
      .select({ name: dealerships.name })
      .from(dealerships)
      .where(eq(dealerships.id, dealershipId))
      .limit(1);

    const dealerName = dealership?.name ?? "your dealer";

    // Load KB content linked to this unit
    let kbContent = "";
    if (unit) {
      const kbLinks = await db
        .select({ entry: knowledgeBaseEntries })
        .from(unitKnowledgeLinks)
        .innerJoin(knowledgeBaseEntries, eq(unitKnowledgeLinks.entryId, knowledgeBaseEntries.id))
        .where(and(eq(unitKnowledgeLinks.unitId, unit.id), eq(knowledgeBaseEntries.isPublished, true)))
        .limit(5);

      kbContent = kbLinks
        .map((l) => `${l.entry.title}: ${l.entry.description ?? ""}`)
        .filter(Boolean)
        .join("\n");
    }

    // If FAQ match found, return it without calling Anthropic
    if (faqMatch) {
      // Upsert conversation
      let convId = conversationId;
      if (!convId) {
        const [newConv] = await db
          .insert(aiChatConversations)
          .values({ dealershipId, customerId, messageCount: 0, status: "active" })
          .returning();
        convId = newConv.id;
      }

      await db.insert(aiChatMessages).values([
        { conversationId: convId, role: "customer", content: message, actions: null },
        { conversationId: convId, role: "assistant", content: faqMatch.answer, actions: [{ type: "faq_match", faqId: faqMatch.id }] as any },
      ]);

      await db
        .update(aiChatConversations)
        .set({ messageCount: drizzleSql`${aiChatConversations.messageCount} + 2`, lastMessageAt: new Date() })
        .where(eq(aiChatConversations.id, convId));

      return res.json({
        success: true,
        response: faqMatch.answer,
        conversationId: convId,
        actions: [{ type: "faq_match" }],
      });
    }

    // If no API key, return friendly error
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({
        success: false,
        response: "I am having trouble connecting right now. Would you like to create a support ticket instead?",
        actions: [{ type: "suggest_ticket" }],
      });
    }

    // Build system prompt with customer data
    const warrantyStatus = unit
      ? unit.warrantyEnd
        ? new Date(unit.warrantyEnd) > new Date()
          ? "Active"
          : "Expired"
        : "No warranty on file"
      : "No unit on file";

    const warrantyExpiry = unit?.warrantyEnd
      ? new Date(unit.warrantyEnd).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
      : "Unknown";

    const claimsSummary = recentClaims.length
      ? recentClaims.map((c) => `${c.type.toUpperCase()} #${c.claimNumber} — ${c.status}`).join(", ")
      : "No recent claims";

    const ticketsSummary = recentTickets.length
      ? recentTickets.map((t) => `Ticket #${t.ticketNumber} (${t.category}) — ${t.status}`).join(", ")
      : "No recent tickets";

    const unitDesc = unit
      ? `${unit.year ?? ""} ${unit.manufacturer ?? ""} ${unit.model ?? ""}`.trim()
      : "No unit on file";

    const customerName = req.user
      ? `${req.user.firstName ?? ''} ${req.user.lastName ?? ''}`.trim() || req.user.email
      : "Customer";

    const systemPrompt = `You are a helpful customer support assistant for ${dealerName}. You have access to this customer's real account data:

CUSTOMER: ${customerName}
UNIT: ${unitDesc} (VIN: ${unit?.vin ?? "N/A"})
WARRANTY STATUS: ${warrantyStatus} - expires ${warrantyExpiry}
ACTIVE CLAIMS: ${claimsSummary}
RECENT TICKETS: ${ticketsSummary}
KNOWLEDGE BASE: ${kbContent || "No KB articles linked to this unit."}

RULES:
- Answer questions about THIS customer's specific data when asked
- For general RV questions, draw from the knowledge base content provided
- Never fabricate warranty coverage, claim statuses, or dates — use only the data above
- Never share other customers' data
- Never make financial commitments or approve/deny claims
- If asked about something outside your data (like specific repair costs), say you do not have that information
- For complex issues that need human help, offer to create a support ticket
- Keep responses concise (2-4 sentences max unless listing items)
- Be friendly and helpful
- You represent ${dealerName} support — never mention DS360 or the technology behind you`;

    // Load conversation history
    let historyMessages: { role: "user" | "assistant"; content: string }[] = [];
    if (conversationId) {
      const prevMessages = await db
        .select()
        .from(aiChatMessages)
        .where(eq(aiChatMessages.conversationId, conversationId))
        .orderBy(desc(aiChatMessages.createdAt))
        .limit(10);

      historyMessages = prevMessages
        .reverse()
        .map((m) => ({
          role: m.role === "customer" ? "user" : ("assistant" as "user" | "assistant"),
          content: m.content,
        }));
    }

    // Call Anthropic
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        ...historyMessages,
        { role: "user", content: message },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const assistantReply = textBlock?.type === "text" ? textBlock.text : "I am having trouble right now. Please try again or create a support ticket.";

    // Detect ticket suggestion
    const suggestTicket = assistantReply.toLowerCase().includes("support ticket") || assistantReply.toLowerCase().includes("ticket");
    const actions = suggestTicket ? [{ type: "suggest_ticket" }] : null;

    // Upsert conversation and save messages
    let convId = conversationId;
    if (!convId) {
      const [newConv] = await db
        .insert(aiChatConversations)
        .values({ dealershipId, customerId, messageCount: 0, status: "active" })
        .returning();
      convId = newConv.id;
    }

    await db.insert(aiChatMessages).values([
      { conversationId: convId, role: "customer", content: message, actions: null },
      { conversationId: convId, role: "assistant", content: assistantReply, actions: actions as any },
    ]);

    await db
      .update(aiChatConversations)
      .set({ messageCount: drizzleSql`${aiChatConversations.messageCount} + 2`, lastMessageAt: new Date() })
      .where(eq(aiChatConversations.id, convId));

    return res.json({ success: true, response: assistantReply, conversationId: convId, actions });
  } catch (error: any) {
    console.error("[AI Support] customer-chat error:", error);
    return res.status(503).json({
      success: false,
      response: "I am having trouble connecting right now. Would you like to create a support ticket instead?",
      actions: [{ type: "suggest_ticket" }],
    });
  }
});

// GET /api/ai/customer-chat/history — last 30 days of conversations for current customer
router.get("/customer-chat/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.query.dealershipId as string || req.user?.dealershipId;
    const customerId = req.user!.id;
    if (!dealershipId) return res.json({ success: true, messages: [] });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const convs = await db
      .select()
      .from(aiChatConversations)
      .where(
        and(
          eq(aiChatConversations.customerId, customerId),
          eq(aiChatConversations.dealershipId, dealershipId),
          gte(aiChatConversations.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(aiChatConversations.createdAt))
      .limit(1);

    if (!convs.length) return res.json({ success: true, messages: [], conversationId: null });

    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, convs[0].id))
      .orderBy(aiChatMessages.createdAt);

    return res.json({ success: true, messages, conversationId: convs[0].id });
  } catch (error) {
    console.error("[AI Support] history error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/ai/customer-chat/stats — conversation stats
router.get("/customer-chat/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const { role, dealershipId } = req.user!;
    const isOperator = role === "operator_admin";

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);

    const baseWhere = isOperator ? undefined : eq(aiChatConversations.dealershipId, dealershipId!);

    const [todayCount] = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(baseWhere ? and(baseWhere, gte(aiChatConversations.createdAt, today)) : gte(aiChatConversations.createdAt, today));

    const [weekCount] = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(baseWhere ? and(baseWhere, gte(aiChatConversations.createdAt, weekAgo)) : gte(aiChatConversations.createdAt, weekAgo));

    const [monthCount] = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(baseWhere ? and(baseWhere, gte(aiChatConversations.createdAt, monthAgo)) : gte(aiChatConversations.createdAt, monthAgo));

    const [escalated] = await db
      .select({ count: count() })
      .from(aiChatConversations)
      .where(
        baseWhere
          ? and(baseWhere, eq(aiChatConversations.status, "escalated"))
          : eq(aiChatConversations.status, "escalated")
      );

    return res.json({
      success: true,
      stats: {
        conversationsToday: todayCount?.count ?? 0,
        conversationsThisWeek: weekCount?.count ?? 0,
        conversationsThisMonth: monthCount?.count ?? 0,
        escalations: escalated?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("[AI Support] stats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/customer-chat/:conversationId/escalate — mark escalated, create ticket
router.post("/customer-chat/:conversationId/escalate", requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    await db
      .update(aiChatConversations)
      .set({ status: "escalated" })
      .where(eq(aiChatConversations.id, conversationId));

    return res.json({ success: true, message: "Conversation escalated" });
  } catch (error) {
    console.error("[AI Support] escalate error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── Dealer config management endpoints ──

// GET /api/ai/customer-chat/dealer-config — get dealer config + FAQs
router.get("/customer-chat/dealer-config", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user?.dealershipId;
    if (!dealershipId) return res.status(400).json({ success: false, message: "dealershipId required" });

    const [config] = await db
      .select()
      .from(aiSupportConfig)
      .where(eq(aiSupportConfig.dealershipId, dealershipId))
      .limit(1);

    const faqs = await db
      .select()
      .from(aiSupportFaqs)
      .where(eq(aiSupportFaqs.dealershipId, dealershipId))
      .orderBy(aiSupportFaqs.sortOrder);

    return res.json({ success: true, config: config ?? null, faqs });
  } catch (error) {
    console.error("[AI Support] dealer-config GET error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/ai/customer-chat/dealer-config — upsert dealer config
router.put("/customer-chat/dealer-config", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user?.dealershipId;
    if (!dealershipId) return res.status(400).json({ success: false, message: "dealershipId required" });

    const { isActive, greetingMessage } = req.body as { isActive: boolean; greetingMessage: string };

    const existing = await db
      .select({ id: aiSupportConfig.id })
      .from(aiSupportConfig)
      .where(eq(aiSupportConfig.dealershipId, dealershipId))
      .limit(1);

    if (existing.length) {
      await db
        .update(aiSupportConfig)
        .set({ isActive, greetingMessage, updatedAt: new Date() })
        .where(eq(aiSupportConfig.dealershipId, dealershipId));
    } else {
      await db.insert(aiSupportConfig).values({ dealershipId, isActive, greetingMessage });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[AI Support] dealer-config PUT error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/ai/customer-chat/faqs — add an FAQ
router.post("/customer-chat/faqs", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user?.dealershipId;
    if (!dealershipId) return res.status(400).json({ success: false, message: "dealershipId required" });

    const { question, answer, sortOrder } = req.body as { question: string; answer: string; sortOrder?: number };
    if (!question || !answer) return res.status(400).json({ success: false, message: "question and answer required" });

    const [faq] = await db
      .insert(aiSupportFaqs)
      .values({ dealershipId, question, answer, sortOrder: sortOrder ?? 0, isActive: true })
      .returning();

    return res.status(201).json({ success: true, faq });
  } catch (error) {
    console.error("[AI Support] faqs POST error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/ai/customer-chat/faqs/:faqId — update an FAQ
router.put("/customer-chat/faqs/:faqId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { faqId } = req.params;
    const { question, answer, sortOrder, isActive } = req.body;

    await db
      .update(aiSupportFaqs)
      .set({ question, answer, sortOrder, isActive })
      .where(eq(aiSupportFaqs.id, faqId));

    return res.json({ success: true });
  } catch (error) {
    console.error("[AI Support] faq PUT error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/ai/customer-chat/faqs/:faqId — delete an FAQ
router.delete("/customer-chat/faqs/:faqId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { faqId } = req.params;
    await db.delete(aiSupportFaqs).where(eq(aiSupportFaqs.id, faqId));
    return res.json({ success: true });
  } catch (error) {
    console.error("[AI Support] faq DELETE error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/ai/customer-chat/conversations — dealer conversation log
router.get("/customer-chat/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const dealershipId = req.user?.dealershipId;
    if (!dealershipId) return res.status(400).json({ success: false, message: "dealershipId required" });

    const { filter } = req.query as { filter?: string };

    let dateFilter: Date | undefined;
    if (filter === "today") { dateFilter = new Date(); dateFilter.setHours(0, 0, 0, 0); }
    else if (filter === "week") { dateFilter = new Date(); dateFilter.setDate(dateFilter.getDate() - 7); }

    const convs = await db
      .select()
      .from(aiChatConversations)
      .where(
        dateFilter
          ? and(eq(aiChatConversations.dealershipId, dealershipId), gte(aiChatConversations.createdAt, dateFilter))
          : eq(aiChatConversations.dealershipId, dealershipId)
      )
      .orderBy(desc(aiChatConversations.lastMessageAt))
      .limit(100);

    return res.json({ success: true, conversations: convs });
  } catch (error) {
    console.error("[AI Support] conversations error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/ai/customer-chat/conversations/:conversationId/messages
router.get("/customer-chat/conversations/:conversationId/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const messages = await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, conversationId))
      .orderBy(aiChatMessages.createdAt);

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("[AI Support] conv messages error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
