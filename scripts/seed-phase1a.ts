// seed-phase1a.ts — adds test users for new Phase 1A roles.
// Idempotent: safe to run multiple times. Skips users that already exist.

import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const PW = "Test@2026!";

async function upsertUser(
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  dealershipId: string | null
) {
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`  skip (exists): ${email}`);
    return existing[0];
  }
  const hash = await bcrypt.hash(PW, 10);
  const [created] = await db.insert(schema.users).values({
    email,
    firstName,
    lastName,
    passwordHash: hash,
    role: role as any,
    roles: [role],
    dealershipId,
    isActive: true,
  }).returning();
  console.log(`  created: ${email} (${role})`);
  return created;
}

async function main() {
  const [firstDealer] = await db.select().from(schema.dealerships).limit(1);
  if (!firstDealer) {
    console.log("No dealership in DB; skipping role seeding until a dealership exists.");
    await pool.end();
    return;
  }
  const dealerId = firstDealer.id;

  console.log(`Seeding Phase 1A test users against dealership: ${firstDealer.name}`);

  const tech = await upsertUser("tech@phase1a.test", "Tina", "Tech", "technician", dealerId);
  await upsertUser("pubbid@phase1a.test", "Pat", "Public", "public_bidder", dealerId);
  const cons = await upsertUser("consignor@phase1a.test", "Charlie", "Consignor", "consignor", dealerId);
  await upsertUser("indiebid@phase1a.test", "Ivy", "Independent", "bidder", null);

  if (tech) {
    const existingTech = await db.select().from(schema.technicians).where(eq(schema.technicians.userId, tech.id)).limit(1);
    if (existingTech.length === 0) {
      await db.insert(schema.technicians).values({
        userId: tech.id,
        dealershipId: dealerId,
        specializations: ["electrical", "plumbing"],
        hourlyRate: "85.00",
        isAvailable: true,
      });
      console.log(`  created technician record for ${tech.email}`);
    }
  }

  if (cons) {
    const existingCons = await db.select().from(schema.consignors).where(eq(schema.consignors.userId, cons.id)).limit(1);
    if (existingCons.length === 0) {
      await db.insert(schema.consignors).values({
        userId: cons.id,
        dealershipId: dealerId,
        contactName: "Charlie Consignor",
        contactPhone: "+1-555-0100",
      });
      console.log(`  created consignor record for ${cons.email}`);
    }
  }

  console.log("Phase 1A seed complete.");
  console.log(`All new users can log in with password: ${PW}`);
  await pool.end();
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
