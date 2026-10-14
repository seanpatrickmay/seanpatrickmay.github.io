import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { deepDiveErrors, RETIRED_FIELDS } from './deepDive.js';
import { wikiTotals } from './wikiStrip.js';

/**
 * The deep-dive rules and content, against the real projects.json. The
 * fixture tests in deepDive.test.mjs say what the rules are; these say the
 * data meets them, and pin the content this milestone migrated.
 */

const ROOT = path.join(import.meta.dirname, '..');
const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));
const wikis = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'wikis.json'), 'utf8'));
const localFile = href => path.join(ROOT, 'public', decodeURI(href.split('#')[0]));

test('projects.json passes every deep-dive rule', () => {
  assert.deepEqual(deepDiveErrors(real, wikis), []);
});

test('the five lead figures this milestone ships are in place, and only those', () => {
  const withFigure = real.filter(p => p.leadFigure).map(p => p.slug).sort();
  assert.deepEqual(withFigure, ['alphasettler', 'lecteuraide', 'life-dashboard', 'repowiki', 'wildfire-modeling']);
  assert.ok(real.find(p => p.slug === 'alphasettler').leadFigure.chart, "AlphaSettler's figure is the chart");
});

test('every local lead-figure image and source points at a file that exists', () => {
  for (const p of real.filter(x => x.leadFigure)) {
    const { src, source } = p.leadFigure;
    for (const ref of [src, source?.href].filter(r => typeof r === 'string' && r.startsWith('/'))) {
      assert.ok(fs.existsSync(localFile(ref)), `${p.slug}: missing ${ref}`);
    }
  }
});

test('lead-figure captions are lowercase, like the rest of the handwriting', () => {
  for (const p of real.filter(x => x.leadFigure)) {
    const first = p.leadFigure.caption[0];
    assert.equal(first, first.toLowerCase(), `${p.slug}: "${p.leadFigure.caption}"`);
  }
});

// The metrics this milestone migrated. Change a row only when its source
// changes: every value here was checked against the source named in its
// entry (see docs/superpowers/plans/2026-10-10-project-board-milestone-2.md).
// A wikiTotal metric has no typed value: the feed fills it, and it moves
// every time a wiki regenerates, so the row names the total instead.
const EXPECTED_METRICS = {
  'wildfire-modeling': ['0.928', '0.929', '+0.180'],
  alphasettler: ['~300×', '700k', '0.585'],
  repowiki: ['wikiTotal:wikis', 'wikiTotal:features', 'wikiTotal:citations'],
  'alternative-data-pipeline': ['175,000+', '61%', '~37 to 0'],
  'ai-chief-of-staff': ['32'],
  'seanpatrickmay-github-io': ['1,751', '0.95'],
  'life-dashboard': ['<$2/mo'],
};

test('each deep dive carries exactly the sourced metrics this milestone migrated', () => {
  for (const p of real.filter(x => x.slug)) {
    assert.deepEqual((p.metrics ?? []).map(m => m.value ?? `wikiTotal:${m.wikiTotal}`), EXPECTED_METRICS[p.slug] ?? [], p.slug);
  }
});

const PUBLIC_KINDS = new Set(['repo', 'paper', 'wiki', 'live']);
const isPublic = p => (p.links ?? []).some(l => PUBLIC_KINDS.has(l.kind));

test('a project with public sources links every metric; only a private one self-reports', () => {
  for (const p of real) {
    for (const m of p.metrics ?? []) {
      if (isPublic(p)) assert.ok(m.source.href, `${p.slug} "${m.value}" is public but has no source link`);
    }
  }
});

test('every local metric source points at a file that exists', () => {
  for (const p of real) {
    for (const m of p.metrics ?? []) {
      const href = m.source?.href;
      if (href?.startsWith('/')) assert.ok(fs.existsSync(localFile(href)), `${p.slug} "${m.value}": missing ${href}`);
    }
  }
});

test('credits appear only where the collaborators are known', () => {
  const credited = Object.fromEntries(real.filter(p => p.credits).map(p => [p.slug, p.credits]));
  assert.deepEqual(credited, {
    'wildfire-modeling': "with Aidan D'Alonzo & Ethan Meid",
    'ai-chief-of-staff': 'on a team of 7 engineers',
    'hex-reversi': "with Akul Sethi; repository hosted under collaborator's account",
  });
});

test('findings and metric labels are lowercase-led, like the rest of the copy', () => {
  const PROPER = /^(F1|F2|CFR\+|Lambda|Garmin|Catanatron|AlphaSettler|RepoWiki|XGBoost|MLP)(?!\w)/;
  for (const p of real) {
    for (const text of [...(p.findings ?? []), ...(p.metrics ?? []).map(m => m.label)]) {
      assert.ok(PROPER.test(text) || text[0] === text[0].toLowerCase(), `${p.slug}: "${text}"`);
    }
  }
});

test('every metric label is short enough to sit under its figure', () => {
  for (const p of real) {
    for (const m of p.metrics ?? []) {
      assert.ok(m.label.length <= 90, `${p.slug} "${m.value}": label is ${m.label.length} characters`);
    }
  }
});

test('no project still carries a retired field', () => {
  for (const p of real) {
    for (const field of RETIRED_FIELDS) {
      assert.equal(p[field], undefined, `${p.slug} still has ${field}`);
    }
  }
});

const WIKIED = {
  'life-dashboard': 'life-dashboard',
  lecteuraide: 'lecteuraide',
  'nlhe-alpha-beta': 'pokerml',
  repowiki: 'repowiki',
  alphasettler: 'alphasettler',
  rototext: 'rototext',
};

test('the six projects with a code wiki say so, each pointing at its own wiki', () => {
  const found = Object.fromEntries(real.filter(p => p.wiki).map(p => [p.slug, p.wiki.slug]));
  assert.deepEqual(found, WIKIED);
});

test('wikis.json has an entry for every wikied project, linking exactly its highlights', () => {
  for (const p of real.filter(x => x.wiki)) {
    const entry = wikis.wikis[p.wiki.slug];
    assert.ok(entry, `${p.slug}: no entry for ${p.wiki.slug} in wikis.json`);
    assert.deepEqual(entry.highlights.map(h => h.id), p.wiki.highlight, p.slug);
  }
});

test("wikis.json's generated_at is its oldest fetch, so one broken wiki shows as stale", () => {
  const times = Object.values(wikis.wikis).map(w => Date.parse(w.fetchedAt));
  assert.ok(times.every(t => !Number.isNaN(t)), 'every entry has a fetchedAt');
  assert.equal(Date.parse(wikis.generated_at), Math.min(...times));
});

test("RepoWiki's totals come from the feed, not from typing them in", () => {
  const repowiki = real.find(p => p.slug === 'repowiki');
  assert.deepEqual(repowiki.metrics.map(m => m.wikiTotal), ['wikis', 'features', 'citations']);
  const totals = wikiTotals(wikis);
  assert.equal(totals.wikis, Object.keys(WIKIED).length);
  assert.ok(totals.features > 0 && totals.citations > 0);
});
