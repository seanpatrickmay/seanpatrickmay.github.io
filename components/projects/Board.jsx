import { useMemo, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PinCard from '@/components/PinCard';
import BoardCard from '@/components/projects/BoardCard';
import Artifact from '@/components/projects/Artifact';
import Thread from '@/components/projects/Thread';
import { boardClusters, threadPairs, BOARD_NOTE } from '@/lib/board';

/**
 * The project board: two clusters, "things that run" and "things that think",
 * so a SWE reader and a quant reader each find their half at a glance.
 *
 * Size is rank. Each cluster leads with two big cards, then its small ones,
 * and the DOM follows that rank exactly. The scatter is visual only, so Tab
 * and screen readers walk the cards best-first.
 *
 * At xl the clusters sit side by side, each on a six-column grid (big cards
 * span three, small cards two). Below xl they stack, "run" first, with jump
 * links at the top so a quant reader can skip to their half. A stacked cluster
 * is full board width, so from lg its big cards stay wide enough to hold their
 * cover captions and the evidence hung off them.
 */

// Fixed cycles, so a card's tilt and pin colour are stable across renders.
const ROTATIONS = [-1.2, 0.9, -0.7, 1.1, -0.9, 0.6];
const PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];

// headingLevel: 3 under the home page's "projects" h2; 2 on /projects/, under
// its h1. A skipped level is what Lighthouse's heading-order audit flags.
export default function Board({ projects, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const ref = useRef(null);
  const clusters = useMemo(() => boardClusters(projects), [projects]);
  const pairs = useMemo(() => threadPairs(projects), [projects]);

  return (
    <div ref={ref} data-board="" className="relative">
      <nav
        aria-label="Jump to a cluster"
        className="mb-6 flex flex-wrap items-center gap-x-3 font-hand text-xl text-stone-600 dark:text-stone-300 xl:hidden"
      >
        {clusters.map((cluster, i) => (
          <span key={cluster.id} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true">·</span>}
            <a
              href={`#board-${cluster.id}`}
              className="underline decoration-stone-300 underline-offset-4 hover:text-teal-800 dark:decoration-stone-600 dark:hover:text-teal-400"
            >
              {cluster.label}
            </a>
          </span>
        ))}
      </nav>

      <div className="grid gap-y-14 xl:grid-cols-2 xl:gap-x-12">
        {clusters.map((cluster, ci) => (
          <section key={cluster.id} aria-labelledby={`board-${cluster.id}`}>
            <Heading
              id={`board-${cluster.id}`}
              className="mb-6 scroll-mt-36 font-hand text-3xl text-stone-600 dark:text-stone-300 lg:scroll-mt-16"
            >
              {cluster.label}
            </Heading>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-6">
              {[...cluster.big, ...cluster.small].map((project, i) => {
                const big = project.board.size === 'big';
                return (
                  <div
                    key={project.slug}
                    data-board-slug={project.slug}
                    className={`relative ${big ? 'col-span-2 lg:col-span-3' : 'col-span-1 lg:col-span-2'}`}
                  >
                    <PinCard
                      rotation={ROTATIONS[(i + ci) % ROTATIONS.length]}
                      pinColor={PIN_COLORS[(i + ci * 2) % PIN_COLORS.length]}
                      fastener={i === 1 ? 'tape' : 'pin'}
                    >
                      <BoardCard project={project} />
                    </PinCard>
                    {(project.artifacts ?? []).map((artifact, ai) => (
                      <Artifact key={`${project.slug}-${ai}`} artifact={artifact} />
                    ))}
                  </div>
                );
              })}

              {ci === clusters.length - 1 && (
                <a
                  href={BOARD_NOTE.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 self-center justify-self-start rounded-sm border border-dashed border-stone-400 bg-[#fdfbf6] px-4 py-3 font-hand text-xl text-teal-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 motion-safe:-rotate-2 dark:border-stone-600 dark:bg-stone-900 dark:text-teal-300"
                >
                  {BOARD_NOTE.text}
                  <ArrowUpRight className="ml-1 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              )}
            </div>
          </section>
        ))}
      </div>

      <Thread containerRef={ref} pairs={pairs} />
    </div>
  );
}
