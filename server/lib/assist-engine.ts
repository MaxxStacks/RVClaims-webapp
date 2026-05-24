// server/lib/assist-engine.ts — DS360 Assist AI response engine (Anthropic Claude)

import Anthropic from "@anthropic-ai/sdk";
import type { AssistContextData } from "./assist-context";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ==================== SYSTEM PROMPT ====================

function buildSystemPrompt(kbContext: string, ctx: Partial<AssistContextData> = {}): string {
  const isStaff = ctx.userRole === "dealer_staff";

  const roleBlock = isStaff
    ? `## Role Restrictions
This user is a Dealer Staff member. Do NOT discuss:
- Billing, invoices, or pricing
- Subscription management
- Staff management or permissions
- Account manager contact information
If they ask about these topics, say: "That information is available to your dealership owner. Please check with them or I can help you with something else."`
    : `## Role Restrictions
This user is a Dealer Owner with full access to all platform features including billing and administration.`;

  const unitBlock = ctx.unitContext
    ? `- Viewing Unit: ${ctx.unitContext.vin} — ${ctx.unitContext.year ?? ""} ${ctx.unitContext.make ?? ""} ${ctx.unitContext.model ?? ""}
- Unit Claims: ${ctx.unitContext.totalClaims} total (${ctx.unitContext.openClaims} open)`
    : "";

  const claimBlock = ctx.claimContext
    ? `- Viewing Claim: ${ctx.claimContext.claimNumber} — Status: ${ctx.claimContext.status}
- Claim Type: ${ctx.claimContext.claimType}
- FRC Lines: ${ctx.claimContext.frcLineCount}`
    : "";

  const contextLines = [
    `- Dealer: ${ctx.dealerName ?? "Your Dealership"} (ID: ${ctx.dealerId ?? ""})`,
    `- User: ${ctx.userName ?? "Dealer User"} (Role: ${ctx.userRole ?? "dealer_owner"})`,
    `- Current Page: ${ctx.currentPage ?? "Dashboard"}`,
    `- Active Modules: ${(ctx.activeModules ?? ["claims"]).join(", ")}`,
    `- Subscription Tier: ${ctx.subscriptionTier ?? "Standard"}`,
    unitBlock,
    claimBlock,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are DS360 Assist, the official support agent for DealerSuite360 — a SaaS platform for North American RV dealerships. You help dealers navigate the platform efficiently.

## Your Identity
- Name: DS360 Assist (or just "Assist")
- Tone: Professional, helpful, knowledgeable. Like a senior DS360 support rep who knows every feature and workflow. Canadian-friendly tone.
- You NEVER make up information. If you don't know, say "Let me connect you with your account manager for that."
- You NEVER discuss other dealers' data or information.
- You NEVER provide financial, legal, or tax advice.

## Current Context
${contextLines}

${roleBlock}

## Knowledge Base Context
${kbContext || "No specific knowledge base articles found for this query. Answer from general DS360 platform knowledge."}

## Available Actions
When a dealer asks to DO something (not just learn about it), offer to walk them through it step-by-step. Available guided workflows:
- Create a new unit
- Create a new client
- File a claim
- Add a staff member

## Escalation
When the dealer explicitly asks for a human, says they need help you cannot provide, expresses frustration, or you have genuinely exhausted your knowledge on their issue — end your response with EXACTLY this marker on its own line BEFORE the quick replies:
[ESCALATE]

Only add [ESCALATE] when:
- The dealer says "speak to someone", "talk to a human", "I need support", "get me help"
- You cannot find the answer after trying and have said so
- The issue involves billing disputes, account suspensions, or legal/compliance matters
- Technical issues requiring direct hands-on operator access to the platform

Do NOT add [ESCALATE] for questions you can confidently answer.

## Quick Replies
After EVERY response, on the very last line (after [ESCALATE] if present), include 1-3 suggested follow-up questions or actions. Format exactly as:
[QUICK_REPLIES: "Reply 1" | "Reply 2" | "Reply 3"]
Keep each reply under 40 characters. Make them specific to what was just discussed.`;
}

// ==================== TYPES ====================

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistResponse {
  response: string;
  quickReplies: string[];
  escalate: boolean;
}

// ==================== RESPONSE PARSER ====================

function parseResponse(text: string): { response: string; quickReplies: string[]; escalate: boolean } {
  let working = text.trim();

  // Detect and strip [ESCALATE] marker
  const escalate = /\[ESCALATE\]/.test(working);
  working = working.replace(/\s*\[ESCALATE\]\s*/g, " ").trim();

  // Parse [QUICK_REPLIES: ...] at end
  const re = /\[QUICK_REPLIES:\s*([\s\S]*?)\]\s*$/;
  const match = working.match(re);
  let quickReplies: string[] = [];
  if (match) {
    const raw = match[1];
    quickReplies = raw
      .split("|")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter((s) => s.length > 0)
      .slice(0, 3);
    working = working.slice(0, match.index).trim();
  }

  return { response: working, quickReplies, escalate };
}

// ==================== HEDGING DETECTION ====================

const HEDGING_PHRASES = [
  "i'm not sure",
  "i don't have information",
  "i don't have specific information",
  "you may want to check with",
  "i'd recommend contacting",
  "i cannot find",
  "i'm unable to find",
  "i don't have details",
  "i'm not familiar with",
  "that's outside my knowledge",
];

export function containsHedging(text: string): boolean {
  const lower = text.toLowerCase();
  return HEDGING_PHRASES.some((phrase) => lower.includes(phrase));
}

// ==================== MAIN EXPORT ====================

export async function getAssistResponse(
  userMessage: string,
  history: ConversationMessage[],
  kbContext: string,
  ctx: Partial<AssistContextData> = {}
): Promise<AssistResponse> {
  const systemPrompt = buildSystemPrompt(kbContext, ctx);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const apiResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages,
    });

    const block = apiResponse.content[0];
    const rawText =
      block.type === "text"
        ? block.text
        : "I encountered an issue generating a response. Please try again.";

    return parseResponse(rawText);
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error?.status === 429) {
      return {
        response: "I'm receiving too many requests right now. Please wait a moment and try again.",
        quickReplies: [],
        escalate: false,
      };
    }
    if (error?.status === 529 || error?.message?.includes("overloaded")) {
      return {
        response: "DS360 Assist is temporarily busy. Please try again in a few moments.",
        quickReplies: [],
        escalate: false,
      };
    }
    console.error("[assist-engine] Anthropic API error:", error);
    return {
      response:
        "I'm having trouble connecting right now. Please try again or contact DS360 Support directly.",
      quickReplies: [],
      escalate: false,
    };
  }
}

// ==================== CONVERSATION SUMMARY ====================

export async function generateConversationSummary(
  messages: ConversationMessage[]
): Promise<string> {
  if (messages.length === 0) return "";

  const transcript = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-16)
    .map((m) => `${m.role === "user" ? "Dealer" : "Assistant"}: ${m.content.slice(0, 300)}`)
    .join("\n\n");

  if (!transcript.trim()) return "";

  try {
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: "Summarize this support conversation in 2-3 sentences. Focus on the dealer's main issue and what was discussed. Be concise and factual.",
      messages: [{ role: "user", content: transcript }],
    });
    const block = res.content[0];
    return block.type === "text" ? block.text.trim() : "";
  } catch {
    return "";
  }
}
