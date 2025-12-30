import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { PROJECT_LANGUAGES, PROJECT_TAGS } from '@/lib/projectTaxonomy';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';
import Badge from '@/components/ui/Badge';
import MultiSelect from '@/components/ui/MultiSelect';
import { Github } from 'lucide-react';

const projects = validateProjects(rawProjects) ? rawProjects : [];

const SORT_OPTIONS = [
  { value: 'coolness', label: 'Featured' },
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Title (A–Z)' },
];

const TAG_PRIORITY = [
  'Agentic AI',
  'Machine Learning',
  'Computer Vision',
  'NLP',
  'Game Theory',
  'Full-stack',
  'Data Engineering',
  'Cloud/Infra',
  'Concurrency',
  'Algorithms',
];

const TECH_PRIORITY = [
  'FastAPI',
  'Next.js',
  'React',
  'PyTorch',
  'PostgreSQL',
  'Tailwind CSS',
  'LangChain',
  'CrewAI',
  'ChromaDB',
  'Vertex AI Gemini',
  'Cloud Translation',
  'Garmin API',
  'Spotify API',
];

function projectTimestamp(project) {
  if (project.updatedAt) {
    const parsed = Date.parse(project.updatedAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
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

function parseListParam(param) {
  if (!param) return [];
  const raw = Array.isArray(param) ? param.join(',') : param;
  return raw
    .split(',')
    .map(item => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

function pickCardDescription(project) {
  if (!project) return '';
  return (
    project.cardDescription ||
    project.featuredDescription ||
    project.oneLiner ||
    project.summary ||
    ''
  );
}

function pickHighlightTag(project) {
  const tags = Array.isArray(project?.tags) ? project.tags : [];
  if (!tags.length) return '';

  for (const preferred of TAG_PRIORITY) {
    if (tags.includes(preferred)) return preferred;
  }

  return tags[0];
}

function pickHighlightTech(project) {
  const stack = Array.isArray(project?.stack) ? project.stack : [];
  const languages = Array.isArray(project?.languages) ? project.languages : [];
  const languageSet = new Set(languages);

  for (const preferred of TECH_PRIORITY) {
    if (stack.includes(preferred)) return preferred;
  }

  for (const tech of stack) {
    if (!languageSet.has(tech)) return tech;
  }

  return stack[0] || languages[0] || '';
}

export default function ProjectsIndex() {
  const router = useRouter();
  const hydratedRef = useRef(false);

  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [sortOption, setSortOption] = useState('coolness');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Hydrate state from URL query once
  useEffect(() => {
    if (!router.isReady || hydratedRef.current) return;
    const { q, tags, langs, sort } = router.query;

    setQuery(typeof q === 'string' ? q : '');
    const initialTags = parseListParam(tags).filter(tag => PROJECT_TAGS.includes(tag));
    const initialLanguages = parseListParam(langs).filter(lang => PROJECT_LANGUAGES.includes(lang));

    setSelectedTags(initialTags.sort((a, b) => a.localeCompare(b)));
    setSelectedLanguages(initialLanguages.sort((a, b) => a.localeCompare(b)));
    const sortValue = typeof sort === 'string' ? sort : '';
    const validSort = SORT_OPTIONS.some(option => option.value === sortValue);
    setSortOption(validSort ? sortValue : 'coolness');
    setFiltersOpen(initialTags.length > 0 || initialLanguages.length > 0);
    hydratedRef.current = true;
  }, [router.isReady, router.query]);

  // Sync state to URL for shareable filters
  useEffect(() => {
    if (!router.isReady || !hydratedRef.current) return;

    const nextQuery = {};
    if (query.trim()) nextQuery.q = query.trim();
    if (selectedTags.length) nextQuery.tags = selectedTags.join(',');
    if (selectedLanguages.length) nextQuery.langs = selectedLanguages.join(',');
    if (sortOption !== 'coolness') nextQuery.sort = sortOption;

    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
  }, [query, selectedTags, selectedLanguages, sortOption, router]);

  const filteredProjects = useMemo(() => {
    const text = query.trim().toLowerCase();
    const tagSet = new Set(selectedTags);
    const langSet = new Set(selectedLanguages);

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
  }, [query, selectedTags, selectedLanguages, sortOption]);

  const hasActiveFilters = Boolean(
    query.trim() || selectedTags.length || selectedLanguages.length,
  );

  const activeFacetCount = selectedTags.length + selectedLanguages.length;

  const handleClearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setSelectedLanguages([]);
    setSortOption('coolness');
  };

  const showFeaturedRow = sortOption === 'coolness' && !hasActiveFilters;
  const featuredProjects = showFeaturedRow ? filteredProjects.slice(0, 3) : [];
  const remainingProjects = showFeaturedRow ? filteredProjects.slice(3) : filteredProjects;

  return (
    <>
      <Head>
        <title>Projects — Sean P. May</title>
        <meta name="description" content="Projects by Sean P. May" />
      </Head>
      <main className="section-container pt-24 pb-16 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
              Explore builds spanning full-stack product work, applied ML, agentic tooling, and systems projects. Use search and filters to jump to what interests you most.
            </p>
          </div>
          <PillLink href="/" variant="outline" className="px-4">
            Home
          </PillLink>
        </div>

        {showFeaturedRow && featuredProjects.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Featured
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {featuredProjects.length} project{featuredProjects.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map(project => {
                const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
                const description = pickCardDescription(project);
                return (
                  <Link
                    key={project.slug || project.title}
                    href={href}
                    className="group rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm transition hover:bg-white dark:border-slate-800/60 dark:bg-slate-950/60 dark:hover:bg-slate-900/60"
                  >
                    <div className="flex items-start gap-3">
                      {project.emoji && (
                        <span className="text-2xl leading-none" aria-hidden="true">
                          {project.emoji}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-50 leading-snug break-words">
                          {project.title}
                        </div>
                        {description && (
                          <div className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                            {description}
                          </div>
                        )}
                        {project.period && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {project.period}
                          </div>
                        )}
                      </div>
                      <span className="text-slate-400 transition group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/60 lg:sticky lg:top-6 lg:z-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="sr-only" htmlFor="project-search">
                Search projects
              </label>
              <input
                id="project-search"
                type="search"
                placeholder="Search projects..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Sort
                </span>
                {SORT_OPTIONS.map(option => {
                  const isActive = sortOption === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortOption(option.value)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-3 py-1 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(previous => !previous)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
              >
                Filters{activeFacetCount ? ` (${activeFacetCount})` : ''}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MultiSelect
                label="Tags"
                options={PROJECT_TAGS}
                selected={selectedTags}
                onChange={values => setSelectedTags([...values].sort((a, b) => a.localeCompare(b)))}
                placeholder="Select tags"
              />
              <MultiSelect
                label="Languages"
                options={PROJECT_LANGUAGES}
                selected={selectedLanguages}
                onChange={values => setSelectedLanguages([...values].sort((a, b) => a.localeCompare(b)))}
                placeholder="Select languages"
              />
            </div>
          )}
        </section>

        <section className="space-y-4">
          {!showFeaturedRow && (
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                {remainingProjects.length} result{remainingProjects.length === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {remainingProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              No projects match those filters. Try adjusting your search or clearing selections.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remainingProjects.map(project => (
                <Card key={project.slug || project.title} className="h-full flex flex-col">
                  <CardHeader className="flex items-start gap-3">
                    {project.emoji && (
                      <span className="text-2xl" aria-hidden="true">{project.emoji}</span>
                    )}
                    <div>
                      <CardTitle className="text-base sm:text-lg">{project.title}</CardTitle>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.period}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-3">
                      {pickCardDescription(project) && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {pickCardDescription(project)}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {pickHighlightTag(project) && (
                          <Badge variant="outline" className="text-xs">
                            {pickHighlightTag(project)}
                          </Badge>
                        )}
                        {pickHighlightTech(project) && (
                          <Badge className="text-xs">
                            {pickHighlightTech(project)}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                        {project.slug && (
                          <PillLink href={`/projects/${project.slug}/`} variant="solid" className="px-4 text-sm">
                            Details
                          </PillLink>
                        )}
                        {(project.links || []).map((link, index) => (
                          <PillLink
                            key={index}
                            href={link.href}
                            external
                            variant="outline"
                            icon={Github}
                            className="text-sm"
                          >
                            Repo
                          </PillLink>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
