// server/lib/revenueShare.ts — Revenue share calculation for white-label operators

import { db } from "../db";
import { operators, dealerships, dealerModuleSubscriptions, serviceModules } from "@shared/schema";
import { eq, and, isNull } from "drizzle-orm";

export interface RevenueShareReport {
  operatorId: string;
  operatorName: string;
  month: number;
  year: number;
  dealerCount: number;
  totalDealerSubscriptionRevenue: number;
  ds360SharePercent: number;
  ds360ShareAmount: number;
  operatorShareAmount: number;
  licensingFee: number;
  subscriptionBreakdown: Array<{
    moduleSlug: string;
    dealerCount: number;
    monthlyRevenue: number;
  }>;
}

export async function calculateRevenueShare(
  operatorId: string,
  month: number,
  year: number
): Promise<RevenueShareReport> {
  // Fetch the operator
  const [operator] = await db
    .select()
    .from(operators)
    .where(eq(operators.id, operatorId))
    .limit(1);

  if (!operator) {
    throw new Error(`Operator ${operatorId} not found`);
  }

  // Get all dealers under this operator
  const operatorDealers = await db
    .select({ id: dealerships.id, name: dealerships.name })
    .from(dealerships)
    .where(eq(dealerships.operatorId, operatorId));

  const dealerCount = operatorDealers.length;

  if (dealerCount === 0) {
    return {
      operatorId,
      operatorName: operator.name,
      month,
      year,
      dealerCount: 0,
      totalDealerSubscriptionRevenue: 0,
      ds360SharePercent: Number(operator.revenueSharePercent ?? 15),
      ds360ShareAmount: 0,
      operatorShareAmount: 0,
      licensingFee: Number(operator.monthlyFee ?? 0),
      subscriptionBreakdown: [],
    };
  }

  const dealerIds = operatorDealers.map(d => d.id);

  // Aggregate active module subscriptions for dealers in this operator
  const moduleBreakdownMap: Record<string, { dealerCount: number; monthlyRevenue: number }> = {};
  let totalRevenue = 0;

  for (const dealerId of dealerIds) {
    const subs = await db
      .select({
        moduleId: dealerModuleSubscriptions.moduleId,
        monthlyRate: dealerModuleSubscriptions.monthlyRate,
        slug: serviceModules.slug,
      })
      .from(dealerModuleSubscriptions)
      .leftJoin(serviceModules, eq(dealerModuleSubscriptions.moduleId, serviceModules.id))
      .where(
        and(
          eq(dealerModuleSubscriptions.dealershipId, dealerId),
          eq(dealerModuleSubscriptions.status, "active")
        )
      );

    for (const sub of subs) {
      const rate = Number(sub.monthlyRate ?? 0);
      const slug = sub.slug ?? sub.moduleId;
      totalRevenue += rate;
      if (!moduleBreakdownMap[slug]) {
        moduleBreakdownMap[slug] = { dealerCount: 0, monthlyRevenue: 0 };
      }
      moduleBreakdownMap[slug].dealerCount += 1;
      moduleBreakdownMap[slug].monthlyRevenue += rate;
    }
  }

  const revenueSharePct = Number(operator.revenueSharePercent ?? 15);
  const licensingFee = Number(operator.monthlyFee ?? 0);
  const ds360ShareAmount = (totalRevenue * revenueSharePct) / 100;
  const operatorShareAmount = totalRevenue - ds360ShareAmount;

  const subscriptionBreakdown = Object.entries(moduleBreakdownMap).map(([moduleSlug, data]) => ({
    moduleSlug,
    dealerCount: data.dealerCount,
    monthlyRevenue: data.monthlyRevenue,
  }));

  return {
    operatorId,
    operatorName: operator.name,
    month,
    year,
    dealerCount,
    totalDealerSubscriptionRevenue: totalRevenue,
    ds360SharePercent: revenueSharePct,
    ds360ShareAmount,
    operatorShareAmount,
    licensingFee,
    subscriptionBreakdown,
  };
}
