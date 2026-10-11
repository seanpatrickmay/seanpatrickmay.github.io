/**
 * The wiki strip: what a deep dive says about a project's code wiki,
 * derived from the wiki's own export.json, plus the rules for the `wiki`
 * field in projects.json.
 *
 * Pure, so the daily feed (scripts/update_wikis.mjs), the page and
 * `npm test` share one definition. Lines of code are left out on purpose:
 * the exports count JSON fixtures and Markdown, so their line counts
 * disagree with the repos'.
 */

export const WIKI_BASE = 'https://seanpatrickmay.me/wiki/';
export const MAX_HIGHLIGHTS = 3;
export const MAX_LANGUAGES = 3;
// Sean's id in an export's people snapshot.
export const OWNER_ID = 'sean-may';
// Config and markup, not what a project is written in.
export const NON_CODE_LANGUAGES = ['JSON', 'Markdown', 'CSS', 'HTML', 'YAML', 'TOML', 'Shell'];
// The exports name a file's dialect; the strip names the language.
const LANGUAGE_NAMES = { TSX: 'TypeScript', JSX: 'JavaScript' };
// The totals a metric may take from the feed instead of a typed value.
export const WIKI_TOTALS = ['wikis', 'features', 'citations'];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MONTH = /^\d{4}-\d{2}/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const wikiUrl = slug => `${WIKI_BASE}${slug}/`;
export const featureUrl = (slug, featureId) => `${WIKI_BASE}${slug}/wiki/${featureId}/`;
export const exportUrl = slug => `${WIKI_BASE}${slug}/export.json`;

const count = n => n.toLocaleString('en-US');
const plural = (n, word) => `${count(n)} ${word}${n === 1 ? '' : 's'}`;
const sum = (xs, key) => xs.reduce((total, x) => total + (Number.isInteger(x?.[key]) ? x[key] : 0), 0);

function claimsOf(pages) {
  return pages.flatMap(p => (p.sections ?? []).flatMap(s => s.claims ?? []));
}

/**
 * The earliest (or latest) instant among ISO dates, as that date's own
 * YYYY-MM. Sorting the strings would compare wall-clock times across
 * different offsets.
 */
function extremeMonth(dates, earliest) {
  const valid = dates.filter(d => typeof d === 'string' && MONTH.test(d) && !Number.isNaN(Date.parse(d)));
  if (valid.length === 0) return null;
  valid.sort((a, b) => Date.parse(a) - Date.parse(b));
  return (earliest ? valid[0] : valid[valid.length - 1]).slice(0, 7);
}

function spanOf(pages) {
  const first = extremeMonth(pages.map(p => p.infobox?.firstCommitDate), true);
  const last = extremeMonth(pages.map(p => p.infobox?.lastCommitDate), false);
  return first && last ? { first, last } : null;
}

/** Ranked by how many pages use each language; a page counts once per language. */
function languagesOf(pages) {
  const pagesUsing = new Map();
  for (const p of pages) {
    const names = new Set(
      (p.infobox?.languages ?? [])
        .map(l => LANGUAGE_NAMES[l] ?? l)
        .filter(l => !NON_CODE_LANGUAGES.includes(l)),
    );
    for (const name of names) pagesUsing.set(name, (pagesUsing.get(name) ?? 0) + 1);
  }
  return [...pagesUsing]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_LANGUAGES)
    .map(([name]) => name);
}

/** "solo" when Sean is the one human holding lines; otherwise his share. Bots never count. */
function authorshipOf(people = []) {
  const holders = people.filter(p => p?.kind === 'human' && p.currentLines > 0);
  const total = sum(holders, 'currentLines');
  const mine = holders.find(p => p.id === OWNER_ID)?.currentLines ?? 0;
  if (!total || !mine) return null;
  if (mine === total) return { solo: true };
  // Rounding can reach 1 or 0; a non-solo entry still states some share of the other side.
  const share = Math.min(0.99, Math.max(0.01, Math.round((mine / total) * 100) / 100));
  return { solo: false, share };
}

export function deriveWiki(exportJson, { slug, highlight = [] }) {
  const pages = exportJson?.pages;
  if (!Array.isArray(pages) || pages.length === 0) throw new Error(`${slug}: export has no pages`);
  const titles = new Map((exportJson.manifest?.features ?? []).map(f => [f.id, f.title]));
  const missing = highlight.filter(id => !titles.has(id) || !pages.some(p => p.featureId === id));
  if (missing.length > 0) throw new Error(`${slug}: no wiki page for highlight ${missing.join(', ')}`);
  const claims = claimsOf(pages);
  return {
    url: wikiUrl(slug),
    exportedAt: exportJson.exportedAt ?? null,
    head: typeof exportJson.head === 'string' ? exportJson.head.slice(0, 7) : null,
    features: pages.length,
    citedClaims: claims.filter(c => (c.citations ?? []).length > 0).length,
    citations: claims.reduce((n, c) => n + (c.citations ?? []).length, 0),
    commits: Number.isInteger(exportJson.people?.snapshot?.commits) ? exportJson.people.snapshot.commits : null,
    span: spanOf(pages),
    authorship: authorshipOf(exportJson.people?.snapshot?.people),
    languages: languagesOf(pages),
    highlights: highlight.map(id => ({ id, title: titles.get(id), href: featureUrl(slug, id) })),
  };
}

const monthName = ym => MONTHS[Number(ym.slice(5, 7)) - 1];

export function formatSpan(span) {
  if (!span) return '';
  const firstYear = span.first.slice(0, 4);
  const lastYear = span.last.slice(0, 4);
  if (span.first === span.last) return `${monthName(span.first)} ${firstYear}`;
  if (firstYear === lastYear) return `${monthName(span.first)} – ${monthName(span.last)} ${lastYear}`;
  return `${monthName(span.first)} ${firstYear} – ${monthName(span.last)} ${lastYear}`;
}

export function formatAuthorship(authorship) {
  if (!authorship) return '';
  return authorship.solo ? 'solo' : `${Math.round(authorship.share * 100)}% of lines mine`;
}

export function headline(entry) {
  return `code wiki · ${plural(entry.features, 'feature')} · ${plural(entry.citedClaims, 'cited claim')}`;
}

/** "345 commits, Oct 2025 – Jun 2026 · solo", plus "as of …" when the entry is stale. */
export function historyLine(entry, staleness = null) {
  const commits = Number.isInteger(entry.commits) ? plural(entry.commits, 'commit') : '';
  const when = [commits, formatSpan(entry.span)].filter(Boolean).join(', ');
  return [when, formatAuthorship(entry.authorship), staleness?.label].filter(Boolean).join(' · ');
}

export function wikiTotals(wikisFile) {
  const entries = Object.values(wikisFile?.wikis ?? {});
  return { wikis: entries.length, features: sum(entries, 'features'), citations: sum(entries, 'citations') };
}

/**
 * A metric may say `"wikiTotal": "citations"` instead of typing a number
 * that goes stale the next time a wiki regenerates. This fills its value
 * from the feed. A total the feed cannot supply leaves the value out, and
 * the deep-dive rules then fail the build.
 */
export function resolveWikiMetrics(project, wikisFile) {
  if (!Array.isArray(project?.metrics) || !project.metrics.some(m => m?.wikiTotal !== undefined)) return project;
  const totals = wikiTotals(wikisFile);
  const metrics = project.metrics.map(m => {
    if (m?.wikiTotal === undefined) return m;
    const { wikiTotal, ...rest } = m;
    const n = totals[wikiTotal];
    return Number.isInteger(n) && n > 0 ? { ...rest, value: count(n) } : rest;
  });
  return { ...project, metrics };
}

export function validateWikiFields(projects = []) {
  const errors = [];
  const owner = new Map();
  for (const p of projects.filter(x => typeof x?.slug === 'string' && x.slug.length > 0)) {
    const where = p.slug;
    for (const [i, m] of (Array.isArray(p.metrics) ? p.metrics : []).entries()) {
      if (m?.wikiTotal === undefined) continue;
      const at = `${where} metrics[${i}]`;
      if (!WIKI_TOTALS.includes(m.wikiTotal)) errors.push(`${at}: wikiTotal must be one of ${WIKI_TOTALS.join(', ')}`);
      if (m.value !== undefined) errors.push(`${at}: a wikiTotal metric takes its value from wikis.json, so it has no value`);
    }
    if (p.wiki === undefined) continue;
    const w = p.wiki;
    if (!w || typeof w !== 'object' || typeof w.slug !== 'string' || !SLUG.test(w.slug)) {
      errors.push(`${where}: wiki.slug must be a kebab-case slug`);
      continue;
    }
    if (owner.has(w.slug)) errors.push(`${where}: wiki "${w.slug}" is already ${owner.get(w.slug)}'s`);
    else owner.set(w.slug, where);
    const h = w.highlight;
    if (!Array.isArray(h) || h.length < 1 || h.length > MAX_HIGHLIGHTS) {
      errors.push(`${where}: wiki.highlight needs 1 to ${MAX_HIGHLIGHTS} feature ids`);
    } else {
      if (!h.every(id => typeof id === 'string' && SLUG.test(id))) errors.push(`${where}: wiki.highlight ids must be kebab-case`);
      if (new Set(h).size !== h.length) errors.push(`${where}: wiki.highlight repeats a feature`);
    }
    if (!(Array.isArray(p.links) ? p.links : []).some(l => l?.kind === 'wiki' && l.href === wikiUrl(w.slug))) {
      errors.push(`${where}: a wiki needs a link of kind "wiki" to ${wikiUrl(w.slug)}`);
    }
    if (p.howItWorks !== undefined) {
      errors.push(`${where}: a wikied project has no "how it works"; the wiki strip's feature links replace it`);
    }
  }
  return errors;
}
