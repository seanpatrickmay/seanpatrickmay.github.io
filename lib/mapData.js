/**
 * Geographic coordinates and category grouping for the interactive pin map.
 */
import activityPlaces from '@/public/activity-places.json' assert { type: 'json' };

export const COORDINATES = {
  'Boston, MA': [42.36, -71.06],
  'Richmond, VA': [37.54, -77.44],
  'Groton, CT': [41.35, -72.08],
  'Fort Meade, MD': [39.11, -76.74],
  'New York, NY': [40.71, -74.01],
  'Miami, FL': [25.76, -80.19],
  'Maryland': [39.05, -76.64],
  'Montreal': [45.50, -73.57],
  'Budapest, Hungary': [47.47, 19.06],
  'Ellicott City, MD': [39.27, -76.80],
  'Providence, RI': [41.82, -71.41],
  // Places the movement map plots. County-level because that is the
  // granularity Garmin names activities at.
  'Henrico County, VA': [37.56, -77.40],
  'Howard County, MD': [39.25, -76.93],
  'Anne Arundel County, MD': [38.99, -76.56],
  'Baltimore County, MD': [39.45, -76.62],
  'Shenandoah County, VA': [38.86, -78.57],
  'Columbia, MD': [39.20, -76.86],
  'Dublin, Ireland': [53.35, -6.26],
};

export const WORLD_INSET_LOCATIONS = ['Budapest, Hungary', 'Montreal'];

/**
 * Returns [longitude, latitude] for react-simple-maps (expects [lon, lat])
 */
export function toMapCoords(locationName) {
  const coords = COORDINATES[locationName];
  if (!coords) return null;
  return [coords[1], coords[0]];
}

export function isWorldInset(locationName) {
  return WORLD_INSET_LOCATIONS.includes(locationName);
}

export const WORK_PINS = [
  { org: 'Capital One', role: 'SWE Intern', location: 'Richmond, VA', period: 'Summer 2026', emoji: '🏦', img: '/logos/normalized/capitalone-logo.png' },
  { org: 'NExT Consulting', role: 'SWE Co-op', location: 'Boston, MA', period: 'Fall 2025', img: '/logos/normalized/next-logo.png' },
  { org: 'General Dynamics Electric Boat', role: 'SDE Co-op', location: 'Groton, CT', period: '2024', img: '/logos/normalized/gdeb-logo.png' },
  { org: 'DISA', role: 'Admin Assistant', location: 'Fort Meade, MD', period: '2023', img: '/logos/normalized/disa-logo.png' },
  { org: 'ComicScore', role: 'Software Engineer (Freelance)', location: 'New York, NY', period: 'Jan – Jun 2026', emoji: '💼' },
];

export const EDUCATION_PINS = [
  { org: 'Northeastern University', role: 'B.S. CS & Math', location: 'Boston, MA', period: 'Sep 2022 – Dec 2026', emoji: '🎓', img: '/logos/normalized/nu-logo.png' },
  { org: 'Corvinus University', role: 'Study Abroad', location: 'Budapest, Hungary', period: 'Jun – Aug 2025', emoji: '🇭🇺', img: '/logos/normalized/corvinus-logo.png' },
  { org: 'Centennial High School', role: 'High School Diploma', location: 'Ellicott City, MD', period: '2018 – 2022', emoji: '🦅' },
];

// Parked, not deleted: the movement map took the third slot. Re-adding this
// to CATEGORIES is a one-line change if it should come back.
export const ACTIVITY_PINS = [
  {
    org: 'Poker',
    role: 'Player',
    locations: ['Maryland', 'Miami, FL', 'Montreal', 'Boston, MA', 'Richmond, VA', 'Providence, RI'],
    period: '2022–Present',
    emoji: '🃏',
  },
];

/**
 * Garmin's place string -> a key in COORDINATES.
 *
 * Explicit rather than fuzzy-matched: "Columbia" is Columbia, MD here, and
 * guessing at that from a bare city name is how a map ends up putting a run
 * in Colombia. Unknown places are surfaced by unknownActivityPlaces() rather
 * than silently dropped.
 */
export const ACTIVITY_PLACE_KEYS = {
  Boston: 'Boston, MA',
  'New York': 'New York, NY',
  Richmond: 'Richmond, VA',
  Providence: 'Providence, RI',
  Montreal: 'Montreal',
  Budapest: 'Budapest, Hungary',
  Dublin: 'Dublin, Ireland',
  Columbia: 'Columbia, MD',
  'Henrico County': 'Henrico County, VA',
  'Howard County': 'Howard County, MD',
  'Anne Arundel County': 'Anne Arundel County, MD',
  'Baltimore County': 'Baltimore County, MD',
  'Shenandoah County': 'Shenandoah County, VA',
};

const SPORT_WORDS = {
  run: ['run', 'runs', '🏃'],
  bike: ['ride', 'rides', '🚴'],
  hike: ['hike', 'hikes', '🥾'],
  walk: ['walk', 'walks', '🚶'],
  swim: ['swim', 'swims', '🏊'],
  row: ['row', 'rows', '🚣'],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel(day) {
  if (!day) return null;
  const [year, month] = day.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "Jul 2026" for a single month, "Jun – Aug 2026" for a span. */
function periodLabel(first, last) {
  const from = monthLabel(first);
  const to = monthLabel(last);
  if (!from) return null;
  if (!to || from === to) return from;
  const [fromMonth, fromYear] = from.split(' ');
  const [toMonth, toYear] = to.split(' ');
  return fromYear === toYear ? `${fromMonth} – ${toMonth} ${toYear}` : `${from} – ${to}`;
}

/** "5 runs · 3 rides · 153 km" — busiest sport first. */
function summaryLabel(sports, distanceKm) {
  const parts = Object.entries(sports ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([sport, n]) => {
      const words = SPORT_WORDS[sport];
      if (!words) return `${n} ${sport}`;
      return `${n} ${n === 1 ? words[0] : words[1]}`;
    });
  if (distanceKm > 0) parts.push(`${Math.round(distanceKm)} km`);
  return parts.join(' · ');
}

function dominantEmoji(sports) {
  const top = Object.entries(sports ?? {}).sort((a, b) => b[1] - a[1])[0];
  return SPORT_WORDS[top?.[0]]?.[2] ?? '📍';
}

/** Places in the data file that have no coordinate yet. */
export function unknownActivityPlaces() {
  return (activityPlaces?.places ?? [])
    .map(p => p.place)
    .filter(place => {
      const key = ACTIVITY_PLACE_KEYS[place];
      return !key || !COORDINATES[key];
    });
}

export const MOVEMENT_PINS = (activityPlaces?.places ?? [])
  .map(entry => {
    const key = ACTIVITY_PLACE_KEYS[entry.place];
    if (!key || !COORDINATES[key]) return null;
    return {
      org: entry.place,
      role: summaryLabel(entry.sports, entry.distance_km),
      location: key,
      period: periodLabel(entry.first, entry.last),
      emoji: dominantEmoji(entry.sports),
      // The pin's title is already the place, so the entry list should not
      // print it again next to the summary.
      showLocation: false,
      // Drives pin radius: a place with 40 runs should not look like a place
      // with one.
      weight: entry.count,
    };
  })
  .filter(Boolean);

export const CATEGORIES = [
  { id: 'work', label: 'work', pins: WORK_PINS },
  { id: 'education', label: 'education', pins: EDUCATION_PINS },
  // No inset: with Ireland and Hungary in the set the bounding box is the
  // North Atlantic, which is a shape worth drawing whole rather than a US
  // map with Europe relegated to a corner box.
  { id: 'movement', label: 'movement', pins: MOVEMENT_PINS, useInset: false },
];
