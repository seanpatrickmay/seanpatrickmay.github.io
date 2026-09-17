#!/usr/bin/env node
/**
 * Fails when any live data file has gone stale.
 *
 * The Garmin refresh broke on 2026-03-21 and nothing noticed until
 * 2026-09-17 — six months of the training card presenting dead numbers as
 * current. The workflow was failing daily the whole time; no one was reading
 * the Actions tab. This turns that into a red X the next morning.
 *
 * Usage:
 *   node scripts/check_freshness.mjs          # exits 1 if anything is stale
 *   node scripts/check_freshness.mjs --warn   # always exits 0, still reports
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');

// Every feed refreshes daily. The allowance covers a few consecutive upstream
// hiccups without crying wolf, while still catching a real outage in a week
// rather than half a year.
const FEEDS = [
  { file: 'stats.json', label: 'Garmin training', maxAgeDays: 10 },
  { file: 'goodreads.json', label: 'Goodreads reading', maxAgeDays: 10 },
  { file: 'spotify.json', label: 'Spotify top 10', maxAgeDays: 10 },
  { file: 'duolingo.json', label: 'Duolingo progress', maxAgeDays: 10 },
];

const warnOnly = process.argv.includes('--warn');
const isCI = Boolean(process.env.GITHUB_ACTIONS);

function ageInDays(iso) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / 86_400_000;
}

const results = [];
for (const feed of FEEDS) {
  const path = resolve(PUBLIC_DIR, feed.file);
  let generatedAt = null;
  let problem = null;

  try {
    generatedAt = JSON.parse(readFileSync(path, 'utf8')).generated_at ?? null;
    if (!generatedAt) problem = 'no generated_at field';
  } catch (err) {
    problem = err.code === 'ENOENT' ? 'file missing' : `unreadable (${err.message})`;
  }

  const age = generatedAt ? ageInDays(generatedAt) : null;
  if (!problem && age === null) problem = `unparseable generated_at: ${generatedAt}`;
  const stale = !problem && age > feed.maxAgeDays;

  results.push({ ...feed, generatedAt, age, problem, stale });
}

const bad = results.filter(r => r.problem || r.stale);

console.log('Data freshness:');
for (const r of results) {
  if (r.problem) {
    console.log(`  ✗ ${r.label.padEnd(18)} ${r.problem}`);
  } else {
    const mark = r.stale ? '✗' : '✓';
    const age = `${r.age.toFixed(1)}d old`;
    const limit = r.stale ? `  (limit ${r.maxAgeDays}d)` : '';
    console.log(`  ${mark} ${r.label.padEnd(18)} ${age.padEnd(12)} ${r.generatedAt}${limit}`);
  }
}

if (isCI) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    const lines = ['### Data freshness', ''];
    for (const r of results) {
      lines.push(r.problem
        ? `- ❌ **${r.label}** — ${r.problem}`
        : `- ${r.stale ? '❌' : '✅'} **${r.label}** — ${r.age.toFixed(1)} days old (limit ${r.maxAgeDays})`);
    }
    const { appendFileSync } = await import('fs');
    appendFileSync(summary, lines.join('\n') + '\n');
  }
  for (const r of bad) {
    const msg = r.problem
      ? `${r.file}: ${r.problem}`
      : `${r.file} is ${r.age.toFixed(1)} days old (limit ${r.maxAgeDays}) — its refresh workflow is probably failing`;
    console.log(`::${warnOnly ? 'warning' : 'error'}::${msg}`);
  }
}

if (bad.length && !warnOnly) {
  console.error(`\n${bad.length} of ${results.length} feeds are stale or unreadable.`);
  process.exit(1);
}
console.log(bad.length ? '\nStale feeds found (warn-only mode).' : '\nAll feeds fresh.');
