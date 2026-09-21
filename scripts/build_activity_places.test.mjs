import test from 'node:test';
import assert from 'node:assert/strict';

import {
  aggregatePlaces,
  collectActivities,
  parseActivityName,
} from './build_activity_places.mjs';

test('parses the ordinary "<Place> <Type>" shape', () => {
  assert.deepEqual(parseActivityName('Henrico County Running'), { place: 'Henrico County', sport: 'run' });
  assert.deepEqual(parseActivityName('Richmond Cycling'), { place: 'Richmond', sport: 'bike' });
  assert.deepEqual(parseActivityName('New York Walking'), { place: 'New York', sport: 'walk' });
});

test('matches the longest type suffix first', () => {
  // "Swimming" would also match, and would leave "Shenandoah County Open Water".
  assert.deepEqual(parseActivityName('Shenandoah County Open Water Swimming'), {
    place: 'Shenandoah County',
    sport: 'swim',
  });
});

test('indoor activities have no place', () => {
  for (const name of ['Indoor Cycling', 'Treadmill Running', 'Indoor Rowing', 'Pool Swimming']) {
    assert.equal(parseActivityName(name), null, name);
  }
});

test('a bare type name has no place', () => {
  assert.equal(parseActivityName('Walking'), null);
  assert.equal(parseActivityName('Running'), null);
});

test('names with no recognised type are skipped rather than guessed at', () => {
  assert.equal(parseActivityName('Strength'), null);
  assert.equal(parseActivityName('Elliptical'), null);
  assert.equal(parseActivityName(''), null);
  assert.equal(parseActivityName(undefined), null);
});

test('a place containing a type word survives', () => {
  // Not hypothetical: Running Springs, CA and Swimming River, NJ both exist.
  assert.deepEqual(parseActivityName('Running Springs Running'), {
    place: 'Running Springs',
    sport: 'run',
  });
});

test('collectActivities de-duplicates across the per-sport buckets', () => {
  const stats = {
    stats: {
      combined: { recent: { last60: [{ id: 1, name: 'Boston Running' }, { id: 2, name: 'Indoor Cycling' }] } },
      running: { recent: { last60: [{ id: 1, name: 'Boston Running' }] } },
      biking: { recent: { last60: [{ id: 3, name: 'Richmond Cycling' }] } },
    },
  };
  assert.equal(collectActivities(stats).length, 3);
});

test('collectActivities tolerates missing buckets and empty lists', () => {
  assert.deepEqual(collectActivities({}), []);
  assert.deepEqual(collectActivities({ stats: { running: {} } }), []);
  assert.deepEqual(collectActivities({ stats: { running: { recent: { last60: [] } } } }), []);
});

test('aggregatePlaces sums counts, distance and sports per place', () => {
  const [boston] = aggregatePlaces([
    { id: 1, name: 'Boston Running', distance_km: 5, start: '2026-09-02 07:00:00' },
    { id: 2, name: 'Boston Running', distance_km: 10.25, start: '2026-09-04 07:00:00' },
    { id: 3, name: 'Boston Cycling', distance_km: 20, start: '2026-08-30 07:00:00' },
  ]);
  assert.equal(boston.place, 'Boston');
  assert.equal(boston.count, 3);
  assert.equal(boston.distance_km, 35.3);
  assert.deepEqual(boston.sports, { run: 2, bike: 1 });
  assert.equal(boston.first, '2026-08-30');
  assert.equal(boston.last, '2026-09-04');
});

test('aggregatePlaces orders by count, then alphabetically', () => {
  const out = aggregatePlaces([
    { id: 1, name: 'Zed Running', distance_km: 1, start: '2026-01-01 00:00:00' },
    { id: 2, name: 'Alpha Running', distance_km: 1, start: '2026-01-01 00:00:00' },
    { id: 3, name: 'Busy Running', distance_km: 1, start: '2026-01-01 00:00:00' },
    { id: 4, name: 'Busy Running', distance_km: 1, start: '2026-01-02 00:00:00' },
  ]);
  assert.deepEqual(out.map(p => p.place), ['Busy', 'Alpha', 'Zed']);
});

test('aggregatePlaces drops activities with no place', () => {
  assert.deepEqual(aggregatePlaces([{ id: 1, name: 'Indoor Cycling', distance_km: 30 }]), []);
});

test('aggregatePlaces survives a missing distance or start', () => {
  const [place] = aggregatePlaces([{ id: 1, name: 'Boston Running' }]);
  assert.equal(place.distance_km, 0);
  assert.equal(place.first, null);
});
