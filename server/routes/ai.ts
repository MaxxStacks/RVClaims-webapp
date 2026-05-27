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
import { aiClaimFeedback } from "@shared/schema";

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

export default router;
