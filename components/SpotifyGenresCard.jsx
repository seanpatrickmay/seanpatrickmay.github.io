import StaleBadge from '@/components/ui/StaleBadge';

/**
 * Rank-weighted genre chart derived from the top-artists list.
 *
 * Spotify exposes no "top genres" for a user, so `share` is each genre's
 * weight relative to the leader — not a share of listening time, which this
 * data cannot support. The caption says so rather than letting the bars imply
 * a precision that is not there.
 */
export default function SpotifyGenresCard({ genres = [], window: windowLabel, staleness }) {
  if (!genres.length) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          🎚️ top genres{' '}
          <span className="font-medium normal-case tracking-normal text-slate-500 dark:text-slate-400">
            · {windowLabel}
          </span>
        </div>
        <StaleBadge staleness={staleness} />
      </div>

      <ul className="mt-3 space-y-2">
        {genres.map((genre, i) => (
          <li key={genre.name}>
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">
                {genre.name}
              </span>
              <span className="flex-none tabular-nums text-slate-500 dark:text-slate-400">
                #{i + 1}
              </span>
            </div>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <span
                className="block h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                style={{ width: `${Math.max(4, genre.share)}%` }}
              />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
        weighted by artist rank, relative to the top genre
      </p>
    </div>
  );
}
