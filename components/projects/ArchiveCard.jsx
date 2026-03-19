import Link from 'next/link';
import { Github } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';
import { pickHighlightTag, pickHighlightTech, sortProjectLinks } from '@/lib/projectDisplay';

export default function ArchiveCard({ project }) {
  if (!project) return null;

  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
  const description = project.cardDescription || project.featuredDescription || project.oneLiner || '';
  const tag = pickHighlightTag(project);
  const tech = pickHighlightTech(project);
  const links = sortProjectLinks(project.links || []);
  const repoLink = links.find(link => link.kind === 'repo');

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {project.coverImage?.src ? (
        <Link href={href} className="block relative h-32 bg-slate-900 overflow-hidden group">
          <img
            src={project.coverImage.src}
            alt={project.coverImage.alt || ''}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      ) : (
        <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-700" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <Link href={href} className="text-base font-semibold text-slate-900 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
            {project.emoji && <span aria-hidden="true">{project.emoji}</span>}
            {project.title}
          </Link>
          {project.period && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.period}</div>
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug line-clamp-3">
            {description}
          </p>
        )}

        {(tag || tech) && (
          <div className="flex flex-wrap gap-2">
            {tag && <Badge variant="outline" className="text-xs">{tag}</Badge>}
            {tech && <Badge className="text-xs">{tech}</Badge>}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {project.slug && (
            <PillLink href={href} variant="solid" className="px-4 text-sm">
              Details
            </PillLink>
          )}
          {repoLink && (
            <PillLink href={repoLink.href} external variant="outline" icon={Github} className="text-sm">
              {repoLink.label || 'Repo'}
            </PillLink>
          )}
        </div>
      </div>
    </Card>
  );
}
