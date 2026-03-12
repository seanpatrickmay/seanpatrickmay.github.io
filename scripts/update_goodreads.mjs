#!/usr/bin/env node
/**
 * Fetches Goodreads reading data from public RSS feeds.
 * Writes to public/goodreads.json.
 *
 * Usage: node scripts/update_goodreads.mjs
 *
 * No credentials needed — RSS feeds are public.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'goodreads.json');

const USER_ID = '199381877';
const RSS_BASE = `https://www.goodreads.com/review/list_rss/${USER_ID}`;
const SHELVES = ['currently-reading', 'read'];
const MAX_RECENT = 5;
const TIMEOUT_MS = 15_000;

function extractCDATA(text) {
  if (!text) return '';
  return text.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(re);
  return match ? match[1].trim() : '';
}

function parseItems(xml) {
  const items = [];
  const itemBlocks = xml.split('<item>').slice(1);
  for (const block of itemBlocks) {
    const raw = block.split('</item>')[0];
    const title = extractCDATA(extractTag(raw, 'title')) || extractTag(raw, 'title');
    const author = extractTag(raw, 'author_name');
    const rating = parseInt(extractTag(raw, 'user_rating'), 10) || 0;
    const avgRating = parseFloat(extractTag(raw, 'average_rating')) || 0;
    const dateAdded = extractCDATA(extractTag(raw, 'user_date_added'));
    const published = extractTag(raw, 'book_published');
    const imageUrl = extractCDATA(extractTag(raw, 'book_medium_image_url'))
      || extractCDATA(extractTag(raw, 'book_image_url'));
    const bookId = extractTag(raw, 'book_id');
    const link = extractCDATA(extractTag(raw, 'link'));

    const numPagesMatch = raw.match(/<num_pages>(\d+)<\/num_pages>/);
    const numPages = numPagesMatch ? parseInt(numPagesMatch[1], 10) : null;

    items.push({
      title,
      author,
      rating,
      avgRating,
      dateAdded,
      published,
      numPages,
      imageUrl: imageUrl || null,
      bookId,
      link: link || `https://www.goodreads.com/book/show/${bookId}`,
    });
  }
  return items;
}

async function fetchShelf(shelf) {
  const url = `${RSS_BASE}?shelf=${shelf}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const xml = await resp.text();
    return parseItems(xml);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log('Fetching Goodreads shelves...');

  const results = {};
  for (const shelf of SHELVES) {
    try {
      results[shelf] = await fetchShelf(shelf);
      console.log(`  ${shelf}: ${results[shelf].length} books`);
    } catch (err) {
      console.error(`  ${shelf}: failed (${err.message})`);
      results[shelf] = [];
    }
  }

  const currentlyReading = results['currently-reading'] || [];
  const read = (results['read'] || []).slice(0, MAX_RECENT);
  const totalPages = (results['read'] || []).reduce((sum, b) => sum + (b.numPages || 0), 0);

  const output = {
    generated_at: new Date().toISOString(),
    currentlyReading,
    recentlyRead: read,
    totalPages,
    profileUrl: `https://www.goodreads.com/user/show/${USER_ID}`,
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Written to ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
