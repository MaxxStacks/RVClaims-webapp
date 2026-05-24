// server/lib/assist-context.ts — Build dynamic dealer/user/page context for DS360 Assist

import { db } from "../db";
import { dealerships, dealershipModules, units, claims, claimFrcLines, users } from "@shared/schema";
import { eq, and, count, ne } from "drizzle-orm";

export interface AssistContextData {
  dealerName: string;
  dealerId: string;
  userName: string;
  userRole: string;
  currentPage: string;
  activeModules: string[];
  subscriptionTier: string;
  unitContext?: {
    vin: string;
    year: number | null;
    make: string | null;
    model: string | null;
    totalClaims: number;
    openClaims: number;
  };
  claimContext?: {
    claimNumber: string;
    status: string;
    claimType: string;
    frcLineCount: number;
  };
}

// Extract UUID from a URL path segment (e.g. /dealer/owner/units/abc-123 → "abc-123")
function extractIdFromPath(path: string, segment: string): string | null {
  const re = new RegExp(`/${segment}/([0-9a-f-]{36})`, "i");
  const m = path.match(re);
  return m ? m[1] : null;
}

export async function buildAssistContext(
  dealershipId: string,
  clerkUserId: string,
  userRole: string,
  currentPage: string
): Promise<AssistContextData> {
  const ctx: AssistContextData = {
    dealerName: "Your Dealership",
    dealerId: dealershipId,
    userName: "Dealer User",
    userRole,
    currentPage: currentPage || "Dashboard",
    activeModules: ["claims"],
    subscriptionTier: "Standard",
  };

  try {
    // ── Dealer info ─────────────────────────────────────────────────────────
    const [dealer] = await db
      .select({
        name: dealerships.name,
        plan: dealerships.plan,
        techflowEnabled: dealerships.techflowEnabled,
        marketingEnabled: dealerships.marketingEnabled,
        consignmentEnabled: dealerships.consignmentEnabled,
        partsStoreEnabled: dealerships.partsStoreEnabled,
      })
      .from(dealerships)
      .where(eq(dealerships.id, dealershipId))
      .limit(1);

    if (dealer) {
      ctx.dealerName = dealer.name;
      ctx.subscriptionTier = dealer.plan ?? "plan_a";
      const mods = ["claims"];
      if (dealer.techflowEnabled) mods.push("techflow");
      if (dealer.marketingEnabled) mods.push("marketing");
      if (dealer.consignmentEnabled) mods.push("consignment");
      if (dealer.partsStoreEnabled) mods.push("parts_store");
      ctx.activeModules = mods;
    }

    // ── User name ────────────────────────────────────────────────────────────
    const [usr] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (usr) {
      ctx.userName = [usr.firstName, usr.lastName].filter(Boolean).join(" ") || "Dealer User";
    }

    // ── Unit context ─────────────────────────────────────────────────────────
    const unitId = extractIdFromPath(currentPage, "units");
    if (unitId) {
      const [unit] = await db
        .select({
          vin: units.vin,
          year: units.year,
          manufacturer: units.manufacturer,
          model: units.model,
        })
        .from(units)
        .where(and(eq(units.id, unitId), eq(units.dealershipId, dealershipId)))
        .limit(1);

      if (unit) {
        const [totalRow] = await db
          .select({ cnt: count() })
          .from(claims)
          .where(and(eq(claims.unitId, unitId), eq(claims.dealershipId, dealershipId)));

        const [openRow] = await db
          .select({ cnt: count() })
          .from(claims)
          .where(
            and(
              eq(claims.unitId, unitId),
              eq(claims.dealershipId, dealershipId),
              ne(claims.status, "completed")
            )
          );

        ctx.unitContext = {
          vin: unit.vin,
          year: unit.year,
          make: unit.manufacturer,
          model: unit.model,
          totalClaims: Number(totalRow?.cnt ?? 0),
          openClaims: Number(openRow?.cnt ?? 0),
        };
      }
    }

    // ── Claim context ────────────────────────────────────────────────────────
    const claimId = extractIdFromPath(currentPage, "claims");
    if (claimId) {
      const [claim] = await db
        .select({
          claimNumber: claims.claimNumber,
          status: claims.status,
          type: claims.type,
        })
        .from(claims)
        .where(and(eq(claims.id, claimId), eq(claims.dealershipId, dealershipId)))
        .limit(1);

      if (claim) {
        const [lineRow] = await db
          .select({ cnt: count() })
          .from(claimFrcLines)
          .where(eq(claimFrcLines.claimId, claimId));

        ctx.claimContext = {
          claimNumber: claim.claimNumber,
          status: claim.status ?? "draft",
          claimType: claim.type,
          frcLineCount: Number(lineRow?.cnt ?? 0),
        };
      }
    }
  } catch (err) {
    console.error("[assist-context] Error building context:", err);
    // Return partial context — non-critical
  }

  return ctx;
}
