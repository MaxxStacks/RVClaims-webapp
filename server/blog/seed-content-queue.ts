// server/blog/seed-content-queue.ts

import { db } from '../db';
import { contentQueue, blogCategories } from '@shared/schema';

const INITIAL_TOPICS = [
  // ─── WEEK 1 ───
  {
    title: 'What is a DAF Claim? A Complete Guide for RV Dealers',
    targetKeyword: 'DAF claim RV dealership',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    scheduledGeneration: '2026-03-26T09:00:00Z',
  },
  {
    title: 'The RV Warranty Claims Lifecycle: From Inspection to Payment',
    targetKeyword: 'RV warranty claim process',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    scheduledGeneration: '2026-03-28T09:00:00Z',
  },
  {
    title: 'RV PDI Inspection Best Practices: What Every Dealer Should Check',
    targetKeyword: 'RV PDI checklist dealer',
    category: 'Inspections',
    promptTemplate: 'pdi-inspection',
    scheduledGeneration: '2026-03-31T09:00:00Z',
  },

  // ─── WEEK 2 ───
  {
    title: 'How to Process Jayco Warranty Claims Efficiently',
    targetKeyword: 'Jayco warranty claim process',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    customContext: 'Focus on Jayco-specific FRC codes and their warranty portal requirements. Mention common Jayco claim categories: structural, plumbing, electrical, appliance.',
    scheduledGeneration: '2026-04-02T09:00:00Z',
  },
  {
    title: "Forest River Warranty Claims: A Dealer's Complete Guide",
    targetKeyword: 'Forest River warranty claim',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    customContext: 'Cover Forest River-specific processes. Forest River is a Berkshire Hathaway company with multiple divisions — each may have slight workflow differences.',
    scheduledGeneration: '2026-04-04T09:00:00Z',
  },
  {
    title: 'Why Your RV Dealership Needs a Customer Self-Service Portal',
    targetKeyword: 'RV dealer customer portal',
    category: 'Dealership Operations',
    promptTemplate: 'dealership-operations',
    scheduledGeneration: '2026-04-07T09:00:00Z',
  },

  // ─── WEEK 3 ───
  {
    title: 'Understanding RV FRC Codes: A Manufacturer-by-Manufacturer Breakdown',
    targetKeyword: 'RV FRC codes explained',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    customContext: 'Cover how FRC codes differ across Jayco, Forest River, Heartland, Keystone, Columbia NW, and Midwest Auto. Explain why manufacturer-specific code systems matter for claim approval rates.',
    scheduledGeneration: '2026-04-09T09:00:00Z',
  },
  {
    title: 'Keystone RV Warranty Claims: What Dealers Need to Know',
    targetKeyword: 'Keystone RV warranty process',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    scheduledGeneration: '2026-04-11T09:00:00Z',
  },
  {
    title: 'How Digital Photo Documentation Increases Warranty Claim Approval Rates',
    targetKeyword: 'warranty claim photo documentation',
    category: 'Dealership Operations',
    promptTemplate: 'dealership-operations',
    customContext: 'Cover the requirement for photos per FRC line item. Discuss how organized, properly labeled photos reduce claim denials and speed up processing. Contrast with the common practice of texting photos or saving to random folders.',
    scheduledGeneration: '2026-04-14T09:00:00Z',
  },

  // ─── WEEK 4 ───
  {
    title: 'Extended Warranty Management for RV Dealers: Best Practices',
    targetKeyword: 'RV extended warranty management',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    scheduledGeneration: '2026-04-16T09:00:00Z',
  },
  {
    title: 'The True Cost of Manual Warranty Claims Processing at Your RV Dealership',
    targetKeyword: 'RV dealer warranty management',
    category: 'Dealership Operations',
    promptTemplate: 'dealership-operations',
    customContext: 'Calculate the hidden costs: staff hours on data entry, lost claims from missed deadlines, customer call volume for status updates, errors from manual VIN and FRC entry. Make the case for digital workflow management.',
    scheduledGeneration: '2026-04-18T09:00:00Z',
  },
  {
    title: 'How AI is Transforming RV Dealership Service Departments',
    targetKeyword: 'AI RV dealership software',
    category: 'Industry',
    promptTemplate: 'industry-trends',
    customContext: 'Cover AI document scanning (extracting VIN and data from warranty certs, invoices), AI-powered F&I presentations, VIN tag scanning via phone camera, and how these reduce manual data entry. This is the future DS360 is building toward.',
    scheduledGeneration: '2026-04-21T09:00:00Z',
  },
];

const CATEGORIES = [
  { name: 'Warranty Guides', slug: 'warranty-guides', description: 'Manufacturer-specific warranty claims guides and best practices', sortOrder: 1 },
  { name: 'Inspections', slug: 'inspections', description: 'PDI, DAF, and inspection process guides', sortOrder: 2 },
  { name: 'Dealership Operations', slug: 'dealership-operations', description: 'Efficiency, workflows, and management for RV dealers', sortOrder: 3 },
  { name: 'Industry', slug: 'industry', description: 'RV industry trends, technology, and market insights', sortOrder: 4 },
  { name: 'Guides', slug: 'guides', description: 'Step-by-step how-to guides and tutorials', sortOrder: 5 },
];

export async function seedContentQueue(): Promise<void> {
  console.log('[Seed] Inserting blog categories...');
  for (const cat of CATEGORIES) {
    await db.insert(blogCategories).values(cat).onConflictDoNothing();
  }

  console.log('[Seed] Inserting content queue...');
  for (const topic of INITIAL_TOPICS) {
    await db.insert(contentQueue).values({
      ...topic,
      scheduledGeneration: new Date(topic.scheduledGeneration),
      status: 'queued',
    });
  }

  console.log(`[Seed] Loaded ${INITIAL_TOPICS.length} topics into content queue`);
}

// Run directly: npx tsx server/blog/seed-content-queue.ts
if (process.argv[1]?.includes('seed-content-queue')) {
  import('dotenv/config').then(() =>
    seedContentQueue()
      .then(() => process.exit(0))
      .catch(err => { console.error(err); process.exit(1); })
  );
}
