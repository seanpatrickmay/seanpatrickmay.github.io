#!/usr/bin/env node
/**
 * Refreshes public/wikis.json, the numbers behind each deep dive's wiki
 * strip, from every wiki's export.json.
 *
 * Usage: node scripts/update_wikis.mjs
 *
 * No credentials: the wikis are public. A wiki that fails to fetch keeps
 * its previous entry and that entry's fetchedAt, and generated_at is the
 * oldest fetchedAt. So a wiki that stays broken goes stale, in
 * check_freshness.mjs and as "as of …" on its page, instead of passing old
 * numbers off as current. A highlight with no page is a mistake in
 * projects.json, and fails the run.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { deriveWiki, exportUrl } from '../lib/wikiStrip.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS = resolve(__dirname, '..', 'public', 'projects.json');
const OUTPUT = resolve(__dirname, '..', 'public', 'wikis.json');
// The largest export is about 2MB.
const TIMEOUT_MS = 30_000;

export async function fetchExport(slug, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS } = {}) {
  const url = exportUrl(slug);
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

export async function buildWikis(projects, previous, { fetchImpl = fetch, now = new Date(), logger = console, timeoutMs } = {}) {
  const wikis = {};
  const failed = [];
  for (const p of projects.filter(x => typeof x?.wiki?.slug === 'string')) {
    const { slug } = p.wiki;
    let exportJson;
    try {
      exportJson = await fetchExport(slug, { fetchImpl, timeoutMs });
    } catch (err) {
      failed.push(slug);
      const kept = previous?.wikis?.[slug];
      logger.warn(`${slug}: ${err.message}; ${kept ? 'keeping the previous entry' : 'no previous entry, so its strip is hidden'}`);
      if (kept) wikis[slug] = kept;
      continue;
    }
    // Outside the try: deriveWiki throwing is a config mistake, not an outage.
    wikis[slug] = { ...deriveWiki(exportJson, p.wiki), fetchedAt: now.toISOString() };
  }
  const times = Object.values(wikis).map(w => w.fetchedAt).filter(Boolean).sort((a, b) => Date.parse(a) - Date.parse(b));
  return { file: { generated_at: times[0] ?? now.toISOString(), wikis }, failed };
}

function readPrevious() {
  try {
    return JSON.parse(readFileSync(OUTPUT, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function main() {
  const projects = JSON.parse(readFileSync(PROJECTS, 'utf8'));
  const configured = projects.filter(p => typeof p?.wiki?.slug === 'string').length;
  const { file, failed } = await buildWikis(projects, readPrevious());
  if (configured > 0 && failed.length === configured) {
    throw new Error('every wiki failed to fetch; leaving wikis.json as it is');
  }
  writeFileSync(OUTPUT, JSON.stringify(file, null, 2) + '\n');
  for (const [slug, w] of Object.entries(file.wikis)) {
    console.log(`  ${slug}: ${w.features} features, ${w.citedClaims} cited claims`);
  }
  console.log(`Written to ${OUTPUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
