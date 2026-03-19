import { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { PROJECT_LANGUAGES, PROJECT_TAGS } from '@/lib/projectTaxonomy';
import Section from '@/components/ui/Section';
import MultiSelect from '@/components/ui/MultiSelect';
import ArchiveCard from '@/components/projects/ArchiveCard';
import ProjectHero from '@/components/projects/ProjectHero';
import ProjectBinder from '@/components/projects/ProjectBinder';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';

const projects = validateProjects(rawProjects) ? rawProjects : [];

const SORT_OPTIONS = [
  { value: 'coolness', label: 'Featured' },
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Title (A–Z)' },
];

const QUICK_FILTERS = [
  { value: 'agentic-ai', label: 'Agentic AI', tags: ['Agentic AI'] },
  { value: 'full-stack', label: 'Full-stack', tags: ['Full-stack'] },
  { value: 'ml', label: 'ML', tags: ['Machine Learning', 'Computer Vision', 'NLP'] },
  { value: 'systems', label: 'Systems', tags: ['Cloud/Infra', 'Concurrency'] },
  { value: 'game-theory', label: 'Game Theory', tags: ['Game Theory'] },
  { value: 'algorithms', label: 'Algorithms', tags: ['Algorithms'] },
];
const QUICK_FILTER_VALUES = QUICK_FILTERS.map(filter => filter.value);

const ARCHIVE_ROTATIONS = [-1.2, 0.8, -0.6, 1.0, -1.0, 0.5];
const ARCHIVE_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];

function projectTimestamp(project) {
  const dateCandidates = [project.updatedAt, project.endDate, project.startDate];
  for (const value of dateCandidates) {
    if (!value) continue;
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  const period = project.period || '';
  const match = period.match(/(19|20)\d{2}(?!.*(19|20)\d{2})/);
  if (match) {
    const year = parseInt(match[0], 10);
    if (!Number.isNaN(year)) {
      return new Date(year, 0, 1).getTime();
    }
  }

  return -Infinity;
}

export default function ProjectsSection() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState([]);
  const [sortOption, setSortOption] = useState('coolness');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    const text = query.trim().toLowerCase();
    const tagSet = new Set(selectedTags);
    const langSet = new Set(selectedLanguages);
    const quickFilters = QUICK_FILTERS.filter(filter => selectedQuickFilters.includes(filter.value));

    const matches = projects.filter(project => {
      if (text) {
        const haystack = [
          project.title,
          project.oneLiner,
          project.summary,
          ...(project.bullets || []),
          ...(project.highlights || []),
        ]
          .filter(Boolean)
          .join(' \u2022 ')
          .toLowerCase();

        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (tagSet.size) {
        const projectTags = project.tags || [];
        for (const tag of tagSet) {
          if (!projectTags.includes(tag)) {
            return false;
          }
        }
      }

      if (langSet.size) {
        const projectLangs = project.languages || [];
        for (const lang of langSet) {
          if (!projectLangs.includes(lang)) {
            return false;
          }
        }
      }

      if (quickFilters.length) {
        const projectTags = project.tags || [];
        for (const filter of quickFilters) {
          const matchesQuickFilter = filter.tags.some(tag => projectTags.includes(tag));
          if (!matchesQuickFilter) {
            return false;
          }
        }
      }

      return true;
    });

    const sorted = [...matches];
    if (sortOption === 'coolness') {
      sorted.sort((a, b) => {
        const aCool = typeof a.coolness === 'number' ? a.coolness : -Infinity;
        const bCool = typeof b.coolness === 'number' ? b.coolness : -Infinity;
        if (aCool === bCool) return a.title.localeCompare(b.title);
        return bCool - aCool;
      });
    } else if (sortOption === 'date') {
      sorted.sort((a, b) => {
        const aTime = projectTimestamp(a);
        const bTime = projectTimestamp(b);
        if (aTime === bTime) return a.title.localeCompare(b.title);
        return bTime - aTime;
      });
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [query, selectedTags, selectedLanguages, selectedQuickFilters, sortOption]);

  const hasActiveFilters = Boolean(
    query.trim() || selectedTags.length || selectedLanguages.length || selectedQuickFilters.length,
  );

  const activeFacetCount =
    selectedTags.length + selectedLanguages.length + selectedQuickFilters.length;

  const toggleQuickFilter = value => {
    if (!QUICK_FILTER_VALUES.includes(value)) return;

    const next = selectedQuickFilters.includes(value)
      ? selectedQuickFilters.filter(item => item !== value)
      : [...selectedQuickFilters, value];

    setSelectedQuickFilters(
      QUICK_FILTERS.filter(filter => next.includes(filter.value)).map(filter => filter.value),
    );
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setSelectedLanguages([]);
    setSelectedQuickFilters([]);
    setSortOption('coolness');
  };

  const caseStudies = [...filteredProjects]
    .filter(project => Number.isFinite(project.caseStudyRank))
    .sort((a, b) => a.caseStudyRank - b.caseStudyRank);

  const archiveProjects = filteredProjects.filter(
    project => !Number.isFinite(project.caseStudyRank),
  );

  return (
    <Section id="projects" title="projects" icon={Trophy}>
      <Pinboard className="space-y-12">
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          things i've built, some cool and some just for learning
        </p>

        {caseStudies.length > 0 && (
          <section className="space-y-8">
            <h3 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50">
              deep dives
            </h3>

            {caseStudies.length > 0 && (
              <ProjectHero project={caseStudies[0]} />
            )}

            {caseStudies.length > 1 && (
              <ProjectBinder projects={caseStudies.slice(1)} />
            )}
          </section>
        )}

        <section className="rounded-2xl border border-stone-300/60 bg-stone-50/80 px-4 py-3 shadow-sm dark:border-stone-700/60 dark:bg-stone-800/80 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="sr-only" htmlFor="homepage-project-search">
                Search projects
              </label>
              <input
                id="homepage-project-search"
                type="search"
                placeholder="search projects..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 dark:border-slate-700 dark:bg-stone-900/80 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {SORT_OPTIONS.map(option => {
                const isActive = sortOption === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortOption(option.value)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isActive
                        ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-white'
                        : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-stone-900/80 dark:text-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setFiltersOpen(previous => !previous)}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-stone-900/80 dark:text-slate-200 dark:hover:border-slate-500"
              >
                filters{activeFacetCount ? ` (${activeFacetCount})` : ''}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {QUICK_FILTERS.map(filter => {
              const isActive = selectedQuickFilters.includes(filter.value);
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => toggleQuickFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-white'
                      : 'border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-stone-900/80 dark:text-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {filtersOpen && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MultiSelect
                label="tags"
                options={PROJECT_TAGS}
                selected={selectedTags}
                onChange={values => setSelectedTags([...values].sort((a, b) => a.localeCompare(b)))}
                placeholder="select tags"
              />
              <MultiSelect
                label="languages"
                options={PROJECT_LANGUAGES}
                selected={selectedLanguages}
                onChange={values => setSelectedLanguages([...values].sort((a, b) => a.localeCompare(b)))}
                placeholder="select languages"
              />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
            <span>
              {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              nothing matches those filters, try adjusting your search or clearing some
            </div>
          ) : (
            archiveProjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl tracking-tight text-slate-900 dark:text-slate-50">
                    project archive
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {archiveProjects.length} project{archiveProjects.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {archiveProjects.map((project, i) => (
                    <PinCard
                      key={project.slug || project.title}
                      rotation={ARCHIVE_ROTATIONS[i % ARCHIVE_ROTATIONS.length]}
                      pinColor={ARCHIVE_PIN_COLORS[i % ARCHIVE_PIN_COLORS.length]}
                    >
                      <ArchiveCard project={project} />
                    </PinCard>
                  ))}
                </div>
              </div>
            )
          )}
        </section>
      </Pinboard>
    </Section>
  );
}
