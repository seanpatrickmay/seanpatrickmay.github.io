import Link from 'next/link';
import { Github } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';
import { pickHighlightTag, pickHighlightTech, pickProofPoints, sortProjectLinks } from '@/lib/projectDisplay';

export default function ProjectHero({ project }) {
  if (!project) return null;

  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
  const description = project.cardDescription || project.featuredDescription || project.oneLiner || '';
  const tag = pickHighlightTag(project);
  const tech = pickHighlightTech(project);
  const points = pickProofPoints(project, 3);
  const links = sortProjectLinks(project.links || []);
  const liveLink = links.find(link => link.kind === 'live');
  const repoLink = links.find(link => link.kind === 'repo');

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-lg dark:border-slate-800/70 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[1fr_1fr] items-stretch">
        {project.coverImage?.src ? (
          <Link href={href} className="relative block h-56 sm:h-64 lg:h-full lg:min-h-[320px] bg-slate-900 overflow-hidden group">
            <img
              src={project.coverImage.src}
              alt={project.coverImage.alt || ''}
              loading="eager"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>
        ) : (
          <div className="h-56 sm:h-64 lg:h-full lg:min-h-[320px] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
        )}

        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {tag && <Badge variant="outline" className="text-xs">{tag}</Badge>}
              {tech && <Badge className="text-xs">{tech}</Badge>}
            </div>
            <Link href={href} className="block group">
              <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {project.emoji && <span className="mr-2">{project.emoji}</span>}
                {project.title}
              </h2>
            </Link>
            {project.period && (
              <div className="text-sm text-slate-500 dark:text-slate-300">{project.period}</div>
            )}
            {description && (
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
            )}
          </div>

          {points.length > 0 && (
            <ul className="space-y-2">
              {points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            <PillLink href={href} variant="solid" className="px-5">
              deep dive
            </PillLink>
            {liveLink && (
              <PillLink href={liveLink.href} external variant="outline" className="px-4 text-sm">
                {liveLink.label || 'Live'}
              </PillLink>
            )}
            {repoLink && (
              <PillLink href={repoLink.href} external variant="outline" icon={Github} className="text-sm">
                {repoLink.label || 'Repo'}
              </PillLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
