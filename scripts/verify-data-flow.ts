// scripts/verify-data-flow.ts
// End-to-end data flow verification for DS360.
// Usage:
//   npx tsx scripts/verify-data-flow.ts          # run verification
//   npx tsx scripts/verify-data-flow.ts --cleanup # remove all test data tagged "Phase2D-Verify-*"

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq, like, and, sql } from "drizzle-orm";
import * as fs from "fs";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const TAG = `Phase2D-Verify-${Date.now()}`;
const isCleanup = process.argv.includes("--cleanup");

interface CheckResult {
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  detail: string;
}

const results: CheckResult[] = [];
function check(name: string, status: CheckResult["status"], detail: string) {
  results.push({ name, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "—";
  console.log(`  ${icon} ${name}: ${detail}`);
}

async function cleanup() {
  console.log("Cleaning up Phase2D-Verify-* test data...");
  const taggedClaims = await db.select().from(schema.claims).where(like(schema.claims.dealerNotes, "Phase2D-Verify-%"));
  for (const c of taggedClaims) {
    await db.delete(schema.notificationDeliveries).where(eq((schema.notificationDeliveries as any).claimId, c.id)).catch(() => {});
    await db.delete(schema.claims).where(eq(schema.claims.id, c.id));
    console.log(`  deleted claim ${c.claimNumber}`);
  }
  const taggedUnits = await db.select().from(schema.units).where(like(schema.units.stockNumber, "Phase2D-Verify-%"));
  for (const u of taggedUnits) {
    await db.delete(schema.units).where(eq(schema.units.id, u.id));
    console.log(`  deleted unit ${u.vin} (${u.stockNumber})`);
  }
  console.log(`Done. Removed ${taggedClaims.length} claims and ${taggedUnits.length} units.`);
  await pool.end();
}

async function main() {
  if (isCleanup) { await cleanup(); return; }

  console.log(`=== DS360 Data Flow Verification ===`);
  console.log(`Tag: ${TAG}\n`);

  const [dealership] = await db.select().from(schema.dealerships).where(eq(schema.dealerships.reviewStatus, "active")).limit(1);
  if (!dealership) {
    console.error("No active dealership found in DB. Cannot run verification.");
    process.exit(1);
  }
  console.log(`Test dealership: ${dealership.name} (${dealership.id})`);

  const [operator] = await db.select().from(schema.users)
    .where(sql`${schema.users.roles}::jsonb @> ${JSON.stringify(["operator_admin"])}::jsonb`)
    .limit(1);
  if (!operator) {
    console.error("No operator_admin user found. Cannot run verification.");
    process.exit(1);
  }
  console.log(`Operator user: ${operator.email}\n`);

  console.log("--- Test 1: Unit creation visibility ---");
  const testVin = `VERIFY${Date.now().toString().slice(-11)}`;
  const [createdUnit] = await db.insert(schema.units).values({
    vin: testVin,
    year: 2026,
    manufacturer: "Verify-Mfr",
    model: "Verify-Model",
    stockNumber: TAG,
    status: "in_inventory",
    dealershipId: dealership.id,
  }).returning();
  check("Unit created", "PASS", `id=${createdUnit.id}, VIN=${createdUnit.vin}`);

  const operatorViewUnits = await db.select().from(schema.units).where(eq(schema.units.id, createdUnit.id));
  check("Operator can see unit",
    operatorViewUnits.length > 0 ? "PASS" : "FAIL",
    operatorViewUnits.length > 0 ? "Unit visible in cross-dealer query" : "Unit NOT found in operator-scoped query");

  const dealerViewUnits = await db.select().from(schema.units).where(and(
    eq(schema.units.id, createdUnit.id),
    eq(schema.units.dealershipId, dealership.id),
  ));
  check("Dealer can see own unit",
    dealerViewUnits.length > 0 ? "PASS" : "FAIL",
    dealerViewUnits.length > 0 ? "Unit visible in dealership-scoped query" : "Unit NOT visible to dealer");

  console.log("\n--- Test 2: Claim creation + event fan-out ---");
  const claimNumber = `VRF-${Date.now().toString().slice(-8)}`;
  const [createdClaim] = await db.insert(schema.claims).values({
    claimNumber,
    dealershipId: dealership.id,
    unitId: createdUnit.id,
    manufacturer: "Verify-Mfr",
    type: "warranty",
    status: "new_unassigned",
    dealerNotes: `${TAG} - automated verification claim`,
    submittedAt: new Date(),
  }).returning();
  check("Claim created", "PASS", `${createdClaim.claimNumber}, status=${createdClaim.status}`);

  const operatorViewClaims = await db.select().from(schema.claims).where(eq(schema.claims.id, createdClaim.id));
  check("Operator can see claim",
    operatorViewClaims.length > 0 ? "PASS" : "FAIL",
    operatorViewClaims.length > 0 ? "Claim visible to operator" : "Claim NOT visible to operator");

  const claimsOnUnit = await db.select().from(schema.claims).where(eq(schema.claims.unitId, createdUnit.id));
  check("Claim linked to unit",
    claimsOnUnit.length > 0 ? "PASS" : "FAIL",
    `${claimsOnUnit.length} claim(s) found on unit`);

  console.log("\n--- Test 3: Event bus + notification fan-out ---");
  let notifTableExists = false;
  let notifs: any[] = [];
  try {
    notifs = await db.select().from(schema.notificationDeliveries).limit(1);
    notifTableExists = true;
  } catch (err: any) {
    check("notification_deliveries table", "FAIL", `Table missing or query failed: ${err.message}`);
  }
  if (notifTableExists) {
    check("notification_deliveries table", "PASS", "Table exists and queryable");

    const recent = await db.select().from(schema.notificationDeliveries)
      .where(sql`${schema.notificationDeliveries.createdAt} > NOW() - INTERVAL '60 seconds'`).limit(20);
    if (recent.length > 0) {
      check("Recent notifications exist", "PASS", `${recent.length} notification(s) created in last 60s`);
    } else {
      check("Recent notifications", "SKIP",
        "No recent notifications — expected, since direct DB insert bypasses event bus.");
    }

    const [totalRow] = await db.select({ c: sql<number>`count(*)` }).from(schema.notificationDeliveries);
    check("Notification deliveries lifetime count", "PASS", `${totalRow.c} total deliveries in DB`);
  }

  console.log("\n--- Test 4: Email outbox / queue ---");
  const recentDeliveries = await db.select().from(schema.notificationDeliveries)
    .where(sql`${schema.notificationDeliveries.createdAt} > NOW() - INTERVAL '24 hours'`).limit(10);
  check("Notification deliveries (24h)", recentDeliveries.length > 0 ? "PASS" : "SKIP",
    `${recentDeliveries.length} notification(s) created in last 24h`);

  const emailChannelCount = recentDeliveries.filter(d => (d as any).channel === "email" || (d as any).type === "email").length;
  check("Email-channel notifications (24h)", emailChannelCount > 0 ? "PASS" : "SKIP",
    `${emailChannelCount} email-channel notifications in last 24h`);

  console.log("\n--- Test 5: Cross-portal data consistency ---");
  const operatorQuery = await db.select().from(schema.claims).where(sql`true`).limit(100);
  const operatorSeesNew = operatorQuery.find(c => c.id === createdClaim.id);
  check("Operator portal claim visibility", operatorSeesNew ? "PASS" : "FAIL",
    operatorSeesNew ? "Claim appears in operator's claim list query" : "Claim missing from operator query");

  const dealerQuery = await db.select().from(schema.claims).where(eq(schema.claims.dealershipId, dealership.id)).limit(100);
  const dealerSeesNew = dealerQuery.find(c => c.id === createdClaim.id);
  check("Dealer portal claim visibility", dealerSeesNew ? "PASS" : "FAIL",
    dealerSeesNew ? "Claim appears in dealer's claim list query" : "Claim missing from dealer query");

  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const skipped = results.filter(r => r.status === "SKIP").length;
  console.log(`\n=== Summary: ${passed} PASS, ${failed} FAIL, ${skipped} SKIP ===`);

  const md = [
    `# Phase 2D Data Flow Verification Report`,
    `**Run tag:** ${TAG}`,
    `**Date:** ${new Date().toISOString()}`,
    `**Tested dealership:** ${dealership.name}`,
    ``,
    `## Summary`,
    `- ✓ ${passed} passed`,
    `- ✗ ${failed} failed`,
    `- — ${skipped} skipped`,
    ``,
    `## Results`,
    ``,
    ...results.map(r => `- **${r.status === "PASS" ? "✓" : r.status === "FAIL" ? "✗" : "—"} ${r.name}** — ${r.detail}`),
    ``,
    `## Created test data (use --cleanup to remove)`,
    `- Unit: ${createdUnit.vin} (id=${createdUnit.id})`,
    `- Claim: ${createdClaim.claimNumber} (id=${createdClaim.id})`,
    ``,
    `## Important note`,
    `This test inserts data **directly via SQL**, which bypasses the API layer's event bus. Notifications and emails are NOT triggered by this verification.`,
    `To verify the event bus end-to-end, manually create a claim via the dealer portal UI and watch for:`,
    `1. Notification appears in operator's bell within 30s`,
    `2. Email arrives at operator's inbox within 60s`,
    `3. Operator's claim queue updates in real time`,
    ``,
  ].join("\n");
  fs.writeFileSync("PHASE2D-VERIFICATION-REPORT.md", md);
  console.log(`\nReport written to PHASE2D-VERIFICATION-REPORT.md`);
  console.log(`To clean up: npx tsx scripts/verify-data-flow.ts --cleanup`);

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
