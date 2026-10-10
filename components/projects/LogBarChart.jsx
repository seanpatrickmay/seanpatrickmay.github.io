import { logBarLayout } from '@/lib/logBarChart';

/**
 * A log-scale bar chart, drawn in HTML at build time rather than shipped as
 * an image. An SVG in an <img> cannot see the site's class-based dark mode,
 * and an SVG scaled down to a 320px phone shrinks its labels past reading.
 * Here the labels are real text at real sizes, and the colours follow the
 * theme.
 *
 * To assistive tech it is one image (role="img", named by the figure's alt),
 * so a screen reader hears one sentence instead of a dozen loose numbers.
 */
function Gridlines({ ticks }) {
  return ticks.map(t => (
    <span
      key={t.value}
      aria-hidden="true"
      className="absolute inset-y-0 w-px bg-stone-300 dark:bg-stone-600"
      style={{ left: `${t.percent}%` }}
    />
  ));
}

export default function LogBarChart({ chart, label }) {
  const { bars, ticks } = logBarLayout(chart);
  return (
    <div role="img" aria-label={label} data-chart="" className="px-2 pb-1 pt-3 sm:px-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 dark:text-stone-300">
        {chart.unit} · log scale
      </p>
      <ul className="space-y-3">
        {bars.map(b => (
          <li key={b.label}>
            <p className="flex items-baseline justify-between gap-3 text-sm text-stone-800 dark:text-stone-100">
              <span className={b.highlight ? 'font-semibold' : ''}>{b.label}</span>
              <span className="stat-figure text-base">{b.display}</span>
            </p>
            <div className="relative mt-1 h-3">
              <Gridlines ticks={ticks} />
              <div
                data-bar=""
                className={`relative h-full rounded-r-sm ${b.highlight ? 'bg-teal-600 dark:bg-teal-400' : 'bg-stone-500 dark:bg-stone-400'}`}
                style={{ width: `${b.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      {/* Tick labels: the first hangs right of its line and the last left of
          it, so neither pokes out of the figure on a phone. */}
      <div className="relative mt-2 h-4 text-[11px] text-stone-600 dark:text-stone-300">
        {ticks.map((t, i) => (
          <span
            key={t.value}
            className={`absolute top-0 ${i === 0 ? '' : i === ticks.length - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
            style={{ left: `${t.percent}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
