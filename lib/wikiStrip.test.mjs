import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveWiki,
  featureUrl,
  formatAuthorship,
  formatSpan,
  headline,
  historyLine,
  resolveWikiMetrics,
  validateWikiFields,
  wikiTotals,
  wikiUrl,
} from './wikiStrip.js';
import { validateDeepDives } from './deepDive.js';
import { fixtureExport } from './wikiFixture.mjs';

const CONFIG = { slug: 'life-dashboard', highlight: ['garmin-integration', 'ai-digest'] };

test('deriveWiki counts features, cited claims and citations across every section', () => {
  const w = deriveWiki(fixtureExport(), CONFIG);
  assert.equal(w.features, 3);
  // c2 (2), c1 (1), c2 (1), c1 (1) have citations; c1 with [] and c3 with none do not.
  assert.equal(w.citedClaims, 4);
  assert.equal(w.citations, 5);
  assert.equal(w.commits, 345);
  assert.equal(w.head, 'e662257');
  assert.equal(w.exportedAt, '2026-10-09T04:27:49.136Z');
  assert.equal(w.url, 'https://seanpatrickmay.me/wiki/life-dashboard/');
});

test('deriveWiki never carries lines of code', () => {
  const json = JSON.stringify(deriveWiki(fixtureExport(), CONFIG));
  assert.ok(!/loc|currentLines/i.test(json), json);
});

test('the span runs from the earliest first commit to the latest last commit', () => {
  assert.deepEqual(deriveWiki(fixtureExport(), CONFIG).span, { first: '2025-10', last: '2026-06' });
});

test('mixed offsets: the span picks the earliest instant and prints its own month', () => {
  const e = fixtureExport();
  // 2026-01-01T01:00+05:00 is 2025-12-31T20:00Z, earlier than 2025-12-31T22:00-05:00 (2026-01-01T03:00Z).
  e.pages[0].infobox.firstCommitDate = '2026-01-01T01:00:00+05:00';
  e.pages[1].infobox.firstCommitDate = '2025-12-31T22:00:00-05:00';
  e.pages[2].infobox.firstCommitDate = '2026-02-01T00:00:00Z';
  assert.equal(deriveWiki(e, CONFIG).span.first, '2026-01');
});

test('no usable commit dates means no span', () => {
  const e = fixtureExport();
  for (const p of e.pages) p.infobox = {};
  assert.equal(deriveWiki(e, CONFIG).span, null);
});

test('languages: non-code dropped, TSX counted as TypeScript, ranked by pages', () => {
  assert.deepEqual(deriveWiki(fixtureExport(), CONFIG).languages, ['Python', 'TypeScript']);
});

test('languages: TSX and TypeScript on one page count once', () => {
  const e = fixtureExport();
  e.pages[0].infobox.languages = ['TSX', 'TypeScript'];
  e.pages[1].infobox.languages = ['Ada'];
  e.pages[2].infobox.languages = [];
  // Counted twice, TypeScript (2) would outrank Ada (1). Counted once they tie, and the tie goes by name.
  assert.deepEqual(deriveWiki(e, CONFIG).languages, ['Ada', 'TypeScript']);
});

test('languages: at most three, and none when every language is non-code', () => {
  const e = fixtureExport();
  e.pages[0].infobox.languages = ['Rust', 'Go', 'C', 'Zig'];
  assert.equal(deriveWiki(e, CONFIG).languages.length, 3);
  for (const p of e.pages) p.infobox.languages = ['JSON', 'Markdown'];
  assert.deepEqual(deriveWiki(e, CONFIG).languages, []);
});

test('authorship: solo when Sean is the only human holding lines; bots do not count', () => {
  assert.deepEqual(deriveWiki(fixtureExport(), CONFIG).authorship, { solo: true });
  const e = fixtureExport();
  e.people.snapshot.people.push({ id: 'old-friend', kind: 'human', currentLines: 0 });
  assert.deepEqual(deriveWiki(e, CONFIG).authorship, { solo: true });
});

test("authorship: otherwise Sean's share of current lines", () => {
  const e = fixtureExport();
  e.people.snapshot.people = [
    { id: 'sean-may', kind: 'human', currentLines: 750 },
    { id: 'akul', kind: 'human', currentLines: 250 },
  ];
  assert.deepEqual(deriveWiki(e, CONFIG).authorship, { solo: false, share: 0.75 });
  e.people.snapshot.people = [{ id: 'akul', kind: 'human', currentLines: 250 }];
  assert.equal(deriveWiki(e, CONFIG).authorship, null, 'no share of Sean to state');
});

test('authorship: a share that rounds to 100% or 0% is clamped to 99% or 1%', () => {
  const e = fixtureExport();
  e.people.snapshot.people = [
    { id: 'sean-may', kind: 'human', currentLines: 996 },
    { id: 'akul', kind: 'human', currentLines: 4 },
  ];
  const a = deriveWiki(e, CONFIG).authorship;
  assert.deepEqual(a, { solo: false, share: 0.99 });
  assert.equal(formatAuthorship(a), '99% of lines mine');
  e.people.snapshot.people = [
    { id: 'sean-may', kind: 'human', currentLines: 4 },
    { id: 'akul', kind: 'human', currentLines: 996 },
  ];
  assert.deepEqual(deriveWiki(e, CONFIG).authorship, { solo: false, share: 0.01 });
});

test('highlights: in config order, with manifest titles and wiki hrefs', () => {
  assert.deepEqual(deriveWiki(fixtureExport(), CONFIG).highlights, [
    { id: 'garmin-integration', title: 'Garmin integration', href: 'https://seanpatrickmay.me/wiki/life-dashboard/wiki/garmin-integration/' },
    { id: 'ai-digest', title: 'AI digest', href: 'https://seanpatrickmay.me/wiki/life-dashboard/wiki/ai-digest/' },
  ]);
});

test('a highlight with no page throws', () => {
  assert.throws(() => deriveWiki(fixtureExport(), { slug: 'x', highlight: ['nope'] }), /x: no wiki page for highlight nope/);
});

test('an export with no pages throws', () => {
  const e = fixtureExport();
  e.pages = [];
  assert.throws(() => deriveWiki(e, CONFIG), /life-dashboard: export has no pages/);
});

test('urls', () => {
  assert.equal(wikiUrl('pokerml'), 'https://seanpatrickmay.me/wiki/pokerml/');
  assert.equal(featureUrl('pokerml', 'cfr'), 'https://seanpatrickmay.me/wiki/pokerml/wiki/cfr/');
});

test('formatSpan', () => {
  assert.equal(formatSpan({ first: '2025-10', last: '2026-06' }), 'Oct 2025 – Jun 2026');
  assert.equal(formatSpan({ first: '2026-09', last: '2026-10' }), 'Sep – Oct 2026');
  assert.equal(formatSpan({ first: '2026-09', last: '2026-09' }), 'Sep 2026');
  assert.equal(formatSpan(null), '');
});

test('formatAuthorship', () => {
  assert.equal(formatAuthorship({ solo: true }), 'solo');
  assert.equal(formatAuthorship({ solo: false, share: 0.75 }), '75% of lines mine');
  assert.equal(formatAuthorship(null), '');
});

test('headline: en-US separators whatever the locale, and singular for one', () => {
  assert.equal(headline({ features: 25, citedClaims: 2329 }), 'code wiki · 25 features · 2,329 cited claims');
  assert.equal(headline({ features: 1, citedClaims: 1 }), 'code wiki · 1 feature · 1 cited claim');
});

test('historyLine joins what is known, and says when stale data is from', () => {
  const w = deriveWiki(fixtureExport(), CONFIG);
  assert.equal(historyLine(w), '345 commits, Oct 2025 – Jun 2026 · solo');
  assert.equal(historyLine(w, { days: 12, label: 'as of Oct 9' }), '345 commits, Oct 2025 – Jun 2026 · solo · as of Oct 9');
  assert.equal(historyLine({ commits: 1, span: null, authorship: null }), '1 commit');
  assert.equal(historyLine({ commits: null, span: null, authorship: null }), '');
});

const FILE = {
  generated_at: '2026-10-11T00:00:00.000Z',
  wikis: { a: { features: 25, citations: 780 }, b: { features: 51, citations: 1549 } },
};

test('wikiTotals sums across every entry', () => {
  assert.deepEqual(wikiTotals(FILE), { wikis: 2, features: 76, citations: 2329 });
  assert.deepEqual(wikiTotals(null), { wikis: 0, features: 0, citations: 0 });
});

const SRC = { label: "each wiki's export.json, refreshed daily", href: 'https://seanpatrickmay.me/wiki/' };

test('resolveWikiMetrics fills each wikiTotal metric from the feed, en-US formatted', () => {
  const p = { slug: 'repowiki', metrics: [{ wikiTotal: 'citations', label: 'citations', source: SRC }, { value: '6', label: 'x', source: SRC }] };
  const r = resolveWikiMetrics(p, FILE);
  assert.deepEqual(r.metrics, [{ value: '2,329', label: 'citations', source: SRC }, { value: '6', label: 'x', source: SRC }]);
  assert.equal(p.metrics[0].value, undefined, 'the input is not mutated');
  const plain = { slug: 'x', metrics: [{ value: '6', label: 'x', source: SRC }] };
  assert.equal(resolveWikiMetrics(plain, FILE), plain);
});

test('a wikiTotal the feed cannot fill is left without a value, which the deep-dive rules reject', () => {
  const p = {
    slug: 'repowiki', title: 'R', period: '2026', stack: [],
    metrics: [{ wikiTotal: 'features', label: 'feature articles', source: SRC }],
  };
  const errors = validateDeepDives([resolveWikiMetrics(p, { wikis: {} })]).join('\n');
  assert.match(errors, /repowiki metrics\[0\]: needs a value/);
});

const WIKI_LINK = { label: 'Wiki', href: 'https://seanpatrickmay.me/wiki/life-dashboard/', kind: 'wiki' };
const wikied = (extra = {}) => ({
  slug: 'life-dashboard',
  links: [WIKI_LINK],
  wiki: { slug: 'life-dashboard', highlight: ['ai-digest'] },
  ...extra,
});

test('validateWikiFields: a well-formed wiki field passes', () => {
  assert.deepEqual(validateWikiFields([wikied(), { slug: 'plain' }]), []);
});

test('validateWikiFields: slug, highlight count, duplicates and kebab-case', () => {
  const errs = p => validateWikiFields([p]).join('\n');
  assert.match(errs(wikied({ wiki: { slug: 'Life Dashboard', highlight: ['a'] } })), /wiki.slug must be a kebab-case slug/);
  assert.match(errs(wikied({ wiki: { slug: 'life-dashboard', highlight: [] } })), /wiki.highlight needs 1 to 3 feature ids/);
  assert.match(errs(wikied({ wiki: { slug: 'life-dashboard', highlight: ['a', 'b', 'c', 'd'] } })), /wiki.highlight needs 1 to 3 feature ids/);
  assert.match(errs(wikied({ wiki: { slug: 'life-dashboard', highlight: ['a', 'a'] } })), /wiki.highlight repeats a feature/);
  assert.match(errs(wikied({ wiki: { slug: 'life-dashboard', highlight: ['AI Digest'] } })), /wiki.highlight ids must be kebab-case/);
});

test('validateWikiFields: two projects cannot claim one wiki', () => {
  assert.match(validateWikiFields([wikied(), wikied({ slug: 'other' })]).join('\n'), /other: wiki "life-dashboard" is already life-dashboard's/);
});

test('validateWikiFields: a wiki needs its wiki link, at the matching href', () => {
  assert.match(validateWikiFields([wikied({ links: [] })]).join('\n'), /needs a link of kind "wiki" to https:\/\/seanpatrickmay.me\/wiki\/life-dashboard\//);
  const wrong = { ...WIKI_LINK, href: 'https://seanpatrickmay.me/wiki/pokerml/' };
  assert.match(validateWikiFields([wikied({ links: [wrong] })]).join('\n'), /needs a link of kind "wiki"/);
});

test('validateWikiFields: a wikied project has no "how it works"', () => {
  assert.match(validateWikiFields([wikied({ howItWorks: ['x'] })]).join('\n'), /life-dashboard: a wikied project has no "how it works"/);
});

test('validateWikiFields: wikiTotal names a known total and comes without a value', () => {
  const errs = metrics => validateWikiFields([{ slug: 'repowiki', metrics }]).join('\n');
  assert.match(errs([{ wikiTotal: 'lines', label: 'x', source: SRC }]), /repowiki metrics\[0\]: wikiTotal must be one of wikis, features, citations/);
  assert.match(errs([{ wikiTotal: 'features', value: '76', label: 'x', source: SRC }]), /repowiki metrics\[0\]: a wikiTotal metric takes its value from wikis.json/);
});

test('validateWikiFields: non-array links give the link error, not a crash', () => {
  assert.match(validateWikiFields([wikied({ links: {} })]).join('\n'), /needs a link of kind "wiki"/);
});

test('validateWikiFields: a non-string wiki slug fails the kebab-case check', () => {
  assert.match(validateWikiFields([wikied({ wiki: { slug: 5, highlight: ['a'] } })]).join('\n'), /wiki.slug must be a kebab-case slug/);
});

test('resolveWikiMetrics: a non-array metrics list has no wikiTotal to fill', () => {
  const p = { slug: 'x', metrics: 'nope' };
  assert.equal(resolveWikiMetrics(p, FILE), p);
});
