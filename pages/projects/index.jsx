import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import rawProjects from '@/public/projects.json' assert { type: 'json' };
import { validateProjects } from '@/lib/projects';
import { PROJECT_LANGUAGES, PROJECT_TAGS } from '@/lib/projectTaxonomy';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';
import Badge from '@/components/ui/Badge';
import MultiSelect from '@/components/ui/MultiSelect';

const projects = validateProjects(rawProjects) ? rawProjects : [];

const SORT_OPTIONS = [
  { value: 'coolness', label: 'Coolness 😃' },
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Title (A–Z)' },
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

export default function ProjectsIndex() {
  const router = useRouter();
  const hydratedRef = useRef(false);

  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [sortOption, setSortOption] = useState('coolness');

  // Hydrate state from URL query once
  useEffect(() => {
    if (!router.isReady || hydratedRef.current) return;
    const { q, tags, langs, sort } = router.query;

    setQuery(typeof q === 'string' ? q : '');
    const initialTags = parseListParam(tags).filter(tag => PROJECT_TAGS.includes(tag));
    const initialLanguages = parseListParam(langs).filter(lang => PROJECT_LANGUAGES.includes(lang));

    setSelectedTags(initialTags.sort((a, b) => a.localeCompare(b)));
    setSelectedLanguages(initialLanguages.sort((a, b) => a.localeCompare(b)));
    if (sort === 'coolness' || sort === 'date') {
      setSortOption(sort);
    } else {
      setSortOption('coolness');
    }
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

  const handleClearFilters = () => {
    setQuery('');
    setSelectedTags([]);
    setSelectedLanguages([]);
    setSortOption('coolness');
  };

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
          <PillLink href="/" className="px-4">Home</PillLink>
        </div>

        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/60">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="project-search">
                Search
              </label>
              <input
                id="project-search"
                type="search"
                placeholder="Search titles, descriptions, tech..."
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Sort</span>
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

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{filteredProjects.length} result{filteredProjects.length === 1 ? '' : 's'}</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              No projects match those filters. Try adjusting your search or clearing selections.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map(project => (
                <Card key={project.slug || project.title}>
                  <CardHeader className="flex items-start gap-3">
                    {project.emoji && (
                      <span className="text-2xl" aria-hidden="true">{project.emoji}</span>
                    )}
                    <div>
                      <CardTitle className="text-base sm:text-lg">{project.title}</CardTitle>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.period}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.oneLiner && (
                      <div className="text-sm text-slate-600 dark:text-slate-300">{project.oneLiner}</div>
                    )}

                    {!!(project.tags || []).length && (
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {!!(project.languages || []).length && (
                      <div className="flex flex-wrap gap-2">
                        {(project.languages || []).map(language => (
                          <Badge key={language} className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {typeof project.coolness === 'number' && project.coolness >= 90 && (
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Preeeeetty cool
                      </div>
                    )}

                    {!!(project.stack || []).length && (
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {(project.stack || []).slice(0, 6).map(tech => (
                          <span key={tech} className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap pt-1">
                      {project.slug && (
                        <PillLink href={`/projects/${project.slug}`} className="px-4">
                          View details
                        </PillLink>
                      )}
                      {(project.links || []).map((link, index) => (
                        <PillLink key={index} href={link.href} external>
                          {link.label}
                        </PillLink>
                      ))}
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
