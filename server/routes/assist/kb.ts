// server/routes/assist/kb.ts — Knowledge Base CRUD (operator-only)
// POST   /api/assist/kb/articles
// GET    /api/assist/kb/articles
// GET    /api/assist/kb/articles/:id
// PUT    /api/assist/kb/articles/:id
// DELETE /api/assist/kb/articles/:id (soft delete → archived)

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { kbArticles, insertKbArticleSchema, updateKbArticleSchema } from "@shared/schema-assist";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireOperator } from "../../middleware/rbac";
import { upsertArticleEmbedding } from "../../lib/vector-store";

const router = Router();

// POST /api/assist/kb/articles — create article
router.post("/", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const parsed = insertKbArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid article data", errors: parsed.error.errors });
    }

    const [article] = await db
      .insert(kbArticles)
      .values({ ...parsed.data, authorId: req.user!.clerkUserId })
      .returning();

    // Embed in background — don't block the response
    upsertArticleEmbedding(article.id, article.title, article.content).catch((e) =>
      console.error("[kb] embedding failed for", article.id, e)
    );

    return res.status(201).json({ success: true, article });
  } catch (err) {
    console.error("Create KB article error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/assist/kb/articles — list articles
router.get("/", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const conditions = [];
    if (req.query.category) {
      conditions.push(eq(kbArticles.category, req.query.category as string));
    }
    if (req.query.status) {
      conditions.push(eq(kbArticles.status, req.query.status as string));
    } else {
      // Default: exclude archived
      conditions.push(eq(kbArticles.status, "published"));
    }

    const articles = await db
      .select()
      .from(kbArticles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(kbArticles.updatedAt));

    return res.json({ success: true, articles });
  } catch (err) {
    console.error("List KB articles error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/assist/kb/articles/:id — get single article
router.get("/:id", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const [article] = await db
      .select()
      .from(kbArticles)
      .where(eq(kbArticles.id, req.params.id))
      .limit(1);

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    return res.json({ success: true, article });
  } catch (err) {
    console.error("Get KB article error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/assist/kb/articles/:id — update article
router.put("/:id", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const parsed = updateKbArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid data", errors: parsed.error.errors });
    }

    const [existing] = await db.select().from(kbArticles).where(eq(kbArticles.id, req.params.id)).limit(1);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const [updated] = await db
      .update(kbArticles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(kbArticles.id, req.params.id))
      .returning();

    // Re-embed if content or title changed
    if (parsed.data.content || parsed.data.title) {
      const newTitle = parsed.data.title ?? updated.title;
      const newContent = parsed.data.content ?? updated.content;
      upsertArticleEmbedding(updated.id, newTitle, newContent).catch((e) =>
        console.error("[kb] re-embedding failed for", updated.id, e)
      );
    }

    return res.json({ success: true, article: updated });
  } catch (err) {
    console.error("Update KB article error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/assist/kb/articles/:id — soft delete (archive)
router.delete("/:id", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(kbArticles).where(eq(kbArticles.id, req.params.id)).limit(1);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    await db
      .update(kbArticles)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(kbArticles.id, req.params.id));

    return res.json({ success: true, message: "Article archived" });
  } catch (err) {
    console.error("Archive KB article error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
