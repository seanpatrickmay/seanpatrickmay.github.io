import { useState } from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';
import { pickHighlightTag, pickHighlightTech, pickProofPoints, sortProjectLinks } from '@/lib/projectDisplay';
import classNames from '@/lib/classNames';
import PinCard from '@/components/PinCard';

const BINDER_ROTATIONS = [-1, 1.2, -0.8, 1.5, -0.6];
const BINDER_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];

function BinderTab({ project, isSelected, onClick }) {
  const tag = pickHighlightTag(project);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={classNames(
        'group relative flex flex-1 flex-col items-center gap-1.5 rounded-t-2xl border border-b-0 px-4 py-3 text-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
        'min-w-[120px] sm:min-w-[140px]',
        isSelected
          ? 'bg-white border-slate-200/80 shadow-sm z-10 dark:bg-slate-900 dark:border-slate-700'
          : 'bg-slate-50 border-slate-200/40 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700/40 dark:hover:bg-slate-800',
      )}
    >
      <span className={classNames(
        'text-2xl transition-transform duration-300',
        isSelected ? 'scale-110' : 'group-hover:scale-105',
      )}>
        {project.emoji || '📁'}
      </span>
      <span className={classNames(
        'text-xs font-semibold leading-tight transition-colors',
        isSelected
          ? 'text-slate-900 dark:text-slate-50'
          : 'text-slate-600 dark:text-slate-300',
      )}>
        {project.title}
      </span>
      {tag && (
        <span className={classNames(
          'text-[10px] font-medium leading-tight transition-colors',
          isSelected
            ? 'text-teal-600 dark:text-teal-400'
            : 'text-slate-400 dark:text-slate-500',
        )}>
          {tag}
        </span>
      )}
      {isSelected && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-500 rounded-full" />
      )}
    </button>
  );
}

function BinderPanel({ project, isOpen }) {
  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
  const description = project.cardDescription || project.featuredDescription || project.oneLiner || '';
  const tag = pickHighlightTag(project);
  const tech = pickHighlightTech(project);
  const points = pickProofPoints(project, 3);
  const links = sortProjectLinks(project.links || []);
  const liveLink = links.find(link => link.kind === 'live');
  const repoLink = links.find(link => link.kind === 'repo');

  return (
    <div
      className="grid transition-[grid-template-rows] duration-400 ease-out"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <div
          className={classNames(
            'transition-all duration-400 ease-out',
            isOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-3',
          )}
        >
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_1fr] items-start">
            {project.coverImage?.src ? (
              <Link href={href} className="relative block h-48 sm:h-56 rounded-xl bg-slate-900 overflow-hidden group">
                <img
                  src={project.coverImage.src}
                  alt={project.coverImage.alt || ''}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ) : (
              <div className="h-48 sm:h-56 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
            )}

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Link href={href} className="block group">
                  <h3 className="font-display text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {project.title}
                  </h3>
                </Link>
                {project.period && (
                  <div className="text-xs text-slate-500 dark:text-slate-300">{project.period}</div>
                )}
                {description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
                )}
              </div>

              {(tag || tech) && (
                <div className="flex flex-wrap gap-2">
                  {tag && <Badge variant="outline" className="text-xs">{tag}</Badge>}
                  {tech && <Badge className="text-xs">{tech}</Badge>}
                </div>
              )}

              {points.length > 0 && (
                <ul className="space-y-1.5">
                  {points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <PillLink href={href} variant="solid" className="px-4 text-sm">
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
        </div>
      </div>
    </div>
  );
}

export default function ProjectBinder({ projects = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (projects.length === 0) return null;

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar px-1">
        {projects.map((project, index) => (
          <BinderTab
            key={project.slug || project.title}
            project={project}
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      <PinCard
        rotation={BINDER_ROTATIONS[selectedIndex % BINDER_ROTATIONS.length]}
        pinColor={BINDER_PIN_COLORS[selectedIndex % BINDER_PIN_COLORS.length]}
      >
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 -mt-px">
          {projects.map((project, index) => (
            <BinderPanel
              key={project.slug || project.title}
              project={project}
              isOpen={selectedIndex === index}
            />
          ))}
        </div>
      </PinCard>
    </div>
  );
}
