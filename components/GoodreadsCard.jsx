import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen } from 'lucide-react';

const NUM = new Intl.NumberFormat('en-US');
// Page-count benchmark for the yearly reading bar. Harry Potter's 7 US editions
// run ~4,100 pages. Swap to taste — e.g. the LOTR trilogy is ~1,178 pages.
const BENCHMARK = { label: 'the Harry Potter series', pages: 4100, books: 7 };

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-xs text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
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

      {currentlyReading.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 mb-2">
            Currently reading
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {currentlyReading.map(book => (
              <li key={book.bookId}>
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 group"
                >
                  {book.imageUrl && (
                    <img
                      src={book.imageUrl}
                      alt=""
                      loading="lazy"
                      className="w-10 h-14 rounded object-cover flex-shrink-0 shadow-sm"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50 leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {book.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 truncate">
                      {book.author}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 mb-2">
            Recently read
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
            {recent.slice(0, 4).map(book => (
              <li key={book.bookId}>
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 group"
                >
                  {book.imageUrl && (
                    <img
                      src={book.imageUrl}
                      alt=""
                      loading="lazy"
                      className="w-7 h-10 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-800 dark:text-slate-200 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                      {book.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-300 truncate">
                        {book.author}
                      </span>
                      <StarRating rating={book.rating} />
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
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
