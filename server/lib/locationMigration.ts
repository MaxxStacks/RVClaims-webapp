// server/lib/locationMigration.ts — Auto-migrate existing dealers to have a Main location
// Safe to call multiple times (idempotent — checks before inserting).

import { db } from "../db";
import { dealerships, dealershipLocations } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function migrateExistingDealersToLocations(): Promise<{ locationsCreated: number }> {
  let locationsCreated = 0;

  try {
    const allDealerships = await db.select().from(dealerships);

    for (const dealer of allDealerships) {
      // Check if any locations already exist for this dealership
      const existing = await db
        .select({ id: dealershipLocations.id })
        .from(dealershipLocations)
        .where(eq(dealershipLocations.dealershipId, dealer.id))
        .limit(1);

      if (existing.length > 0) {
        // Already migrated — skip
        continue;
      }

      // Create Main location using the dealership's own address data
      await db.insert(dealershipLocations).values({
        dealershipId: dealer.id,
        name: "Main",
        address: dealer.street ?? dealer.addressLine1 ?? null,
        city: dealer.city ?? null,
        province: dealer.province ?? dealer.stateProvince ?? null,
        postalCode: dealer.postalCode ?? null,
        phone: dealer.phone ?? null,
        email: dealer.email ?? null,
        managerUserId: null,
        isMain: true,
        isActive: true,
      });

      locationsCreated++;
    }
  } catch (err) {
    console.error("[LOCATION MIGRATION] Failed:", err);
  }

  return { locationsCreated };
}
