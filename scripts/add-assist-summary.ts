// scripts/add-assist-summary.ts — Add summary column to assist_conversations
// Run: npx tsx scripts/add-assist-summary.ts

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding summary column to assist_conversations...");
  try {
    await db.execute(
      sql`ALTER TABLE assist_conversations ADD COLUMN IF NOT EXISTS summary TEXT`
    );
    console.log("✅ summary column added (or already exists)");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
  process.exit(0);
}

main();
