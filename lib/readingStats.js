// Derivations for /reading.
//
// Everything here is a pure function of goodreads.json's `readHistory`, so the
// page can be prerendered and the numbers can be tested without a network.
//
// `now` is injectable throughout: the static export resolves these at build
// time, and a hardcoded `Date.now()` would make the tests drift.

const MS_DAY = 24 * 60 * 60 * 1000;

function parseRead(book) {
  const t = Date.parse(book?.dateRead ?? '');
  return Number.isFinite(t) ? t : null;
}

function utcMonthKey(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Pages and books finished per month, oldest first, including empty months.
 *
 * Empty months are kept deliberately — a gap in reading is part of the shape,
 * and dropping them would make an uneven year look like a steady one.
 */
export function pagesByMonth(history = [], months = 12, now = Date.now()) {
  const buckets = new Map();
  const cursor = new Date(now);
  cursor.setUTCDate(1);
  cursor.setUTCHours(0, 0, 0, 0);

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1));
    buckets.set(utcMonthKey(d.getTime()), {
      key: utcMonthKey(d.getTime()),
      label: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      year: d.getUTCFullYear(),
      pages: 0,
      books: 0,
    });
  }

  for (const book of history) {
    const t = parseRead(book);
    if (t == null) continue;
    const bucket = buckets.get(utcMonthKey(t));
    if (!bucket) continue; // older than the window
    bucket.pages += Number(book.numPages) || 0;
    bucket.books += 1;
  }

  return [...buckets.values()];
}

/** Star distribution, always 1..5 so the axis does not jump between builds. */
export function ratingHistogram(history = []) {
  const counts = [1, 2, 3, 4, 5].map(rating => ({ rating, count: 0 }));
  for (const book of history) {
    const r = Number(book?.rating);
    if (r >= 1 && r <= 5) counts[r - 1].count += 1;
  }
  return counts;
}

/**
 * How your ratings sit against the Goodreads crowd.
 *
 * The averages are close for most readers, so the headline is the *spread*:
 * which books you disagreed with hardest in each direction.
 */
export function criticProfile(history = []) {
  const rated = history.filter(b => Number(b?.rating) >= 1 && Number(b?.avgRating) > 0);
  if (rated.length === 0) return null;

  const mine = rated.reduce((s, b) => s + Number(b.rating), 0) / rated.length;
  const crowd = rated.reduce((s, b) => s + Number(b.avgRating), 0) / rated.length;

  const deltas = rated
    .map(b => ({
      title: b.title,
      link: b.link ?? null,
      rating: Number(b.rating),
      avgRating: Number(b.avgRating),
      delta: Number(b.rating) - Number(b.avgRating),
    }))
    .sort((a, b) => a.delta - b.delta);

  return {
    rated: rated.length,
    yourAverage: mine,
    goodreadsAverage: crowd,
    delta: mine - crowd,
    // One each way is enough to make the point without turning into a table.
    coldest: deltas[0],
    warmest: deltas[deltas.length - 1],
  };
}

/** Longest single book in the history, by page count. */
export function longestBook(history = []) {
  return history
    .filter(b => Number(b?.numPages) > 0)
    .sort((a, b) => Number(b.numPages) - Number(a.numPages))[0] ?? null;
}

/**
 * Reading pace over the window actually covered by the data.
 *
 * Measured from the oldest finish date in range rather than assuming a full
 * year, so a short history does not report an artificially slow pace.
 */
export function readingPace(history = [], now = Date.now()) {
  const stamps = history.map(parseRead).filter(t => t != null);
  if (stamps.length === 0) return null;

  const oldest = Math.min(...stamps);
  const days = Math.max(1, (now - oldest) / MS_DAY);
  const pages = history.reduce((s, b) => s + (Number(b.numPages) || 0), 0);

  return {
    days: Math.round(days),
    pagesPerDay: pages / days,
    daysPerBook: days / stamps.length,
  };
}
