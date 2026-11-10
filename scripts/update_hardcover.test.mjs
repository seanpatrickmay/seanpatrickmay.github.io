import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOutput, fetchJournals, fetchMe, pickAuthor, readingActivity, readsFor, toBook } from './update_hardcover.mjs';

const NOW = Date.parse('2026-11-05T12:00:00Z');

function userBook(overrides = {}) {
  return {
    id: 1,
    status_id: 3,
    rating: 4,
    date_added: '2026-01-01',
    privacy_setting_id: 1,
    user_book_reads: [],
    edition: { pages: 300, image: { url: 'https://assets.hardcover.app/edition.jpg' }, cached_contributors: [] },
    book: {
      id: 10,
      title: 'A  Book',
      slug: 'a-book',
      pages: 250,
      release_year: 1999,
      rating: 4.234,
      image: { url: 'https://assets.hardcover.app/book.jpg' },
      cached_contributors: [{ author: { name: 'Jane Writer' }, contribution: null }],
    },
    ...overrides,
  };
}

test('pickAuthor skips translators and falls back to the edition', () => {
  const translated = [
    { author: { name: 'Some Translator' }, contribution: 'Translator' },
    { author: { name: 'Victor Hugo' }, contribution: 'Author' },
  ];
  assert.equal(pickAuthor(translated), 'Victor Hugo');
  assert.equal(pickAuthor([], [{ author: { name: 'From Edition' } }]), 'From Edition');
  assert.equal(pickAuthor([], null), null);
});

test('toBook uses the edition read, the latest finish, and a hardcover link', () => {
  const book = toBook(userBook({
    user_book_reads: [
      { started_at: null, finished_at: '2025-03-01', progress_pages: 300 },
      { started_at: null, finished_at: '2026-09-14', progress_pages: 300 },
    ],
  }));
  assert.equal(book.title, 'A Book');
  assert.equal(book.author, 'Jane Writer');
  assert.equal(book.numPages, 300);
  assert.equal(book.dateRead, '2026-09-14T00:00:00.000Z');
  assert.equal(book.imageUrl, 'https://assets.hardcover.app/edition.jpg');
  assert.equal(book.link, 'https://hardcover.app/books/a-book');
  assert.equal(book.avgRating, 4.23);
  assert.equal(book.progress, null);
});

test('toBook reports progress through the open read of a book in progress', () => {
  const book = toBook(userBook({
    status_id: 2,
    rating: null,
    user_book_reads: [{ started_at: '2026-10-01', finished_at: null, progress_pages: 159 }],
  }));
  assert.equal(book.progress, 0.53);
  assert.equal(book.dateStarted, '2026-10-01T00:00:00.000Z');
  assert.equal(book.dateRead, null);
  assert.equal(book.rating, 0);
});

test('buildOutput keeps public books only and totals the past 12 months', () => {
  const me = {
    username: 'reader',
    user_books: [
      userBook({ id: 1, book: { ...userBook().book, id: 1 }, user_book_reads: [{ finished_at: '2026-10-01' }] }),
      userBook({ id: 2, book: { ...userBook().book, id: 2 }, user_book_reads: [{ finished_at: '2025-01-01' }] }),
      userBook({ id: 3, book: { ...userBook().book, id: 3 }, user_book_reads: [] }),
      userBook({ id: 4, privacy_setting_id: 3, user_book_reads: [{ finished_at: '2026-10-02' }] }),
      userBook({ id: 5, status_id: 2, book: { ...userBook().book, id: 5 } }),
    ],
  };
  const out = buildOutput(me, NOW);
  assert.deepEqual(out.recentlyRead.map((b) => b.bookId), ['1', '3', '2']);
  assert.deepEqual(out.currentlyReading.map((b) => b.bookId), ['5']);
  assert.equal(out.yearBooksRead, 1);
  assert.equal(out.yearPagesRead, 300);
  assert.equal(out.totalPages, 900);
  assert.equal(out.profileUrl, 'https://hardcover.app/@reader');
  assert.equal(out.generated_at, new Date(NOW).toISOString());
});

test('fetchMe sends a Bearer token, retries a rate limit, and unwraps me', async () => {
  const seen = [];
  let calls = 0;
  const fetchImpl = async (_url, init) => {
    seen.push(init.headers.authorization);
    calls += 1;
    if (calls === 1) return new Response('Too Many Requests', { status: 429 });
    return new Response(JSON.stringify({ data: { me: [{ username: 'reader', user_books: [] }] } }), { status: 200 });
  };
  const me = await fetchMe('Bearer hc_test', { fetchImpl, sleep: async () => {} });
  assert.equal(me.username, 'reader');
  assert.deepEqual(seen, ['Bearer hc_test', 'Bearer hc_test']);
});

// The 2026-11-08 refresh died on a single "fetch failed" from the runner:
// a dropped connection throws rather than returning a status to retry on.
test('fetchMe retries a network error or timeout, then gives up with the cause', async () => {
  let calls = 0;
  const flaky = async () => {
    calls += 1;
    if (calls === 1) throw new TypeError('fetch failed');
    if (calls === 2) throw new DOMException('This operation was aborted', 'AbortError');
    return new Response(JSON.stringify({ data: { me: { username: 'reader', user_books: [] } } }), { status: 200 });
  };
  const me = await fetchMe('x', { fetchImpl: flaky, sleep: async () => {} });
  assert.equal(me.username, 'reader');
  assert.equal(calls, 3);

  const down = async () => { throw new TypeError('fetch failed'); };
  await assert.rejects(fetchMe('x', { fetchImpl: down, sleep: async () => {} }), /network error after 3 attempts: fetch failed/);
});

test('fetchMe fails loudly on a refused token or a GraphQL error', async () => {
  const refused = async () => new Response('{}', { status: 401 });
  await assert.rejects(fetchMe('x', { fetchImpl: refused }), /token refused/);
  const broken = async () => new Response(JSON.stringify({ errors: [{ message: 'field not found' }] }), { status: 200 });
  await assert.rejects(fetchMe('x', { fetchImpl: broken }), /field not found/);
});

// --- reading activity (the pages-per-day heatmap) ---------------------------

/** A progress_updated journal entry, as Hardcover returns it (UTC, no zone suffix). */
function progress(createdAt, delta, { was = 0, now = was + delta, read = 7, book = 10, privacy = 1 } = {}) {
  return {
    book_id: book,
    created_at: createdAt,
    privacy_setting_id: privacy,
    metadata: { pages_delta: delta, progress_pages_was: was, progress_pages: now, user_book_read_id: read },
  };
}

/** A read as readingActivity takes it. */
const read = (id, started, finished = null, total = null) => ({ id, started, finished, total });

const pagesOn = (activity) => Object.fromEntries(activity.days.filter((d) => d.pages).map((d) => [d.day, d.pages]));

test('readingActivity spreads a late paper update evenly over the days since the last one', () => {
  const journals = [
    progress('2026-11-06T22:00:00', 30, { was: 0 }),
    // Logged Monday night, four Boston days after the previous update.
    progress('2026-11-10T23:00:00', 60, { was: 30 }),
  ];
  const out = readingActivity(journals, [read(7, '2026-11-06')], { now: Date.parse('2026-11-11T03:00:00Z') });
  assert.deepEqual(pagesOn(out), {
    '2026-11-06': 30,
    '2026-11-07': 15,
    '2026-11-08': 15,
    '2026-11-09': 15,
    '2026-11-10': 15,
  });
  // The grid starts at the first day with reading and runs to today.
  assert.equal(out.start, '2026-11-06');
  assert.equal(out.days[0].day, '2026-11-06');
  assert.equal(out.days.at(-1).day, '2026-11-10');
});

test('readingActivity spreads a read\'s first update back to the day it was started', () => {
  const journals = [progress('2026-11-09T02:00:00', 90, { was: 0 })]; // Nov 8, 9pm in Boston
  const out = readingActivity(journals, [read(7, '2026-11-06')], { now: Date.parse('2026-11-09T12:00:00Z') });
  assert.deepEqual(pagesOn(out), { '2026-11-06': 30, '2026-11-07': 30, '2026-11-08': 30 });
});

test('readingActivity spreads a finished read evenly from its start date to its finish date', () => {
  const out = readingActivity([], [read(1, '2026-09-01', '2026-09-10', 300)], { now: Date.parse('2026-11-10T12:00:00Z') });
  const pages = pagesOn(out);
  assert.equal(Object.keys(pages).length, 10);
  assert.equal(pages['2026-09-01'], 30);
  assert.equal(pages['2026-09-10'], 30);
  assert.equal(out.start, '2026-09-01');
  assert.equal(out.days.at(-1).day, '2026-11-10');
});

test('readingActivity splits a finished read at its progress updates', () => {
  const journals = [progress('2026-09-04T16:00:00', 200, { was: 0, read: 1 })]; // noon, Sep 4
  const out = readingActivity(journals, [read(1, '2026-09-01', '2026-09-08', 300)], { now: Date.parse('2026-09-08T20:00:00Z') });
  assert.deepEqual(pagesOn(out), {
    '2026-09-01': 50, '2026-09-02': 50, '2026-09-03': 50, '2026-09-04': 50, // 200 over Sep 1-4
    '2026-09-05': 25, '2026-09-06': 25, '2026-09-07': 25, '2026-09-08': 25, // the last 100 over Sep 5-8
  });
});

test('readingActivity leaves a read with no start date off the heatmap', () => {
  // Imported from Goodreads: a finish date and nothing else.
  const out = readingActivity([], [read(1, null, '2026-09-20', 231)], { now: Date.parse('2026-11-10T12:00:00Z') });
  assert.deepEqual(pagesOn(out), {});
  assert.equal(out.days.length, 1); // just today
});

test('readingActivity skips imports, backwards corrections, private entries and days over a year back', () => {
  const journals = [
    progress('2026-11-05T19:03:00', 240, { was: null, read: 1 }), // copied over from Goodreads
    progress('2026-11-06T15:00:00', -20, { was: 100, read: 2 }), // progress moved back
    progress('2026-11-06T15:00:00', 50, { was: 0, read: 3, privacy: 3 }),
    progress('2026-11-06T15:00:00', 40, { was: 0, read: 4 }), // started Nov 3: 10 a day Nov 3-6
  ];
  const reads = [read(1, '2026-11-05'), read(4, '2026-11-03'), read(5, '2024-01-01', '2025-12-31', 730)];
  const out = readingActivity(journals, reads, { now: Date.parse('2026-11-06T20:00:00Z') });
  const pages = pagesOn(out);
  assert.equal(pages['2026-11-03'], 10);
  assert.equal(pages['2026-11-06'], 10);
  // The two-year read keeps only its days inside the trailing 365, at its own one-a-day rate.
  assert.equal(out.days.length, 365);
  assert.equal(out.start, '2025-11-07');
  assert.equal(pages['2025-11-07'], 1);
  assert.equal(pages['2026-01-01'], undefined);
});

test('readingActivity counts an imported page count as already read, not read that day', () => {
  // Started Nov 5 by the relay with 401 pages already behind it, then finished Nov 9.
  const journals = [progress('2026-11-05T19:05:00', 401, { was: null, now: 401, read: 1 })];
  const out = readingActivity(journals, [read(1, '2026-11-05', '2026-11-09', 501)], { now: Date.parse('2026-11-10T12:00:00Z') });
  assert.deepEqual(pagesOn(out), { '2026-11-05': 20, '2026-11-06': 20, '2026-11-07': 20, '2026-11-08': 20, '2026-11-09': 20 });
});

test('readingActivity reports the last real update per book, not import time', () => {
  const journals = [
    progress('2026-11-05T19:05:00', 401, { was: null, book: 1, read: 1 }),
    progress('2026-11-07T01:54:00', 151, { was: 0, book: 2, read: 2 }),
    progress('2026-11-10T05:36:22.228338', 70, { was: 151, book: 2, read: 2 }),
  ];
  const out = readingActivity(journals, [], { now: Date.parse('2026-11-10T12:00:00Z') });
  assert.deepEqual(Object.fromEntries(out.lastRead), { 2: '2026-11-10T05:36:22.228Z' });
});

test('readsFor keeps public reads with the pages each one was read in', () => {
  const me = {
    user_books: [
      userBook({ user_book_reads: [{ id: 1, started_at: '2026-09-01', finished_at: '2026-09-10', progress_pages: 290, edition: { pages: 310 } }] }),
      userBook({ user_book_reads: [{ id: 2, started_at: '2026-10-01', finished_at: '2026-10-05', progress_pages: null, edition: null }] }),
      userBook({ privacy_setting_id: 3, user_book_reads: [{ id: 3, started_at: '2026-10-01', finished_at: '2026-10-05' }] }),
    ],
  };
  assert.deepEqual(readsFor(me), [
    { id: 1, started: '2026-09-01', finished: '2026-09-10', total: 290 },
    { id: 2, started: '2026-10-01', finished: '2026-10-05', total: 300 }, // the user book's edition
  ]);
});

test('buildOutput adds the activity days and each current book\'s last read', () => {
  const me = {
    username: 'reader',
    user_books: [userBook({ id: 5, status_id: 2, book: { ...userBook().book, id: 5 } })],
  };
  const activity = { start: '2026-11-05', days: [{ day: '2026-11-05', pages: 12 }], lastRead: new Map([[5, '2026-11-05T20:00:00.000Z']]) };
  const out = buildOutput(me, Date.parse('2026-11-05T22:00:00Z'), activity);
  assert.deepEqual(out.activity, { start: '2026-11-05', days: [{ day: '2026-11-05', pages: 12 }] });
  assert.equal(out.currentlyReading[0].lastRead, '2026-11-05T20:00:00.000Z');
});

test('fetchJournals pages past Hardcover\'s 100-row cap', async () => {
  const offsets = [];
  const fetchImpl = async (_url, init) => {
    const { variables } = JSON.parse(init.body);
    offsets.push(variables.offset);
    const count = variables.offset === 0 ? 100 : 7;
    const rows = Array.from({ length: count }, (_, i) => progress('2026-11-06T12:00:00', 1, { book: variables.offset + i }));
    return new Response(JSON.stringify({ data: { reading_journals: rows } }), { status: 200 });
  };
  const rows = await fetchJournals('x', 141555, '2025-11-05', { fetchImpl, sleep: async () => {} });
  assert.equal(rows.length, 107);
  assert.deepEqual(offsets, [0, 100]);
});
