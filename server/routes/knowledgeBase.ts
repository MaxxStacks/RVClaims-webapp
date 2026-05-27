// server/routes/knowledgeBase.ts — Knowledge Base API

import { Router, type Request, type Response } from 'express';
import { db } from '../db';
import { knowledgeBaseEntries, unitKnowledgeLinks, units } from '@shared/schema';
import { eq, and, ilike, or, desc, asc, sql, inArray } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { autoLinkNewEntry } from '../lib/knowledgeBase';
import { presignUpload } from '../lib/r2';

const router = Router();
router.use(requireAuth);

// Operators (admin/staff) can see unpublished; all others see only published
function isOperator(role: string) {
  return role === 'operator_admin' || role === 'operator_staff';
}

// ─── GET /api/knowledge-base ─────────────────────────────────────────────────
router.get('/knowledge-base', async (req: Request, res: Response) => {
  const u = req.user!;
  const { manufacturer, contentType, search, modelFamily, page, limit: lim } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(lim || '20', 10)));
  const offset = (pageNum - 1) * pageSize;

  const conditions: any[] = [];

  if (!isOperator(u.role)) {
    conditions.push(eq(knowledgeBaseEntries.isPublished, true));
  }
  if (manufacturer) conditions.push(eq(knowledgeBaseEntries.manufacturer, manufacturer));
  if (contentType) conditions.push(eq(knowledgeBaseEntries.contentType, contentType as any));
  if (modelFamily) conditions.push(ilike(knowledgeBaseEntries.modelFamily, `%${modelFamily}%`));
  if (search) {
    conditions.push(
      or(
        ilike(knowledgeBaseEntries.title, `%${search}%`),
        ilike(knowledgeBaseEntries.description, `%${search}%`),
        ilike(knowledgeBaseEntries.manufacturer, `%${search}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(where)
    .orderBy(desc(knowledgeBaseEntries.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(knowledgeBaseEntries)
    .where(where);

  const total = countRows[0]?.count ?? 0;

  res.json({
    entries: rows,
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

// ─── GET /api/knowledge-base/manufacturers ───────────────────────────────────
router.get('/knowledge-base/manufacturers', async (req: Request, res: Response) => {
  const u = req.user!;
  const publishedOnly = !isOperator(u.role);

  const rows = await db
    .select({
      manufacturer: knowledgeBaseEntries.manufacturer,
      count: sql<number>`count(*)::int`,
    })
    .from(knowledgeBaseEntries)
    .where(publishedOnly ? eq(knowledgeBaseEntries.isPublished, true) : undefined)
    .groupBy(knowledgeBaseEntries.manufacturer)
    .orderBy(asc(knowledgeBaseEntries.manufacturer));

  res.json(rows);
});

// ─── GET /api/knowledge-base/models ─────────────────────────────────────────
router.get('/knowledge-base/models', async (req: Request, res: Response) => {
  const u = req.user!;
  const { manufacturer } = req.query as Record<string, string>;
  if (!manufacturer) return res.json([]);

  const publishedOnly = !isOperator(u.role);
  const conditions: any[] = [eq(knowledgeBaseEntries.manufacturer, manufacturer)];
  if (publishedOnly) conditions.push(eq(knowledgeBaseEntries.isPublished, true));

  const rows = await db
    .select({
      modelFamily: knowledgeBaseEntries.modelFamily,
      count: sql<number>`count(*)::int`,
    })
    .from(knowledgeBaseEntries)
    .where(and(...conditions))
    .groupBy(knowledgeBaseEntries.modelFamily)
    .orderBy(asc(knowledgeBaseEntries.modelFamily));

  res.json(rows.filter(r => r.modelFamily !== null));
});

// ─── GET /api/knowledge-base/:id ─────────────────────────────────────────────
router.get('/knowledge-base/:id', async (req: Request, res: Response) => {
  const [entry] = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(eq(knowledgeBaseEntries.id, req.params.id))
    .limit(1);

  if (!entry) return res.status(404).json({ error: 'Not found' });
  if (!entry.isPublished && !isOperator(req.user!.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Increment view count (non-blocking)
  db.update(knowledgeBaseEntries)
    .set({ viewCount: sql`${knowledgeBaseEntries.viewCount} + 1` })
    .where(eq(knowledgeBaseEntries.id, entry.id))
    .catch(() => {});

  res.json(entry);
});

// ─── POST /api/knowledge-base ────────────────────────────────────────────────
router.post('/knowledge-base', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const {
    title, description, contentType, manufacturer,
    modelFamily, modelNumber, yearStart, yearEnd,
    fileUrl, videoUrl, articleContent, tags, isPublished,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title required' });
  if (!contentType) return res.status(400).json({ error: 'contentType required' });
  if (!manufacturer) return res.status(400).json({ error: 'manufacturer required' });

  const [entry] = await db.insert(knowledgeBaseEntries).values({
    title,
    description: description || null,
    contentType,
    manufacturer,
    modelFamily: modelFamily || null,
    modelNumber: modelNumber || null,
    yearStart: yearStart ? parseInt(String(yearStart), 10) : null,
    yearEnd: yearEnd ? parseInt(String(yearEnd), 10) : null,
    fileUrl: fileUrl || null,
    videoUrl: videoUrl || null,
    articleContent: articleContent || null,
    tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    isPublished: isPublished !== false,
    createdBy: u.id,
  }).returning();

  // Auto-link to matching units
  let linkedUnitsCount = 0;
  try {
    linkedUnitsCount = await autoLinkNewEntry(entry.id);
  } catch (err) {
    console.error('KB auto-link failed (non-blocking):', err);
  }

  res.status(201).json({ entry, linkedUnitsCount });
});

// ─── POST /api/knowledge-base/presign ────────────────────────────────────────
router.post('/knowledge-base/presign', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const { filename, contentType } = req.body;
  if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType required' });

  const allowedTypes = [
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'image/gif', 'video/mp4',
  ];
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Unsupported content type' });
  }

  try {
    const result = await presignUpload({ scope: 'general', contentType, filename });
    res.json({ uploadUrl: result.uploadUrl, publicUrl: result.publicUrl, storageKey: result.storageKey });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// ─── PATCH /api/knowledge-base/:id ──────────────────────────────────────────
router.patch('/knowledge-base/:id', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const [entry] = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(eq(knowledgeBaseEntries.id, req.params.id))
    .limit(1);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const allowed = [
    'title', 'description', 'contentType', 'manufacturer', 'modelFamily', 'modelNumber',
    'yearStart', 'yearEnd', 'fileUrl', 'videoUrl', 'articleContent', 'tags', 'isPublished',
  ];
  const updates: Record<string, any> = { updatedAt: new Date() };
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      if (k === 'yearStart' || k === 'yearEnd') {
        updates[k] = req.body[k] ? parseInt(String(req.body[k]), 10) : null;
      } else if (k === 'tags') {
        updates[k] = Array.isArray(req.body[k])
          ? req.body[k]
          : String(req.body[k]).split(',').map((t: string) => t.trim()).filter(Boolean);
      } else {
        updates[k] = req.body[k];
      }
    }
  }

  await db.update(knowledgeBaseEntries).set(updates).where(eq(knowledgeBaseEntries.id, entry.id));
  const [updated] = await db.select().from(knowledgeBaseEntries).where(eq(knowledgeBaseEntries.id, entry.id)).limit(1);

  // Re-run auto-link if manufacturer/model/year changed
  const changed = ['manufacturer', 'modelFamily', 'modelNumber', 'yearStart', 'yearEnd'].some(k => req.body[k] !== undefined);
  let linkedUnitsCount = 0;
  if (changed) {
    try {
      linkedUnitsCount = await autoLinkNewEntry(entry.id);
    } catch {}
  }

  res.json({ entry: updated, linkedUnitsCount });
});

// ─── DELETE /api/knowledge-base/:id ─────────────────────────────────────────
router.delete('/knowledge-base/:id', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const [entry] = await db
    .select()
    .from(knowledgeBaseEntries)
    .where(eq(knowledgeBaseEntries.id, req.params.id))
    .limit(1);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  // Soft delete — set isPublished = false
  await db.update(knowledgeBaseEntries).set({ isPublished: false, updatedAt: new Date() }).where(eq(knowledgeBaseEntries.id, entry.id));
  res.json({ success: true });
});

// ─── GET /api/units/:unitId/knowledge ────────────────────────────────────────
router.get('/units/:unitId/knowledge', async (req: Request, res: Response) => {
  const u = req.user!;
  const { unitId } = req.params;

  // Access check
  const [unit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  if (!isOperator(u.role)) {
    if (u.role === 'client' && unit.customerId !== u.id) return res.status(403).json({ error: 'Forbidden' });
    if (['dealer_owner', 'dealer_staff', 'service_manager', 'shop_manager', 'parts_dept', 'technician'].includes(u.role) && unit.dealershipId !== u.dealershipId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  // Get all links for this unit
  const links = await db
    .select()
    .from(unitKnowledgeLinks)
    .where(eq(unitKnowledgeLinks.unitId, unitId));

  if (links.length === 0) {
    return res.json({ entries: [], matchTypes: {} });
  }

  const entryIds = links.map(l => l.entryId);
  const matchTypeMap: Record<string, string> = {};
  for (const l of links) {
    matchTypeMap[l.entryId] = l.matchType;
  }

  // Customer-facing content filter
  const customerHiddenTypes = ['wiring_diagram', 'parts_catalog', 'bulletin', 'recall_notice'];

  let entriesQuery = db
    .select()
    .from(knowledgeBaseEntries)
    .where(
      and(
        inArray(knowledgeBaseEntries.id, entryIds),
        eq(knowledgeBaseEntries.isPublished, true),
        ...(u.role === 'client'
          ? [sql`${knowledgeBaseEntries.contentType} NOT IN ('wiring_diagram','parts_catalog','bulletin','recall_notice')`]
          : [])
      )
    );

  const entries = await entriesQuery;

  // Sort: owners_manual first, maintenance_schedule second, then others
  const typeOrder: Record<string, number> = {
    owners_manual: 0,
    maintenance_schedule: 1,
    how_to_article: 2,
    video: 3,
    troubleshooting_guide: 4,
    spec_sheet: 5,
    wiring_diagram: 6,
    parts_catalog: 7,
    bulletin: 8,
    recall_notice: 9,
  };
  entries.sort((a, b) => (typeOrder[a.contentType] ?? 99) - (typeOrder[b.contentType] ?? 99));

  res.json({ entries, matchTypes: matchTypeMap });
});

// ─── POST /api/knowledge-base/:id/link-unit/:unitId ──────────────────────────
router.post('/knowledge-base/:id/link-unit/:unitId', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const { id: entryId, unitId } = req.params;

  // Ensure both exist
  const [entry] = await db.select().from(knowledgeBaseEntries).where(eq(knowledgeBaseEntries.id, entryId)).limit(1);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  const [unit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  // Check if already linked
  const existing = await db
    .select()
    .from(unitKnowledgeLinks)
    .where(and(eq(unitKnowledgeLinks.unitId, unitId), eq(unitKnowledgeLinks.entryId, entryId)))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: 'Already linked', link: existing[0] });
  }

  const [link] = await db.insert(unitKnowledgeLinks).values({
    unitId,
    entryId,
    matchType: 'manual',
    autoLinked: false,
  }).returning();

  res.status(201).json(link);
});

// ─── DELETE /api/knowledge-base/:id/unlink-unit/:unitId ─────────────────────
router.delete('/knowledge-base/:id/unlink-unit/:unitId', async (req: Request, res: Response) => {
  const u = req.user!;
  if (u.role !== 'operator_admin') return res.status(403).json({ error: 'operator_admin only' });

  const { id: entryId, unitId } = req.params;

  await db
    .delete(unitKnowledgeLinks)
    .where(and(eq(unitKnowledgeLinks.unitId, unitId), eq(unitKnowledgeLinks.entryId, entryId)));

  res.json({ success: true });
});

export default router;
