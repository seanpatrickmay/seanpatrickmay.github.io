import Head from 'next/head';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import ProjectPageHeader from '@/components/ProjectPageHeader';
import PillLink from '@/components/ui/PillLink';
import { sortProjectLinks } from '@/lib/projectDisplay';

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
    gallery = [],
  } = project;

  const overviewText = overview || summary || project.cardDescription || oneLiner || '';
  const proofList = proofPoints.length ? proofPoints : bullets;
  const builtList = whatIBuilt.length ? whatIBuilt : bullets;
  const howList = howItWorks.length ? howItWorks : [];
  const resultsList = results.length ? results : [];
  const nextList = nextSteps.length ? nextSteps : [];
  const galleryList = gallery.length ? gallery : project.images || [];
  const sortedLinks = sortProjectLinks(links);

  return (
    <>
      <Head>
        <title>{`${title} — Projects — Sean P. May`}</title>
        <meta name="description" content={overviewText || title} />
      </Head>
      <ProjectPageHeader />

      <main id="main-content" className="section-container pt-24 pb-16">
        <div className="mb-8">
          <a href="/projects/" className="text-sm text-slate-500 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors">
            &larr; all projects
          </a>
        </div>

        {/* ── Hero: cover + title + overview + proof points ── */}
        <header className="space-y-6 mb-12">
          {coverImage?.src && (
            <div className="rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-800/60 shadow-sm">
              <img src={coverImage.src} alt={coverImage.alt || ''} loading="lazy" className="w-full h-auto" />
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-display text-3xl md:text-4xl tracking-tight flex items-center gap-3">
                {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
                {title}
              </h1>
              {period && (
                <p className="text-slate-500 dark:text-slate-300">{period}</p>
              )}
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
              {stack.map(s => <span key={s} className="badge">{s}</span>)}
            </div>
          )}

          {overviewText && (
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl">
              {overviewText}
            </p>
          )}

          {proofList.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              {proofList.map((point, i) => {
                const rotations = [-0.5, 0.3, -0.2, 0.4, -0.3];
                const rotation = rotations[i % rotations.length];
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/80 to-white px-4 py-3 shadow-sm dark:border-teal-500/20 dark:from-teal-950/30 dark:to-slate-900/50 motion-reduce:!rotate-0"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{point}</p>
                  </div>
                );
              })}
            </div>
          )}
        </header>

        {/* ── Two-column: What I Built + How It Works ── */}
        {(builtList.length > 0 || howList.length > 0) && (
          <section className="mb-12">
            <div className={`grid gap-8 ${builtList.length > 0 && howList.length > 0 ? 'lg:grid-cols-2' : ''}`}>
              {builtList.length > 0 && (
                <div>
                  <h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50 mb-4">
                    what i built
                  </h2>
                  <ul className="space-y-3">
                    {builtList.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {howList.length > 0 && (
                <div>
                  <h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50 mb-4">
                    how it works
                  </h2>
                  <ol className="space-y-3">
                    {howList.map((item, i) => {
                      const colors = [
                        'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
                        'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
                        'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
                      ];
                      return (
                        <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
                          <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${colors[i % colors.length]}`}>
                            {i + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Results: callout style ── */}
        {resultsList.length > 0 && (
          <section className="mb-12 rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50/50 via-white to-sky-50/30 p-6 shadow-sm dark:border-teal-800/40 dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900/80">
            <h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50 mb-4">
              results
            </h2>
            <ul className="space-y-2">
              {resultsList.map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-teal-500 mt-0.5 flex-shrink-0 text-base">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Gallery ── */}
        {galleryList.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50 mb-4">
              screenshots
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryList.map((img, i) => {
                const rotations = [0.5, -0.8, 0.6, -0.4];
                return (
                  <figure
                    key={i}
                    className="rounded-xl overflow-hidden border border-slate-200/70 bg-white/60 shadow-sm transition-transform hover:scale-[1.01] dark:border-slate-800/60 dark:bg-slate-900/60 motion-reduce:!rotate-0 motion-reduce:hover:!scale-100"
                    style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}
                  >
                    <img src={img.src} alt={img.alt || ''} loading="lazy" className="w-full h-auto" />
                    {img.caption && (
                      <figcaption className="p-3 text-sm text-slate-500 dark:text-slate-300">{img.caption}</figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Next steps: subtle, at the bottom ── */}
        {nextList.length > 0 && (
          <section className="mb-12 border-t border-slate-200/70 dark:border-slate-800/60 pt-8">
            <h2 className="text-sm font-semibold lowercase tracking-widest text-slate-500 dark:text-slate-300 mb-3">
              what's next
            </h2>
            <ul className="space-y-1">
              {nextList.map((item, i) => (
                <li key={i} className="text-sm text-slate-500 dark:text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
