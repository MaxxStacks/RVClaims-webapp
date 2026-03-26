/**
 * DealerSuite360 — Pre-Render Script
 *
 * PURPOSE: Launches a headless browser, loads each marketing page from
 * your running dev/staging server, waits for React to render, then saves
 * the fully-rendered HTML as a static file. These static files are what
 * the crawler middleware serves to search engines and AI bots.
 *
 * USAGE:
 *   1. Start your dev server:  npm run dev
 *   2. In another terminal:    npx tsx scripts/prerender.ts
 *   3. Output goes to:         public/prerendered/
 *
 * WHEN TO RUN:
 *   - After any content change to marketing/landing pages
 *   - Before each deployment
 *   - Can be added to build pipeline: "postbuild": "npx tsx scripts/prerender.ts"
 *
 * REQUIREMENTS:
 *   npm install puppeteer --save-dev
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const CONFIG = {
  baseUrl: process.env.PRERENDER_URL || 'http://localhost:5173',
  outputDir: path.join(process.cwd(), 'public', 'prerendered'),
  renderTimeout: 5000,
  viewport: { width: 1280, height: 800 },
  routes: [
    { path: '/',                    file: 'index.html' },
    { path: '/about',               file: 'about.html' },
    { path: '/services',            file: 'services.html' },
    { path: '/claims-processing',   file: 'claims-processing.html' },
    { path: '/technology',          file: 'technology.html' },
    { path: '/revenue-services',    file: 'revenue-services.html' },
    { path: '/financing',           file: 'financing.html' },
    { path: '/warranty-plans',      file: 'warranty-plans.html' },
    { path: '/fi-services',         file: 'fi-services.html' },
    { path: '/network-marketplace', file: 'network-marketplace.html' },
    { path: '/live-auctions',       file: 'live-auctions.html' },
    { path: '/pricing',             file: 'pricing.html' },
    { path: '/contact',             file: 'contact.html' },
    { path: '/privacy-policy',      file: 'privacy-policy.html' },
    { path: '/signup',              file: 'signup.html' },
    { path: '/rv-types',            file: 'rv-types.html' },
    { path: '/blog',               file: 'blog/index.html' },
    { path: '/dealers',            file: 'dealers/index.html' },
  ],
};

async function fetchBlogSlugs(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/blog?limit=100`);
    const data = await res.json();
    return (data.posts || []).map((p: any) => p.slug as string);
  } catch {
    return [];
  }
}

async function prerender() {
  console.log('─────────────────────────────────────────');
  console.log('  DealerSuite360 Pre-Render Script');
  console.log('─────────────────────────────────────────');
  console.log(`  Base URL:    ${CONFIG.baseUrl}`);
  console.log(`  Output Dir:  ${CONFIG.outputDir}`);
  console.log(`  Routes:      ${CONFIG.routes.length}`);
  console.log('─────────────────────────────────────────\n');

  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  // Append blog post routes dynamically
  const blogSlugs = await fetchBlogSlugs(CONFIG.baseUrl);
  if (blogSlugs.length > 0) {
    console.log(`  Blog posts: ${blogSlugs.length} to prerender`);
    for (const slug of blogSlugs) {
      CONFIG.routes.push({ path: `/blog/${slug}`, file: `blog/${slug}.html` });
    }
  }

  // Append dealer listing routes dynamically
  try {
    const dealersRes = await fetch(`${CONFIG.baseUrl}/api/dealers?limit=500`);
    const dealersData = await dealersRes.json();
    const dealerSlugs: string[] = (dealersData.dealers || []).map((d: any) => d.slug as string).filter(Boolean);
    if (dealerSlugs.length > 0) {
      console.log(`  Dealer listings: ${dealerSlugs.length} to prerender`);
      for (const slug of dealerSlugs) {
        CONFIG.routes.push({ path: `/dealers/listing/${slug}`, file: `dealers/${slug}.html` });
      }
    }
  } catch {
    // no dealers yet — skip silently
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of CONFIG.routes) {
    const url = `${CONFIG.baseUrl}${route.path}`;
    const outputPath = path.join(CONFIG.outputDir, route.file);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    try {
      console.log(`  Rendering: ${route.path} → ${route.file}`);

      const page = await browser.newPage();
      await page.setViewport(CONFIG.viewport);
      await page.setUserAgent(
        'Mozilla/5.0 (compatible; DS360Prerenderer/1.0; +https://dealersuite360.com)'
      );

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, CONFIG.renderTimeout));

      let html = await page.content();

      html = html.replace(
        '<html',
        `<!-- Pre-rendered by DealerSuite360 SEO Pipeline | ${new Date().toISOString()} -->\n<html`
      );

      fs.writeFileSync(outputPath, html, 'utf-8');
      const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`  ✓ Saved: ${route.file} (${fileSize} KB)\n`);
      successCount++;

      await page.close();
    } catch (error) {
      console.error(`  ✗ FAILED: ${route.path}`);
      console.error(`    Error: ${error instanceof Error ? error.message : error}\n`);
      failCount++;
    }
  }

  await browser.close();

  console.log('─────────────────────────────────────────');
  console.log(`  Done! ${successCount} succeeded, ${failCount} failed`);
  console.log(`  Output: ${CONFIG.outputDir}`);
  console.log('─────────────────────────────────────────');

  if (failCount > 0) process.exit(1);
}

prerender().catch(err => {
  console.error('Pre-render script failed:', err);
  process.exit(1);
});
