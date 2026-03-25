// server/blog/cron.ts

import cron from 'node-cron';
import { processContentQueue } from './generate-post';
import { publishScheduledPosts } from './publish';
import { updateSitemap } from './sitemap-updater';
import { triggerPrerender } from './prerender-trigger';

export function initBlogCron(): void {

  // ─── Generate drafts: Mon, Wed, Fri at 5:00 AM ET ───
  cron.schedule('0 5 * * 1,3,5', async () => {
    console.log('[Cron] Starting content generation...');
    try {
      await processContentQueue();
      console.log('[Cron] Content generation complete');
    } catch (error) {
      console.error('[Cron] Content generation failed:', error);
    }
  }, { timezone: 'America/Toronto' });

  // ─── Check for posts to publish: every hour ───
  cron.schedule('0 * * * *', async () => {
    try {
      const published = await publishScheduledPosts();
      if (published > 0) {
        console.log(`[Cron] Published ${published} posts`);
        await updateSitemap();
        await triggerPrerender();
      }
    } catch (error) {
      console.error('[Cron] Publish check failed:', error);
    }
  }, { timezone: 'America/Toronto' });

  console.log('[Cron] Blog automation initialized');
  console.log('  → Content generation: Mon/Wed/Fri 5:00 AM ET');
  console.log('  → Publish check: Every hour');
}
