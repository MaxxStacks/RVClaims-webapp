// server/blog/sitemap-updater.ts

import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export async function updateSitemap(): Promise<void> {
  const published = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'));

  const sitemapPath = path.join(process.cwd(), 'client', 'public', 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.warn('[Sitemap] sitemap.xml not found, skipping update');
    return;
  }

  let existingSitemap = fs.readFileSync(sitemapPath, 'utf-8');

  const blogStartMarker = '<!-- BLOG_POSTS_START -->';
  const blogEndMarker = '<!-- BLOG_POSTS_END -->';
  const startIdx = existingSitemap.indexOf(blogStartMarker);
  const endIdx = existingSitemap.indexOf(blogEndMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    existingSitemap =
      existingSitemap.substring(0, startIdx) +
      existingSitemap.substring(endIdx + blogEndMarker.length);
  }

  const blogEntries = published.map(post => {
    const lastmod = post.publishedAt
      ? new Date(post.publishedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return `  <url>
    <loc>https://dealersuite360.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('\n');

  const blogBlock = `\n${blogStartMarker}\n${blogEntries}\n${blogEndMarker}\n`;
  existingSitemap = existingSitemap.replace('</urlset>', `${blogBlock}</urlset>`);

  fs.writeFileSync(sitemapPath, existingSitemap, 'utf-8');
  console.log(`[Sitemap] Updated with ${published.length} blog posts`);
}
