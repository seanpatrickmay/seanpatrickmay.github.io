#!/usr/bin/env node
/**
 * Fetches reading data from Hardcover (hardcover.app) and writes
 * public/hardcover.json.
 *
 * Usage: HARDCOVER_TOKEN=... node scripts/update_hardcover.mjs
 *
 * HARDCOVER_TOKEN is a personal API token from hardcover.app/account/api
 * (with or without the leading "Bearer "). Only books whose privacy setting is
 * public are written out.
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'hardcover.json');

const API = 'https://api.hardcover.app/v1/graphql';
const STATUS = { reading: 2, read: 3 };
const PUBLIC = 1; // privacy_setting_id
// Feeds the horizontal "recently read" shelf, which only earns its scroll if
// the covers overflow the card.
const MAX_RECENT = 12;
const TIMEOUT_MS = 15_000;
const RETRIES = 3;

const QUERY = `{
  me {
    username
    user_books(where: { status_id: { _in: [2, 3] } }, order_by: { id: desc }) {
      id
      status_id
      rating
      date_added
      privacy_setting_id
      user_book_reads(order_by: { id: desc }) { started_at finished_at progress_pages }
      edition { pages image { url } cached_contributors }
      book { id title slug pages release_year rating image { url } cached_contributors }
    }
  }
}`;

// Hardcover keeps some titles and names with doubled spaces; they render verbatim.
function squish(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;
}

/** The writer, skipping translators, editors, illustrators and the like. */
export function pickAuthor(...contributorLists) {
  for (const list of contributorLists) {
    if (!Array.isArray(list) || !list.length) continue;
    const author = list.find((c) => !c?.contribution || c.contribution === 'Author') ?? list[0];
    const name = squish(author?.author?.name);
    if (name) return name;
  }
  return null;
}

const isoDay = (day) => (day ? `${day}T00:00:00.000Z` : null);

/** One Hardcover user_book → the shape the reading card renders. */
export function toBook(userBook) {
  const book = userBook.book ?? {};
  const edition = userBook.edition ?? {};
  const reads = userBook.user_book_reads ?? [];
  const numPages = Number(edition.pages) || Number(book.pages) || null;

  const finished = reads.map((r) => r.finished_at).filter(Boolean).sort();
  const openRead = reads.find((r) => !r.finished_at);
  const pagesIn = Number(openRead?.progress_pages) || 0;
  const progress = userBook.status_id === STATUS.reading && numPages && pagesIn
    ? Math.min(1, Math.round((pagesIn / numPages) * 1000) / 1000)
    : null;

  return {
    title: squish(book.title),
    author: pickAuthor(book.cached_contributors, edition.cached_contributors),
    rating: Number(userBook.rating) || 0,
    avgRating: book.rating ? Math.round(book.rating * 100) / 100 : 0,
    dateAdded: isoDay(userBook.date_added),
    dateStarted: isoDay(openRead?.started_at),
    dateRead: isoDay(finished.at(-1)),
    published: book.release_year ? String(book.release_year) : '',
    numPages,
    progress,
    imageUrl: edition.image?.url || book.image?.url || null,
    bookId: String(book.id ?? userBook.id),
    link: book.slug ? `https://hardcover.app/books/${book.slug}` : null,
  };
}

/** Build public/hardcover.json from the `me` query result. */
export function buildOutput(me, now = Date.now()) {
  const shelf = (me?.user_books ?? []).filter((ub) => ub.privacy_setting_id === PUBLIC);
  const on = (status) => shelf.filter((ub) => ub.status_id === status).map(toBook);
  const ts = (value) => Date.parse(value || '') || 0;

  // Most recently started first.
  const currentlyReading = on(STATUS.reading).sort(
    (a, b) => ts(b.dateStarted || b.dateAdded) - ts(a.dateStarted || a.dateAdded),
  );
  const readAll = on(STATUS.read);
  // Most-recently-finished first (fall back to date added when no read date).
  const recentlyRead = [...readAll]
    .sort((a, b) => ts(b.dateRead || b.dateAdded) - ts(a.dateRead || a.dateAdded))
    .slice(0, MAX_RECENT);

  const totalPages = readAll.reduce((sum, b) => sum + (b.numPages || 0), 0);

  // Trailing 12 months, by finish date. Books marked read without a date are
  // excluded from the yearly figure (no date to bucket on).
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const readThisYear = readAll.filter((b) => b.dateRead && ts(b.dateRead) >= yearAgo);

  return {
    generated_at: new Date(now).toISOString(),
    currentlyReading,
    recentlyRead,
    totalPages,
    yearPagesRead: readThisYear.reduce((sum, b) => sum + (b.numPages || 0), 0),
    yearBooksRead: readThisYear.length,
    profileUrl: me?.username ? `https://hardcover.app/@${me.username}` : 'https://hardcover.app',
  };
}

/**
 * POST the query; retries rate limits, 5xx, dropped connections and timeouts,
 * throws on anything else.
 */
export async function fetchMe(token, { fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const auth = `Bearer ${String(token).trim().replace(/^bearer\s+/i, '')}`;
  for (let attempt = 1; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let resp;
    try {
      resp = await fetchImpl(API, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          authorization: auth,
          'content-type': 'application/json',
          'user-agent': 'seanpatrickmay.github.io reading card',
        },
        body: JSON.stringify({ query: QUERY }),
      });
    } catch (err) {
      // No response at all (DNS, reset, our own timeout): as transient as a 5xx.
      if (attempt < RETRIES) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(`network error after ${RETRIES} attempts: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }
    const retryable = resp.status === 429 || resp.status >= 500;
    if (retryable && attempt < RETRIES) {
      await sleep(2000 * attempt);
      continue;
    }
    if (resp.status === 401 || resp.status === 403) {
      throw new Error(`token refused (HTTP ${resp.status}) — generate a new one at hardcover.app/account/api`);
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const body = await resp.json();
    if (body.errors?.length || body.error) {
      throw new Error(`GraphQL: ${String(body.errors?.[0]?.message ?? body.error).slice(0, 200)}`);
    }
    const me = Array.isArray(body.data?.me) ? body.data.me[0] : body.data?.me;
    if (!me) throw new Error('no user for this token');
    return me;
  }
}

async function main() {
  const token = process.env.HARDCOVER_TOKEN;
  if (!token) throw new Error('HARDCOVER_TOKEN is not set');

  console.log('Fetching Hardcover shelves...');
  const me = await fetchMe(token);
  const output = buildOutput(me);
  console.log(`  currently reading: ${output.currentlyReading.length} books`);
  console.log(`  read: ${output.recentlyRead.length} shown`);

  // An empty result is far likelier to be a broken token or API change than a
  // real empty library. Writing it would blank the card and the workflow would
  // commit it, so keep the existing file.
  if (!output.currentlyReading.length && !output.recentlyRead.length) {
    throw new Error(`no public books came back — keeping the existing ${OUTPUT}`);
  }

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`  past 12 months: ${output.yearBooksRead} books, ${output.yearPagesRead} pages`);
  console.log(`Written to ${OUTPUT}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
