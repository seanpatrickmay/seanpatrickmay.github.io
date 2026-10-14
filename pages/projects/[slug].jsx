import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import rawWikis from '@/public/wikis.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { assertValidDeepDives, DEEP_DIVE_LABELS, MAX_STACK_CHIPS, overviewText } from '@/lib/deepDive';
import { sortProjectLinks } from '@/lib/projectDisplay';
import { highlightsFor, resolveWikiMetrics } from '@/lib/wikiStrip';
import { getStaleness } from '@/lib/freshness';
import ProjectPageHeader from '@/components/ProjectPageHeader';
import PillLink from '@/components/ui/PillLink';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';
import MetricsStrip from '@/components/projects/MetricsStrip';
import LeadFigure from '@/components/projects/LeadFigure';
import WikiStrip from '@/components/projects/WikiStrip';

const allProjects = validateProjects(rawProjects) ? rawProjects : [];

export async function getStaticPaths() {
  // A broken deep dive fails the build, the way a broken board does,
  // instead of shipping a metric with no source.
  assertValidDeepDives(allProjects, rawWikis);
  const paths = allProjects
    .filter(p => typeof p.slug === 'string' && p.slug.length > 0)
    .map(p => ({ params: { slug: p.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const raw = allProjects.find(p => p.slug === params.slug) || null;
  // RepoWiki's totals are filled from wikis.json here, so the page and the
  // build gate see the same numbers.
  const project = raw ? resolveWikiMetrics(raw, rawWikis) : null;
  const entry = (raw?.wiki && rawWikis.wikis?.[raw.wiki.slug]) || null;
  // wikis.json only changes when the daily feed runs, so the strip takes its highlights from the ids projects.json names now.
  const wiki = entry && { ...entry, highlights: highlightsFor(entry, raw.wiki.highlight) };
  return { props: { project, wiki, wikiStaleness: wiki ? getStaleness(wiki.fetchedAt) : null } };
}

/**
 * A deep dive, evidence first: the numbers with their sources, then a real
 * figure, then the project's code wiki where it has one, then the story.
 * Every fact appears once. The old template showed the same numbers in the
 * overview, three proof cards and a results list.
 *
 * Each section's root carries data-section, in DEEP_DIVE_SECTIONS order;
 * lib/deepDiveExport.test.mjs holds the export to it.
 */

/** A stamped heading, matching the section headings on the home page. */
function Stamped({ children }) {
  return (
    <div className="mb-4">
      <div className="stamp">
        <h2 className="font-display text-2xl tracking-tight">{children}</h2>
      </div>
    </div>
  );
}

/** Paper, for a block of content sitting on the board. */
function Sheet({ children, className = '', rotation = 0, pinColor = 'teal', fastener = 'pin' }) {
  return (
    <PinCard rotation={rotation} pinColor={pinColor} fastener={fastener}>
      <div className={`paper rounded-sm border border-stone-200/80 p-5 dark:border-stone-700/80 ${className}`}>
        {children}
      </div>
    </PinCard>
  );
}

function Dot() {
  return <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />;
}

export default function ProjectDetail({ project, wiki = null, wikiStaleness = null }) {
  if (!project) return null;
  const {
    title,
    emoji,
    period,
    credits,
    stack = [],
    links = [],
    linksNote,
    metrics = [],
    whatIBuilt = [],
    howItWorks = [],
    findings = [],
    nextSteps = [],
  } = project;

  const overview = overviewText(project);
  const sortedLinks = sortProjectLinks(links);
  const canonical = `https://seanpatrickmay.me/projects/${project.slug}/`;
  const imagePath = project.coverImage?.src || project.leadFigure?.src || '/images/headshot.png';
  const image = imagePath.startsWith('http') ? imagePath : `https://seanpatrickmay.me${imagePath}`;
  const description = overview || project.oneLiner || `${title} by Sean P. May`;

  return (
    <>
      <Head>
        <title>{`${title} — Projects — Sean P. May`}</title>
        <meta name="description" content={description} />
        <link key="canonical" rel="canonical" href={canonical} />
        <meta key="og:title" property="og:title" content={`${title} — Sean P. May`} />
        <meta key="og:description" property="og:description" content={description} />
        <meta key="og:url" property="og:url" content={canonical} />
        <meta key="og:type" property="og:type" content="article" />
        <meta key="og:image" property="og:image" content={image} />
        <meta key="twitter:title" name="twitter:title" content={`${title} — Sean P. May`} />
        <meta key="twitter:description" name="twitter:description" content={description} />
        <meta key="twitter:image" name="twitter:image" content={image} />
      </Head>
      <ProjectPageHeader />

      <main id="main-content" data-deep-dive="" className="section-container pb-16 pt-20 sm:pt-24">
        <div data-section="back" className="mb-4 sm:mb-6">
          <a
            href="/projects/"
            className="font-hand text-lg text-stone-500 underline-offset-4 transition-colors hover:text-teal-700 hover:underline dark:text-stone-400 dark:hover:text-teal-400"
          >
            <ArrowLeft className="mr-1 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
            {DEEP_DIVE_LABELS.back}
          </a>
        </div>

        <Pinboard>
          <div className="space-y-6 sm:space-y-8">
            {/* ── Title, period, credits, links ── */}
            <header data-section="masthead" className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <h1 className="flex items-center gap-3 font-display text-3xl tracking-tight text-stone-900 [overflow-wrap:anywhere] md:text-4xl dark:text-stone-50">
                  {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
                  <span className="min-w-0">{title}</span>
                </h1>
                <p className="text-stone-600 dark:text-stone-300">
                  {period}
                  {credits && (
                    <>
                      {/* The spaces sit outside the hidden dot, so a screen reader
                          hears "Mar 2026 with …" rather than "Mar 2026with …". */}
                      {' '}<span aria-hidden="true">·</span>{' '}
                      <span data-credits="">{credits}</span>
                    </>
                  )}
                </p>
              </div>
              {(sortedLinks.length > 0 || linksNote) && (
                <div className="flex flex-wrap items-center gap-2">
                  {sortedLinks.map((link, index) => (
                    <PillLink key={`${link.href}-${index}`} href={link.href} external variant={index === 0 ? 'solid' : 'outline'}>
                      {link.label}
                    </PillLink>
                  ))}
                  {/* A private repo says why there is nothing to click,
                      rather than leaving the space blank. */}
                  {linksNote && <p className="text-sm italic text-stone-600 dark:text-stone-300">🔒 {linksNote}</p>}
                </div>
              )}
            </header>

            {/* ── Stack: the first four, in the order projects.json lists them ── */}
            {stack.length > 0 && (
              <ul data-section="stack" aria-label="stack" className="flex flex-wrap gap-2">
                {stack.slice(0, MAX_STACK_CHIPS).map(s => (
                  <li key={s} data-stack-chip="" className="badge">
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <MetricsStrip metrics={metrics} />

            <LeadFigure project={project} />

            <WikiStrip wiki={wiki} staleness={wikiStaleness} />

            {overview && (
              <p data-section="overview" className="max-w-3xl text-lg leading-relaxed text-stone-700 dark:text-stone-200">
                {overview}
              </p>
            )}

            {/* ── What I built / How it works ── */}
            {(whatIBuilt.length > 0 || howItWorks.length > 0) && (
              <div className={`grid gap-8 ${whatIBuilt.length && howItWorks.length ? 'lg:grid-cols-2' : ''}`}>
                {whatIBuilt.length > 0 && (
                  <section data-section="built">
                    <Stamped>{DEEP_DIVE_LABELS.built}</Stamped>
                    <Sheet rotation={-0.4} pinColor="yellow">
                      <ul className="space-y-3">
                        {whatIBuilt.map((item, i) => (
                          <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                            <Dot />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Sheet>
                  </section>
                )}

                {howItWorks.length > 0 && (
                  <section data-section="how">
                    <Stamped>{DEEP_DIVE_LABELS.how}</Stamped>
                    <Sheet rotation={0.5} pinColor="blue" fastener="tape">
                      <ol className="space-y-3">
                        {howItWorks.map((item, i) => (
                          <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                            <span className="stat-figure mt-[-0.1rem] w-5 flex-shrink-0 text-lg text-teal-700 dark:text-teal-400">
                              {i + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ol>
                    </Sheet>
                  </section>
                )}
              </div>
            )}

            {/* ── Findings: the lessons, with their numbers left in the strip ── */}
            {findings.length > 0 && (
              <section data-section="findings">
                <Stamped>{DEEP_DIVE_LABELS.findings}</Stamped>
                <Sheet rotation={-0.3} pinColor="green">
                  <ul className="space-y-2.5">
                    {findings.map((item, i) => (
                      <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                        <Dot />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Sheet>
              </section>
            )}

            {/* ── What's next: a margin note, not a section ── */}
            {nextSteps.length > 0 && (
              <section data-section="next" className="border-t border-stone-300/60 pt-6 dark:border-stone-700/60">
                {/* stone-600, not 500: 500 on the kraft board is 3.9:1. */}
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-600 dark:text-stone-300">
                  {DEEP_DIVE_LABELS.next}
                </h2>
                <ul className="space-y-1">
                  {nextSteps.map((item, i) => (
                    <li key={i} className="font-hand text-lg text-stone-600 dark:text-stone-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </Pinboard>
      </main>
    </>
  );
}
