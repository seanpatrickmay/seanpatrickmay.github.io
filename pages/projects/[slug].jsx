import Head from 'next/head';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
      <main className="section-container pt-24 pb-16 space-y-8">
        <div>
          <a href="/projects/" className="text-sm text-slate-600 hover:underline dark:text-slate-300">← All projects</a>
        </div>
        <header className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
                {title}
              </h1>
              {period && (
                <div className="text-slate-600 dark:text-slate-300">
                  {period}
                </div>
              )}
              {!!stack.length && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {stack.map(s => <span key={s} className="badge">{s}</span>)}
                </div>
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

          {coverImage?.src && (
            <div className="rounded-3xl overflow-hidden border border-slate-200/70 bg-white/60 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
              <img src={coverImage.src} alt={coverImage.alt || ''} className="w-full h-auto" />
            </div>
          )}
        </header>

        {overviewText && (
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-200">{overviewText}</p>
            </CardContent>
          </Card>
        )}

        {proofList.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Proof points</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {proofList.map((point, i) => (
                  <li key={i} className="text-sm text-slate-700 dark:text-slate-200">• {point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {builtList.length > 0 && (
          <Card>
            <CardHeader><CardTitle>What I built</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {builtList.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {howList.length > 0 && (
          <Card>
            <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2">
                {howList.map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            </CardContent>
          </Card>
        )}

        {resultsList.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {resultsList.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {nextList.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Next steps</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {nextList.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {galleryList.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Screenshots</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryList.map((img, i) => (
                <figure key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/60 dark:bg-slate-900/60">
                  <img src={img.src} alt={img.alt || ''} className="w-full h-auto" />
                  {img.caption && (
                    <figcaption className="p-2 text-sm text-slate-600 dark:text-slate-400">{img.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
