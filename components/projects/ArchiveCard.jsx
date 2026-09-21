import Link from 'next/link';
import { Github } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';
import { pickHighlightTag, pickHighlightTech, sortProjectLinks } from '@/lib/projectDisplay';

/**
 * One project on the wall.
 *
 * The body is deliberately four lines tall and no more: title, one meta line,
 * two lines of description, one row of actions. An earlier version gave the
 * period, the tag and the tech a row each, which pushed every card past 450px
 * — nine of those is most of the section. Period, tag and tech say the same
 * thing in a third of the height when they share a line.
 */
export default function ArchiveCard({ project }) {
  if (!project) return null;

  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
  const description = project.cardDescription || project.featuredDescription || project.oneLiner || '';
  const links = sortProjectLinks(project.links || []);
  const repoLink = links.find(link => link.kind === 'repo');

  // Period first because it orders the wall; then the one tag and one tech
  // worth naming. Empty values drop out rather than leaving stray separators.
  const meta = [project.period, pickHighlightTag(project), pickHighlightTech(project)].filter(Boolean);

  return (
    <Card className="paper flex h-full flex-col overflow-hidden">
      {project.coverImage?.src ? (
        <Link href={href} className="group relative block aspect-[2/1] overflow-hidden bg-slate-900">
          <img
            src={project.coverImage.src}
            alt={project.coverImage.alt || ''}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      ) : (
        <div className="aspect-[2/1] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={href}
          className="flex items-center gap-2 text-base font-semibold leading-tight text-slate-900 transition-colors hover:text-teal-600 dark:text-slate-50 dark:hover:text-teal-400"
        >
          {project.emoji && <span aria-hidden="true">{project.emoji}</span>}
          {project.title}
        </Link>

        {meta.length > 0 && (
          <div className="text-xs leading-tight text-slate-500 dark:text-slate-300">
            {meta.join(' · ')}
          </div>
        )}

        {description && (
          <p className="line-clamp-2 text-sm leading-snug text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {project.slug && (
            <PillLink href={href} variant="solid" className="px-4 text-sm">
              deep dive
            </PillLink>
          )}
          {repoLink && (
            <PillLink href={repoLink.href} external variant="outline" icon={Github} className="text-sm">
              {repoLink.label || 'Repo'}
            </PillLink>
          )}
          {project.linksNote && (
            <span className="text-xs italic text-slate-500 dark:text-slate-400">
              🔒 {project.linksNote}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
