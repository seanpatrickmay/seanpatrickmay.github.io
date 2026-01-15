import Link from 'next/link';
import { Github } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';
import { pickHighlightTag, pickHighlightTech, pickProofPoints, sortProjectLinks } from '@/lib/projectDisplay';

export default function CaseStudyCard({ project }) {
  if (!project) return null;

  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
  const description = project.cardDescription || project.featuredDescription || project.oneLiner || '';
  const tag = pickHighlightTag(project);
  const tech = pickHighlightTech(project);
  const points = pickProofPoints(project, 2);
  const links = sortProjectLinks(project.links || []);
  const liveLink = links.find(link => link.kind === 'live');
  const repoLink = links.find(link => link.kind === 'repo');

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      {project.coverImage?.src ? (
        <div className="relative h-44 sm:h-48 bg-slate-900">
          <img
            src={project.coverImage.src}
            alt={project.coverImage.alt || ''}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-44 sm:h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={href} className="text-lg font-semibold text-slate-900 dark:text-slate-50 hover:underline">
                {project.emoji ? `${project.emoji} ${project.title}` : project.title}
              </Link>
              {project.period && (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{project.period}</div>
              )}
            </div>
          </div>
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{description}</p>
          )}
        </div>

        {(tag || tech) && (
          <div className="flex flex-wrap gap-2">
            {tag && (
              <Badge variant="outline" className="text-xs">
                {tag}
              </Badge>
            )}
            {tech && <Badge className="text-xs">{tech}</Badge>}
          </div>
        )}

        {points.length > 0 && (
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {points.map((point, index) => (
              <li key={`${project.slug || project.title}-point-${index}`}>• {point}</li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <PillLink href={href} variant="solid" className="px-4 text-sm">
            Deep dive
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
    </Card>
  );
}
