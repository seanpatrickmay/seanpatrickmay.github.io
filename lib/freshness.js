// Shared staleness helper for the live-data cards.
//
// A card that silently shows six-month-old numbers is worse than a card that
// says it is six months old. `scripts/check_freshness.mjs` catches this in CI;
// this is the visitor-facing half, so the page stays honest even between a
// break and a fix.

// Matches the CI allowance in scripts/check_freshness.mjs.
export const DEFAULT_MAX_AGE_DAYS = 10;

/**
 * Returns null when the data is fresh, or `{ days, label }` when it is not.
 * `label` is already formatted for display, e.g. "as of Mar 21".
 */
export function getStaleness(generatedAt, maxAgeDays = DEFAULT_MAX_AGE_DAYS) {
  if (!generatedAt) return null;
  const then = Date.parse(generatedAt);
  if (Number.isNaN(then)) return null;

  const days = (Date.now() - then) / 86_400_000;
  if (days <= maxAgeDays) return null;

  const date = new Date(then);
  return {
    days: Math.round(days),
    label: `as of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
  };
}
