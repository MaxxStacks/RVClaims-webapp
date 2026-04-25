import "dotenv/config";
import { db } from "../server/db";
import { users, sessions } from "../shared/schema";

async function main() {
  await db.delete(sessions);
  const deleted = await db.delete(users);
  console.log("All users wiped. Ready for Clerk-driven creation.");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
