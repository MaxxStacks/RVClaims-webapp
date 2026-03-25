/**
 * DealerSuite360 — Crawler Detection Middleware
 *
 * PURPOSE: Intercepts requests from search engine and AI crawlers,
 * serves them a fully-rendered static HTML snapshot instead of the
 * empty React SPA shell. Human visitors get the normal SPA experience.
 *
 * HOW IT WORKS:
 * 1. Checks the User-Agent header against known crawler patterns
 * 2. If crawler detected → serves pre-rendered HTML from /public/prerendered/
 * 3. If human visitor → passes through to the normal Vite/React SPA
 *
 * INSTALLATION:
 * Add this middleware BEFORE your static file serving and SPA catch-all
 * in server/index.ts. See SEO-INTEGRATION.md for exact placement.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// ─── Crawler User-Agent Patterns ───
const CRAWLER_PATTERNS: RegExp[] = [
  // Search Engine Crawlers
  /googlebot/i,
  /google-inspectiontool/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,

  // AI Search & Indexers
  /gptbot/i,
  /chatgpt-user/i,
  /claude-web/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /cohere-ai/i,
  /meta-externalagent/i,
  /bytespider/i,
  /amazonbot/i,
  /youbot/i,

  // Social Media Previews
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /discordbot/i,
  /whatsapp/i,
  /telegrambot/i,

  // SEO Tools
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /screaming frog/i,

  // Generic
  /ia_archiver/i,
  /archive\.org_bot/i,
];

// ─── Route-to-File Mapping ───
// Maps URL paths to their pre-rendered HTML files in public/prerendered/
const ROUTE_MAP: Record<string, string> = {
  '/':                    'index.html',
  '/about':               'about.html',
  '/services':            'services.html',
  '/claims-processing':   'claims-processing.html',
  '/technology':          'technology.html',
  '/revenue-services':    'revenue-services.html',
  '/financing':           'financing.html',
  '/warranty-plans':      'warranty-plans.html',
  '/fi-services':         'fi-services.html',
  '/network-marketplace': 'network-marketplace.html',
  '/live-auctions':       'live-auctions.html',
  '/pricing':             'pricing.html',
  '/contact':             'contact.html',
  '/privacy-policy':      'privacy-policy.html',
  '/signup':              'signup.html',
  '/rv-types':            'rv-types.html',
};

function isCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return CRAWLER_PATTERNS.some(pattern => pattern.test(userAgent));
}

export function crawlerMiddleware(prerenderedDir?: string) {
  const baseDir = prerenderedDir || path.join(process.cwd(), 'public', 'prerendered');

  return (req: Request, res: Response, next: NextFunction): void => {
    const userAgent = req.headers['user-agent'];

    if (req.method !== 'GET' || !isCrawler(userAgent)) {
      return next();
    }

    const urlPath = req.path.replace(/\/+$/, '') || '/';
    const fileName = ROUTE_MAP[urlPath];

    if (!fileName) {
      // Portal routes (/operator, /dealer, /portal, /bidder) fall through intentionally
      return next();
    }

    const filePath = path.join(baseDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`[SEO] Pre-rendered file missing: ${filePath} (UA: ${userAgent?.substring(0, 50)})`);
      return next();
    }

    console.log(`[SEO] Serving pre-rendered: ${urlPath} → ${fileName}`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Prerendered', 'true');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(filePath);
  };
}

export { isCrawler };
