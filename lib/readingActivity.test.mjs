import test from 'node:test';
import assert from 'node:assert/strict';

import { heatLevel, heatmapWeeks, lastReadLabel, activitySummary } from './readingActivity.js';

const GENERATED = '2026-11-10T22:57:49.760Z'; // 5:57pm in Boston

test('lastReadLabel counts Boston calendar days back from when the data was fetched', () => {
  assert.equal(lastReadLabel('2026-11-10T05:36:22.228Z', GENERATED), 'today'); // 12:36am Nov 10
  assert.equal(lastReadLabel('2026-11-10T03:00:00.000Z', GENERATED), 'yesterday'); // 10pm Nov 9
  assert.equal(lastReadLabel('2026-11-06T15:00:00.000Z', GENERATED), '4d ago');
  assert.equal(lastReadLabel('2026-10-20T15:00:00.000Z', GENERATED), '3w ago');
  assert.equal(lastReadLabel('2026-07-01T15:00:00.000Z', GENERATED), '4mo ago');
  assert.equal(lastReadLabel(null, GENERATED), null);
  assert.equal(lastReadLabel('2026-11-10T05:36:22.228Z', null), null);
});

test('heatLevel buckets pages on fixed steps so a level means the same thing every week', () => {
  assert.deepEqual([0, 1, 19, 20, 49, 50, 99, 100, 400].map(heatLevel), [0, 1, 1, 2, 2, 3, 3, 4, 4]);
});

test('heatmapWeeks lays days into Sunday-first columns, padding before the first day', () => {
  // 2026-11-05 is a Thursday.
  const days = ['05', '06', '07', '08', '09', '10'].map((d, i) => ({ day: `2026-11-${d}`, pages: i * 30 }));
  const weeks = heatmapWeeks(days);
  assert.equal(weeks.length, 2);
  assert.deepEqual(weeks[0].map((c) => c?.day ?? null), [null, null, null, null, '2026-11-05', '2026-11-06', '2026-11-07']);
  assert.deepEqual(weeks[1].map((c) => c.day), ['2026-11-08', '2026-11-09', '2026-11-10']);
  assert.deepEqual(weeks[1].map((c) => c.level), [3, 4, 4]);
  assert.deepEqual(heatmapWeeks([]), []);
});

test('activitySummary totals pages and averages them over every day, zeros included', () => {
  const days = [{ day: '2026-11-05', pages: 30 }, { day: '2026-11-06', pages: 0 }, { day: '2026-11-07', pages: 15 }];
  assert.deepEqual(activitySummary(days), { totalPages: 45, perDay: 15, daysRead: 2, days: 3 });
  assert.deepEqual(activitySummary([]), { totalPages: 0, perDay: 0, daysRead: 0, days: 0 });
});
