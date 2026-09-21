// Sidebar "now" / "previously" entries.
//
// These used to be two hand-maintained JSX lists, which drifted: on
// 2026-09-17 "now" still advertised the Capital One internship (ended
// 2026-08-08) and the Calc III grading role (ended 2026-05). Each entry now
// carries machine-readable dates and the split is derived, so a finished role
// cannot keep presenting itself as current.
//
// `end: null` means ongoing. `meta` holds already-formatted display strings so
// the prose stays editable without a date parser.

export const TIMELINE = [
  {
    title: 'SWE Intern',
    meta: ['Richmond, VA', 'Summer 2026'],
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
    title: 'B.S. CS & Math',
    highlight: true,
    meta: ['Northeastern University', 'Dec 2026'],
    start: '2022-09-01',
    end: '2026-12-01',
    emoji: '🎓',
  },
  {
    title: 'Quant Research',
    highlight: true,
    meta: ['NU Systematic Alpha'],
    start: '2025-09-01',
    end: null,
    emoji: '📈',
  },
  {
    title: 'Calc III Grader',
    meta: ['NU College of Science', 'Spring 2026'],
    start: '2026-01-01',
    end: '2026-05-31',
    emoji: '📝',
  },
  {
    title: 'Freelance SWE',
    meta: ['Comic Book Grading App', 'Jan – Jun 2026'],
    start: '2026-01-01',
    end: '2026-06-30',
    emoji: '💼',
  },
  {
    title: 'SWE Co-op',
    meta: ['NExT Consulting', 'Fall 2025'],
    start: '2025-09-01',
    end: '2025-12-31',
    emoji: '🧪',
  },
  {
    title: 'SDE Co-op',
    meta: ['General Dynamics Electric Boat', '2024'],
    start: '2024-01-01',
    end: '2024-07-31',
    emoji: '🔧',
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
