import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const MODULES = [
  {
    moduleKey: "claims" as const,
    name: "Claims Management",
    description: "Core claims processing for warranty, PDI, DAF, and extended warranty claims. Required base module.",
    pricingType: "hybrid" as const,
    defaultMonthlyCents: 19900,
    defaultSetupCents: 49900,
    defaultPerUseCents: 1500,
    requiresBrandingTier: "base" as const,
    isBaseRequired: true,
    sortOrder: 1,
  },
  {
    moduleKey: "techflow" as const,
    name: "TechFlow",
    description: "Technician dispatch and labor hour tracking. Auto-syncs labor hours back to approved warranty claims.",
    pricingType: "subscription" as const,
    defaultMonthlyCents: 9900,
    requiresBrandingTier: "base" as const,
    sortOrder: 2,
  },
  {
    moduleKey: "marketplace" as const,
    name: "Dealer Marketplace",
    description: "Dealer-to-dealer auction platform with Stripe escrow. Optional Public Showcase add-on for monthly public auctions.",
    pricingType: "subscription" as const,
    defaultMonthlyCents: 4158,
    requiresBrandingTier: "base" as const,
    sortOrder: 3,
  },
  {
    moduleKey: "parts_store" as const,
    name: "Parts Store",
    description: "Sell parts directly to clients via the customer portal. Includes inventory, fulfillment, and order tracking.",
    pricingType: "commission" as const,
    defaultCommissionBps: 500,
    requiresBrandingTier: "mid" as const,
    sortOrder: 4,
  },
  {
    moduleKey: "ai_fi" as const,
    name: "AI F&I Presenter",
    description: "AI video avatar that walks customers through F&I products post-purchase. Live video, real-time objection handling, auto-syncs accepted products.",
    pricingType: "per_use" as const,
    defaultPerUseCents: 2500,
    requiresBrandingTier: "mid" as const,
    sortOrder: 5,
  },
  {
    moduleKey: "marketing" as const,
    name: "Marketing Suite",
    description: "Email campaigns, lead capture forms, landing pages. Includes Anthropic-powered content generation.",
    pricingType: "subscription" as const,
    defaultMonthlyCents: 14900,
    requiresBrandingTier: "mid" as const,
    sortOrder: 6,
  },
  {
    moduleKey: "consignment" as const,
    name: "Consignment Management",
    description: "Manage consigned units for private sellers. Includes consignment agreements, payouts via Stripe Connect.",
    pricingType: "commission" as const,
    defaultCommissionBps: 1000,
    requiresBrandingTier: "base" as const,
    sortOrder: 7,
  },
  {
    moduleKey: "financing" as const,
    name: "Financing Hub",
    description: "Multi-lender application submission, rate comparison, and funding tracking. Integrates with major lender APIs.",
    pricingType: "per_use" as const,
    defaultPerUseCents: 4900,
    requiresBrandingTier: "mid" as const,
    sortOrder: 8,
  },
];

async function main() {
  console.log("Seeding module catalog...");
  for (const mod of MODULES) {
    const [existing] = await db.select().from(schema.moduleCatalog).where(eq(schema.moduleCatalog.moduleKey, mod.moduleKey));
    if (existing) {
      await db.update(schema.moduleCatalog).set({ ...mod, active: true }).where(eq(schema.moduleCatalog.id, existing.id));
      console.log(`  Updated ${mod.moduleKey}`);
    } else {
      await db.insert(schema.moduleCatalog).values(mod);
      console.log(`  Created ${mod.moduleKey}`);
    }
  }
  console.log("Done.");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
