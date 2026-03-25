// server/blog/generate-post.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { blogPosts, contentQueue } from '@shared/schema';
import { PROMPT_TEMPLATES } from './prompt-templates/index';
import { eq } from 'drizzle-orm';

const anthropic = new Anthropic();

interface GenerationResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  tags: string[];
  wordCount: number;
  readTimeMinutes: number;
}

export async function generateBlogPost(queueItem: typeof contentQueue.$inferSelect): Promise<GenerationResult> {
  const template = PROMPT_TEMPLATES[queueItem.promptTemplate as keyof typeof PROMPT_TEMPLATES];

  if (!template) {
    throw new Error(`Unknown prompt template: ${queueItem.promptTemplate}`);
  }

  const userPrompt = `Write a blog post with the following specifications:

Topic: ${queueItem.title}
Target SEO Keyword: ${queueItem.targetKeyword}
Category: ${queueItem.category}
${queueItem.customContext ? `\nAdditional Context:\n${queueItem.customContext}` : ''}

Respond ONLY with valid JSON in this exact structure (no markdown, no backticks, no preamble):
{
  "title": "The blog post title (compelling, includes target keyword naturally)",
  "slug": "url-friendly-slug-with-keyword",
  "excerpt": "150-200 character summary for preview cards and meta description",
  "content": "<h2>...</h2><p>...</p> (full HTML content of the blog post)",
  "metaTitle": "SEO title under 70 characters",
  "metaDescription": "Meta description under 160 characters with target keyword",
  "metaKeywords": "comma, separated, keywords, including, target",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: template.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in API response');
  }

  const cleaned = textContent.text.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned) as GenerationResult;

  const plainText = parsed.content.replace(/<[^>]*>/g, '');
  parsed.wordCount = plainText.split(/\s+/).filter(Boolean).length;
  parsed.readTimeMinutes = Math.max(1, Math.ceil(parsed.wordCount / 250));

  return parsed;
}

export async function processContentQueue(): Promise<void> {
  const now = new Date();

  const pendingItems = await db
    .select()
    .from(contentQueue)
    .where(eq(contentQueue.status, 'queued'));

  const readyItems = pendingItems.filter(
    item => new Date(item.scheduledGeneration) <= now
  );

  console.log(`[Blog] Found ${readyItems.length} items ready for generation`);

  for (const item of readyItems) {
    try {
      await db
        .update(contentQueue)
        .set({ status: 'generating', updatedAt: now })
        .where(eq(contentQueue.id, item.id));

      console.log(`[Blog] Generating: "${item.title}"`);

      const result = await generateBlogPost(item);

      const [newPost] = await db
        .insert(blogPosts)
        .values({
          title: result.title,
          slug: result.slug,
          excerpt: result.excerpt,
          content: result.content,
          metaTitle: result.metaTitle,
          metaDescription: result.metaDescription,
          metaKeywords: result.metaKeywords,
          tags: result.tags,
          targetKeyword: item.targetKeyword,
          category: item.category,
          status: 'review',
          generatedBy: 'anthropic',
          promptTemplate: item.promptTemplate,
          generationModel: 'claude-sonnet-4-6',
          wordCount: result.wordCount,
          readTimeMinutes: result.readTimeMinutes,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      await db
        .update(contentQueue)
        .set({
          status: 'generated',
          generatedPostId: newPost.id,
          updatedAt: now,
        })
        .where(eq(contentQueue.id, item.id));

      console.log(`[Blog] Generated: "${result.title}" (${result.wordCount} words)`);

    } catch (error) {
      console.error(`[Blog] Failed: "${item.title}"`, error);

      await db
        .update(contentQueue)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
          updatedAt: now,
        })
        .where(eq(contentQueue.id, item.id));
    }
  }
}
