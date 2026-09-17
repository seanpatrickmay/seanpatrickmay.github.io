import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import AutoScrollShelf from '@/components/AutoScrollShelf';

const NUM = new Intl.NumberFormat('en-US');
// Page-count benchmark for the yearly reading bar. Harry Potter's 7 US editions
// run ~4,100 pages. Swap to taste — e.g. the LOTR trilogy is ~1,178 pages.
const BENCHMARK = { label: 'the Harry Potter series', pages: 4100, books: 7 };

function toShelfItems(books, withRatings) {
  return books.map((book, index) => ({
    id: book.bookId || book.link || `${book.title}-${index}`,
    title: book.title,
    subtitle: book.author,
    image: book.imageUrl,
    url: book.link,
    badge: withRatings && book.rating ? `★${book.rating}` : null,
  }));
}

/** One horizontal shelf of covers, with a wooden rail underneath. */
function Shelf({ label, count, books, withRatings = false, emptyMessage }) {
  // Stable identity: AutoScrollShelf re-measures whenever `items` changes, and
  // a fresh array every render would re-measure on every render.
  const shelfItems = useMemo(() => toShelfItems(books, withRatings), [books, withRatings]);

  if (!books.length) return null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {label}
        </div>
        <div className="text-[10px] tabular-nums text-stone-400 dark:text-stone-500">
          {count} {count === 1 ? 'book' : 'books'}
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

export default function GoodreadsCard({ data = null, bare = false }) {
  const currentlyReading = data?.currentlyReading ?? [];
  const recent = data?.recentlyRead ?? [];

  if (!data || (!currentlyReading.length && !recent.length)) return null;

  const yearPages = Number(data?.yearPagesRead) || 0;
  const yearBooks = Number(data?.yearBooksRead) || 0;
  const hasYear = yearPages > 0;
  const ratio = yearPages / BENCHMARK.pages;
  const barWidth = `${Math.max(2, Math.min(100, Math.round(ratio * 100)))}%`;
  const ratioLabel = ratio >= 1 ? `${ratio.toFixed(1)}×` : `${Math.round(ratio * 100)}%`;
  const ariaNow = Math.min(100, Math.round(ratio * 100));

  const content = (
    <div className="space-y-4">
      {hasYear && (
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700/80 dark:text-amber-400/80">
            reading · past 12 months
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold leading-none text-stone-900 dark:text-stone-50">
              {NUM.format(yearPages)}
            </span>
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">pages</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              · {yearBooks} {yearBooks === 1 ? 'book' : 'books'}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-medium text-amber-700 dark:text-amber-300">📚 {BENCHMARK.label}</span>
              <span className="font-semibold text-stone-600 dark:text-stone-300">{ratioLabel}</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40"
              role="progressbar"
              aria-valuenow={ariaNow}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${NUM.format(yearPages)} pages read in the past 12 months — ${ratioLabel} of ${BENCHMARK.label}`}
            >
              <div
                className="h-full rounded-full bg-amber-500 transition-all dark:bg-amber-400"
                style={{ width: barWidth }}
              />
            </div>
            <div className="mt-1 text-[10px] text-stone-400 dark:text-stone-500">
              all {BENCHMARK.books} books run ~{NUM.format(BENCHMARK.pages)} pages
            </div>
          </div>
        </div>
      )}

      <Shelf
        label="currently reading"
        count={currentlyReading.length}
        books={currentlyReading}
        emptyMessage="Nothing on the go"
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
