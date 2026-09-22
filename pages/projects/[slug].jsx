import Head from 'next/head';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import ProjectPageHeader from '@/components/ProjectPageHeader';
import PillLink from '@/components/ui/PillLink';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';
import { sortProjectLinks } from '@/lib/projectDisplay';
import CoverArt, { hasMotif } from '@/components/projects/CoverArt';

const allProjects = validateProjects(rawProjects) ? rawProjects : [];

export async function getStaticPaths() {
  const paths = allProjects
    .filter(p => typeof p.slug === 'string' && p.slug.length > 0)
    .map(p => ({ params: { slug: p.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const project = allProjects.find(p => p.slug === params.slug) || null;
  return { props: { project } };
}

/**
 * Detail pages used a visual language of their own: white cards on a plain
 * background, teal gradient callouts, and a five-colour rainbow on the
 * numbered steps. They are where anyone who actually cares about a project
 * ends up, and they looked like a different site from the one that sent
 * them there. This is the same board, paper and stamps as the home page,
 * with one accent colour instead of five.
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

export default function ProjectDetail({ project }) {
  if (!project) return null;
  const {
    title,
    emoji,
    period,
    stack = [],
    bullets = [],
    oneLiner,
    links = [],
    summary,
    overview,
    proofPoints = [],
    whatIBuilt = [],
    howItWorks = [],
    results = [],
    nextSteps = [],
    coverImage,
    coverArt,
    gallery = [],
  } = project;

  const overviewText = overview || summary || project.cardDescription || oneLiner || '';
  const proofList = proofPoints.length ? proofPoints : bullets;
  const builtList = whatIBuilt.length ? whatIBuilt : bullets;
  const howList = howItWorks;
  const galleryList = gallery.length ? gallery : project.images || [];
  const sortedLinks = sortProjectLinks(links);

  return (
    <>
      <Head>
        <title>{`${title} — Projects — Sean P. May`}</title>
        <meta name="description" content={overviewText || title} />
      </Head>
      <ProjectPageHeader />

      <main id="main-content" className="section-container pb-16 pt-24">
        <div className="mb-6">
          <a
            href="/projects/"
            className="font-hand text-lg text-stone-500 underline-offset-4 transition-colors hover:text-teal-700 hover:underline dark:text-stone-400 dark:hover:text-teal-400"
          >
            ← all projects
          </a>
        </div>

        <Pinboard>
          <div className="space-y-10">
            {/* ── Masthead: cover, title, links, overview ── */}
            <header className="space-y-6">
              <PinCard rotation={-0.7} pinColor="red">
                <div className="aspect-[3/1] overflow-hidden rounded-sm border border-stone-200/80 dark:border-stone-700/80">
                  {hasMotif(coverArt?.motif) ? (
                    <CoverArt motif={coverArt.motif} line={coverArt.line} />
                  ) : coverImage?.src ? (
                    <img
                      src={coverImage.src}
                      alt={coverImage.alt || ''}
                      loading="eager"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
                  )}
                </div>
              </PinCard>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="flex items-center gap-3 font-display text-3xl tracking-tight text-stone-900 md:text-4xl dark:text-stone-50">
                    {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
                    {title}
                  </h1>
                  {period && <p className="text-stone-600 dark:text-stone-300">{period}</p>}
                </div>
                {sortedLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sortedLinks.map((link, index) => (
                      <PillLink
                        key={`${link.href}-${index}`}
                        href={link.href}
                        external
                        variant={index === 0 ? 'solid' : 'outline'}
                      >
                        {link.label}
                      </PillLink>
                    ))}
                  </div>
                )}
              </div>

              {!!stack.length && (
                <div className="flex flex-wrap gap-2">
                  {stack.map(s => (
                    <span key={s} className="badge">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {overviewText && (
                <p className="max-w-3xl text-lg leading-relaxed text-stone-700 dark:text-stone-200">
                  {overviewText}
                </p>
              )}
            </header>

            {/* ── The three things worth knowing, as notes on the board ── */}
            {proofList.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-3">
                {proofList.slice(0, 3).map((point, i) => (
                  <Sheet
                    key={i}
                    rotation={[-1.2, 0.8, -0.6][i % 3]}
                    pinColor={['red', 'blue', 'green'][i % 3]}
                    fastener={i === 1 ? 'tape' : 'pin'}
                  >
                    <p className="text-sm leading-snug text-stone-700 dark:text-stone-200">{point}</p>
                  </Sheet>
                ))}
              </div>
            )}

            {/* ── What I built / How it works ── */}
            {(builtList.length > 0 || howList.length > 0) && (
              <div className={`grid gap-8 ${builtList.length && howList.length ? 'lg:grid-cols-2' : ''}`}>
                {builtList.length > 0 && (
                  <section>
                    <Stamped>what i built</Stamped>
                    <Sheet rotation={-0.4} pinColor="yellow">
                      <ul className="space-y-3">
                        {builtList.map((item, i) => (
                          <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                            <span className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Sheet>
                  </section>
                )}

                {howList.length > 0 && (
                  <section>
                    <Stamped>how it works</Stamped>
                    <Sheet rotation={0.5} pinColor="blue" fastener="tape">
                      <ol className="space-y-3">
                        {howList.map((item, i) => (
                          <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                            {/* One ink colour. The old version cycled five,
                                which made a numbered list look like a chart
                                legend for data that did not exist. */}
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

            {/* ── Results ── */}
            {results.length > 0 && (
              <section>
                <Stamped>results</Stamped>
                <Sheet rotation={-0.3} pinColor="green">
                  <ul className="space-y-2.5">
                    {results.map((item, i) => (
                      <li key={i} className="flex gap-3 text-stone-700 dark:text-stone-300">
                        <span className="mt-0.5 flex-shrink-0 text-base text-teal-600 dark:text-teal-400">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Sheet>
              </section>
            )}

            {/* ── Gallery, pinned up like photos ── */}
            {galleryList.length > 0 && (
              <section>
                <Stamped>screenshots</Stamped>
                <div className="grid gap-6 sm:grid-cols-2">
                  {galleryList.map((img, i) => (
                    <PinCard
                      key={i}
                      rotation={[-1.1, 0.9, -0.7, 1.2][i % 4]}
                      pinColor={['red', 'teal', 'yellow', 'blue'][i % 4]}
                      fastener={i % 3 === 1 ? 'tape' : 'pin'}
                    >
                      <figure className="paper rounded-sm border border-stone-200/80 p-2 pb-3 dark:border-stone-700/80">
                        <img
                          src={img.src}
                          alt={img.alt || ''}
                          loading="lazy"
                          className="w-full rounded-sm"
                        />
                        {img.caption && (
                          <figcaption className="font-hand px-1 pt-2 text-lg leading-tight text-stone-600 dark:text-stone-300">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    </PinCard>
                  ))}
                </div>
              </section>
            )}

            {/* ── What's next: a margin note, not a section ── */}
            {nextSteps.length > 0 && (
              <section className="border-t border-stone-300/60 pt-6 dark:border-stone-700/60">
                <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                  what&apos;s next
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
