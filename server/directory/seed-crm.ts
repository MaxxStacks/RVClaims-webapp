// server/directory/seed-crm.ts
// Seeds default CRM tags
// Run once: npx tsx server/directory/seed-crm.ts

import { db } from '../db';
import { crmTags } from '@shared/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_TAGS = [
  { name: 'Small Lot', color: '#6b7280' },
  { name: 'Mid-Size', color: '#3b82f6' },
  { name: 'Large Dealer', color: '#8b5cf6' },
  { name: 'Multi-Location', color: '#ec4899' },
  { name: 'Jayco Dealer', color: '#f59e0b' },
  { name: 'Forest River Dealer', color: '#10b981' },
  { name: 'Heartland Dealer', color: '#ef4444' },
  { name: 'Keystone Dealer', color: '#6366f1' },
  { name: 'Columbia NW Dealer', color: '#14b8a6' },
  { name: 'Ontario', color: '#f97316' },
  { name: 'Quebec', color: '#06b6d4' },
  { name: 'British Columbia', color: '#84cc16' },
  { name: 'Alberta', color: '#a855f7' },
  { name: 'Saskatchewan', color: '#f43f5e' },
  { name: 'Manitoba', color: '#0ea5e9' },
  { name: 'Atlantic Canada', color: '#22d3ee' },
  { name: 'US Northeast', color: '#4f46e5' },
  { name: 'US Southeast', color: '#dc2626' },
  { name: 'US Midwest', color: '#ca8a04' },
  { name: 'US West', color: '#059669' },
  { name: 'US Southwest', color: '#d97706' },
  { name: 'High Priority', color: '#ef4444' },
  { name: 'Cold Lead', color: '#6b7280' },
  { name: 'Referral', color: '#22c55e' },
  { name: 'Uses Competitor', color: '#f97316' },
];

async function seedCrmTags() {
  let inserted = 0;
  let skipped = 0;

  for (const tag of DEFAULT_TAGS) {
    const existing = await db.select().from(crmTags).where(eq(crmTags.name, tag.name));
    if (existing.length > 0) { skipped++; continue; }
    await db.insert(crmTags).values(tag);
    inserted++;
  }

  console.log(`[Seed CRM] Tags: ${inserted} inserted, ${skipped} already existed`);
}

seedCrmTags().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
