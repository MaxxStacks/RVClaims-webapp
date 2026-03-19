// server/lib/ai-fi-presenter.ts — AI F&I Video Presenter
// Creates live AI-powered video sessions for remote F&I product presentations
// Architecture: Avatar platform (Tavus/D-ID) provides the face + voice
//              Anthropic Claude provides the brain (knows the customer, unit, financing)
//              Platform manages the session lifecycle

import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { units, users, dealerships, fiDeals } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const DID_API_KEY = process.env.DID_API_KEY;

let anthropic: Anthropic | null = null;
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

// ==================== SESSION MANAGEMENT ====================

export interface FiPresenterSession {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  unitInfo: {
    vin: string;
    year: number;
    manufacturer: string;
    model: string;
    salePrice?: string;
  };
  dealershipInfo: {
    name: string;
    primaryColor: string;
    logoUrl?: string;
  };
  financingDetails?: {
    lender: string;
    term: number;
    rate: string;
    monthlyPayment?: string;
  };
  products: FiProduct[];
  sessionUrl: string;        // link sent to customer
  status: "created" | "active" | "completed" | "expired";
  acceptedProducts: string[]; // product IDs the customer accepted
  createdAt: Date;
  expiresAt: Date;
}

export interface FiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  monthlyAddon?: string;     // added to monthly payment
  category: "gap" | "extended_warranty" | "paint_protection" | "fabric_protection" | "roadside" | "tire_wheel" | "key_replacement" | "other";
  features: string[];
  objectionHandlers: Record<string, string>;  // common objection → response
}

// In-memory session store (move to Redis in production)
const activeSessions = new Map<string, FiPresenterSession>();

// ==================== CREATE SESSION ====================

export async function createFiPresenterSession(data: {
  unitId: string;
  dealershipId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  financingDetails?: FiPresenterSession["financingDetails"];
  products: FiProduct[];
}): Promise<FiPresenterSession | null> {
  try {
    // Gather unit info
    const [unit] = await db.select().from(units).where(eq(units.id, data.unitId)).limit(1);
    if (!unit) throw new Error("Unit not found");

    // Gather dealership info
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, data.dealershipId)).limit(1);
    if (!dealership) throw new Error("Dealership not found");

    const sessionId = randomBytes(16).toString("hex");
    const platformUrl = process.env.PLATFORM_URL || "https://rvclaims.ca";

    const session: FiPresenterSession = {
      sessionId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      unitInfo: {
        vin: unit.vin,
        year: unit.year || 0,
        manufacturer: unit.manufacturer || "",
        model: unit.model || "",
      },
      dealershipInfo: {
        name: dealership.name,
        primaryColor: dealership.primaryColor || "#08235d",
        logoUrl: dealership.logoUrl || undefined,
      },
      financingDetails: data.financingDetails,
      products: data.products,
      sessionUrl: `${platformUrl}/fi-session/${sessionId}`,
      status: "created",
      acceptedProducts: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 day expiry
    };

    activeSessions.set(sessionId, session);

    return session;
  } catch (error) {
    console.error("[AI F&I] Create session failed:", error);
    return null;
  }
}

// ==================== AI CONVERSATION BRAIN ====================

function buildFiSystemPrompt(session: FiPresenterSession): string {
  const { customerName, unitInfo, dealershipInfo, financingDetails, products } = session;

  let prompt = `You are a professional, friendly F&I (Finance & Insurance) product advisor for ${dealershipInfo.name}.

You are speaking with ${customerName} who just purchased a ${unitInfo.year} ${unitInfo.manufacturer} ${unitInfo.model} (VIN: ${unitInfo.vin}).

`;

  if (financingDetails) {
    prompt += `Their financing: ${financingDetails.lender}, ${financingDetails.term} months at ${financingDetails.rate}%`;
    if (financingDetails.monthlyPayment) prompt += `, $${financingDetails.monthlyPayment}/month`;
    prompt += `.\n\n`;
  }

  prompt += `PRODUCTS TO PRESENT (in order of priority):\n`;
  for (const product of products) {
    prompt += `\n${product.name} — $${product.price}`;
    if (product.monthlyAddon) prompt += ` ($${product.monthlyAddon}/mo added to payment)`;
    prompt += `\n  ${product.description}\n  Features: ${product.features.join(", ")}\n`;
  }

  prompt += `
PRESENTATION RULES:
1. Be warm, conversational, and professional — not pushy
2. Present one product at a time, starting with the highest value
3. Explain WHY this product matters for their specific RV (not generic pitches)
4. Use their name naturally in conversation
5. When they object, acknowledge the concern first, then address it
6. If they decline, respect it and move to the next product
7. Never pressure or use scare tactics
8. Mention that the products can be added to their monthly payment for convenience
9. At the end, summarize what they accepted
10. Keep responses concise — this is a conversation, not a lecture

WHEN CUSTOMER ACCEPTS: Confirm their choice and mention it will be added to their file.
WHEN CUSTOMER DECLINES: Say "I completely understand" and move on gracefully.

Respond naturally as if speaking face-to-face. Keep responses under 3 sentences unless explaining a product.`;

  return prompt;
}

export async function getPresenterResponse(
  sessionId: string,
  customerMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ response: string; action?: "accept" | "decline" | "question"; productId?: string } | null> {
  if (!anthropic) return null;

  const session = activeSessions.get(sessionId);
  if (!session) return null;

  try {
    const messages = [
      ...conversationHistory,
      { role: "user" as const, content: customerMessage },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: buildFiSystemPrompt(session),
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const text = textBlock.text;

    // Detect acceptance/decline intent
    const lowerMsg = customerMessage.toLowerCase();
    let action: "accept" | "decline" | "question" | undefined;

    if (lowerMsg.includes("yes") || lowerMsg.includes("sure") || lowerMsg.includes("i'll take") || lowerMsg.includes("sounds good") || lowerMsg.includes("add it")) {
      action = "accept";
    } else if (lowerMsg.includes("no") || lowerMsg.includes("pass") || lowerMsg.includes("skip") || lowerMsg.includes("not interested") || lowerMsg.includes("don't need")) {
      action = "decline";
    } else {
      action = "question";
    }

    return { response: text, action };
  } catch (error) {
    console.error("[AI F&I] Conversation error:", error);
    return null;
  }
}

// ==================== SESSION LIFECYCLE ====================

export function getSession(sessionId: string): FiPresenterSession | null {
  return activeSessions.get(sessionId) || null;
}

export function acceptProduct(sessionId: string, productId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  if (!session.acceptedProducts.includes(productId)) {
    session.acceptedProducts.push(productId);
  }
  return true;
}

export async function completeSession(sessionId: string): Promise<FiPresenterSession | null> {
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  session.status = "completed";

  // Sync accepted products to platform — create F&I deal record
  if (session.acceptedProducts.length > 0) {
    try {
      // Look up dealership from unit
      const [unit] = await db.select().from(units).where(eq(units.vin, session.unitInfo.vin)).limit(1);
      if (unit) {
        const dealNumber = `FI-AI-${randomBytes(4).toString("hex").toUpperCase()}`;
        await db.insert(fiDeals).values({
          dealNumber,
          dealershipId: unit.dealershipId,
          unitId: unit.id,
          customerName: session.customerName,
          productsOffered: session.products.length,
          productsSold: session.acceptedProducts.length,
          dealerNotes: `AI F&I Session. Accepted: ${session.acceptedProducts.join(", ")}`,
          status: "completed",
        });
      }
    } catch (error) {
      console.error("[AI F&I] Failed to sync accepted products:", error);
    }
  }

  return session;
}

export function listActiveSessions(dealershipId?: string): FiPresenterSession[] {
  const sessions: FiPresenterSession[] = [];
  activeSessions.forEach((session) => {
    if (session.status !== "expired") {
      sessions.push(session);
    }
  });
  return sessions;
}

// Cleanup expired sessions every hour
setInterval(() => {
  const now = new Date();
  activeSessions.forEach((session, id) => {
    if (now > session.expiresAt) {
      session.status = "expired";
      activeSessions.delete(id);
    }
  });
}, 60 * 60 * 1000);
