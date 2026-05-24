// server/lib/assist-engine.ts — DS360 Assist AI response engine (Anthropic Claude)

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `You are DS360 Assist, the official support agent for DealerSuite360 — a SaaS platform for North American RV dealerships. You help dealers navigate the platform efficiently.

## Your Identity
- Name: DS360 Assist (or just "Assist")
- Tone: Professional, helpful, knowledgeable. Like a senior support rep.
- You NEVER make up information. If you don't know, offer to escalate.
- You NEVER discuss other dealers' data or information.
- You NEVER provide financial, legal, or tax advice.

## Current Context
- Dealer: {{dealer_name}} (ID: {{dealer_id}})
- User: {{user_name}} (Role: {{user_role}})
- Current Page: {{current_page}}
- Active Modules: {{active_modules}}
- Subscription Tier: {{subscription_tier}}

## Role Restrictions
{{role_restrictions}}

## Knowledge Base Context
{{kb_context}}

## Available Actions
When a dealer asks to DO something (not just learn about it), offer to walk them through it step-by-step. Available guided workflows:
- Create a new unit
- Create a new client
- File a claim
- Add a staff member

## Escalation
If you cannot answer a question or the dealer explicitly asks for human help, present the escalation options: Open a Ticket, Live Chat, Email Account Manager, Share Screen, or Contact Support directly.`;

export interface AssistContext {
  dealerName?: string;
  dealerId?: string;
  userName?: string;
  userRole?: string;
  currentPage?: string;
  activeModules?: string[];
  subscriptionTier?: string;
}

function buildSystemPrompt(kbContext: string, ctx: AssistContext = {}): string {
  const roleRestrictions =
    ctx.userRole === "dealer_staff"
      ? `This user is a Dealer Staff member. Do NOT discuss:
- Billing, invoices, or pricing
- Subscription management
- Staff management or permissions
- Account manager contact information
If they ask about these topics, say: "That information is available to your dealership owner. Please check with them or I can help you with something else."`
      : "This user is a Dealer Owner with full access.";

  return SYSTEM_PROMPT_TEMPLATE
    .replace("{{dealer_name}}", ctx.dealerName ?? "Unknown Dealer")
    .replace("{{dealer_id}}", ctx.dealerId ?? "")
    .replace("{{user_name}}", ctx.userName ?? "Dealer User")
    .replace("{{user_role}}", ctx.userRole ?? "dealer_owner")
    .replace("{{current_page}}", ctx.currentPage ?? "Dashboard")
    .replace("{{active_modules}}", (ctx.activeModules ?? ["claims"]).join(", "))
    .replace("{{subscription_tier}}", ctx.subscriptionTier ?? "Standard")
    .replace("{{role_restrictions}}", roleRestrictions)
    .replace("{{kb_context}}", kbContext || "No specific knowledge base articles found for this query. Answer from general DS360 platform knowledge.");
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getAssistResponse(
  userMessage: string,
  history: ConversationMessage[],
  kbContext: string,
  ctx: AssistContext = {}
): Promise<string> {
  const systemPrompt = buildSystemPrompt(kbContext, ctx);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const block = response.content[0];
    return block.type === "text" ? block.text : "I encountered an issue generating a response. Please try again.";
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error?.status === 429) {
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    }
    if (error?.status === 529 || error?.message?.includes("overloaded")) {
      return "DS360 Assist is temporarily busy. Please try again in a few moments.";
    }
    console.error("[assist-engine] Anthropic API error:", error);
    return "I'm having trouble connecting right now. Please try again or contact DS360 Support directly.";
  }
}
