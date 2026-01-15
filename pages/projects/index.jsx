import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { PROJECT_LANGUAGES, PROJECT_TAGS } from '@/lib/projectTaxonomy';
import PillLink from '@/components/ui/PillLink';
import MultiSelect from '@/components/ui/MultiSelect';
import CaseStudyCard from '@/components/projects/CaseStudyCard';
import ArchiveCard from '@/components/projects/ArchiveCard';

const projects = validateProjects(rawProjects) ? rawProjects : [];

const SORT_OPTIONS = [
  { value: 'coolness', label: 'Featured' },
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Title (A–Z)' },
];

const QUICK_FILTERS = [
  { label: 'Agentic AI', tags: ['Agentic AI'] },
  { label: 'Full-stack', tags: ['Full-stack'] },
  { label: 'ML', tags: ['Machine Learning', 'Computer Vision', 'NLP'] },
  { label: 'Systems', tags: ['Cloud/Infra', 'Concurrency'] },
  { label: 'Game Theory', tags: ['Game Theory'] },
  { label: 'Algorithms', tags: ['Algorithms'] },
];

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

function parseListParam(param) {
  if (!param) return [];
  const raw = Array.isArray(param) ? param.join(',') : param;
  return raw
    .split(',')
    .map(item => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

export default function ProjectsIndex() {
  const router = useRouter();
  const hydratedRef = useRef(false);
  const isRoutingRef = useRef(false);

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

  useEffect(() => {
    const handleRouteStart = () => {
      isRoutingRef.current = true;
    };
    const handleRouteDone = () => {
      isRoutingRef.current = false;
    };

    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleRouteDone);
    router.events.on('routeChangeError', handleRouteDone);

    return () => {
      router.events.off('routeChangeStart', handleRouteStart);
      router.events.off('routeChangeComplete', handleRouteDone);
      router.events.off('routeChangeError', handleRouteDone);
    };
  }, [router.events]);

  // Sync state to URL for shareable filters
  useEffect(() => {
    if (!router.isReady || !hydratedRef.current) return;
    if (router.pathname !== '/projects') return;
    if (isRoutingRef.current) return;

    const nextQuery = {};
    if (query.trim()) nextQuery.q = query.trim();
    if (selectedTags.length) nextQuery.tags = selectedTags.join(',');
    if (selectedLanguages.length) nextQuery.langs = selectedLanguages.join(',');
    if (sortOption !== 'coolness') nextQuery.sort = sortOption;

    const basePath = router.asPath.split('?')[0] || router.pathname;
    const nextSearch = new URLSearchParams(nextQuery).toString();
    const nextPath = nextSearch ? `${basePath}?${nextSearch}` : basePath;
    if (router.asPath === nextPath) return;

    router.replace(nextPath, undefined, { shallow: true });
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

  const toggleQuickFilter = (tags = []) => {
    const next = new Set(selectedTags);
    const filteredTags = tags.filter(tag => PROJECT_TAGS.includes(tag));
    if (!filteredTags.length) return;

    const allSelected = filteredTags.every(tag => next.has(tag));
    if (allSelected) {
      filteredTags.forEach(tag => next.delete(tag));
    } else {
      filteredTags.forEach(tag => next.add(tag));
    }
    setSelectedTags([...next].sort((a, b) => a.localeCompare(b)));
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setSelectedLanguages([]);
    setSortOption('coolness');
  };

  const caseStudies = [...filteredProjects]
    .filter(project => Number.isFinite(project.caseStudyRank))
    .sort((a, b) => a.caseStudyRank - b.caseStudyRank);

  const archiveProjects = filteredProjects.filter(
    project => !Number.isFinite(project.caseStudyRank),
  );

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
              Case studies up top. Everything else is in the archive below.
            </p>
          </div>
          <PillLink href="/" variant="outline" className="px-4">
            Home
          </PillLink>
        </div>

        {caseStudies.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Deep Dives
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {caseStudies.length} project{caseStudies.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {caseStudies.map(project => (
                <CaseStudyCard key={project.slug || project.title} project={project} />
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/60 lg:sticky lg:top-6 lg:z-20">
          <div className="flex flex-col gap-4">
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
                  More filters{activeFacetCount ? ` (${activeFacetCount})` : ''}
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Quick filters
              </span>
              {QUICK_FILTERS.map(filter => {
                const isActive = filter.tags.every(tag => selectedTags.includes(tag));
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => toggleQuickFilter(filter.tags)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
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
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              No projects match those filters. Try adjusting your search or clearing selections.
            </div>
          ) : (
            archiveProjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Project Archive
                  </h2>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {archiveProjects.length} project{archiveProjects.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {archiveProjects.map(project => (
                    <ArchiveCard key={project.slug || project.title} project={project} />
                  ))}
                </div>
              </div>
            )
          )}
        </section>
      </main>
    </>
  );
}
