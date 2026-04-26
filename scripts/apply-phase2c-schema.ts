// scripts/apply-phase2c-schema.ts — Apply Phase 2C schema changes directly
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Applying Phase 2C schema changes...\n");

    // Add new columns to dealerships table (skip if already exist)
    const dealershipColumns = [
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS branding_tier text DEFAULT 'base'`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#0cb22c'`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter'`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS email_from_name text`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS custom_subdomain text`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'active'`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS reviewed_at timestamp`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS reviewed_by_id uuid`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS review_notes text`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS address_line_1 text`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS address_line_2 text`,
      `ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS state_province text`,
    ];

    for (const sql of dealershipColumns) {
      try {
        await client.query(sql);
        const col = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];
        console.log(`  ✓ dealerships.${col}`);
      } catch (err: any) {
        console.log(`  skip: ${err.message.slice(0, 60)}`);
      }
    }

    // Add unique constraint on custom_subdomain (safe - all NULLs allowed)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS dealerships_custom_subdomain_unique
        ON dealerships(custom_subdomain) WHERE custom_subdomain IS NOT NULL
      `);
      console.log(`  ✓ dealerships.custom_subdomain unique index`);
    } catch (err: any) {
      console.log(`  skip unique index: ${err.message.slice(0, 60)}`);
    }

    // Create module_catalog table
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_catalog (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        module_key text NOT NULL UNIQUE,
        name text NOT NULL,
        description text,
        pricing_type text NOT NULL,
        default_monthly_cents integer,
        default_setup_cents integer,
        default_per_use_cents integer,
        default_commission_bps integer,
        requires_branding_tier text DEFAULT 'base',
        is_base_required boolean DEFAULT false,
        sort_order integer DEFAULT 0,
        active boolean DEFAULT true,
        created_at timestamp DEFAULT now()
      )
    `);
    console.log(`  ✓ table: module_catalog`);

    // Create dealership_modules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dealership_modules (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        dealership_id uuid NOT NULL,
        module_key text NOT NULL,
        status text DEFAULT 'enabled',
        monthly_cents integer,
        setup_cents integer,
        per_use_cents integer,
        commission_bps integer,
        enabled_at timestamp DEFAULT now(),
        enabled_by_id uuid,
        disabled_at timestamp,
        trial_ends_at timestamp,
        notes text
      )
    `);
    console.log(`  ✓ table: dealership_modules`);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS dealership_modules_dealership_idx ON dealership_modules(dealership_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS dealership_modules_module_idx ON dealership_modules(module_key)
    `);
    console.log(`  ✓ indexes on dealership_modules`);

    console.log("\n✅ Phase 2C schema applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
