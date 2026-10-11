/**
 * The deep dive: which sections a project's page has, in what order, and
 * the rules its data must meet.
 *
 * Pure, so the rules run in `npm test` and as a build gate (getStaticPaths
 * in pages/projects/[slug].jsx) without rendering anything. The order is the
 * spec's: evidence first, then the story.
 */
import { validateLogBars } from './logBarChart.js';
import { hasMotif } from './motifs.js';

export const DEEP_DIVE_SECTIONS = ['back', 'masthead', 'stack', 'metrics', 'figure', 'overview', 'built', 'how', 'findings', 'next'];

export const DEEP_DIVE_LABELS = {
  back: 'all projects',
  built: 'what i built',
  how: 'how it works',
  findings: 'findings',
  next: "what's next",
};

export const MAX_METRICS = 3;
export const MAX_STACK_CHIPS = 4;
export const MIN_ALT_WORDS = 6;
// A private project's numbers can only be its own word. The label has to
// say so, rather than leave a source that looks checkable and is not.
export const SELF_REPORTED = 'self-reported';

// Replaced by metrics (the numbers) and findings (the lessons). Rejected
// rather than ignored, so an old field cannot quietly come back and sit
// unrendered in the JSON.
export const RETIRED_FIELDS = ['proofPoints', 'bullets', 'results'];

// Every field of body prose on the page. A metric's number lives in the
// strip; repeating it here is the "same number three times" the old
// template was built on.
const PROSE_FIELDS = ['overview', 'whatIBuilt', 'howItWorks', 'findings'];

const hasText = v => typeof v === 'string' && v.trim().length > 0;
const SITE_OR_HTTPS = /^(https:\/\/|\/(?!\/))/;

export function overviewText(project) {
  return project.overview || project.summary || project.cardDescription || project.oneLiner || '';
}

/**
 * True when `value` appears in `text` as a whole number, case-insensitively:
 * "6" does not match "16" or "2.6", and "751" does not match "1,751".
 */
export function mentions(text, value) {
  if (!hasText(text) || !hasText(value)) return false;
  const hay = text.toLowerCase();
  const needle = value.toLowerCase();
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const digitBefore = /\d[.,]?$/.test(hay.slice(0, i));
    const digitAfter = /^[.,]?\d/.test(hay.slice(i + needle.length));
    if (!digitBefore && !digitAfter) return true;
  }
  return false;
}

/**
 * What fills the figure slot: the lead figure, else a cover-art motif the
 * component can draw, else the photographic cover, else nothing. The page
 * (components/projects/LeadFigure.jsx) and deepDiveSections both ask this,
 * so the slot and the section list cannot disagree.
 */
export function figureKind(project) {
  if (project.leadFigure) return 'lead';
  if (hasMotif(project.coverArt?.motif)) return 'motif';
  if (hasText(project.coverImage?.src)) return 'cover';
  return null;
}

export function deepDiveSections(project) {
  const present = {
    back: true,
    masthead: true,
    stack: (project.stack ?? []).length > 0,
    metrics: (project.metrics ?? []).length > 0,
    figure: figureKind(project) !== null,
    overview: hasText(overviewText(project)),
    built: (project.whatIBuilt ?? []).length > 0,
    how: (project.howItWorks ?? []).length > 0,
    findings: (project.findings ?? []).length > 0,
    next: (project.nextSteps ?? []).length > 0,
  };
  return DEEP_DIVE_SECTIONS.filter(id => present[id]);
}

function sourceErrors(source, at) {
  if (!source || typeof source !== 'object') return [`${at}: needs a source`];
  const errors = [];
  if (!hasText(source.label)) errors.push(`${at}: source needs a label`);
  if (source.href === undefined) {
    if (hasText(source.label) && !source.label.startsWith(SELF_REPORTED)) {
      errors.push(`${at}: a source without href must be labelled "${SELF_REPORTED}, …"`);
    }
  } else if (!(hasText(source.href) && SITE_OR_HTTPS.test(source.href))) {
    errors.push(`${at}: source href must be https:// or a site path`);
  }
  return errors;
}

function metricErrors(p, where) {
  if (p.metrics === undefined) return [];
  if (!Array.isArray(p.metrics)) return [`${where}: metrics must be a list`];
  const errors = [];
  if (p.metrics.length > MAX_METRICS) errors.push(`${where}: at most ${MAX_METRICS} metrics, found ${p.metrics.length}`);
  const seen = new Set();
  p.metrics.forEach((m, i) => {
    const at = `${where} metrics[${i}]`;
    if (!hasText(m?.value)) errors.push(`${at}: needs a value`);
    if (!hasText(m?.label)) errors.push(`${at}: needs a label`);
    errors.push(...sourceErrors(m?.source, at));
    if (!hasText(m?.value)) return;
    if (seen.has(m.value)) errors.push(`${at}: duplicate value "${m.value}"`);
    seen.add(m.value);
    for (const field of PROSE_FIELDS) {
      const texts = [p[field]].flat().filter(hasText);
      if (texts.some(t => mentions(t, m.value))) errors.push(`${at}: "${m.value}" also appears in ${field}`);
    }
  });
  return errors;
}

function leadFigureErrors(p, where) {
  const f = p.leadFigure;
  if (f === undefined) return [];
  const at = `${where} leadFigure`;
  if (!f || typeof f !== 'object') return [`${at}: must be an object`];
  const errors = [];
  if (Boolean(f.src) === Boolean(f.chart)) errors.push(`${at}: needs exactly one of src or chart`);
  if (f.src !== undefined) {
    if (!(hasText(f.src) && f.src.startsWith(`/projects/${p.slug}/`) && f.src.endsWith('.webp'))) {
      errors.push(`${at}: src must be a .webp under /projects/${p.slug}/`);
    }
    const sized = [f.width, f.height].every(n => Number.isInteger(n) && n > 0);
    if (!sized) errors.push(`${at}: needs integer width and height`);
  }
  if (f.chart !== undefined) errors.push(...validateLogBars(f.chart).map(e => `${at}.chart: ${e}`));
  const words = hasText(f.alt) ? f.alt.trim().split(/\s+/).length : 0;
  if (words < MIN_ALT_WORDS) errors.push(`${at}: alt needs at least ${MIN_ALT_WORDS} words describing the figure`);
  if (!hasText(f.caption)) errors.push(`${at}: needs a caption`);
  else if (hasText(f.alt) && f.alt.trim() === f.caption.trim()) {
    errors.push(`${at}: alt must describe the figure, not repeat the caption`);
  }
  errors.push(...sourceErrors(f.source, at));
  return errors;
}

export function validateDeepDives(projects = []) {
  const errors = [];
  for (const p of projects.filter(x => hasText(x?.slug))) {
    const where = p.slug;
    for (const field of RETIRED_FIELDS) {
      if (p[field] !== undefined) errors.push(`${where}: ${field} is retired; its numbers go in metrics and its lessons in findings`);
    }
    errors.push(...metricErrors(p, where));
    errors.push(...leadFigureErrors(p, where));
    if (p.findings !== undefined) {
      if (!Array.isArray(p.findings)) errors.push(`${where}: findings must be a list`);
      else p.findings.forEach((f, i) => { if (!hasText(f)) errors.push(`${where} findings[${i}]: needs text`); });
    }
    if (p.credits !== undefined && !hasText(p.credits)) errors.push(`${where}: credits must be text`);
    if ((p.gallery ?? []).length > 0) errors.push(`${where}: gallery is not rendered; use leadFigure`);
  }
  return errors;
}

/** Fails the build on a broken deep dive, the way assertValidBoard does for the board. */
export function assertValidDeepDives(projects) {
  const errors = validateDeepDives(projects);
  if (errors.length > 0) throw new Error('projects.json deep dives are invalid:\n' + errors.join('\n'));
}
