// Display helpers for the reading card's pages-per-day heatmap and the
// "last read" line under books in progress. The data comes from
// public/hardcover.json (see scripts/update_hardcover.mjs).
//
// Everything is relative to the data's generated_at, never Date.now(): the
// page is prerendered, and a clock read at render time would disagree
// between the static HTML and the browser.

const TIME_ZONE = 'America/New_York';
const DAY_MS = 24 * 60 * 60 * 1000;
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Whole Boston calendar days from `earlier` to `later` (ISO strings). */
function calendarDaysBetween(earlier, later) {
  const day = (iso) => Date.parse(`${dayFormat.format(Date.parse(iso))}T00:00:00Z`);
  return Math.round((day(later) - day(earlier)) / DAY_MS);
}

/** "today", "yesterday", "4d ago", "3w ago", "4mo ago" — or null without dates. */
export function lastReadLabel(lastRead, generatedAt) {
  if (!lastRead || !generatedAt) return null;
  const days = calendarDaysBetween(lastRead, generatedAt);
  if (!Number.isFinite(days)) return null;
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** 0-4 on fixed page steps (not quantiles), so a shade keeps its meaning. */
export function heatLevel(pages) {
  if (!(pages > 0)) return 0;
  if (pages < 20) return 1;
  if (pages < 50) return 2;
  if (pages < 100) return 3;
  return 4;
}

/**
 * Days → Sunday-first week columns of { day, pages, level }. The first column
 * is padded with nulls before the first day; the last simply ends.
 */
export function heatmapWeeks(days) {
  if (!days?.length) return [];
  const weekday = new Date(`${days[0].day}T00:00:00Z`).getUTCDay();
  const cells = [...Array(weekday).fill(null), ...days.map((d) => ({ ...d, level: heatLevel(d.pages) }))];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Totals for the heatmap header; the average spreads over every day shown. */
export function activitySummary(days) {
  const list = days ?? [];
  const totalPages = list.reduce((sum, d) => sum + (Number(d.pages) || 0), 0);
  return {
    totalPages,
    perDay: list.length ? Math.round(totalPages / list.length) : 0,
    daysRead: list.filter((d) => d.pages > 0).length,
    days: list.length,
  };
}
