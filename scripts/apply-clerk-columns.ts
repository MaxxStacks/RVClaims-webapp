import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
  console.log("✓ password_hash made nullable");

  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_user_id" text`);
  console.log("✓ users.clerk_user_id added");

  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_clerk_user_id_unique'
      ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id");
      END IF;
    END $$
  `);
  console.log("✓ users.clerk_user_id unique constraint added");

  await db.execute(sql`ALTER TABLE "dealerships" ADD COLUMN IF NOT EXISTS "clerk_org_id" text`);
  console.log("✓ dealerships.clerk_org_id added");

  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dealerships_clerk_org_id_unique'
      ) THEN
        ALTER TABLE "dealerships" ADD CONSTRAINT "dealerships_clerk_org_id_unique" UNIQUE("clerk_org_id");
      END IF;
    END $$
  `);
  console.log("✓ dealerships.clerk_org_id unique constraint added");

  console.log("Schema migration complete.");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
