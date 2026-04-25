// scripts/seed-units-2b.ts — Seeds Phase 2B test units with warranty data.
// Idempotent: safe to run multiple times (skips by VIN).
// Run: npx tsx scripts/seed-units-2b.ts

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq, sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  console.log("=== Phase 2B Unit Seed ===\n");

  // Find first dealership
  const [dealership] = await db.select().from(schema.dealerships).limit(1);
  if (!dealership) {
    console.error("No dealership found. Run seed-test-data.ts first.");
    process.exit(1);
  }
  console.log(`Using dealership: ${dealership.name} (${dealership.id})`);

  const testUnits = [
    {
      vin: "1J4FA39S3PL000001",
      year: 2024,
      manufacturer: "Jayco",
      model: "Jay Flight 28BHS",
      stockNumber: "J24-001",
      status: "in_inventory" as const,
      lotLocation: "Front row A",
      warrantyStart: "2024-08-15",
      warrantyEnd: "2026-08-15",
      intakeDate: "2024-08-15",
    },
    {
      vin: "1F7NF52P3RKE00002",
      year: 2025,
      manufacturer: "Forest River",
      model: "Cherokee 274RK",
      stockNumber: "FR25-014",
      status: "sold" as const,
      lotLocation: "Sold lot",
      warrantyStart: "2025-01-10",
      warrantyEnd: "2027-01-10",
      extendedWarrantyPlan: "Premium Plus 5yr",
      extendedWarrantyStart: "2025-01-10",
      extWarrantyEnd: "2030-01-10",
      intakeDate: "2025-01-08",
      soldDate: "2025-02-22",
    },
    {
      vin: "1H7BL18B5SK000003",
      year: 2023,
      manufacturer: "Heartland",
      model: "Mallard M27",
      stockNumber: "H23-203",
      status: "in_service" as const,
      lotLocation: "Service bay 2",
      warrantyStart: "2023-06-01",
      warrantyEnd: "2025-06-01",
      intakeDate: "2023-05-25",
    },
  ];

  let seeded = 0;
  for (const u of testUnits) {
    const [existing] = await db.select().from(schema.units).where(eq(schema.units.vin, u.vin)).limit(1);
    if (existing) {
      console.log(`  skip (exists): ${u.vin}`);
      continue;
    }
    await db.insert(schema.units).values({ ...u, dealershipId: dealership.id });
    console.log(`✓ Seeded: ${u.year} ${u.manufacturer} ${u.model} (${u.vin})`);
    seeded++;
  }

  // Also promote any operator_admin user to dealer_owner if needed
  const admins = await db.select().from(schema.users).where(eq(schema.users.role, "operator_admin")).limit(5);
  for (const admin of admins) {
    const roles = (admin.roles as string[]) ?? [];
    if (!roles.includes("dealer_owner")) {
      await db.update(schema.users).set({
        roles: sql`${JSON.stringify([...roles, "dealer_owner"])}::jsonb`,
        dealershipId: dealership.id,
      }).where(eq(schema.users.id, admin.id));
      console.log(`✓ Promoted ${admin.email} → dealer_owner`);
    }
  }

  console.log(`\n=== Done. ${seeded} units seeded ===`);
  console.log(`Dealership: ${dealership.name} (${dealership.id})`);
  console.log("\nNext:");
  console.log("  1. Sign in → /portal-select-v6 → Dealer Owner");
  console.log("  2. Click 'Units / Inventory' in sidebar");
  console.log("  3. Click any unit row → Unit Profile opens");
  console.log("  4. Click '+ New Claim' on unit profile → auto-fills manufacturer");

  await pool.end();
}

main().catch(err => { console.error("Seed failed:", err); process.exit(1); });
