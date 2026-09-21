import StaleBadge from '@/components/ui/StaleBadge';

/**
 * Genre chart as a cloud of stickers rather than another bar chart.
 *
 * The about section already had four horizontal bar charts; a fifth read as
 * filler. The board metaphor the page is built on — pushpins, polaroids, a
 * shelf rail — suits sized-and-rotated labels far better, and a sticker cloud
 * carries relative weight without pretending to a precision this data does not
 * have (Spotify exposes no per-user genre listening time; weight is derived
 * from where the artists carrying a genre sit in the top-artists ranking).
 *
 * Everything here is a pure function of `share`, so the layout is identical on
 * the server and the client — no randomness, no hydration mismatch.
 */

// Warm, board-ish palette. Ordered so the leader gets the strongest colour and
// the tail fades into paper, which does the ranking work without numbers.
const STICKERS = [
  'bg-teal-600 text-white border-teal-700/40',
  'bg-amber-200 text-amber-950 border-amber-400/50',
  'bg-indigo-500 text-white border-indigo-600/40',
  'bg-rose-200 text-rose-950 border-rose-400/50',
  'bg-stone-200 text-stone-800 border-stone-400/50',
  'bg-emerald-200 text-emerald-950 border-emerald-500/40',
];

// Deterministic per-position tilt — a fixed cycle, not Math.random().
const TILTS = [-3.5, 2.5, -1.5, 3, -2.5, 1.5];

function sizeFor(share) {
  // Map weight onto a type ramp. Floors at 12px so the tail stays legible;
  // the leader lands near 30px, which is big enough to read as a headline.
  const t = Math.max(0, Math.min(1, share / 100));
  return 12 + t * 18;
}

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

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5 px-1 pb-1">
        {genres.map((genre, i) => (
          <li key={genre.name}>
            <span
              className={[
                'inline-block rounded-full border px-3 py-1 font-semibold leading-tight',
                'shadow-sm transition-transform duration-200 hover:!rotate-0 hover:scale-105',
                'motion-reduce:!rotate-0',
                STICKERS[i % STICKERS.length],
              ].join(' ')}
              style={{
                fontSize: `${sizeFor(genre.share).toFixed(1)}px`,
                transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
              }}
              title={`${genre.name} — ${genre.share}% of my top genre's weight`}
            >
              {genre.name}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-center text-[10px] text-slate-500 dark:text-slate-400">
        bigger = more of what i actually played
      </p>
    </div>
  );
}
