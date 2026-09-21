// Sidebar "now" / "previously" entries.
//
// These used to be two hand-maintained JSX lists, which drifted: on
// 2026-09-17 "now" still advertised the Capital One internship (ended
// 2026-08-08) and a grading role that finished in May. Each entry carries
// machine-readable dates and the split is derived, so a finished role cannot
// keep presenting itself as current.
//
// `org` leads and `role` sits under it: the organisation is what gets
// recognised at a glance, and "SWE Co-op" on its own says nothing about where.
// `end: null` means ongoing. `detail` holds already-formatted display strings
// so the prose stays editable without a date parser.

export const TIMELINE = [
  {
    org: 'Capital One',
    role: 'SWE Intern',
    detail: ['Richmond, VA', 'Summer 2026'],
    start: '2026-06-01',
    end: '2026-08-08',
    // Square logo renders the wordmark illegibly small at icon size; two files
    // rather than a CSS filter so the red swoosh survives on dark backgrounds.
    wordmark: {
      light: '/logos/normalized/capitalone-wordmark.png',
      dark: '/logos/normalized/capitalone-wordmark-dark.png',
      alt: 'Capital One',
    },
  },
  {
    org: 'Northeastern University',
    role: 'B.S. CS & Math, AI Concentration',
    highlight: true,
    detail: ['Dec 2026'],
    start: '2022-09-01',
    end: '2026-12-01',
    emoji: '\u{1F393}',
  },
  {
    org: 'NU Systematic Alpha',
    role: 'Quant Research',
    highlight: true,
    detail: [],
    start: '2025-09-01',
    end: null,
    emoji: '\u{1F4C8}',
  },
  {
    org: 'ComicScore',
    role: 'Software Engineer (Freelance)',
    detail: ['New York, NY', 'Jan \u2013 Jun 2026'],
    start: '2026-01-01',
    end: '2026-06-30',
    emoji: '\u{1F4BC}',
  },
  {
    org: 'NExT Consulting',
    role: 'SWE Consultant Co-op',
    detail: ['Boston, MA', 'Fall 2025'],
    start: '2025-09-01',
    end: '2025-12-31',
    emoji: '\u{1F9EA}',
  },
  {
    org: 'General Dynamics: Electric Boat',
    role: 'SDE Co-op',
    detail: ['Groton, CT', '2024'],
    start: '2024-01-01',
    end: '2024-07-31',
    emoji: '\u{1F527}',
  },
];

function endTime(entry) {
  if (!entry.end) return Infinity; // ongoing
  const t = Date.parse(entry.end);
  return Number.isNaN(t) ? Infinity : t;
}

function startTime(entry) {
  const t = Date.parse(entry.start);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Splits the timeline into `current` (not yet ended) and `past`
 * (reverse-chronological by end date).
 *
 * `now` is injectable so this stays testable and so callers can resolve it at
 * build time rather than at render time.
 */
export function splitTimeline(now = Date.now(), timeline = TIMELINE) {
  const t = now instanceof Date ? now.getTime() : now;

  const current = timeline
    .filter(e => endTime(e) >= t)
    .sort((a, b) => startTime(b) - startTime(a));

  const past = timeline
    .filter(e => endTime(e) < t)
    .sort((a, b) => endTime(b) - endTime(a));

  return { current, past };
}
