import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    for (const tbl of ["assist_conversations","assist_messages","assist_support_tickets","assist_knowledge_gaps","dealer_account_managers","remote_sessions","remote_session_events","kb_articles"]) {
      const r = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`,[tbl]);
      console.log(`\n${tbl}:`);
      r.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    }
  } finally { client.release(); await pool.end(); }
}
main().catch(console.error);
