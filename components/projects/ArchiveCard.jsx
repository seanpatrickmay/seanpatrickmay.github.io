import { Github } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex items-start gap-3">
        {project.emoji && (
          <span className="text-2xl" aria-hidden="true">
            {project.emoji}
          </span>
        )}
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg">
            {project.title}
          </CardTitle>
          {project.period && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.period}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {description && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {description}
          </div>
        )}

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

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
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
      </CardContent>
    </Card>
  );
}
