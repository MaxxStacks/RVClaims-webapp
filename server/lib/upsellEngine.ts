// server/lib/upsellEngine.ts — DS360 Smart Upsell opportunity generation engine

import { db } from "../db";
import {
  dealerships, units, claims, fiDeals, dealerModuleSubscriptions, serviceModules,
  upsellOpportunities,
} from "@shared/schema";
import { eq, and, gte, inArray, notInArray, sql } from "drizzle-orm";
import { getDealerCurrency } from "./locale";

// ─── Trigger constants ────────────────────────────────────────────────────────

const WARRANTY_EXPIRY_DAYS_HIGH   = 30;
const WARRANTY_EXPIRY_DAYS_MEDIUM = 60;
const WARRANTY_EXPIRY_DAYS_LOW    = 90;

const UNIT_AGE_ROADSIDE_YEARS     = 5;
const UNIT_AGE_PROTECTION_YEARS   = 3;

const SERVICE_GAP_MONTHS          = 12;

// ─── Generate opportunities for one dealership ───────────────────────────────

export async function generateOpportunities(dealershipId: string): Promise<number> {
  let created = 0;

  // Load dealership for currency
  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  const currency = getDealerCurrency(dealership ?? undefined);

  // Load all units for this dealership
  const dealerUnits = await db
    .select()
    .from(units)
    .where(eq(units.dealershipId, dealershipId));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  for (const unit of dealerUnits) {
    try {
      // Skip units without a customer
      if (!unit.customerId) continue;

      // ── Load recent activity for service gap check ──
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - SERVICE_GAP_MONTHS);

      const recentClaims = await db
        .select({ id: claims.id })
        .from(claims)
        .where(
          and(
            eq(claims.unitId, unit.id),
            gte(claims.createdAt, twelveMonthsAgo),
          )
        )
        .limit(1);

      const hasRecentActivity = recentClaims.length > 0;

      // ── Define potential opportunities for this unit ──
      const candidates: Array<{
        triggerType: typeof upsellOpportunities.$inferSelect["triggerType"];
        recommendedProductType: typeof upsellOpportunities.$inferSelect["recommendedProductType"];
        estimatedValue: number;
        urgency: typeof upsellOpportunities.$inferSelect["urgency"];
        triggerDetails: Record<string, unknown>;
      }> = [];

      // 1. WARRANTY EXPIRY
      if (unit.warrantyEnd) {
        const warrantyEndDate = new Date(unit.warrantyEnd);
        const diffMs = warrantyEndDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= WARRANTY_EXPIRY_DAYS_LOW) {
          const urgency =
            diffDays <= WARRANTY_EXPIRY_DAYS_HIGH   ? "high"   :
            diffDays <= WARRANTY_EXPIRY_DAYS_MEDIUM  ? "medium" : "low";

          candidates.push({
            triggerType: "warranty_expiry",
            recommendedProductType: "extended_warranty",
            estimatedValue: 1200,
            urgency,
            triggerDetails: {
              warrantyEnd: unit.warrantyEnd,
              daysRemaining: diffDays,
            },
          });
        }
      }

      // 2. UNIT AGE
      if (unit.year) {
        const age = currentYear - unit.year;
        if (age >= UNIT_AGE_ROADSIDE_YEARS) {
          candidates.push({
            triggerType: "unit_age",
            recommendedProductType: "roadside",
            estimatedValue: 299,
            urgency: "medium",
            triggerDetails: { unitYear: unit.year, ageYears: age },
          });
        } else if (age >= UNIT_AGE_PROTECTION_YEARS) {
          candidates.push({
            triggerType: "unit_age",
            recommendedProductType: "protection_package",
            estimatedValue: 499,
            urgency: "low",
            triggerDetails: { unitYear: unit.year, ageYears: age },
          });
        }
      }

      // 3. SERVICE GAP
      if (!hasRecentActivity) {
        candidates.push({
          triggerType: "service_gap",
          recommendedProductType: "maintenance_package",
          estimatedValue: 350,
          urgency: "low",
          triggerDetails: { lastServiceCheck: `>12 months` },
        });
      }

      // 4. SEASONAL
      if (currentMonth === 10 || currentMonth === 11) {
        candidates.push({
          triggerType: "seasonal",
          recommendedProductType: "winterization",
          estimatedValue: 249,
          urgency: "high",
          triggerDetails: { season: "fall", month: currentMonth },
        });
      } else if (currentMonth === 3 || currentMonth === 4) {
        candidates.push({
          triggerType: "seasonal",
          recommendedProductType: "de_winterization",
          estimatedValue: 199,
          urgency: "high",
          triggerDetails: { season: "spring", month: currentMonth },
        });
      } else if (currentMonth === 4 || currentMonth === 5) {
        // Note: April overlaps winterization and de-winterization blocks above.
        // May is only spring_prep.
        if (currentMonth === 5) {
          candidates.push({
            triggerType: "seasonal",
            recommendedProductType: "spring_prep",
            estimatedValue: 299,
            urgency: "medium",
            triggerDetails: { season: "spring_prep", month: currentMonth },
          });
        }
      }

      // 5. F&I GAPS — check if customer has no fi_deal with GAP coverage
      // fi_deals table uses customerId via customerName (no direct FK to user id)
      // Use unit FK instead for the join
      const gapDeals = await db
        .select({ id: fiDeals.id })
        .from(fiDeals)
        .where(
          and(
            eq(fiDeals.dealershipId, dealershipId),
            eq(fiDeals.unitId!, unit.id),
          )
        )
        .limit(1);

      if (gapDeals.length === 0) {
        candidates.push({
          triggerType: "fi_gap",
          recommendedProductType: "gap_coverage",
          estimatedValue: 800,
          urgency: "medium",
          triggerDetails: { reason: "No F&I deal with GAP coverage on file" },
        });
      }

      // ── De-duplicate and insert ──
      for (const candidate of candidates) {
        // Check for existing non-expired/non-dismissed opportunity
        const existing = await db
          .select({ id: upsellOpportunities.id })
          .from(upsellOpportunities)
          .where(
            and(
              eq(upsellOpportunities.dealershipId, dealershipId),
              eq(upsellOpportunities.customerId, unit.customerId),
              eq(upsellOpportunities.unitId, unit.id),
              eq(upsellOpportunities.triggerType, candidate.triggerType),
              eq(upsellOpportunities.recommendedProductType, candidate.recommendedProductType),
              notInArray(upsellOpportunities.status, ["expired", "dismissed"]),
            )
          )
          .limit(1);

        if (existing.length > 0) continue;

        await db.insert(upsellOpportunities).values({
          dealershipId,
          customerId: unit.customerId,
          unitId: unit.id,
          triggerType: candidate.triggerType,
          triggerDetails: candidate.triggerDetails,
          recommendedProductType: candidate.recommendedProductType,
          estimatedValue: candidate.estimatedValue.toString(),
          currency,
          urgency: candidate.urgency,
          status: "new",
        });

        created++;
      }
    } catch (err) {
      // Per-unit error isolation — log and continue
      console.error(`[upsellEngine] Error processing unit ${unit.id}:`, err);
    }
  }

  return created;
}

// ─── Run scan across all dealerships with smart_upsell module active ─────────

export async function runUpsellScan(): Promise<{ dealersScanned: number; opportunitiesCreated: number }> {
  let dealersScanned = 0;
  let opportunitiesCreated = 0;

  // Find all dealerships that have the smart_upsell module active
  const activeModule = await db
    .select({ id: serviceModules.id })
    .from(serviceModules)
    .where(eq(serviceModules.slug, "smart_upsell"))
    .limit(1);

  if (activeModule.length === 0) {
    return { dealersScanned: 0, opportunitiesCreated: 0 };
  }

  const moduleId = activeModule[0].id;

  const activeSubs = await db
    .select({ dealershipId: dealerModuleSubscriptions.dealershipId })
    .from(dealerModuleSubscriptions)
    .where(
      and(
        eq(dealerModuleSubscriptions.moduleId, moduleId),
        eq(dealerModuleSubscriptions.status, "active"),
      )
    );

  for (const sub of activeSubs) {
    try {
      const count = await generateOpportunities(sub.dealershipId);
      opportunitiesCreated += count;
      dealersScanned++;
    } catch (err) {
      console.error(`[upsellEngine] Error scanning dealer ${sub.dealershipId}:`, err);
    }
  }

  return { dealersScanned, opportunitiesCreated };
}
