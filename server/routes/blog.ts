// server/routes/blog.ts

import { Router } from 'express';
import { db } from '../db';
import { blogPosts, contentQueue } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// ─── PUBLIC ROUTES ───

// GET /api/blog — Published posts list
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;

    const conditions: any[] = [eq(blogPosts.status, 'published')];
    if (category) conditions.push(eq(blogPosts.category, category));

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        category: blogPosts.category,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        readTimeMinutes: blogPosts.readTimeMinutes,
        coverImageUrl: blogPosts.coverImageUrl,
      })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(and(...conditions));

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/admin/drafts — All posts (operator only)
// NOTE: placed before /:slug to avoid route conflict
router.get('/admin/drafts', async (req, res) => {
  try {
    const status = req.query.status as string;
    const conditions = status ? [eq(blogPosts.status, status)] : [];

    const posts = await db
      .select()
      .from(blogPosts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// GET /api/blog/admin/queue — Content queue (operator only)
router.get('/admin/queue', async (req, res) => {
  try {
    const queue = await db
      .select()
      .from(contentQueue)
      .orderBy(desc(contentQueue.scheduledGeneration));

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// POST /api/blog/admin/queue — Add topic to queue
router.post('/admin/queue', async (req, res) => {
  try {
    const { title, targetKeyword, category, promptTemplate, customContext, scheduledGeneration } = req.body;

    const [item] = await db
      .insert(contentQueue)
      .values({
        title,
        targetKeyword,
        category,
        promptTemplate,
        customContext,
        scheduledGeneration: new Date(scheduledGeneration),
        status: 'queued',
      })
      .returning();

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to queue' });
  }
});

// POST /api/blog/admin/generate-now/:id — Trigger immediate generation
router.post('/admin/generate-now/:id', async (req, res) => {
  try {
    const { processContentQueue } = await import('../blog/generate-post');

    await db
      .update(contentQueue)
      .set({ scheduledGeneration: new Date(), status: 'queued' })
      .where(eq(contentQueue.id, parseInt(req.params.id)));

    await processContentQueue();
    res.json({ message: 'Generation triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger generation' });
  }
});

// PUT /api/blog/admin/:id — Update post
router.put('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = { ...req.body };

    if (updates.content) {
      const plainText = updates.content.replace(/<[^>]*>/g, '');
      updates.wordCount = plainText.split(/\s+/).filter(Boolean).length;
      updates.readTimeMinutes = Math.max(1, Math.ceil(updates.wordCount / 250));
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// POST /api/blog/admin/:id/approve — Approve for publishing
router.post('/admin/:id/approve', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { scheduledFor } = req.body;

    const [updated] = await db
      .update(blogPosts)
      .set({
        status: scheduledFor ? 'approved' : 'published',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        publishedAt: scheduledFor ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

// POST /api/blog/admin/:id/archive — Archive post
router.post('/admin/:id/archive', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [updated] = await db
      .update(blogPosts)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive post' });
  }
});

// GET /api/blog/:slug — Single published post
router.get('/:slug', async (req, res) => {
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.slug, req.params.slug),
        eq(blogPosts.status, 'published')
      ))
      .limit(1);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    await db
      .update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, post.id));

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;
