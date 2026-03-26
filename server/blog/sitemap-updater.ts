// server/blog/sitemap-updater.ts

import { db } from '../db';
import { blogPosts, dealerListings } from '@shared/schema';
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

  // ── Dealer listings ──────────────────────────────────────────────────────
  const dealers = await db
    .select({ slug: dealerListings.slug, updatedAt: dealerListings.updatedAt })
    .from(dealerListings)
    .where(eq(dealerListings.listingStatus, 'active'));

  const dealerStartMarker = '<!-- DEALER_LISTINGS_START -->';
  const dealerEndMarker = '<!-- DEALER_LISTINGS_END -->';
  const dStartIdx = existingSitemap.indexOf(dealerStartMarker);
  const dEndIdx = existingSitemap.indexOf(dealerEndMarker);

  if (dStartIdx !== -1 && dEndIdx !== -1) {
    const dealerEntries = dealers.map(d => {
      const lastmod = d.updatedAt
        ? new Date(d.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return `  <url>
    <loc>https://dealersuite360.com/dealers/listing/${d.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('\n');

    const dealerBlock = `${dealerStartMarker}\n${dealerEntries}\n${dealerEndMarker}`;
    existingSitemap =
      existingSitemap.substring(0, dStartIdx) +
      dealerBlock +
      existingSitemap.substring(dEndIdx + dealerEndMarker.length);
  }

  fs.writeFileSync(sitemapPath, existingSitemap, 'utf-8');
  console.log(`[Sitemap] Updated with ${published.length} blog posts and ${dealers.length} dealer listings`);
}
