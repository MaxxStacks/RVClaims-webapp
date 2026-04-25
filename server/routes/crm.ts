// server/routes/crm.ts — Operator CRM routes (requireAuth + operator roles)

import { Router } from 'express';
import { db } from '../db';
import {
  dealerListings, crmPipeline, crmActivities, crmTags, crmDealerTags,
  crmAttachments, dealerReviews, dealerMessages, quoteRequests,
} from '@shared/schema';
import { eq, and, or, ilike, desc, asc, sql, inArray, lt, gte } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { generateSlug } from '../directory/import-dealers';

const router = Router();
const opRoles = requireRole('operator_admin', 'operator_staff');
const adminOnly = requireRole('operator_admin');

// ─── GET /api/crm/dashboard — Stats ───
router.get('/dashboard', requireAuth, opRoles, async (req, res) => {
  try {
    const now = new Date();

    const [totalCount] = await db.select({ count: sql<number>`count(*)` }).from(dealerListings);
    const [caCount] = await db.select({ count: sql<number>`count(*)` }).from(dealerListings).where(eq(dealerListings.country, 'CA'));
    const [usCount] = await db.select({ count: sql<number>`count(*)` }).from(dealerListings).where(eq(dealerListings.country, 'US'));
    const [claimedCount] = await db.select({ count: sql<number>`count(*)` }).from(dealerListings).where(eq(dealerListings.isClaimed, true));
    const [verifiedCount] = await db.select({ count: sql<number>`count(*)` }).from(dealerListings).where(eq(dealerListings.isVerified, true));

    const pipeline = await db.select({
      stage: crmPipeline.stage,
      count: sql<number>`count(*)`,
    }).from(crmPipeline).groupBy(crmPipeline.stage);

    const overdueFollowUps = await db.select({ count: sql<number>`count(*)` })
      .from(crmPipeline).where(lt(crmPipeline.nextFollowUp, now));

    const recentActivity = await db.select({
      id: crmActivities.id,
      dealerListingId: crmActivities.dealerListingId,
      activityType: crmActivities.activityType,
      title: crmActivities.title,
      createdAt: crmActivities.createdAt,
    }).from(crmActivities)
      .orderBy(desc(crmActivities.createdAt))
      .limit(20);

    // Enrich with dealer names
    const dealerIds = [...new Set(recentActivity.map(a => a.dealerListingId))];
    const dealers = dealerIds.length > 0
      ? await db.select({ id: dealerListings.id, name: dealerListings.name, city: dealerListings.city })
          .from(dealerListings).where(inArray(dealerListings.id, dealerIds))
      : [];
    const dealerMap = Object.fromEntries(dealers.map(d => [d.id, d]));

    res.json({
      total: Number(totalCount.count),
      canada: Number(caCount.count),
      us: Number(usCount.count),
      claimed: Number(claimedCount.count),
      verified: Number(verifiedCount.count),
      pipelineBreakdown: pipeline.map(p => ({ stage: p.stage, count: Number(p.count) })),
      overdueFollowUps: Number(overdueFollowUps[0].count),
      recentActivity: recentActivity.map(a => ({ ...a, dealer: dealerMap[a.dealerListingId] || null })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ─── GET /api/crm/dealers — Full dealer list ───
router.get('/dealers', requireAuth, opRoles, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const stage = req.query.stage as string;
    const country = req.query.country as string;
    const claimed = req.query.claimed as string;
    const verified = req.query.verified as string;

    const conditions: any[] = [];
    if (search) {
      conditions.push(or(
        ilike(dealerListings.name, `%${search}%`),
        ilike(dealerListings.city, `%${search}%`),
        ilike(dealerListings.stateProvince, `%${search}%`),
        ilike(dealerListings.email, `%${search}%`),
        ilike(dealerListings.phone, `%${search}%`),
      ));
    }
    if (country) conditions.push(eq(dealerListings.country, country.toUpperCase()));
    if (claimed === 'true') conditions.push(eq(dealerListings.isClaimed, true));
    if (claimed === 'false') conditions.push(eq(dealerListings.isClaimed, false));
    if (verified === 'true') conditions.push(eq(dealerListings.isVerified, true));

    // Join with pipeline for stage filter
    const dealers = await db.select({
      id: dealerListings.id,
      name: dealerListings.name,
      slug: dealerListings.slug,
      city: dealerListings.city,
      stateProvince: dealerListings.stateProvince,
      country: dealerListings.country,
      phone: dealerListings.phone,
      email: dealerListings.email,
      website: dealerListings.website,
      brandsCarried: dealerListings.brandsCarried,
      listingStatus: dealerListings.listingStatus,
      isVerified: dealerListings.isVerified,
      isClaimed: dealerListings.isClaimed,
      listingTier: dealerListings.listingTier,
      pageViews: dealerListings.pageViews,
      dataQuality: dealerListings.dataQuality,
      createdAt: dealerListings.createdAt,
      // Pipeline fields via join
      pipelineId: crmPipeline.id,
      stage: crmPipeline.stage,
      assignedTo: crmPipeline.assignedTo,
      nextFollowUp: crmPipeline.nextFollowUp,
      leadSource: crmPipeline.leadSource,
      estimatedValue: crmPipeline.estimatedValue,
    }).from(dealerListings)
      .leftJoin(crmPipeline, eq(crmPipeline.dealerListingId, dealerListings.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(dealerListings.updatedAt))
      .limit(limit)
      .offset(offset);

    const filtered = stage ? dealers.filter(d => d.stage === stage) : dealers;

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(dealerListings)
      .where(conditions.length ? and(...conditions) : undefined);

    res.json({ dealers: filtered, pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// ─── GET /api/crm/dealers/:id — Single dealer with full CRM ───
router.get('/dealers/:id', requireAuth, opRoles, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [dealer] = await db.select().from(dealerListings).where(eq(dealerListings.id, id)).limit(1);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const [pipeline] = await db.select().from(crmPipeline)
      .where(eq(crmPipeline.dealerListingId, id)).limit(1);

    const tags = await db.select({ id: crmTags.id, name: crmTags.name, color: crmTags.color })
      .from(crmDealerTags)
      .innerJoin(crmTags, eq(crmTags.id, crmDealerTags.tagId))
      .where(eq(crmDealerTags.dealerListingId, id));

    const reviews = await db.select().from(dealerReviews)
      .where(eq(dealerReviews.dealerListingId, id))
      .orderBy(desc(dealerReviews.createdAt));

    const messages = await db.select().from(dealerMessages)
      .where(eq(dealerMessages.dealerListingId, id))
      .orderBy(desc(dealerMessages.createdAt));

    const attachments = await db.select().from(crmAttachments)
      .where(eq(crmAttachments.dealerListingId, id))
      .orderBy(desc(crmAttachments.createdAt));

    res.json({ dealer, pipeline, tags, reviews, messages, attachments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dealer' });
  }
});

// ─── PUT /api/crm/dealers/:id — Update dealer ───
router.put('/dealers/:id', requireAuth, opRoles, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id; delete updates.slug; delete updates.createdAt;

    const [updated] = await db.update(dealerListings).set(updates).where(eq(dealerListings.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dealer' });
  }
});

// ─── DELETE /api/crm/dealers/:id — Remove dealer ───
router.delete('/dealers/:id', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(dealerListings).set({ listingStatus: 'suspended', updatedAt: new Date() }).where(eq(dealerListings.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove dealer' });
  }
});

// ─── POST /api/crm/dealers — Create dealer manually ───
router.post('/dealers', requireAuth, opRoles, async (req, res) => {
  try {
    const { name, city, stateProvince, country, phone, email, website, brandsCarried } = req.body;
    if (!name || !city) return res.status(400).json({ error: 'Name and city required' });

    const slug = generateSlug(name, city, stateProvince || '');
    const [dealer] = await db.insert(dealerListings).values({
      name, slug, city,
      stateProvince: stateProvince || undefined,
      country: country || 'CA',
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      brandsCarried: Array.isArray(brandsCarried) ? brandsCarried : undefined,
      dataSource: 'manual',
      dataQuality: 'enriched',
    }).returning();

    await db.insert(crmPipeline).values({ dealerListingId: dealer.id, stage: 'prospect', leadSource: 'manual' });
    res.status(201).json(dealer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dealer' });
  }
});

// ─── GET /api/crm/pipeline — Pipeline grouped by stage ───
router.get('/pipeline', requireAuth, opRoles, async (req, res) => {
  try {
    const dealers = await db.select({
      id: dealerListings.id,
      name: dealerListings.name,
      city: dealerListings.city,
      stateProvince: dealerListings.stateProvince,
      country: dealerListings.country,
      isVerified: dealerListings.isVerified,
      isClaimed: dealerListings.isClaimed,
      pipelineId: crmPipeline.id,
      stage: crmPipeline.stage,
      assignedTo: crmPipeline.assignedTo,
      nextFollowUp: crmPipeline.nextFollowUp,
      leadSource: crmPipeline.leadSource,
      estimatedValue: crmPipeline.estimatedValue,
      stageChangedAt: crmPipeline.stageChangedAt,
    }).from(crmPipeline)
      .innerJoin(dealerListings, eq(dealerListings.id, crmPipeline.dealerListingId))
      .orderBy(asc(crmPipeline.stageChangedAt));

    const STAGES = ['prospect', 'claimed_page', 'contacted', 'demo_scheduled', 'demo_done', 'negotiating', 'onboarded', 'active_customer', 'lost', 'not_interested'];
    const grouped: Record<string, any[]> = {};
    STAGES.forEach(s => { grouped[s] = []; });
    dealers.forEach(d => {
      const stage = d.stage || 'prospect';
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(d);
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// ─── PUT /api/crm/pipeline/:id/stage — Change stage ───
router.put('/pipeline/:id/stage', requireAuth, opRoles, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { stage, lostReason } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage required' });

    const now = new Date();
    const [updated] = await db.update(crmPipeline).set({
      stage, stageChangedAt: now, updatedAt: now,
      lostReason: lostReason || undefined,
    }).where(eq(crmPipeline.id, id)).returning();

    // Log activity
    if (updated) {
      await db.insert(crmActivities).values({
        dealerListingId: updated.dealerListingId,
        activityType: 'stage_change',
        title: `Stage changed to ${stage.replace(/_/g, ' ')}`,
        createdBy: 'operator',
        metadata: { newStage: stage, lostReason },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

// ─── PUT /api/crm/pipeline/:id/followup — Set follow-up ───
router.put('/pipeline/:id/followup', requireAuth, opRoles, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nextFollowUp, followUpNote } = req.body;

    const [updated] = await db.update(crmPipeline).set({
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      followUpNote: followUpNote || null,
      updatedAt: new Date(),
    }).where(eq(crmPipeline.id, id)).returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set follow-up' });
  }
});

// ─── PUT /api/crm/pipeline/:id/assign — Assign to staff ───
router.put('/pipeline/:id/assign', requireAuth, opRoles, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { assignedTo } = req.body;
    const [updated] = await db.update(crmPipeline).set({ assignedTo, updatedAt: new Date() }).where(eq(crmPipeline.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign' });
  }
});

// ─── GET /api/crm/activities/:dealerId — Activity log ───
router.get('/activities/:dealerId', requireAuth, opRoles, async (req, res) => {
  try {
    const dealerId = parseInt(req.params.dealerId);
    const activities = await db.select().from(crmActivities)
      .where(eq(crmActivities.dealerListingId, dealerId))
      .orderBy(desc(crmActivities.createdAt));
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// ─── POST /api/crm/activities — Log activity ───
router.post('/activities', requireAuth, opRoles, async (req, res) => {
  try {
    const { dealerListingId, activityType, title, description } = req.body;
    if (!dealerListingId || !activityType || !title) {
      return res.status(400).json({ error: 'dealerListingId, activityType, and title required' });
    }
    const user = (req as any).user;
    const [activity] = await db.insert(crmActivities).values({
      dealerListingId: parseInt(dealerListingId),
      activityType, title, description,
      createdBy: user ? `${user.firstName} ${user.lastName}` : 'operator',
    }).returning();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// ─── GET /api/crm/tags — List tags ───
router.get('/tags', requireAuth, opRoles, async (_req, res) => {
  try {
    const tags = await db.select().from(crmTags).orderBy(asc(crmTags.name));
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// ─── POST /api/crm/tags — Create tag ───
router.post('/tags', requireAuth, opRoles, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name required' });
    const [tag] = await db.insert(crmTags).values({ name, color: color || '#4f8cff' }).returning();
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// ─── DELETE /api/crm/tags/:id — Delete tag ───
router.delete('/tags/:id', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(crmDealerTags).where(eq(crmDealerTags.tagId, id));
    await db.delete(crmTags).where(eq(crmTags.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// ─── POST /api/crm/dealers/:id/tags — Add tag to dealer ───
router.post('/dealers/:id/tags', requireAuth, opRoles, async (req, res) => {
  try {
    const dealerListingId = parseInt(req.params.id);
    const { tagId } = req.body;
    if (!tagId) return res.status(400).json({ error: 'tagId required' });

    const existing = await db.select().from(crmDealerTags)
      .where(and(eq(crmDealerTags.dealerListingId, dealerListingId), eq(crmDealerTags.tagId, parseInt(tagId))));
    if (existing.length > 0) return res.json({ success: true, alreadyExists: true });

    const [dt] = await db.insert(crmDealerTags).values({ dealerListingId, tagId: parseInt(tagId) }).returning();
    res.status(201).json(dt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// ─── DELETE /api/crm/dealers/:id/tags/:tagId — Remove tag from dealer ───
router.delete('/dealers/:id/tags/:tagId', requireAuth, opRoles, async (req, res) => {
  try {
    const dealerListingId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    await db.delete(crmDealerTags)
      .where(and(eq(crmDealerTags.dealerListingId, dealerListingId), eq(crmDealerTags.tagId, tagId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// ─── POST /api/crm/reviews/:id/moderate — Moderate review ───
router.post('/reviews/:id/moderate', requireAuth, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['approved', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, flagged, or removed' });
    }
    const [updated] = await db.update(dealerReviews)
      .set({ status, updatedAt: new Date() })
      .where(eq(dealerReviews.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to moderate review' });
  }
});

// ─── GET /api/crm/follow-ups — Today's and overdue follow-ups ───
router.get('/follow-ups', requireAuth, opRoles, async (_req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const followUps = await db.select({
      id: dealerListings.id,
      name: dealerListings.name,
      city: dealerListings.city,
      stateProvince: dealerListings.stateProvince,
      pipelineId: crmPipeline.id,
      stage: crmPipeline.stage,
      nextFollowUp: crmPipeline.nextFollowUp,
      followUpNote: crmPipeline.followUpNote,
      assignedTo: crmPipeline.assignedTo,
    }).from(crmPipeline)
      .innerJoin(dealerListings, eq(dealerListings.id, crmPipeline.dealerListingId))
      .where(lt(crmPipeline.nextFollowUp, tomorrow))
      .orderBy(asc(crmPipeline.nextFollowUp));

    res.json(followUps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// ─── POST /api/crm/export — CSV export ───
router.post('/export', requireAuth, opRoles, async (req, res) => {
  try {
    const { stage, country } = req.body;
    const conditions: any[] = [];
    if (country) conditions.push(eq(dealerListings.country, country));

    const dealers = await db.select({
      name: dealerListings.name,
      city: dealerListings.city,
      stateProvince: dealerListings.stateProvince,
      country: dealerListings.country,
      phone: dealerListings.phone,
      email: dealerListings.email,
      website: dealerListings.website,
      isClaimed: dealerListings.isClaimed,
      isVerified: dealerListings.isVerified,
      stage: crmPipeline.stage,
      assignedTo: crmPipeline.assignedTo,
      nextFollowUp: crmPipeline.nextFollowUp,
      leadSource: crmPipeline.leadSource,
    }).from(dealerListings)
      .leftJoin(crmPipeline, eq(crmPipeline.dealerListingId, dealerListings.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(dealerListings.name));

    const filtered = stage ? dealers.filter(d => d.stage === stage) : dealers;

    const headers = ['Name', 'City', 'Province/State', 'Country', 'Phone', 'Email', 'Website', 'Claimed', 'Verified', 'Pipeline Stage', 'Assigned To', 'Next Follow-Up', 'Lead Source'];
    const rows = filtered.map(d => [
      d.name, d.city, d.stateProvince, d.country,
      d.phone || '', d.email || '', d.website || '',
      d.isClaimed ? 'Yes' : 'No',
      d.isVerified ? 'Yes' : 'No',
      d.stage || '', d.assignedTo || '',
      d.nextFollowUp ? new Date(d.nextFollowUp).toISOString().split('T')[0] : '',
      d.leadSource || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dealers-export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

// ─── POST /api/crm/import — CSV import ───
router.post('/import', requireAuth, adminOnly, async (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ error: 'csvContent required' });

    const fs = await import('fs');
    const path = await import('path');
    const tmpPath = path.join(process.cwd(), 'tmp-import.csv');
    fs.writeFileSync(tmpPath, csvContent, 'utf-8');

    const { importDealersFromCSV } = await import('../directory/import-dealers');
    const result = await importDealersFromCSV(tmpPath);
    fs.unlinkSync(tmpPath);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Import failed' });
  }
});

// ─── PUT /api/crm/bulk/stage — Bulk stage change ───
router.put('/bulk/stage', requireAuth, opRoles, async (req, res) => {
  try {
    const { dealerIds, stage } = req.body;
    if (!Array.isArray(dealerIds) || !stage) {
      return res.status(400).json({ error: 'dealerIds array and stage required' });
    }
    const now = new Date();
    await db.update(crmPipeline)
      .set({ stage, stageChangedAt: now, updatedAt: now })
      .where(inArray(crmPipeline.dealerListingId, dealerIds));
    res.json({ success: true, updated: dealerIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

export default router;
