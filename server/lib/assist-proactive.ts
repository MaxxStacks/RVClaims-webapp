// server/lib/assist-proactive.ts — Context-aware proactive suggestions

import { db } from "../db";
import { assistConversations } from "@shared/schema-assist";
import { sql, gte, eq } from "drizzle-orm";

export interface ProactiveContext {
  userId: string;        // Clerk user ID
  dealerId: string;
  userRole: string;
  currentPage?: string;
  unitId?: string;
  claimId?: string;
  unitCreatedDaysAgo?: number;   // days since unit was created
  unitClaimCount?: number;       // 0 if no claims on this unit
  unitPhotoCount?: number;       // 0 if no photos uploaded
  claimStatus?: string;          // denied, partially_denied, etc.
  dealerUnitCount?: number;      // total units in dealer's inventory
  dealerClaimCount?: number;     // total claims ever filed by dealer
  staffCount?: number;           // number of staff in dealership
}

export interface ProactiveSuggestion {
  text: string;
  quickReplies: string[];
}

// ── Rule evaluation ─────────────────────────────────────────────────────────

export async function getProactiveSuggestion(ctx: ProactiveContext): Promise<ProactiveSuggestion | null> {
  // Don't show if active conversation in last 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const [recent] = await db
    .select({ id: assistConversations.id })
    .from(assistConversations)
    .where(
      sql`dealer_id = ${ctx.dealerId}::uuid AND user_id = ${ctx.userId} AND created_at >= ${fiveMinAgo}`
    )
    .limit(1);

  if (recent) return null;

  const page = ctx.currentPage ?? "";

  // Rule 1: Inventory page with 0 units
  if ((page.includes("/units") || page.includes("/inventory")) && ctx.dealerUnitCount === 0) {
    return {
      text: "Looks like you haven't added any units yet. Want me to walk you through creating your first one?",
      quickReplies: ["Create a Unit", "Show me how", "Not now"],
    };
  }

  // Rule 2: Unit detail page — unit is older than 7 days with 0 claims
  if (ctx.unitId && ctx.unitClaimCount === 0 && (ctx.unitCreatedDaysAgo ?? 0) > 7) {
    return {
      text: `This unit has been in your inventory for ${ctx.unitCreatedDaysAgo} days with no claims. Need help filing a PDI or warranty claim?`,
      quickReplies: ["File a Claim", "What is a PDI?", "Not now"],
    };
  }

  // Rule 3: Unit detail page — no photos uploaded
  if (ctx.unitId && ctx.unitPhotoCount === 0) {
    return {
      text: "This unit doesn't have any photos yet. Photos are required before you can submit a claim. Want me to explain how to upload them?",
      quickReplies: ["How do I upload photos?", "Show me the steps", "Not now"],
    };
  }

  // Rule 4: Claims page with 0 claims across all units
  if (page.includes("/claims") && ctx.dealerClaimCount === 0) {
    return {
      text: "Ready to file your first claim? I can guide you through the process step by step.",
      quickReplies: ["Guide me through it", "What types of claims exist?", "Not now"],
    };
  }

  // Rule 5: Claim detail — denied or partially denied
  if (ctx.claimId && (ctx.claimStatus === "denied" || ctx.claimStatus === "partially_denied")) {
    const label = ctx.claimStatus === "denied" ? "denied" : "partially denied";
    return {
      text: `I see this claim was ${label}. Want me to explain the denial reasons and what your options are?`,
      quickReplies: ["Why was it denied?", "What are my options?", "Contact my account manager"],
    };
  }

  // Rule 6: Staff management with only 1 staff member
  if (page.includes("/staff") && (ctx.staffCount ?? 1) <= 1) {
    return {
      text: "You can invite team members to help manage your dealership. Want me to walk you through adding staff?",
      quickReplies: ["How do I add staff?", "What can staff access?", "Not now"],
    };
  }

  // Rule 7: Long absence (> 14 days since last conversation)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const [lastConvo] = await db
    .select({ createdAt: assistConversations.createdAt })
    .from(assistConversations)
    .where(sql`dealer_id = ${ctx.dealerId}::uuid AND user_id = ${ctx.userId}`)
    .orderBy(sql`created_at DESC`)
    .limit(1);

  if (!lastConvo || lastConvo.createdAt < fourteenDaysAgo) {
    return {
      text: "Welcome back! I'm here to help with anything you need — creating units, filing claims, or managing your dealership.",
      quickReplies: ["Show me what's new", "Help me file a claim", "Add a unit"],
    };
  }

  return null;
}
