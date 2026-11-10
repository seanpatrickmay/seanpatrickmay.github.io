import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import StaleBadge from '@/components/ui/StaleBadge';
import AutoScrollShelf from '@/components/AutoScrollShelf';
import { pickReadingBenchmark } from '@/lib/readingBenchmarks';
import { activitySummary, heatmapWeeks, lastReadLabel } from '@/lib/readingActivity';

const NUM = new Intl.NumberFormat('en-US');

function sumPages(books) {
  return books.reduce((sum, book) => sum + (Number(book?.numPages) || 0), 0);
}

function toShelfItems(books, withRatings, generatedAt) {
  return books.map((book, index) => ({
    id: book.bookId || book.link || `${book.title}-${index}`,
    title: book.title,
    subtitle: book.author,
    caption: withRatings ? null : lastReadLabel(book.lastRead, generatedAt),
    image: book.imageUrl,
    url: book.link,
    badge: withRatings ? (book.rating ? `★${book.rating}` : null) : progressBadge(book.progress),
  }));
}

/** "53%" for a book in progress; nothing before the first page or once done. */
export function progressBadge(progress) {
  const percent = Math.round((Number(progress) || 0) * 100);
  return percent > 0 && percent < 100 ? `${percent}%` : null;
}

/** One horizontal shelf of covers, with a wooden rail underneath. */
function Shelf({ label, count, books, withRatings = false, emptyMessage, meta = null, generatedAt = null }) {
  // Stable identity: AutoScrollShelf re-measures whenever `items` changes, and
  // a fresh array every render would re-measure on every render.
  const shelfItems = useMemo(
    () => toShelfItems(books, withRatings, generatedAt),
    [books, withRatings, generatedAt],
  );

  if (!books.length) return null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {label}
        </div>
        <div className="text-[10px] tabular-nums text-stone-500 dark:text-stone-400">
          {count} {count === 1 ? 'book' : 'books'}
          {meta && <span> · {meta}</span>}
        </div>
      </div>

      <AutoScrollShelf
        items={shelfItems}
        ariaLabel={`${label} — ${count} ${count === 1 ? 'book' : 'books'}`}
        emptyMessage={emptyMessage}
        speed={withRatings ? 11 : 14}
      />

      {/* shelf rail */}
      <div
        aria-hidden="true"
        className="mt-1 h-[3px] rounded-full bg-gradient-to-r from-amber-900/15 via-amber-800/35 to-amber-900/15 dark:from-amber-200/10 dark:via-amber-200/25 dark:to-amber-200/10"
      />
    </div>
  );
}

// Level 0 is a day with no reading; 1-4 follow heatLevel's page steps.
const HEAT_CLASSES = [
  'bg-stone-200/80 dark:bg-stone-700/60',
  'bg-amber-200 dark:bg-amber-900/80',
  'bg-amber-300 dark:bg-amber-700',
  'bg-amber-500 dark:bg-amber-500',
  'bg-amber-700 dark:bg-amber-300',
];
const SHORT_DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const shortDay = (day) => SHORT_DAY.format(new Date(`${day}T00:00:00Z`));

/**
 * Pages per day, Kindle and paper alike, newest week on the right. Older
 * weeks drop off the left edge, whole, once the grid outgrows the card. Paper
 * updates are spread over the days since the last one, hence the "~".
 */
function ReadingHeatmap({ activity }) {
  const days = activity?.days ?? [];
  const weeks = useMemo(() => heatmapWeeks(days), [days]);
  if (!days.length) return null;

  const { totalPages, perDay, daysRead } = activitySummary(days);
  const since = shortDay(activity.start ?? days[0].day);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          pages per day
        </div>
        <div className="text-[10px] tabular-nums text-stone-500 dark:text-stone-400">
          ~{NUM.format(perDay)}/day since {since}
        </div>
      </div>
      <div
        role="img"
        aria-label={`About ${NUM.format(totalPages)} pages read since ${since}, on ${daysRead} of ${days.length} days, roughly ${NUM.format(perDay)} a day`}
        // Newest week first, laid right to left; weeks that do not fit wrap onto
        // a second row that the fixed height hides, so no week is cut in half.
        className="flex h-[88px] flex-row-reverse flex-wrap gap-[3px] overflow-hidden"
      >
        {[...weeks].reverse().map((week) => (
          <div key={(week.find(Boolean) ?? {}).day} className="flex flex-none flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, i) => week[i]).map((cell, i) =>
              cell ? (
                <span
                  key={cell.day}
                  title={`${shortDay(cell.day)} · ${cell.pages ? `~${NUM.format(cell.pages)}` : 'no'} pages`}
                  className={`h-[10px] w-[10px] rounded-[2px] ${HEAT_CLASSES[cell.level]}`}
                />
              ) : (
                <span key={`pad-${i}`} aria-hidden="true" className="h-[10px] w-[10px]" />
              ),
            )}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-1.5 flex items-center justify-end gap-[3px] text-[9px] text-stone-500 dark:text-stone-400">
        <span className="mr-0.5">less</span>
        {HEAT_CLASSES.map((shade) => (
          <span key={shade} className={`h-[8px] w-[8px] rounded-[2px] ${shade}`} />
        ))}
        <span className="ml-0.5">more</span>
      </div>
    </div>
  );
}

export default function HardcoverCard({ data = null, bare = false }) {
  const currentlyReading = data?.currentlyReading ?? [];
  const recent = data?.recentlyRead ?? [];

  if (!data || (!currentlyReading.length && !recent.length)) return null;

  const yearPages = Number(data?.yearPagesRead) || 0;
  const yearBooks = Number(data?.yearBooksRead) || 0;
  const hasYear = yearPages > 0;

  // Ladder rather than a fixed series, so the bar never sits pinned at 100%.
  const benchmark = pickReadingBenchmark(yearPages);
  const target = benchmark?.target ?? null;
  // Only credit a cleared series if it is not the one being aimed at, which
  // happens when the total lands exactly on the top rung.
  const cleared =
    benchmark?.cleared && benchmark.cleared.label !== target?.label ? benchmark.cleared : null;

  const ratio = target ? yearPages / target.pages : 0;
  const barWidth = `${Math.max(2, Math.min(100, Math.round(ratio * 100)))}%`;
  const ratioLabel = ratio >= 1 ? `${ratio.toFixed(1)}×` : `${Math.round(ratio * 100)}%`;
  const ariaNow = Math.min(100, Math.round(ratio * 100));

  const pagesInFlight = sumPages(currentlyReading);

  const content = (
    <div className="space-y-4">
      {hasYear && target && (
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400/80">
              reading · past 12 months
            </div>
            <StaleBadge staleness={data?._staleness} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="stat-figure text-3xl leading-none text-stone-900 dark:text-stone-50">
              {NUM.format(yearPages)}
            </span>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">pages</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              · {yearBooks} {yearBooks === 1 ? 'book' : 'books'}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-medium text-amber-700 dark:text-amber-300">📚 {target.label}</span>
              <span className="font-semibold text-stone-600 dark:text-stone-300">{ratioLabel}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40"
              role="progressbar"
              aria-valuenow={ariaNow}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${NUM.format(yearPages)} pages read in the past 12 months — ${ratioLabel} of ${target.label}`}
            >
              <div
                className="h-full rounded-full bg-amber-500 transition-all dark:bg-amber-400"
                style={{ width: barWidth }}
              />
            </div>
            <div className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
              all {target.books} books run ~{NUM.format(target.pages)} pages
            </div>
            {cleared && (
              <div className="mt-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-500/90">
                ✓ already past {cleared.label}
              </div>
            )}
          </div>
        </div>
      )}

      <ReadingHeatmap activity={data?.activity} />

      <Shelf
        label="currently reading"
        count={currentlyReading.length}
        books={currentlyReading}
        meta={pagesInFlight > 0 ? `${NUM.format(pagesInFlight)} pages` : null}
        emptyMessage="Nothing on the go"
        generatedAt={data?.generated_at}
      />

      <Shelf
        label="recently read"
        count={recent.length}
        books={recent}
        withRatings
        emptyMessage="No finished books yet"
      />

    </div>
  );

  if (bare) return content;

  return (
    <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full flex flex-col">
      <CardHeader>
        <CardTitle icon={BookOpen}>Reading</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {content}
      </CardContent>
    </Card>
  );
}
