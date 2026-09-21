import test from 'node:test';
import assert from 'node:assert/strict';

import {
  criticProfile,
  longestBook,
  pagesByMonth,
  ratingHistogram,
  readingPace,
} from './readingStats.js';

const NOW = Date.parse('2026-09-21T00:00:00Z');

function book(dateRead, numPages, rating, avgRating, title = 'A Book') {
  return { title, dateRead, numPages, rating, avgRating };
}

test('pagesByMonth buckets finishes into the month they were read', () => {
  const months = pagesByMonth(
    [book('2026-09-20T00:00:00Z', 253, 3, 3.67), book('2026-09-01T00:00:00Z', 100, 4, 4)],
    12,
    NOW,
  );

  const sep = months.find(m => m.key === '2026-09');
  assert.equal(sep.pages, 353);
  assert.equal(sep.books, 2);
});

test('pagesByMonth keeps empty months so a gap stays visible', () => {
  const months = pagesByMonth([book('2026-09-20T00:00:00Z', 253, 3, 3.67)], 12, NOW);

  assert.equal(months.length, 12);
  assert.equal(months.at(-1).key, '2026-09', 'newest month last');
  assert.equal(months.at(0).key, '2025-10', 'window spans a full year back');
  assert.equal(months.filter(m => m.books === 0).length, 11);
});

test('pagesByMonth drops books older than the window', () => {
  const months = pagesByMonth([book('2024-02-28T00:00:00Z', 658, 5, 4.34)], 12, NOW);

  assert.equal(months.reduce((s, m) => s + m.books, 0), 0);
});

test('ratingHistogram always reports all five buckets', () => {
  const hist = ratingHistogram([book('2026-09-01T00:00:00Z', 1, 5, 4), book('2026-09-02T00:00:00Z', 1, 5, 4)]);

  assert.equal(hist.length, 5);
  assert.deepEqual(hist.map(h => h.count), [0, 0, 0, 0, 2]);
});

test('criticProfile surfaces the sharpest disagreement in each direction', () => {
  const profile = criticProfile([
    book('2026-03-23T00:00:00Z', 1168, 5, 3.67, 'Atlas Shrugged'),
    book('2026-03-23T00:00:00Z', 359, 2, 3.88, 'Wuthering Heights'),
    book('2026-09-14T00:00:00Z', 240, 4, 4.04, 'A Clockwork Orange'),
  ]);

  assert.equal(profile.warmest.title, 'Atlas Shrugged');
  assert.equal(profile.coldest.title, 'Wuthering Heights');
  assert.equal(profile.rated, 3);
});

test('criticProfile ignores books with no crowd average', () => {
  const profile = criticProfile([
    book('2026-09-14T00:00:00Z', 240, 4, 4.0),
    book('2026-09-15T00:00:00Z', 240, 1, 0),
  ]);

  assert.equal(profile.rated, 1);
  assert.equal(profile.yourAverage, 4);
});

test('criticProfile returns null when nothing is rated', () => {
  assert.equal(criticProfile([book('2026-09-14T00:00:00Z', 240, 0, 0)]), null);
});

test('longestBook picks the highest page count', () => {
  const longest = longestBook([
    book('2026-09-14T00:00:00Z', 240, 4, 4, 'Short'),
    book('2026-03-23T00:00:00Z', 1168, 5, 3.67, 'Atlas Shrugged'),
  ]);

  assert.equal(longest.title, 'Atlas Shrugged');
});

test('readingPace measures from the oldest finish, not a assumed full year', () => {
  // Two books, 100 pages each, finished 9 and 19 days before NOW.
  const pace = readingPace(
    [book('2026-09-12T00:00:00Z', 100, 4, 4), book('2026-09-02T00:00:00Z', 100, 4, 4)],
    NOW,
  );

  assert.equal(pace.days, 19);
  assert.ok(pace.pagesPerDay > 10, `expected a brisk pace, got ${pace.pagesPerDay}`);
});

test('readingPace returns null with no dated books', () => {
  assert.equal(readingPace([], NOW), null);
});
