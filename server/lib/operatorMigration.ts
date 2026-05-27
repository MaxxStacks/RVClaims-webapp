// server/lib/operatorMigration.ts — Auto-migrate to multi-operator architecture
// Idempotent — checks if any operators exist before creating default.

import { db } from "../db";
import { operators, dealerships, users } from "@shared/schema";
import { isNull, inArray, eq } from "drizzle-orm";

export async function migrateToMultiOperator(): Promise<{
  operatorCreated: boolean;
  dealershipsUpdated: number;
  usersUpdated: number;
}> {
  let operatorCreated = false;
  let dealershipsUpdated = 0;
  let usersUpdated = 0;

  try {
    // Check if any operators exist already (idempotent guard)
    const existing = await db.select({ id: operators.id }).from(operators).limit(1);
    if (existing.length > 0) {
      return { operatorCreated: false, dealershipsUpdated: 0, usersUpdated: 0 };
    }

    // Create the default DS360 operator
    const [defaultOperator] = await db
      .insert(operators)
      .values({
        name: "DS360 Operations",
        slug: "ds360",
        contactName: "DS360 Admin",
        contactEmail: "admin@dealersuite360.com",
        country: "CA",
        primaryColor: "#033280",
        secondaryColor: "#0cb22c",
        licenseTier: "enterprise",
        maxDealers: 9999,
        monthlyFee: "0.00",
        revenueSharePercent: "0.00",
        status: "active",
        activatedAt: new Date(),
      })
      .returning({ id: operators.id });

    operatorCreated = true;
    const defaultOperatorId = defaultOperator.id;

    // Update all dealerships that don't have an operator yet
    const dealershipResult = await db
      .update(dealerships)
      .set({ operatorId: defaultOperatorId })
      .where(isNull(dealerships.operatorId));

    dealershipsUpdated = (dealershipResult as any).rowCount ?? 0;

    // Update all operator_admin / operator_staff users without an operatorId
    const userResult = await db
      .update(users)
      .set({ operatorId: defaultOperatorId })
      .where(
        inArray(users.role, ["operator_admin", "operator_staff"])
      );

    usersUpdated = (userResult as any).rowCount ?? 0;
  } catch (err) {
    console.error("[OPERATOR MIGRATION] Failed:", err);
  }

  return { operatorCreated, dealershipsUpdated, usersUpdated };
}
