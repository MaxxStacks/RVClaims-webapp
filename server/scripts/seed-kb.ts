// server/scripts/seed-kb.ts — Seed knowledge base articles from markdown files
// Run with: npx tsx server/scripts/seed-kb.ts

import "dotenv/config";
import fs from "fs";
import path from "path";
import { db } from "../db";
import { kbArticles } from "@shared/schema-assist";
import { eq } from "drizzle-orm";
import { upsertArticleEmbedding } from "../lib/vector-store";

// ---- Frontmatter parser (no external deps) ----

interface Frontmatter {
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  roles_visible?: string[];
}

function parseFrontmatter(raw: string): { meta: Frontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Missing YAML frontmatter block");

  const yamlBlock = match[1];
  const content = match[2].trim();

  const meta: Record<string, unknown> = {};

  for (const line of yamlBlock.split("\n")) {
    // Array lines (- item)
    if (line.startsWith("  - ")) {
      const key = Object.keys(meta).at(-1)!;
      (meta[key] as string[]).push(line.replace(/^\s*- /, "").replace(/^["']|["']$/g, ""));
      continue;
    }
    // Inline array: key: ["a", "b"]
    const inlineArr = line.match(/^(\w+):\s*\[(.*)\]$/);
    if (inlineArr) {
      meta[inlineArr[1]] = inlineArr[2]
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    // Scalar key: value
    const scalar = line.match(/^(\w+):\s*(.+)$/);
    if (scalar) {
      const val = scalar[2].replace(/^["']|["']$/g, "");
      meta[scalar[1]] = val;
      continue;
    }
    // Array header: key: (no value)
    const arrHeader = line.match(/^(\w+):\s*$/);
    if (arrHeader) {
      meta[arrHeader[1]] = [];
    }
  }

  return {
    meta: meta as unknown as Frontmatter,
    content,
  };
}

// ---- Discover markdown files ----

function discoverFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...discoverFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---- Main ----

async function main() {
  const kbDir = path.resolve(process.cwd(), "knowledge-base");
  if (!fs.existsSync(kbDir)) {
    console.error(`[seed-kb] knowledge-base/ directory not found at: ${kbDir}`);
    process.exit(1);
  }

  const files = discoverFiles(kbDir);
  console.log(`[seed-kb] Found ${files.length} markdown files`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");

    let meta: Frontmatter;
    let content: string;

    try {
      ({ meta, content } = parseFrontmatter(raw));
    } catch (err) {
      console.error(`[seed-kb] Frontmatter parse error in ${filePath}:`, err);
      errors++;
      continue;
    }

    if (!meta.title || !meta.slug || !meta.category) {
      console.error(`[seed-kb] Missing required fields (title/slug/category) in ${filePath}`);
      errors++;
      continue;
    }

    // Check if already exists by slug
    const [existing] = await db
      .select({ id: kbArticles.id, slug: kbArticles.slug })
      .from(kbArticles)
      .where(eq(kbArticles.slug, meta.slug))
      .limit(1);

    if (existing) {
      console.log(`[seed-kb] SKIP  ${meta.slug} (already exists)`);
      skipped++;
      continue;
    }

    // Insert article
    const [article] = await db
      .insert(kbArticles)
      .values({
        title: meta.title,
        slug: meta.slug,
        content,
        category: meta.category,
        subcategory: meta.subcategory ?? null,
        tags: meta.tags ?? [],
        rolesVisible: meta.roles_visible ?? ["dealer_owner", "dealer_staff"],
        status: "published",
        authorId: "seed-script",
      })
      .returning();

    console.log(`[seed-kb] INSERT ${meta.slug}`);
    inserted++;

    // Embed — best-effort, don't fail the seed if OpenAI is unavailable
    try {
      await upsertArticleEmbedding(article.id, article.title, article.content);
      console.log(`[seed-kb]   embedded ${meta.slug}`);
    } catch (embErr) {
      console.warn(`[seed-kb]   embedding skipped for ${meta.slug} (${(embErr as Error).message})`);
    }
  }

  console.log(`\n[seed-kb] Done — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors}`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-kb] Fatal:", err);
  process.exit(1);
});
