// server/blog/publish.ts

import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function publishScheduledPosts(): Promise<number> {
  const now = new Date();

  const readyPosts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'approved'));

  const toPublish = readyPosts.filter(post => {
    if (!post.scheduledFor) return true;
    return new Date(post.scheduledFor) <= now;
  });

  for (const post of toPublish) {
    await db
      .update(blogPosts)
      .set({
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(blogPosts.id, post.id));

    console.log(`[Publish] "${post.title}" is now live at /blog/${post.slug}`);
  }

  return toPublish.length;
}
