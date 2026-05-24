// server/lib/vector-store.ts — pgvector embedding operations for DS360 Assist

import OpenAI from "openai";
import { db } from "../db";
import { sql, eq } from "drizzle-orm";
import { kbArticles, type KbArticle } from "@shared/schema-assist";

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn('[AI] OPENAI_API_KEY not set — OpenAI features disabled');
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

// ==================== EMBED TEXT ====================

export async function embedText(text: string): Promise<number[]> {
  if (!openai) throw new Error('OpenAI client not initialized — OPENAI_API_KEY missing');
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8192),
  });
  return response.data[0].embedding;
}

// ==================== CHUNK TEXT ====================

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ==================== UPSERT ARTICLE EMBEDDING ====================

export async function upsertArticleEmbedding(
  articleId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    const textToEmbed = `${title}\n\n${content}`;
    const chunks = chunkText(textToEmbed);

    // For articles, embed the first chunk (representative of the article)
    // Full chunk-per-row storage is a Phase 2 enhancement
    const firstChunk = chunks[0];
    const embedding = await embedText(firstChunk);

    await db
      .update(kbArticles)
      .set({ embedding, updatedAt: new Date() })
      .where(eq(kbArticles.id, articleId));
  } catch (err) {
    console.error("[vector-store] Failed to embed article:", articleId, err);
  }
}

// ==================== SEARCH SIMILAR ====================

export async function searchSimilar(
  query: string,
  limit: number = 5
): Promise<KbArticle[]> {
  try {
    const queryEmbedding = await embedText(query);
    const embeddingStr = JSON.stringify(queryEmbedding);

    // pgvector cosine distance search using raw SQL
    const results = await db.execute(sql`
      SELECT *
      FROM kb_articles
      WHERE status = 'published'
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `);

    return results.rows as unknown as KbArticle[];
  } catch (err) {
    console.error("[vector-store] Similarity search failed:", err);
    return [];
  }
}

// ==================== FORMAT KB CONTEXT ====================

export function formatKbContext(articles: KbArticle[]): string {
  if (articles.length === 0) return "";

  const sections = articles.map((a) => {
    const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "";
    return `### ${a.title}${tags ? ` [${tags}]` : ""}
${a.content}`;
  });

  return `The following knowledge base articles are relevant to this query:\n\n${sections.join("\n\n---\n\n")}`;
}
