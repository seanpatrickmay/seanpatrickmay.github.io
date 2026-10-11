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
      {/* The scale ends pr-14 short of the edge, so a value written at the
          end of a full-length bar still fits inside the figure. */}
      <div className="pr-14">
        <ul className="space-y-3">
          {bars.map(b => (
            <li key={b.label}>
              <p className={`text-sm text-stone-800 dark:text-stone-100 ${b.highlight ? 'font-semibold' : ''}`}>{b.label}</p>
              {/* h-4 holds the value's line box, so it centres on the bar. */}
              <div className="relative mt-1 h-4">
                <Gridlines ticks={ticks} />
                <div
                  data-bar=""
                  className={`relative h-full rounded-r-sm ${b.highlight ? 'bg-teal-600 dark:bg-teal-400' : 'bg-stone-500 dark:bg-stone-400'}`}
                  style={{ width: `${b.percent}%` }}
                />
                {/* At the bar's end, on paper, so no gridline runs through it. */}
                <span
                  className="stat-figure paper absolute top-1/2 z-10 -translate-y-1/2 whitespace-nowrap pl-1.5 pr-1 text-base leading-none text-stone-800 dark:text-stone-100"
                  style={{ left: `${b.percent}%` }}
                >
                  {b.display}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {/* Tick labels: the first hangs right of its line and the last left of
            it, so neither pokes out of the scale on a phone. */}
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
    </div>
  );
}
