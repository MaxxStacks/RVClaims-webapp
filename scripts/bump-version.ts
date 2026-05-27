#!/usr/bin/env tsx
/**
 * scripts/bump-version.ts
 *
 * Reads git log since the last version-bump commit and bumps package.json version:
 *   - BREAKING: in any commit message → major bump
 *   - Any 'feat:' commit → minor bump
 *   - Only 'fix:' commits → patch bump
 *   - No new commits / git unavailable → keep current version
 *
 * Safe to run multiple times (idempotent when no new commits).
 * Does NOT create git tags.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const pkgPath = path.join(ROOT, 'package.json');

// ── Read package.json ─────────────────────────────────────────────────────────
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
  version: string;
  [key: string]: unknown;
};

const [major, minor, patch] = pkg.version.split('.').map(Number);

// ── Get recent commits ────────────────────────────────────────────────────────
function getRecentCommits(): string[] {
  try {
    const raw = execSync('git log --oneline --no-merges -30', {
      encoding: 'utf-8',
      cwd: ROOT,
      timeout: 10000,
    });
    return raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => l.slice(l.indexOf(' ') + 1)); // strip the hash
  } catch {
    return [];
  }
}

// ── Determine bump type ───────────────────────────────────────────────────────
type BumpType = 'major' | 'minor' | 'patch' | 'none';

function determineBump(messages: string[]): BumpType {
  if (!messages.length) return 'none';

  // Exclude commits that are themselves version bumps (chore: bump version)
  const relevant = messages.filter(
    m => !/^chore.*bump.version/i.test(m) && !/^chore.*version bump/i.test(m)
  );

  if (!relevant.length) return 'none';

  if (relevant.some(m => /BREAKING[\s!]/i.test(m))) return 'major';
  if (relevant.some(m => /^feat(\(.+?\))?!?:/i.test(m))) return 'minor';
  if (relevant.some(m => /^fix(\(.+?\))?!?:/i.test(m))) return 'patch';

  // build/refactor/docs → patch
  if (relevant.some(m => /^(build|refactor|docs|perf|ci)(\(.+?\))?!?:/i.test(m))) return 'patch';

  return 'none';
}

// ── Apply bump ────────────────────────────────────────────────────────────────
function applyBump(bump: BumpType): string {
  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return pkg.version;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  // Guard: bail out early if git is not available (e.g. Railway CI builds).
  try { execSync('git --version', { stdio: 'ignore', timeout: 3000 }); } catch {
    console.log('[bump-version] git not available — skipping version bump');
    process.exit(0);
  }

  const commits = getRecentCommits();
  const bump = determineBump(commits);
  const newVersion = applyBump(bump);

  if (newVersion === pkg.version) {
    console.log(`[bump-version] No version change needed (${pkg.version})`);
    return;
  }

  // Write updated package.json preserving formatting
  const raw = fs.readFileSync(pkgPath, 'utf-8');
  const updated = raw.replace(
    /"version":\s*"[^"]*"/,
    `"version": "${newVersion}"`
  );
  fs.writeFileSync(pkgPath, updated, 'utf-8');

  console.log(`[bump-version] ${bump} bump: ${pkg.version} → ${newVersion}`);
}

main();
