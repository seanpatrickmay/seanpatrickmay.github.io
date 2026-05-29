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
const MAX_PAGES = 10; // safety cap when paging a shelf; we stop early on an empty page
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
    const readAtRaw = extractCDATA(extractTag(raw, 'user_read_at'));
    const readAtDate = readAtRaw ? new Date(readAtRaw) : null;
    const dateRead = readAtDate && !Number.isNaN(readAtDate.getTime())
      ? readAtDate.toISOString()
      : null;
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
      dateRead,
      published,
      numPages,
      imageUrl: imageUrl || null,
      bookId,
      link: link || `https://www.goodreads.com/book/show/${bookId}`,
    });
  }
  return items;
}

async function fetchPage(shelf, page) {
  const url = `${RSS_BASE}?shelf=${shelf}&page=${page}`;
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

// Page through a shelf until an empty page (or the cap), de-duping by book so
// the yearly page totals stay accurate even as the read shelf grows.
async function fetchShelf(shelf, maxPages = MAX_PAGES) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const items = await fetchPage(shelf, page);
    if (!items.length) break;
    for (const book of items) {
      const id = book.bookId || book.link || book.title;
      if (seen.has(id)) continue;
      seen.add(id);
      all.push(book);
    }
  }
  return all;
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
  const readAll = results['read'] || [];

  // Most-recently-finished first (fall back to date added when no read date).
  const recencyTs = (b) => Date.parse(b.dateRead || b.dateAdded || '') || 0;
  const recentlyRead = [...readAll]
    .sort((a, b) => recencyTs(b) - recencyTs(a))
    .slice(0, MAX_RECENT);

  const totalPages = readAll.reduce((sum, b) => sum + (b.numPages || 0), 0);

  // Trailing 12 months, by finish date (user_read_at). Books shelved as read
  // without a date are excluded from the yearly figure (no date to bucket on).
  const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const readThisYear = readAll.filter(
    (b) => b.dateRead && Date.parse(b.dateRead) >= yearAgo,
  );
  const yearPagesRead = readThisYear.reduce((sum, b) => sum + (b.numPages || 0), 0);
  const yearBooksRead = readThisYear.length;

  const output = {
    generated_at: new Date().toISOString(),
    currentlyReading,
    recentlyRead,
    totalPages,
    yearPagesRead,
    yearBooksRead,
    profileUrl: `https://www.goodreads.com/user/show/${USER_ID}`,
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`  past 12 months: ${yearBooksRead} books, ${yearPagesRead} pages`);
  console.log(`Written to ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
