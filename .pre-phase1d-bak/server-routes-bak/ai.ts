// server/routes/ai.ts — AI-powered feature endpoints

import { Router, type Request, type Response } from "express";
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

export default router;
