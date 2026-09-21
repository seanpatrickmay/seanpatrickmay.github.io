// Per-discipline breakdown for the training card.
//
// The card used to show "81.3 hours" without saying of what. update_stats.py
// already writes top-level `running` / `biking` sections; nothing read them.
//
// Only run and bike get their own row — those are the two disciplines actually
// being trained. Everything else (walks, strength, rowing, the occasional swim)
// lands in `other`, which is computed as the remainder so the rows always
// reconcile with the combined headline instead of silently dropping ~23 hours.
//
// Totals are summed over the same 8-week weekly series the rest of the card
// uses; the `monthly` blocks are a 30-day window and would not add up.

export const SPORTS = [
  { key: 'running', label: 'run', emoji: '🏃' },
  { key: 'biking', label: 'bike', emoji: '🚴' },
];

function sumSeries(section) {
  const series = Array.isArray(section?.weekly?.series) ? section.weekly.series : [];
  return series.reduce(
    (acc, row) => ({
      km: acc.km + (Number(row?.distance_km) || 0),
      hours: acc.hours + (Number(row?.time_hours) || 0),
    }),
    { km: 0, hours: 0 },
  );
}

/**
 * Returns `{ rows, totalHours, longest }`, or null when there is no data.
 *
 * `rows` is ordered by hours descending so the bars read top-heavy, with
 * `other` pinned last regardless of size.
 */
export function getTrainingSplit(statsData) {
  const stats = statsData?.stats;
  if (!stats) return null;

  const combined = sumSeries(stats.combined);
  if (combined.hours <= 0) return null;

  let namedKm = 0;
  let namedHours = 0;
  const rows = SPORTS.map(sport => {
    const { km, hours } = sumSeries(stats[sport.key]);
    namedKm += km;
    namedHours += hours;
    return { ...sport, km, hours };
  })
    .filter(row => row.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  const otherHours = combined.hours - namedHours;
  const otherKm = combined.km - namedKm;
  if (otherHours >= 0.5) {
    rows.push({
      key: 'other',
      label: 'other',
      emoji: '⚡',
      km: Math.max(0, otherKm),
      hours: otherHours,
    });
  }

  const longest = SPORTS
    .map(sport => ({
      label: sport.label,
      km: Number(stats[sport.key]?.monthly?.longest_km) || 0,
    }))
    .filter(entry => entry.km > 0)
    .sort((a, b) => b.km - a.km);

  return { rows, totalHours: combined.hours, longest };
}
