import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import Section from '@/components/ui/Section';
import ArchiveCard from '@/components/projects/ArchiveCard';
import ProjectHero from '@/components/projects/ProjectHero';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';

/**
 * One featured project, then every other project as a wall of pinned cards.
 *
 * This replaced three stacked browsing models for ten projects: a featured
 * card, a six-tab binder with an expanding panel, and a search + sort + filter
 * slab above a three-card "archive". Between them they produced two counts
 * that disagreed ("10 projects" directly above "project archive · 3"), two
 * labels for the same action ("deep dive" / "details"), and ~1,900px of
 * height. The filter slab was also the only white UI panel on a kraft board.
 *
 * What is left is one model: a featured slot driven by caseStudyRank, a row of
 * tag stickers, and a uniform grid. Search is gone — ten items do not need it,
 * and the tags cover the same ground in a form that suits the board.
 */

const projects = validateProjects(rawProjects) ? rawProjects : [];

// Grouped rather than raw tags: "ML" should catch Machine Learning, Computer
// Vision and NLP, which is what someone scanning actually means.
const TAG_FILTERS = [
  { value: 'ai-ml', label: 'ai / ml', tags: ['Agentic AI', 'Machine Learning', 'Computer Vision', 'NLP', 'AI/ML'] },
  { value: 'systems', label: 'systems', tags: ['Cloud/Infra', 'Concurrency', 'Data Engineering'] },
  { value: 'full-stack', label: 'full-stack', tags: ['Full-stack'] },
  { value: 'algorithms', label: 'algorithms', tags: ['Algorithms', 'Game Theory'] },
];

// Fixed cycles, so a card's tilt and pin colour are stable across renders.
const ROTATIONS = [-1.4, 0.9, -0.7, 1.2, -1.1, 0.6];
const PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];

function rank(project) {
  return Number.isFinite(project.caseStudyRank) ? project.caseStudyRank : Infinity;
}

export default function ProjectsSection() {
  const [activeFilters, setActiveFilters] = useState([]);

  const ordered = useMemo(
    () => [...projects].sort((a, b) => rank(a) - rank(b) || (b.coolness ?? 0) - (a.coolness ?? 0)),
    [],
  );

  const featured = ordered[0] ?? null;
  const rest = ordered.slice(1);

  const visible = useMemo(() => {
    if (activeFilters.length === 0) return rest;
    const wanted = new Set(
      TAG_FILTERS.filter(f => activeFilters.includes(f.value)).flatMap(f => f.tags),
    );
    return rest.filter(project => (project.tags ?? []).some(tag => wanted.has(tag)));
  }, [rest, activeFilters]);

  const toggle = value =>
    setActiveFilters(current =>
      current.includes(value) ? current.filter(v => v !== value) : [...current, value],
    );

  return (
    <Section id="projects" title="projects" icon={Trophy}>
      <Pinboard>
        <div className="space-y-8">
          <p className="max-w-2xl text-base text-stone-600 dark:text-stone-300">
            things i&apos;ve built, some cool and some just for learning
          </p>

          {featured && <ProjectHero project={featured} />}

          {rest.length > 0 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Stickers, matching the genres card, rather than a white
                    filter slab dropped onto the board. */}
                {TAG_FILTERS.map(filter => {
                  const on = activeFilters.includes(filter.value);
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => toggle(filter.value)}
                      aria-pressed={on}
                      className={[
                        'rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm',
                        'transition hover:-translate-y-0.5 focus-visible:outline-none',
                        'focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
                        on
                          ? 'border-teal-700/40 bg-teal-700 text-white'
                          : 'border-stone-300/70 bg-stone-100 text-stone-700 hover:bg-white dark:border-stone-600/70 dark:bg-stone-800 dark:text-stone-200',
                      ].join(' ')}
                    >
                      {filter.label}
                    </button>
                  );
                })}
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveFilters([])}
                    className="font-hand text-lg text-stone-500 underline-offset-4 hover:underline dark:text-stone-400"
                  >
                    show everything
                  </button>
                )}
                <span className="ml-auto text-xs tabular-nums text-stone-500 dark:text-stone-400">
                  {visible.length + 1} {visible.length + 1 === 1 ? 'project' : 'projects'}
                </span>
              </div>

              {visible.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                  nothing under that filter — try another
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((project, i) => (
                    <PinCard
                      key={project.slug ?? project.title}
                      rotation={ROTATIONS[i % ROTATIONS.length]}
                      pinColor={PIN_COLORS[i % PIN_COLORS.length]}
                      fastener={i % 4 === 3 ? 'tape' : 'pin'}
                    >
                      <ArchiveCard project={project} />
                    </PinCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Pinboard>
    </Section>
  );
}
