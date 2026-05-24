// scripts/enable-pgvector.ts — Enable pgvector extension on Neon DB
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("pgvector extension enabled successfully");
    const result = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
    console.log("Extension info:", result.rows[0] ?? "not found");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
