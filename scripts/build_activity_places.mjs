#!/usr/bin/env node
/**
 * Turn Garmin activity names into a list of places, for the movement map.
 *
 * Garmin auto-names outdoor activities "<Place> <Type>" — "Henrico County
 * Running", "Shenandoah County Open Water Swimming" — where <Place> is the
 * locality its reverse geocoder resolved. Indoor sessions get no place at
 * all: "Indoor Cycling", "Treadmill Running", bare "Walking".
 *
 * Reading the NAME rather than startLatitude/startLongitude is deliberate and
 * is the whole reason this is safe to publish. The start coordinate of a run
 * is, for almost every run, the front door of wherever the runner lives;
 * committing years of those to a public repo would be publishing a home
 * address. A county or city name is not that, and it is already the
 * granularity the map draws at.
 *
 * Two producers write public/activity-places.json in the same shape:
 *   - this script, from the rolling window already in public/stats.json,
 *     which runs in prebuild and needs no credentials;
 *   - scripts/backfill_activity_places.py, run by hand against the Garmin
 *     API for the full history.
 * The backfill wins: if the existing file says source "full-history", this
 * script leaves it alone rather than trimming it back to a few months.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const STATS_PATH = path.join(ROOT, 'public', 'stats.json');
const OUT_PATH = path.join(ROOT, 'public', 'activity-places.json');

// Longest first: "Open Water Swimming" has to match before "Swimming".
const TYPE_SUFFIXES = [
  ['Open Water Swimming', 'swim'],
  ['Trail Running', 'run'],
  ['Mountain Biking', 'bike'],
  ['Running', 'run'],
  ['Cycling', 'bike'],
  ['Swimming', 'swim'],
  ['Hiking', 'hike'],
  ['Walking', 'walk'],
  ['Rowing', 'row'],
];

// Names that describe a machine rather than a place. Anything whose place
// would resolve to one of these is indoors and has no location.
const INDOOR_WORDS = /\b(indoor|treadmill|elliptical|virtual|stationary|pool|gym|stair)\b/i;

export const SPORT_LABELS = {
  run: { singular: 'run', plural: 'runs', emoji: '🏃' },
  bike: { singular: 'ride', plural: 'rides', emoji: '🚴' },
  hike: { singular: 'hike', plural: 'hikes', emoji: '🥾' },
  walk: { singular: 'walk', plural: 'walks', emoji: '🚶' },
  swim: { singular: 'swim', plural: 'swims', emoji: '🏊' },
  row: { singular: 'row', plural: 'rows', emoji: '🚣' },
};

/**
 * Split a Garmin activity name into { place, sport }, or null when the
 * activity has no place — indoors, or a name that carries no type suffix
 * we recognise (bare "Strength", say).
 */
export function parseActivityName(name) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return null;

  for (const [suffix, sport] of TYPE_SUFFIXES) {
    if (!trimmed.toLowerCase().endsWith(suffix.toLowerCase())) continue;
    const place = trimmed.slice(0, trimmed.length - suffix.length).trim();
    // "Running" alone, or "Indoor Cycling": no place to speak of.
    if (!place || INDOOR_WORDS.test(place)) return null;
    return { place, sport };
  }
  return null;
}

/** Every activity in stats.json, de-duplicated across the per-sport lists. */
export function collectActivities(stats) {
  const byId = new Map();
  for (const bucket of Object.values(stats?.stats ?? {})) {
    for (const activity of bucket?.recent?.last60 ?? []) {
      if (activity?.id != null) byId.set(activity.id, activity);
    }
  }
  return [...byId.values()];
}

/**
 * Group activities by place. Sorted by count so the busiest place leads the
 * list and, on the map, draws last.
 */
export function aggregatePlaces(activities) {
  const places = new Map();

  for (const activity of activities) {
    const parsed = parseActivityName(activity?.name);
    if (!parsed) continue;

    const entry = places.get(parsed.place) ?? {
      place: parsed.place,
      count: 0,
      distance_km: 0,
      sports: {},
      first: null,
      last: null,
    };

    entry.count += 1;
    entry.sports[parsed.sport] = (entry.sports[parsed.sport] ?? 0) + 1;
    entry.distance_km += Number(activity.distance_km) || 0;

    const day = (activity.start ?? '').slice(0, 10);
    if (day) {
      if (!entry.first || day < entry.first) entry.first = day;
      if (!entry.last || day > entry.last) entry.last = day;
    }

    places.set(parsed.place, entry);
  }

  return [...places.values()]
    .map(entry => ({ ...entry, distance_km: Math.round(entry.distance_km * 10) / 10 }))
    .sort((a, b) => b.count - a.count || a.place.localeCompare(b.place));
}

function main() {
  if (!fs.existsSync(STATS_PATH)) {
    console.warn('  no public/stats.json — skipping activity places');
    return;
  }

  // Never trim a hand-run full-history file back to the rolling window.
  if (fs.existsSync(OUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
      if (existing?.source === 'full-history') {
        console.log(`  activity-places.json is full-history (${existing.places?.length ?? 0} places) — left alone`);
        return;
      }
    } catch {
      // Unparseable: fall through and rewrite it.
    }
  }

  const stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
  const activities = collectActivities(stats);
  const places = aggregatePlaces(activities);

  const payload = {
    source: 'stats-window',
    generated_at: new Date().toISOString(),
    // Honest about what this covers: stats.json holds a rolling recent
    // window per sport, not everything Garmin has.
    note: 'Derived from the rolling window in stats.json. Run scripts/backfill_activity_places.py for the full history.',
    activities_considered: activities.length,
    activities_placed: places.reduce((sum, p) => sum + p.count, 0),
    places,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log(
    `  activity-places.json: ${places.length} places from ${payload.activities_placed}/${activities.length} activities`,
  );
}

if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  main();
}
