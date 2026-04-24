import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function count(table: any, label: string) {
  await db.select().from(table).limit(1);
  console.log(`  ✓ ${label}: queryable`);
}

async function main() {
  console.log("Phase 1A smoke test — verifying all new tables are queryable...");
  await count(schema.events, "events");
  await count(schema.notificationDeliveries, "notification_deliveries");
  await count(schema.userNotificationPreferences, "user_notification_preferences");
  await count(schema.technicians, "technicians");
  await count(schema.workOrders, "work_orders");
  await count(schema.workOrderLabor, "work_order_labor");
  await count(schema.serviceAppointments, "service_appointments");
  await count(schema.consignors, "consignors");
  await count(schema.consignmentAgreements, "consignment_agreements");
  await count(schema.clientPartsOrders, "client_parts_orders");
  await count(schema.lenders, "lenders");
  await count(schema.lenderIntegrations, "lender_integrations");
  await count(schema.financingApplications, "financing_applications");
  await count(schema.lenderSubmissions, "lender_submissions");
  await count(schema.loanDeals, "loan_deals");
  await count(schema.campaignTemplates, "campaign_templates");
  await count(schema.campaigns, "campaigns");
  await count(schema.emailEvents, "email_events");
  await count(schema.leads, "leads");
  await count(schema.landingPages, "landing_pages");
  console.log("\nAll 20 new tables pass.");
  await pool.end();
}

main().then(() => process.exit(0)).catch(err => { console.error("SMOKE TEST FAILED:", err); process.exit(1); });
