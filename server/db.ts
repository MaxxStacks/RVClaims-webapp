import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Lazy singleton — the server starts without DATABASE_URL (marketing site),
// but any auth/DB operation will throw a clear error if it's missing.
let _db: NeonDatabase<typeof schema> | null = null;
let _pool: Pool | null = null;

function getDb(): NeonDatabase<typeof schema> {
  if (_db) return _db;

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Provision a Neon database and add it to your environment."
    );
  }

  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle({ client: _pool, schema });
  return _db;
}

// Export as a Proxy so callers can write `db.select(...)` as normal.
// The real connection is only opened when the first query is executed.
export const db = new Proxy({} as NeonDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function getPool(): Pool {
  getDb(); // ensures _pool is initialised
  return _pool!;
}
