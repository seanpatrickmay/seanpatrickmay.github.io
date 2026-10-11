import { ArrowRight, ChevronRight } from 'lucide-react';
import PinCard from '@/components/PinCard';
import { headline, historyLine } from '@/lib/wikiStrip';

const LINK =
  'rounded-sm underline decoration-stone-400/70 underline-offset-2 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-teal-400';

/**
 * The project's code wiki in one card: its size, how much of it cites
 * code, whose code it is, and the features worth opening. On a wikied
 * project it stands in for "how it works", since the wiki explains that
 * in more depth and regenerates as the code changes.
 *
 * The numbers come from public/wikis.json, which scripts/update_wikis.mjs
 * refreshes daily. No entry, no strip; a stale entry says when it is from.
 * Each line renders only when it has something to say, so a wiki with no
 * code languages shows no empty languages line.
 */
export default function WikiStrip({ wiki, staleness = null }) {
  if (!wiki) return null;
  const history = historyLine(wiki, staleness);
  const languages = wiki.languages ?? [];
  const highlights = wiki.highlights ?? [];
  return (
    <section data-section="wiki" aria-label="code wiki">
      <PinCard rotation={-0.3} pinColor="blue" fastener="pin" className="mx-auto sm:max-w-2xl">
        <div className="paper rounded-sm border border-stone-200/80 px-4 py-4 sm:px-5 dark:border-stone-700/80">
          <p className="font-semibold text-stone-900 dark:text-stone-50">
            <span aria-hidden="true" className="mr-1.5">📖</span>
            <span data-wiki-headline="">{headline(wiki)}</span>
          </p>
          {history && (
            <p data-wiki-history="" className="mt-1 text-sm text-stone-700 dark:text-stone-200">
              {history}
            </p>
          )}
          {languages.length > 0 && (
            <p data-wiki-languages="" className="text-sm text-stone-600 dark:text-stone-300">
              {languages.join(' · ')}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
            {highlights.length > 0 && (
              <ul aria-label="features in the wiki" className="flex flex-wrap gap-x-4 gap-y-1.5">
                {highlights.map(h => (
                  <li key={h.id}>
                    <a
                      href={h.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-wiki-feature=""
                      className={`text-stone-800 dark:text-stone-100 ${LINK}`}
                    >
                      <ChevronRight className="mr-0.5 inline h-3.5 w-3.5 align-[-2px] text-teal-700 dark:text-teal-400" aria-hidden="true" />
                      {h.title}
                      <span className="sr-only">, in the wiki (opens in new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={wiki.url}
              target="_blank"
              rel="noopener noreferrer"
              data-wiki-link=""
              className={`font-medium text-teal-800 dark:text-teal-300 ${LINK}`}
            >
              read the wiki
              <ArrowRight className="ml-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>
      </PinCard>
    </section>
  );
}
