import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import ProjectPageHeader from '@/components/ProjectPageHeader';
import PillLink from '@/components/ui/PillLink';
import StaleBadge from '@/components/ui/StaleBadge';
import { getStaleness } from '@/lib/freshness';
import { pickReadingBenchmark } from '@/lib/readingBenchmarks';
import {
  criticProfile,
  longestBook,
  pagesByMonth,
  ratingHistogram,
  readingPace,
} from '@/lib/readingStats';

const NUM = new Intl.NumberFormat('en-US');

export async function getStaticProps() {
  let data = null;
  try {
    data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'goodreads.json'), 'utf-8'),
    );
  } catch {
    data = null;
  }

  const history = data?.readHistory ?? [];
  // Pace is quoted next to the 12-month headline, so it has to use the same
  // window; one book finished in 2024 otherwise drags it to 8 pages a day.
  const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const windowed = history.filter(b => Date.parse(b?.dateRead ?? '') >= yearAgo);
  // Resolved at build time like the rest of the site, so the charts are in the
  // prerendered HTML and `now` cannot differ between server and client.
  const now = Date.now();

  return {
    props: {
      staleness: getStaleness(data?.generated_at) ?? null,
      profileUrl: data?.profileUrl ?? null,
      yearPages: Number(data?.yearPagesRead) || 0,
      yearBooks: Number(data?.yearBooksRead) || 0,
      totalPages: Number(data?.totalPages) || 0,
      currentlyReading: data?.currentlyReading ?? [],
      months: pagesByMonth(history, 12, now),
      histogram: ratingHistogram(history),
      critic: criticProfile(history),
      longest: longestBook(history),
      pace: readingPace(windowed, now),
    },
  };
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900 ${className}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
        {title}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{subtitle}</div>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MonthlyChart({ months }) {
  const max = Math.max(1, ...months.map(m => m.pages));

  return (
    <div>
      <div className="flex h-[120px] items-end gap-1.5">
        {months.map(month => (
          <div key={month.key} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className={`w-full rounded-t transition-colors ${
                month.pages > 0
                  ? 'bg-amber-400 group-hover:bg-amber-500 dark:bg-amber-500/80 dark:group-hover:bg-amber-400'
                  : 'bg-stone-100 dark:bg-stone-800'
              }`}
              // A read month never renders as a hairline; an empty one stays a
              // visible floor so the gap reads as zero rather than as missing.
              style={{ height: month.pages > 0 ? `${Math.max(4, (month.pages / max) * 100)}%` : 3 }}
            />
            {month.pages > 0 && (
              <div className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-1.5 py-0.5 text-[10px] font-medium text-white group-hover:block dark:bg-stone-100 dark:text-stone-900">
                {NUM.format(month.pages)} pp · {month.books}{' '}
                {month.books === 1 ? 'book' : 'books'}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {months.map(month => (
          <div
            key={month.key}
            className="flex-1 text-center text-[9px] tabular-nums text-stone-500 dark:text-stone-400"
          >
            {month.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Histogram({ histogram }) {
  const max = Math.max(1, ...histogram.map(h => h.count));
  const total = histogram.reduce((s, h) => s + h.count, 0);

  return (
    <ul className="space-y-1.5">
      {[...histogram].reverse().map(row => (
        <li key={row.rating} className="flex items-center gap-2">
          <span className="w-10 flex-none text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
            {row.rating}★
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <span
              className="block h-full rounded-full bg-amber-400 dark:bg-amber-500"
              style={{ width: row.count ? `${(row.count / max) * 100}%` : 0 }}
            />
          </span>
          <span className="w-8 flex-none text-right text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
            {row.count}
          </span>
        </li>
      ))}
      <li className="pt-1 text-[10px] text-stone-500 dark:text-stone-400">
        {total} rated {total === 1 ? 'book' : 'books'}
      </li>
    </ul>
  );
}

function Disagreement({ label, entry, tone }) {
  if (!entry) return null;
  const sign = entry.delta > 0 ? '+' : '';
  const toneClass =
    tone === 'warm'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-stone-900 dark:text-stone-100">
        {entry.link ? (
          <a href={entry.link} target="_blank" rel="noreferrer" className="hover:underline">
            {entry.title}
          </a>
        ) : (
          entry.title
        )}
      </div>
      <div className="text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
        you {entry.rating.toFixed(0)}★ · goodreads {entry.avgRating.toFixed(2)}★{' '}
        <span className={`font-semibold ${toneClass}`}>
          {sign}
          {entry.delta.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default function Reading({
  staleness,
  profileUrl,
  yearPages,
  yearBooks,
  totalPages,
  currentlyReading,
  months,
  histogram,
  critic,
  longest,
  pace,
}) {
  const benchmark = pickReadingBenchmark(yearPages);
  const target = benchmark?.target ?? null;
  const cleared =
    benchmark?.cleared && benchmark.cleared.label !== target?.label ? benchmark.cleared : null;
  const ratio = target ? yearPages / target.pages : 0;
  const pagesInFlight = currentlyReading.reduce((s, b) => s + (Number(b?.numPages) || 0), 0);

  return (
    <>
      <Head>
        <title>Reading — Sean P. May</title>
        <meta
          name="description"
          content={`${NUM.format(yearPages)} pages across ${yearBooks} books in the past 12 months — what Sean May has been reading, and how his ratings compare to Goodreads.`}
        />
      </Head>
      <ProjectPageHeader />

      <main id="main-content" className="section-container pb-20 pt-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              reading
            </h1>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-stone-600 dark:text-stone-300">
              everything below is pulled from goodreads on a daily cron — no hand-kept list
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StaleBadge staleness={staleness} />
            {profileUrl && (
              <PillLink href={profileUrl} external variant="outline" className="text-sm">
                goodreads profile
              </PillLink>
            )}
          </div>
        </div>

        {/* Headline */}
        <section className="mb-5 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700/80 dark:text-amber-400/80">
                past 12 months
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold leading-none text-stone-900 dark:text-stone-50">
                  {NUM.format(yearPages)}
                </span>
                <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  pages
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  · {yearBooks} books
                </span>
              </div>
            </div>
            {pace && (
              <div className="text-sm text-stone-600 dark:text-stone-300">
                <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {pace.pagesPerDay.toFixed(0)}
                </span>{' '}
                pages a day ·{' '}
                <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {pace.daysPerBook.toFixed(0)}
                </span>{' '}
                days a book
              </div>
            )}
          </div>

          {target && (
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium text-amber-700 dark:text-amber-300">
                  📚 {target.label}
                </span>
                <span className="font-semibold text-stone-600 dark:text-stone-300">
                  {ratio >= 1 ? `${ratio.toFixed(1)}×` : `${Math.round(ratio * 100)}%`}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40"
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round(ratio * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${NUM.format(yearPages)} pages — ${Math.round(ratio * 100)}% of ${target.label}`}
              >
                <div
                  className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
                  style={{ width: `${Math.max(2, Math.min(100, ratio * 100))}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                all {target.books} books run ~{NUM.format(target.pages)} pages
                {cleared && ` · already past ${cleared.label}`}
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="pages per month" subtitle="last 12 months" className="lg:col-span-2">
            <MonthlyChart months={months} />
          </Panel>

          <Panel title="how i rate" subtitle="every book i've logged">
            <Histogram histogram={histogram} />
          </Panel>

          {critic && (
            <Panel title="harsh critic?" subtitle="me vs the goodreads crowd" className="lg:col-span-2">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tabular-nums leading-none text-stone-900 dark:text-stone-50">
                    {critic.yourAverage.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">my average</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tabular-nums leading-none text-stone-500 dark:text-stone-400">
                    {critic.goodreadsAverage.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">goodreads</span>
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-300">
                  {Math.abs(critic.delta) < 0.15
                    ? 'about average, then'
                    : critic.delta < 0
                      ? `${Math.abs(critic.delta).toFixed(2)}★ stingier than the crowd`
                      : `${critic.delta.toFixed(2)}★ softer than the crowd`}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Disagreement label="liked it far more" entry={critic.warmest} tone="warm" />
                <Disagreement label="liked it far less" entry={critic.coldest} tone="cold" />
              </div>
            </Panel>
          )}

          <Panel title="on the pile" subtitle={`${NUM.format(pagesInFlight)} pages in flight`}>
            {currentlyReading.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">nothing on the go</p>
            ) : (
              <ul className="space-y-2">
                {currentlyReading.map(b => (
                  <li key={b.bookId || b.title} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-stone-800 dark:text-stone-200">
                      {b.link ? (
                        <a href={b.link} target="_blank" rel="noreferrer" className="hover:underline">
                          {b.title}
                        </a>
                      ) : (
                        b.title
                      )}
                    </span>
                    {b.numPages > 0 && (
                      <span className="flex-none text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
                        {NUM.format(b.numPages)} pp
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {longest && (
            <Panel title="longest sitting" className="lg:col-span-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {longest.link ? (
                    <a href={longest.link} target="_blank" rel="noreferrer" className="hover:underline">
                      {longest.title}
                    </a>
                  ) : (
                    longest.title
                  )}
                </span>
                {longest.author && (
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {longest.author}
                  </span>
                )}
                <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {NUM.format(longest.numPages)} pages
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  — {NUM.format(totalPages)} pages read all-time
                </span>
              </div>
            </Panel>
          )}
        </div>
      </main>
    </>
  );
}
