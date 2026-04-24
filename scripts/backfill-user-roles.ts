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
  const allUsers = await db.select().from(schema.users);
  let updated = 0;
  for (const u of allUsers) {
    const roles = u.roles as string[] | null;
    if (!roles || (Array.isArray(roles) && roles.length === 0)) {
      await db.update(schema.users)
        .set({ roles: [u.role] })
        .where(eq(schema.users.id, u.id));
      updated++;
    }
  }
  console.log(`Backfilled roles for ${updated} of ${allUsers.length} users`);

  // Verify
  const sample = await db.select({
    email: schema.users.email,
    role: schema.users.role,
    roles: schema.users.roles,
  }).from(schema.users).limit(5);
  console.log("Sample rows after backfill:");
  sample.forEach(r => console.log(`  ${r.email}: role=${r.role}, roles=${JSON.stringify(r.roles)}`));

  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
