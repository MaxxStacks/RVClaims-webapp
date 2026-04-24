# PHASE1A-AUTONOMOUS.md
## DS360 Phase 1 Run 1A — Database Schema Foundation

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE1A-DEPLOY-REPORT.md`.**

---

## What this run does

Extends `shared/schema.ts` with 10 new enums, 18 new tables, and 3 table column additions. Zero destructive changes. All existing tables and data preserved.

After this run, Phase 1 runs B/C/D can layer auth, portals, and event bus on top.

---

## Inputs (in project root)

| File | Role |
|---|---|
| `PHASE1A-SCHEMA-PATCH.ts` | The additions — do NOT import this file from application code. It is a reference for what CC must merge into `shared/schema.ts`. |
| `PHASE1A-AUTONOMOUS.md` | This spec. |
| `DS360_Data_Routing_Schema.json` | v6 schema reference (already present from v6 portal bundle). |
| `DS360_Events_Catalog.json` | v7 event catalog reference (already present or will be added now). |

Also presumes:
- Existing `shared/schema.ts` is 961 lines (the file Jonathan reviewed)
- Drizzle ORM + Neon Postgres configured
- `drizzle-kit` in devDependencies
- Project deploys from `main` to Railway

---

## Step 1 — Locate and back up existing schema

```bash
# Find the schema file
find . -name "schema.ts" -not -path "./node_modules/*" -not -path "./dist/*" -type f 2>/dev/null

# Expected: ./shared/schema.ts
# If different path: use that path throughout. If missing: fail and report.

# Confirm schema-marketplace.ts lives alongside if present
find . -name "schema-marketplace.ts" -not -path "./node_modules/*" -type f 2>/dev/null
```

Back up before any edits:

```bash
cp shared/schema.ts shared/schema.ts.pre-phase1a.bak
```

If a `shared/schema-marketplace.ts` exists:
```bash
cp shared/schema-marketplace.ts shared/schema-marketplace.ts.pre-phase1a.bak
```

---

## Step 2 — Extend USER_ROLES enum

In `shared/schema.ts`, find the line:

```ts
export const USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "client", "bidder"] as const;
```

Replace with:

```ts
export const USER_ROLES = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor", "client", "bidder"] as const;
```

Rationale: `bidder` stays (= independent bidder for Live Monthly public auctions). `public_bidder` is the new dealer-sponsored role. `technician` + `consignor` are new dealer-portal-hosted guest roles.

Also find:

```ts
export const INVITE_ROLES = ["dealer_owner", "dealer_staff", "client"] as const;
```

Replace with:

```ts
export const INVITE_ROLES = ["operator_staff", "dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor", "client"] as const;
```

---

## Step 3 — Add 10 new enum arrays

Immediately after the existing enum block (right before `// ==================== 1. USERS ====================`), insert these enums. Copy verbatim from `PHASE1A-SCHEMA-PATCH.ts`:

```ts
export const EVENT_PRIORITIES = ["informational", "action_required", "urgent"] as const;
export const DELIVERY_CHANNELS = ["in_app", "email", "sms", "webhook"] as const;
export const DELIVERY_STATUSES = ["pending", "sent", "delivered", "failed", "skipped"] as const;
export const WORK_ORDER_STATUSES = [
  "unassigned", "assigned", "en_route", "arrived", "in_progress",
  "blocked_parts", "paused", "completed", "invoiced", "cancelled",
] as const;
export const SERVICE_APPT_STATUSES = [
  "requested", "scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show",
] as const;
export const CONSIGNMENT_AGREEMENT_STATUSES = [
  "pending_signature", "active", "expired", "terminated", "sold",
] as const;
export const CLIENT_PARTS_ORDER_STATUSES = [
  "cart", "checkout", "paid", "fulfilling", "shipped", "delivered", "returned", "refunded",
] as const;
export const LENDER_SUBMISSION_STATUSES = [
  "draft", "submitted", "pending_review", "approved", "declined",
  "counter_offered", "withdrawn", "accepted", "funded",
] as const;
export const LOAN_DEAL_STATUSES = ["pending_funding", "funded", "past_due", "default", "paid_off"] as const;
export const CAMPAIGN_STATUSES = ["draft", "scheduled", "sending", "sent", "paused", "archived"] as const;
export const LEAD_STATUSES = ["new", "assigned", "contacted", "qualified", "converted", "disqualified", "lost"] as const;
export const EMAIL_EVENT_TYPES = ["sent", "delivered", "opened", "clicked", "bounced", "unsubscribed", "complained"] as const;
```

---

## Step 4 — Extend the `users` table with `roles` column

Find the existing users pgTable. After the `role` field, add:

```ts
  roles: jsonb("roles").$type<string[]>().default(sql`'[]'::jsonb`),
```

The final `users` table should look like (diff only — do not retype the whole thing):

```ts
  role: text("role", { enum: USER_ROLES }).notNull(),
  roles: jsonb("roles").$type<string[]>().default(sql`'[]'::jsonb`),  // ← NEW
  dealershipId: uuid("dealership_id"),
```

---

## Step 5 — Extend the `dealerships` table

Find the existing dealerships pgTable. Before the closing `});`, add these fields:

```ts
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectStatus: text("stripe_connect_status"),
  cloudflareZoneId: text("cloudflare_zone_id"),
  cloudflareVerificationToken: text("cloudflare_verification_token"),
  customDomainStatus: text("custom_domain_status"),
  techflowEnabled: boolean("techflow_enabled").default(false),
  marketingEnabled: boolean("marketing_enabled").default(false),
  consignmentEnabled: boolean("consignment_enabled").default(false),
  partsStoreEnabled: boolean("parts_store_enabled").default(false),
```

---

## Step 6 — Extend the `claims` table

Find the existing claims pgTable. After `paidAt: timestamp("paid_at"),`, add:

```ts
  assignedToUserId: uuid("assigned_to_user_id"),
  assignedAt: timestamp("assigned_at"),
  reviewStartedAt: timestamp("review_started_at"),
  awaitingDealerResponse: boolean("awaiting_dealer_response").default(false),
  denialReason: text("denial_reason"),
  deniedAt: timestamp("denied_at"),
  appealOpenedAt: timestamp("appeal_opened_at"),
  stuck: boolean("stuck").default(false),
  stuckSince: timestamp("stuck_since"),
  submittedToMfrAt: timestamp("submitted_to_mfr_at"),
  approvedAt: timestamp("approved_at"),
```

Also extend the CLAIM_STATUSES enum (the existing enum is at the top of the file). Find:

```ts
export const CLAIM_STATUSES = ["draft", "submitted", "processing", "authorized", "denied", "parts_ordered", "repair", "completed", "payment_requested", "paid", "closed"] as const;
```

Replace with:

```ts
export const CLAIM_STATUSES = ["draft", "submitted", "new_unassigned", "assigned", "in_review", "info_requested", "submitted_to_mfr", "processing", "authorized", "approved", "partial_approval", "denied", "appeal_pending", "reopened", "awaiting_parts", "parts_ordered", "ready_for_repair", "repair", "completed", "payment_requested", "awaiting_payment", "paid", "closed"] as const;
```

Note: This adds new values, preserves all existing ones. Existing claim rows with `status=submitted` etc. continue to work.

---

## Step 7 — Append all 18 new tables

At the END of `shared/schema.ts` (after all existing tables and relations, but before any final `export` statements if present), append the 18 new tables. Copy the table definitions verbatim from `PHASE1A-SCHEMA-PATCH.ts`:

1. `events`
2. `notificationDeliveries`
3. `userNotificationPreferences`
4. `technicians`
5. `workOrders`
6. `workOrderLabor`
7. `serviceAppointments`
8. `consignors`
9. `consignmentAgreements`
10. `clientPartsOrders`
11. `lenders`
12. `lenderIntegrations`
13. `financingApplications`
14. `lenderSubmissions`
15. `loanDeals`
16. `campaignTemplates`
17. `campaigns`
18. `emailEvents`
19. `leads`
20. `landingPages`

(That's actually 20 — 18 was a rough count including sub-tables. Use what's in PHASE1A-SCHEMA-PATCH.ts.)

**Important:** copy the full pgTable definitions including all index() entries and JSONB type annotations. Do NOT reorder fields. Do NOT rename columns.

---

## Step 8 — Verify TypeScript compiles

```bash
npm run check 2>&1 | tail -30
```

If TypeScript errors:
- **Missing imports**: ensure `jsonb, date, decimal, index` are imported at the top of `shared/schema.ts` (they likely already are, but verify)
- **Duplicate exports**: rare but possible. Rename the conflicting one by checking what's already defined.
- **Enum syntax**: all enums use `as const` — don't drop that suffix.

If any compile error persists after two fix attempts, STOP and record the error in `PHASE1A-DEPLOY-REPORT.md`. Do NOT proceed to migration.

---

## Step 9 — Generate and apply migration

```bash
npx drizzle-kit generate 2>&1 | tee phase1a-migration-gen.log
```

Review the generated migration file under `migrations/` or `drizzle/` (whichever path drizzle-kit uses). It should contain:
- ALTER TYPE statements for `USER_ROLES` and `CLAIM_STATUSES` adding new values
- ALTER TABLE statements adding new columns to `users`, `dealerships`, `claims`
- CREATE TYPE statements for 10 new enums
- CREATE TABLE statements for all 20 new tables
- CREATE INDEX statements for all new indexes

**CRITICAL CHECK**: scan the migration SQL for any `DROP TABLE`, `DROP COLUMN`, or `ALTER COLUMN ... DROP` operations. If any exist, STOP. The patch is supposed to be purely additive. Report the problem and do not apply the migration.

Apply the migration:

```bash
npx drizzle-kit push 2>&1 | tee phase1a-migration-push.log
```

Drizzle-kit push will prompt for confirmation on enum alterations (Postgres treats enum value additions as non-trivial). Accept all additive prompts. Reject any that involve removing values.

---

## Step 10 — Backfill `users.roles` from `users.role`

After migration applies, populate the new `roles` array column from the existing `role` column:

```bash
# Use the project's existing DB connection helper. Either psql directly or via a TS script.

# Option A — via psql (if DATABASE_URL is set):
psql "$DATABASE_URL" -c "UPDATE users SET roles = jsonb_build_array(role) WHERE roles = '[]'::jsonb OR roles IS NULL;"

# Option B — via a one-off TS script if psql not available:
# Create scripts/backfill-user-roles.ts:
#
#   import { db } from "../server/db";  // adjust path to match project's db export
#   import { users } from "../shared/schema";
#   import { eq, sql } from "drizzle-orm";
#
#   async function main() {
#     const allUsers = await db.select().from(users);
#     for (const u of allUsers) {
#       if (!u.roles || (Array.isArray(u.roles) && u.roles.length === 0)) {
#         await db.update(users).set({ roles: [u.role] }).where(eq(users.id, u.id));
#       }
#     }
#     console.log(`Backfilled roles for ${allUsers.length} users`);
#   }
#   main().catch(err => { console.error(err); process.exit(1); });
#
# Then: npx tsx scripts/backfill-user-roles.ts
```

Verify:

```bash
psql "$DATABASE_URL" -c "SELECT role, roles FROM users LIMIT 5;"
```

Every row should have `roles` populated as a JSON array containing at minimum the legacy `role` value.

---

## Step 11 — Seed test users for new roles (NON-DESTRUCTIVE)

Only adds new rows; does not modify existing users.

Find the existing seed file. Common paths:
- `server/seed.ts`
- `scripts/seed.ts`
- `server/db/seed.ts`

```bash
find . -name "seed.ts" -not -path "./node_modules/*" -type f 2>/dev/null
```

Look at how existing seed users are inserted (password hashing, role assignment). Match that pattern exactly.

Append a new section to the seed script (or create `scripts/seed-phase1a.ts`):

```ts
// seed-phase1a.ts — adds test users for new Phase 1A roles.
// Idempotent: safe to run multiple times. Skips users that already exist.

import bcrypt from "bcrypt";  // or whatever the project uses for hashing
import { db } from "../server/db";
import { users, technicians, consignors, dealerships } from "../shared/schema";
import { eq } from "drizzle-orm";

const PW = "Test@2026!";

async function upsertUser(email: string, firstName: string, lastName: string, role: string, dealershipId: string | null) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`  skip (exists): ${email}`);
    return existing[0];
  }
  const hash = await bcrypt.hash(PW, 10);
  const [created] = await db.insert(users).values({
    email, firstName, lastName,
    passwordHash: hash,
    role: role as any,
    roles: [role],
    dealershipId,
    isActive: true,
  }).returning();
  console.log(`  created: ${email} (${role})`);
  return created;
}

async function main() {
  // Find (or assume) a seed dealership. Use first active dealership.
  const [firstDealer] = await db.select().from(dealerships).limit(1);
  if (!firstDealer) {
    console.log("No dealership in DB; skipping role seeding until a dealership exists.");
    return;
  }
  const dealerId = firstDealer.id;

  console.log(`Seeding Phase 1A test users against dealership: ${firstDealer.name}`);

  const tech = await upsertUser("tech@phase1a.test", "Tina", "Tech", "technician", dealerId);
  const pubBid = await upsertUser("pubbid@phase1a.test", "Pat", "Public", "public_bidder", dealerId);
  const cons = await upsertUser("consignor@phase1a.test", "Charlie", "Consignor", "consignor", dealerId);
  const indieBid = await upsertUser("indiebid@phase1a.test", "Ivy", "Independent", "bidder", null);

  // Also seed the technician extension record
  if (tech) {
    const existingTech = await db.select().from(technicians).where(eq(technicians.userId, tech.id)).limit(1);
    if (existingTech.length === 0) {
      await db.insert(technicians).values({
        userId: tech.id,
        dealershipId: dealerId,
        specializations: ["electrical", "plumbing"],
        hourlyRate: "85.00" as any,
        isAvailable: true,
      });
      console.log(`  created technician record for ${tech.email}`);
    }
  }

  // Also seed the consignor extension record
  if (cons) {
    const existingCons = await db.select().from(consignors).where(eq(consignors.userId, cons.id)).limit(1);
    if (existingCons.length === 0) {
      await db.insert(consignors).values({
        userId: cons.id,
        dealershipId: dealerId,
        contactName: "Charlie Consignor",
        contactPhone: "+1-555-0100",
      });
      console.log(`  created consignor record for ${cons.email}`);
    }
  }

  console.log("Phase 1A seed complete.");
  console.log(`All new users can log in with password: ${PW}`);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
```

Run:
```bash
npx tsx scripts/seed-phase1a.ts
```

---

## Step 12 — Smoke test: verify everything is queryable

Create `scripts/phase1a-smoke.ts`:

```ts
import { db } from "../server/db";
import {
  events, notificationDeliveries, userNotificationPreferences,
  technicians, workOrders, serviceAppointments,
  consignors, consignmentAgreements,
  clientPartsOrders,
  lenders, lenderIntegrations, financingApplications, lenderSubmissions, loanDeals,
  campaignTemplates, campaigns, emailEvents, leads, landingPages,
} from "../shared/schema";

async function count(table: any, label: string) {
  const rows = await db.select().from(table).limit(1);
  console.log(`  ✓ ${label}: queryable`);
}

async function main() {
  console.log("Phase 1A smoke test — verifying all new tables are queryable...");
  await count(events, "events");
  await count(notificationDeliveries, "notification_deliveries");
  await count(userNotificationPreferences, "user_notification_preferences");
  await count(technicians, "technicians");
  await count(workOrders, "work_orders");
  await count(serviceAppointments, "service_appointments");
  await count(consignors, "consignors");
  await count(consignmentAgreements, "consignment_agreements");
  await count(clientPartsOrders, "client_parts_orders");
  await count(lenders, "lenders");
  await count(lenderIntegrations, "lender_integrations");
  await count(financingApplications, "financing_applications");
  await count(lenderSubmissions, "lender_submissions");
  await count(loanDeals, "loan_deals");
  await count(campaignTemplates, "campaign_templates");
  await count(campaigns, "campaigns");
  await count(emailEvents, "email_events");
  await count(leads, "leads");
  await count(landingPages, "landing_pages");
  console.log("All new tables pass.");
}

main().then(() => process.exit(0)).catch(err => { console.error("SMOKE TEST FAILED:", err); process.exit(1); });
```

Run:
```bash
npx tsx scripts/phase1a-smoke.ts
```

All 19 tables should print `✓`. If any fails, note the error in the deploy report.

---

## Step 13 — Commit and push

```bash
git add -A
git commit -m "Phase 1A: additive schema — events bus + techflow + consignment + financing + marketing + 9-role RBAC (non-destructive)"
git push origin main
```

Railway will auto-deploy. Wait ~3 min for deploy to complete.

---

## Step 14 — Write the deploy report

Create `PHASE1A-DEPLOY-REPORT.md` in project root with:

```markdown
# Phase 1A Deploy Report — [timestamp]

## Summary
- Migration: generated / applied / success
- New tables: [list with row counts]
- Column additions: users.roles, dealerships.*, claims.*
- Enum extensions: USER_ROLES, CLAIM_STATUSES, INVITE_ROLES
- Seed users created: [list with emails]
- Smoke test: passed / failed

## Files changed
- shared/schema.ts (extended)
- shared/schema.ts.pre-phase1a.bak (backup, safe to delete after verification)
- [migration files listed]
- scripts/seed-phase1a.ts (new)
- scripts/phase1a-smoke.ts (new)
- scripts/backfill-user-roles.ts (if created)

## Verification output
- npm run check: [result]
- drizzle-kit generate: [result]
- drizzle-kit push: [result]
- Backfill SQL: [rows updated]
- Seed script: [users created]
- Smoke test: [each table ✓/✗]

## Known issues
[list any errors encountered + how resolved, or "none"]

## Ready for Phase 1B
[yes / no — if no, what's blocking]
```

---

## Rollback plan (if needed)

This run is non-destructive — no data loss should occur. But if you need to roll back:

```bash
# 1. Restore schema.ts from backup
cp shared/schema.ts.pre-phase1a.bak shared/schema.ts

# 2. Generate down-migration to drop new tables and columns
# Drizzle-kit doesn't have a native down, so write manual SQL:
psql "$DATABASE_URL" <<SQL
BEGIN;
DROP TABLE IF EXISTS events, notification_deliveries, user_notification_preferences,
  technicians, work_orders, work_order_labor, service_appointments,
  consignors, consignment_agreements, client_parts_orders,
  lenders, lender_integrations, financing_applications, lender_submissions, loan_deals,
  campaign_templates, campaigns, email_events, leads, landing_pages CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS roles;
ALTER TABLE dealerships DROP COLUMN IF EXISTS stripe_connect_account_id, ...;  -- list all
ALTER TABLE claims DROP COLUMN IF EXISTS assigned_to_user_id, ...;

-- Enum rollback is more complex; leave enum values as-is (harmless).
COMMIT;
SQL

# 3. git revert the schema commit
git revert HEAD
git push
```

Existing data (users, dealerships, claims, etc.) is untouched. Only net-new tables and columns are removed.

---

## Constraints

- **Do not** modify any existing table's column types, constraints, or indexes. Only ADD.
- **Do not** rename any existing table or column.
- **Do not** drop the existing `bidder` role — it stays valid (Option B).
- **Do not** remove any enum values — only add new ones.
- **Do not** delete or rename any existing file in the project.
- **Do not** touch `schema-marketplace.ts` (it's already well-integrated with marketplace tables).
- **Do not** launch Phase 1B; this run is 1A only.

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE1A-AUTONOMOUS.md in the project root. Execute all 14 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE1A-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 15-20 minutes.
