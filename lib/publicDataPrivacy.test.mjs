import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const stats = JSON.parse(fs.readFileSync('public/stats.json', 'utf8'));

test('public Garmin stats expose only aggregate series used by the UI', () => {
  assert.deepEqual(Object.keys(stats).sort(), ['generated_at', 'stats']);
  assert.deepEqual(Object.keys(stats.stats).sort(), ['biking', 'combined', 'running']);

  for (const [sectionName, section] of Object.entries(stats.stats)) {
    assert.deepEqual(Object.keys(section), ['weekly'], `${sectionName}: unexpected section fields`);
    assert.ok(Array.isArray(section.weekly.series), `${sectionName}: weekly series missing`);
  }
});

test('public Garmin stats do not expose activity identifiers or exact starts', () => {
  const payload = JSON.stringify(stats);
  for (const forbidden of ['"profile"', '"recent"', '"monthly"', '"id"', '"activityId"', '"start"', '"name"']) {
    assert.equal(payload.includes(forbidden), false, `stats.json still includes ${forbidden}`);
  }
});
