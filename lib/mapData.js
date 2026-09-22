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

export const ACTIVITY_PINS = [
  {
    org: 'Poker',
    role: 'Player',
    locations: ['Maryland', 'Miami, FL', 'Montreal', 'Boston, MA', 'Richmond, VA', 'Providence, RI'],
    period: '2022–Present',
    emoji: '🃏',
  },
];

const SPORT_WORDS = {
  run: ['run', 'runs', '🏃'],
  bike: ['ride', 'rides', '🚴'],
  hike: ['hike', 'hikes', '🥾'],
  walk: ['walk', 'walks', '🚶'],
  swim: ['swim', 'swims', '🏊'],
  ski: ['ski day', 'ski days', '⛷️'],
  snowshoe: ['snowshoe', 'snowshoes', '🥾'],
  paddle: ['paddle', 'paddles', '🛶'],
  row: ['row', 'rows', '🚣'],
  climb: ['climb', 'climbs', '🧗'],
  skate: ['skate', 'skates', '⛸️'],
  surf: ['surf', 'surfs', '🏄'],
  multi_sport: ['multisport', 'multisports', '🏅'],
  elliptical: ['elliptical', 'elliptical', '🌀'],
  strength_training: ['lift', 'lifts', '🏋️'],
  mixed_martial_arts: ['MMA session', 'MMA sessions', '🥊'],
  breathwork: ['breathwork', 'breathwork', '🌬️'],
  meditation: ['sit', 'sits', '🧘'],
  yoga: ['yoga session', 'yoga sessions', '🧘'],
};

// Families below this are rolled into a "+N more" rather than given a chip
// each: seven singletons would triple the legend's height to say almost
// nothing.
const LEGEND_MIN_COUNT = 4;

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

/** Humanise a sport key this file has no entry for, rather than dropping it. */
function sportWords(sport) {
  if (SPORT_WORDS[sport]) return SPORT_WORDS[sport];
  const human = String(sport).replace(/_/g, ' ');
  return [human, `${human}s`, '📍'];
}

/** "5 runs · 3 rides · 153 km" — busiest sport first. */
function summaryLabel(sports, distanceKm) {
  const parts = Object.entries(sports ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([sport, n]) => {
      const [singular, plural] = sportWords(sport);
      return `${n} ${n === 1 ? singular : plural}`;
    });
  if (distanceKm > 0) parts.push(`${Math.round(distanceKm)} km`);
  return parts.join(' · ');
}

function dominantSport(sports) {
  return Object.entries(sports ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export const MOVEMENT_PLACES = activityPlaces?.places ?? [];

/**
 * Movement pins carry their own coordinates.
 *
 * They are resolved from the activities' own GPS at backfill time and snapped
 * to a coarse grid, which is both safer and more accurate than a hand-keyed
 * table would be: "Dover" is Dover, Vermont here, and "Fremont" is Fremont,
 * New Hampshire, neither of which is the first guess.
 */
export const MOVEMENT_PINS = MOVEMENT_PLACES.filter(
  entry => Number.isFinite(entry?.lat) && Number.isFinite(entry?.lon),
).map(entry => ({
  org: entry.place,
  role: summaryLabel(entry.sports, entry.distance_km),
  // react-simple-maps orders these [lon, lat].
  coords: [entry.lon, entry.lat],
  location: entry.place,
  period: periodLabel(entry.first, entry.last),
  emoji: sportWords(dominantSport(entry.sports))[2],
  showLocation: false,
  // Drives pin radius: 193 runs should not draw the same dot as one.
  weight: entry.count,
}));

/**
 * Totals for the strip above the map.
 *
 * These count EVERY activity, not just the ones the map can plot. The map
 * answers "where" and needs a GPS fix to do it; the totals answer "how
 * much", and an hour on a trainer is still an hour. The two numbers are
 * deliberately different sizes and the UI says so — 1,751 done, 553 of them
 * with a trace.
 */
export function movementTotals() {
  const totals = activityPlaces?.totals ?? {};
  const entries = Object.entries(totals.sports ?? {}).sort((a, b) => b[1] - a[1]);
  const shown = entries.filter(([, n]) => n >= LEGEND_MIN_COUNT);
  const rest = entries.filter(([, n]) => n < LEGEND_MIN_COUNT);

  return {
    activities: totals.activities ?? 0,
    distanceKm: Math.round(totals.distance_km ?? 0),
    hours: Math.round(totals.hours ?? 0),
    since: monthLabel(totals.first),
    // Share of the earth's circumference, which is the whole point of
    // showing a distance this large on a map.
    earthPercent: Math.round((totals.earth_fraction ?? 0) * 1000) / 10,
    // What the map itself draws, which is the smaller number.
    placedActivities: activityPlaces?.activities_placed ?? 0,
    places: MOVEMENT_PLACES.length,
    sports: shown.map(([sport, n]) => ({
      sport,
      n,
      emoji: sportWords(sport)[2],
      label: n === 1 ? sportWords(sport)[0] : sportWords(sport)[1],
    })),
    otherCount: rest.reduce((sum, [, n]) => sum + n, 0),
  };
}

export const CATEGORIES = [
  { id: 'work', label: 'work', pins: WORK_PINS },
  { id: 'education', label: 'education', pins: EDUCATION_PINS },
  { id: 'activities', label: 'activities', pins: ACTIVITY_PINS },
];
