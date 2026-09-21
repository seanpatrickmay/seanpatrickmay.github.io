// Page-count landmarks for the yearly reading bar.
//
// A single hardcoded benchmark goes stale the moment you pass it: at 6,041
// pages the Harry Potter bar was pinned at 100% reading "1.5×", which tells
// you nothing. So it is a ladder — the bar always points at the next series
// not yet cleared, and credits the largest one already behind you.
//
// Totals are the commonly cited approximate page counts for these editions;
// the card renders them with a "~" for that reason.

export const BENCHMARKS = [
  { label: 'the Lord of the Rings trilogy', pages: 1178, books: 3 },
  { label: 'the Harry Potter series', pages: 4100, books: 7 },
  { label: 'In Search of Lost Time', pages: 4215, books: 7 },
  { label: 'A Song of Ice and Fire', pages: 5216, books: 5 },
  { label: 'the Wheel of Time', pages: 11900, books: 14 },
];

/**
 * Returns `{ target, cleared }` for a page total, or null when there is none.
 *
 * `target` is the smallest series still ahead, so the bar reads as progress
 * rather than a pinned multiplier. Past the top rung it stays on that rung and
 * the card falls back to showing a multiplier, which is honest at that point.
 * `cleared` is the largest series already finished, or null.
 */
export function pickReadingBenchmark(pages) {
  const total = Number(pages) || 0;
  if (total <= 0) return null;

  const ahead = BENCHMARKS.filter(b => b.pages > total);
  const behind = BENCHMARKS.filter(b => b.pages <= total);

  return {
    target: ahead[0] ?? BENCHMARKS[BENCHMARKS.length - 1],
    cleared: behind.length ? behind[behind.length - 1] : null,
  };
}
