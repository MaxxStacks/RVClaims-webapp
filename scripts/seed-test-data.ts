// scripts/seed-test-data.ts — Seeds a test dealership + 3 units for development.
// Also promotes any operator_admin user to also have dealer_owner role so they
// can switch to the Dealer portal via portal-select-v6 and see the units.
//
// Idempotent: safe to run multiple times (skips existing data by name/VIN).
// Run: npx tsx scripts/seed-test-data.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq, sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const DEALERSHIP_NAME = "Maxx RV Sales";

const TEST_UNITS = [
  {
    vin: "1FDXE4FS3KDA12301",
    year: 2024,
    manufacturer: "Jayco",
    model: "Eagle 321RSTS",
    rvType: "fifth_wheel" as const,
    stockNumber: "J-2024-001",
    status: "on_lot" as const,
  },
  {
    vin: "4X4FRHM21N1234567",
    year: 2023,
    manufacturer: "Forest River",
    model: "Rockwood Ultra Lite 2706WS",
    rvType: "travel_trailer" as const,
    stockNumber: "FR-2023-002",
    status: "on_lot" as const,
  },
  {
    vin: "5ZT2HWBC3PA987654",
    year: 2024,
    manufacturer: "Heartland",
    model: "Bighorn 3985BH",
    rvType: "fifth_wheel" as const,
    stockNumber: "H-2024-003",
    status: "delivered" as const,
  },
];

async function main() {
  console.log("=== DS360 Test Data Seed ===\n");

  // --- 1. Upsert dealership ---
  let dealershipId: string;
  const existing = await db
    .select()
    .from(schema.dealerships)
    .where(eq(schema.dealerships.name, DEALERSHIP_NAME))
    .limit(1);

  if (existing.length > 0) {
    dealershipId = existing[0].id;
    console.log(`✓ Dealership already exists: ${DEALERSHIP_NAME} (${dealershipId})`);
  } else {
    const [d] = await db
      .insert(schema.dealerships)
      .values({
        name: DEALERSHIP_NAME,
        legalName: "Maxx RV Sales Ltd.",
        email: "info@maxxrv.test",
        phone: "613-555-0100",
        street: "1234 Highway 17",
        city: "Ottawa",
        province: "ON",
        postalCode: "K1A 0A9",
        country: "Canada",
        contactName: "Jonathan",
        contactEmail: "jonathanwp83@gmail.com",
        contactPhone: "613-555-0101",
        plan: "plan_a",
        status: "active",
        manufacturers: ["Jayco", "Forest River", "Heartland"],
      })
      .returning();
    dealershipId = d.id;
    console.log(`✓ Created dealership: ${DEALERSHIP_NAME} (${dealershipId})`);
  }

  // --- 2. Seed units ---
  for (const u of TEST_UNITS) {
    const existingUnit = await db
      .select()
      .from(schema.units)
      .where(eq(schema.units.vin, u.vin))
      .limit(1);

    if (existingUnit.length > 0) {
      console.log(`  skip unit (exists): ${u.vin}`);
      continue;
    }

    await db.insert(schema.units).values({
      ...u,
      dealershipId,
    });
    console.log(`✓ Created unit: ${u.vin} — ${u.year} ${u.manufacturer} ${u.model}`);
  }

  // --- 3. Promote first operator_admin to also have dealer_owner role ---
  const operatorAdmins = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.role, "operator_admin"))
    .limit(5);

  if (operatorAdmins.length === 0) {
    console.log("\n⚠ No operator_admin users found — skipping role promotion.");
    console.log("  Sign in once as operator to create your user record, then re-run this script.");
  } else {
    for (const user of operatorAdmins) {
      const currentRoles: string[] = (user.roles as string[]) ?? [];
      const needsDealer = !currentRoles.includes("dealer_owner");
      const needsDealershipId = user.dealershipId !== dealershipId;

      if (!needsDealer && !needsDealershipId) {
        console.log(`  skip (already promoted): ${user.email}`);
        continue;
      }

      const updatedRoles = needsDealer ? [...currentRoles, "dealer_owner"] : currentRoles;

      await db
        .update(schema.users)
        .set({
          roles: sql`${JSON.stringify(updatedRoles)}::jsonb`,
          dealershipId: dealershipId,
        })
        .where(eq(schema.users.id, user.id));

      console.log(`✓ Promoted ${user.email} → roles: [${updatedRoles.join(", ")}], dealershipId: ${dealershipId}`);
    }
  }

  console.log("\n=== Done ===");
  console.log(`Dealership ID : ${dealershipId}`);
  console.log(`Units seeded  : ${TEST_UNITS.length}`);
  console.log("\nNext steps:");
  console.log("  1. Sign in at dealersuite360.com/login");
  console.log("  2. Go to /portal-select-v6 → click 'Dealer Owner'");
  console.log("  3. Navigate to Claims → '+ New Claim' → units should appear in dropdown");

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
