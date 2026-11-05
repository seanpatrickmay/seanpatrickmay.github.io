import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOutput, fetchMe, pickAuthor, toBook } from './update_hardcover.mjs';

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

test('fetchMe fails loudly on a refused token or a GraphQL error', async () => {
  const refused = async () => new Response('{}', { status: 401 });
  await assert.rejects(fetchMe('x', { fetchImpl: refused }), /token refused/);
  const broken = async () => new Response(JSON.stringify({ errors: [{ message: 'field not found' }] }), { status: 200 });
  await assert.rejects(fetchMe('x', { fetchImpl: broken }), /field not found/);
});
