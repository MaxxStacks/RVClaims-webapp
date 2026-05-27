// server/lib/knowledgeBase.ts — KB auto-link utilities

import { db } from '../db';
import { knowledgeBaseEntries, unitKnowledgeLinks, units } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Auto-link KB entries to a newly created unit.
 * Called after unit insert. Returns count of new links created.
 */
export async function autoLinkKnowledgeBase(
  unitId: string,
  manufacturer: string | null | undefined,
  model: string | null | undefined,
  year: string | number | null | undefined,
): Promise<number> {
  if (!manufacturer) return 0;

  const unitYear = year ? parseInt(String(year)) : null;

  const entries = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(
      and(
        eq(knowledgeBaseEntries.manufacturer, manufacturer),
        eq(knowledgeBaseEntries.isPublished, true),
      ),
    );

  const matchedLinks: Array<{ entryId: string; matchType: string }> = [];

  for (const entry of entries) {
    // Year range filter
    if (unitYear !== null) {
      if (entry.yearStart !== null && entry.yearStart !== undefined && unitYear < entry.yearStart) continue;
      if (entry.yearEnd !== null && entry.yearEnd !== undefined && unitYear > entry.yearEnd) continue;
    }

    let matchType: string | null = null;

    if (entry.modelNumber && model) {
      // Exact: modelNumber matches unit model string
      if (
        model.toLowerCase().includes(entry.modelNumber.toLowerCase()) ||
        entry.modelNumber.toLowerCase().includes(model.toLowerCase())
      ) {
        matchType = 'exact';
      }
    } else if (entry.modelFamily && model) {
      // Model family match
      if (
        model.toLowerCase().includes(entry.modelFamily.toLowerCase()) ||
        entry.modelFamily.toLowerCase().includes(model.toLowerCase())
      ) {
        matchType = 'model_family';
      }
    } else if (!entry.modelNumber && !entry.modelFamily) {
      // Manufacturer-wide content
      matchType = 'manufacturer';
    }

    if (matchType) {
      matchedLinks.push({ entryId: entry.id, matchType });
    }
  }

  let created = 0;
  for (const link of matchedLinks) {
    try {
      const existing = await db
        .select()
        .from(unitKnowledgeLinks)
        .where(
          and(
            eq(unitKnowledgeLinks.unitId, unitId),
            eq(unitKnowledgeLinks.entryId, link.entryId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(unitKnowledgeLinks).values({
          unitId,
          entryId: link.entryId,
          matchType: link.matchType as any,
          autoLinked: true,
        });
        created++;
      }
    } catch {
      // Skip duplicate constraint errors silently
    }
  }

  return created;
}

/**
 * When a new KB entry is created, find all matching units and link them.
 * Returns count of new links created.
 */
export async function autoLinkNewEntry(entryId: string): Promise<number> {
  const entryRows = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(eq(knowledgeBaseEntries.id, entryId))
    .limit(1);

  if (!entryRows[0]) return 0;
  const e = entryRows[0];

  const allUnits = await db
    .select()
    .from(units)
    .where(eq(units.manufacturer, e.manufacturer));

  let created = 0;
  for (const unit of allUnits) {
    // Year range filter
    if (unit.year !== null && unit.year !== undefined) {
      if (e.yearStart !== null && e.yearStart !== undefined && unit.year < e.yearStart) continue;
      if (e.yearEnd !== null && e.yearEnd !== undefined && unit.year > e.yearEnd) continue;
    }

    let matchType: string | null = null;
    if (e.modelNumber && unit.model) {
      if (unit.model.toLowerCase().includes(e.modelNumber.toLowerCase())) matchType = 'exact';
    } else if (e.modelFamily && unit.model) {
      if (unit.model.toLowerCase().includes(e.modelFamily.toLowerCase())) matchType = 'model_family';
    } else if (!e.modelNumber && !e.modelFamily) {
      matchType = 'manufacturer';
    }

    if (!matchType) continue;

    try {
      const existing = await db
        .select()
        .from(unitKnowledgeLinks)
        .where(
          and(
            eq(unitKnowledgeLinks.unitId, unit.id),
            eq(unitKnowledgeLinks.entryId, entryId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(unitKnowledgeLinks).values({
          unitId: unit.id,
          entryId,
          matchType: matchType as any,
          autoLinked: true,
        });
        created++;
      }
    } catch {
      // Skip duplicate constraint errors silently
    }
  }

  return created;
}
