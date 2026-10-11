import PinCard from '@/components/PinCard';
import Source from '@/components/projects/Source';

// Written out in full so Tailwind's scanner keeps every class. One or two
// metrics in a three-column sheet left a third of it, or two thirds, blank;
// the sheet narrows instead, and PinCard keeps the tape centred on it.
const COLUMNS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };
const WIDTHS = { 1: 'sm:max-w-sm', 2: 'sm:max-w-2xl', 3: '' };

/**
 * The deep dive's numbers, each stated once, each with its source.
 *
 * One taped-up sheet rather than three cards: it reads as a strip, and on a
 * phone the rows stack tightly enough that the lead figure below still
 * starts in the first screen. The extra top padding below sm keeps the tape
 * off the first row. Renders nothing without metrics, since an empty strip
 * would be a box of air between the stack and the figure.
 */
export default function MetricsStrip({ metrics = [] }) {
  if (metrics.length === 0) return null;
  return (
    <section data-section="metrics" aria-label="by the numbers">
      <PinCard rotation={0.3} pinColor="teal" fastener="tape" className={`mx-auto ${WIDTHS[metrics.length] ?? ''}`}>
        <ul className={`paper grid divide-y divide-stone-200 rounded-sm border border-stone-200/80 px-4 pb-1 pt-3 ${COLUMNS[metrics.length] ?? COLUMNS[3]} sm:divide-x sm:divide-y-0 sm:px-2 sm:py-4 dark:divide-stone-700 dark:border-stone-700/80`}>
          {metrics.map(m => (
            <li key={`${m.value}-${m.label}`} data-metric="" className="py-2 sm:px-4 sm:py-0">
              <p className="leading-snug">
                <span className="stat-figure mr-2 text-2xl leading-none text-stone-900 sm:mr-0 sm:block sm:text-3xl dark:text-stone-50">
                  {m.value}
                </span>
                <span className="text-sm text-stone-700 sm:mt-1.5 sm:block dark:text-stone-200">{m.label}</span>
              </p>
              <Source source={m.source} about={`${m.value} ${m.label}`} className="mt-1 block text-xs" />
            </li>
          ))}
        </ul>
      </PinCard>
    </section>
  );
}
