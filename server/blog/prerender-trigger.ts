// server/blog/prerender-trigger.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function triggerPrerender(): Promise<void> {
  try {
    console.log('[Prerender] Triggering static snapshot regeneration...');
    const { stderr } = await execAsync('npm run prerender', {
      cwd: process.cwd(),
      timeout: 120000,
    });
    console.log('[Prerender] Complete');
    if (stderr) console.warn('[Prerender] Warnings:', stderr);
  } catch (error) {
    console.error('[Prerender] Failed:', error);
    // Don't throw — prerender failure shouldn't block publishing
  }
}
