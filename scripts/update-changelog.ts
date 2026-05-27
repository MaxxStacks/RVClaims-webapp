#!/usr/bin/env tsx
/**
 * scripts/update-changelog.ts
 *
 * Reads git log, parses commits by conventional-commit prefix, and writes:
 *   - client/src/data/changelog.json  (consumed by the Changelog page)
 *   - CHANGELOG.md                    (project root, human-readable)
 *
 * Safe to run multiple times (idempotent when no new commits).
 * Works even when git is unavailable (e.g. Railway CI with no git history).
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Read current version from package.json ────────────────────────────────────
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { version: string };
const version = pkg.version;
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ── Try to get git log ─────────────────────────────────────────────────────────
interface ParsedCommit {
  hash: string;
  message: string;
}

function getGitCommits(): ParsedCommit[] {
  try {
    const raw = execSync('git log --oneline --no-merges -50', {
      encoding: 'utf-8',
      cwd: ROOT,
      timeout: 10000,
    });
    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const spaceIdx = line.indexOf(' ');
        return {
          hash: spaceIdx > -1 ? line.slice(0, spaceIdx) : line,
          message: spaceIdx > -1 ? line.slice(spaceIdx + 1) : '',
        };
      });
  } catch {
    // git not available — return static fallback
    return [
      {
        hash: 'static',
        message: `feat: v${version} — DS360 platform update`,
      },
    ];
  }
}

// ── Classify commits ──────────────────────────────────────────────────────────
interface VersionEntry {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
  improvements: string[];
  docs: string[];
  other: string[];
}

function stripPrefix(msg: string): string {
  return msg.replace(/^(feat|fix|build|refactor|docs|chore|test|perf|ci|style|revert)(\(.+?\))?!?:\s*/i, '');
}

function classifyCommits(commits: ParsedCommit[]): VersionEntry {
  const entry: VersionEntry = {
    version,
    date: today,
    features: [],
    fixes: [],
    improvements: [],
    docs: [],
    other: [],
  };

  for (const c of commits) {
    const msg = c.message.trim();
    const clean = stripPrefix(msg);
    if (!clean) continue;

    if (/^feat(\(.+?\))?!?:/i.test(msg)) {
      entry.features.push(clean);
    } else if (/^fix(\(.+?\))?!?:/i.test(msg)) {
      entry.fixes.push(clean);
    } else if (/^(build|refactor)(\(.+?\))?!?:/i.test(msg)) {
      entry.improvements.push(clean);
    } else if (/^docs(\(.+?\))?!?:/i.test(msg)) {
      entry.docs.push(clean);
    } else {
      entry.other.push(clean);
    }
  }

  return entry;
}

// ── Load existing changelog.json ──────────────────────────────────────────────
const changelogJsonPath = path.join(ROOT, 'client', 'src', 'data', 'changelog.json');

function loadExistingEntries(): VersionEntry[] {
  try {
    const raw = fs.readFileSync(changelogJsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Write CHANGELOG.md ────────────────────────────────────────────────────────
function renderMarkdown(entries: VersionEntry[]): string {
  const lines: string[] = [
    '# Changelog',
    '',
    'All notable changes to Dealer Suite 360 are documented here.',
    'Generated automatically from git commit history.',
    '',
  ];

  for (const e of entries) {
    lines.push(`## [${e.version}] — ${e.date}`);
    lines.push('');
    if (e.features.length) {
      lines.push('### New Features');
      e.features.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
    if (e.fixes.length) {
      lines.push('### Bug Fixes');
      e.fixes.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
    if (e.improvements.length) {
      lines.push('### Improvements');
      e.improvements.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
    if (e.docs.length) {
      lines.push('### Documentation');
      e.docs.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
    if (e.other.length) {
      lines.push('### Other Changes');
      e.other.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const commits = getGitCommits();
  const newEntry = classifyCommits(commits);

  const existing = loadExistingEntries();

  // Replace the entry for the current version (if it exists) or prepend
  const withoutCurrent = existing.filter(e => e.version !== version);
  const updated = [newEntry, ...withoutCurrent];

  // Write changelog.json
  fs.mkdirSync(path.dirname(changelogJsonPath), { recursive: true });
  fs.writeFileSync(changelogJsonPath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');

  // Write CHANGELOG.md
  const mdPath = path.join(ROOT, 'CHANGELOG.md');
  fs.writeFileSync(mdPath, renderMarkdown(updated), 'utf-8');

  const total =
    newEntry.features.length +
    newEntry.fixes.length +
    newEntry.improvements.length +
    newEntry.docs.length +
    newEntry.other.length;

  console.log(`[update-changelog] v${version} — ${total} commits parsed → changelog.json + CHANGELOG.md updated`);
}

main();
