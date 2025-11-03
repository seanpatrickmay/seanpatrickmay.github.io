import Head from 'next/head';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';

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
    slug,
    summary,
    highlights = [],
    images = [],
    role,
    outcomes,
  } = project;

  const highlightList = highlights.length ? highlights : bullets;

  return (
    <>
      <Head>
        <title>{title} — Projects — Sean P. May</title>
        <meta name="description" content={oneLiner || summary || title} />
      </Head>
      <main className="section-container pt-24 pb-16 space-y-8">
        <div>
          <a href="/projects" className="text-sm text-slate-600 hover:underline dark:text-slate-300">← All projects</a>
        </div>
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
              {title}
            </h1>
            <div className="text-slate-600 dark:text-slate-300">
              {period}
            </div>
            {typeof project.coolness === 'number' && (
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Coolness score: {project.coolness}
              </div>
            )}
            {!!stack.length && (
              <div className="flex flex-wrap gap-2 pt-1">
                {stack.map(s => <span key={s} className="badge">{s}</span>)}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {links.map((l, i) => (
              <PillLink key={i} href={l.href} external>{l.label}</PillLink>
            ))}
          </div>
        </header>

        {summary && (
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent><p className="text-slate-700 dark:text-slate-200">{summary}</p></CardContent>
          </Card>
        )}

        {!!highlightList.length && (
          <Card>
            <CardHeader><CardTitle>Highlights</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {highlightList.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {!!images.length && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Screenshots</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((img, i) => (
                <figure key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/60 dark:bg-slate-900/60">
                  <img src={img.src} alt={img.alt || ''} className="w-full h-auto" />
                  {(img.caption) && (
                    <figcaption className="p-2 text-sm text-slate-600 dark:text-slate-400">{img.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {(role || outcomes) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {role && (
              <Card>
                <CardHeader><CardTitle>My Role</CardTitle></CardHeader>
                <CardContent><p>{role}</p></CardContent>
              </Card>
            )}
            {outcomes && (
              <Card>
                <CardHeader><CardTitle>Outcomes</CardTitle></CardHeader>
                <CardContent><p>{outcomes}</p></CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </>
  );
}
