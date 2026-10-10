import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { boardClusters, BOARD_CLUSTERS } from './board.js';

/**
 * Checks the static export, because the board's order is a promise to screen
 * readers and keyboards: DOM order is rank order, and each artifact sits
 * right after its own card. Skips (rather than fails) without a fresh
 * `npm run build`, so a plain `npm test` stays usable.
 */

const ROOT = path.join(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');
const DATA = path.join(ROOT, 'public', 'projects.json');
const projects = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const ranked = boardClusters(projects).flatMap(c => [...c.big, ...c.small]);

const filesUnder = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });

// The export is stale if anything that shapes the board changed after it:
// the data, the rules, the board's components, or any page.
const SOURCES = [
  DATA,
  path.join(ROOT, 'lib', 'board.js'),
  ...filesUnder(path.join(ROOT, 'components', 'projects')),
  ...filesUnder(path.join(ROOT, 'pages')),
];
const newestSource = SOURCES.reduce(
  (newest, file) => {
    const mtimeMs = fs.statSync(file).mtimeMs;
    return mtimeMs > newest.mtimeMs ? { file, mtimeMs } : newest;
  },
  { file: null, mtimeMs: 0 },
);

function skipUnlessBuilt(file) {
  const full = path.join(OUT, file);
  if (!fs.existsSync(full)) return `no ${file} in out/; run npm run build first`;
  if (fs.statSync(full).mtimeMs < newestSource.mtimeMs) {
    return `out/${file} is older than ${path.relative(ROOT, newestSource.file)}; rebuild`;
  }
  return false;
}

function region(file, startMarker, endMarker) {
  const html = fs.readFileSync(path.join(OUT, file), 'utf8');
  const start = html.indexOf(startMarker);
  assert.ok(start >= 0, `${file}: no ${startMarker}`);
  const end = html.indexOf(endMarker, start);
  assert.ok(end > start, `${file}: no ${endMarker} after ${startMarker}`);
  return html.slice(start, end);
}

function cardOrder(html) {
  const seen = [];
  for (const m of html.matchAll(/href="\/projects\/([a-z0-9-]+)\/"/g)) {
    if (!seen.includes(m[1])) seen.push(m[1]);
  }
  return seen;
}

function assertBoard(html, file) {
  assert.deepEqual(cardOrder(html), ranked.map(p => p.slug), `${file}: cards out of rank order, or an off-board card`);
  for (const { label } of BOARD_CLUSTERS) assert.ok(html.includes(label), `${file}: missing "${label}"`);
  assert.ok(!html.includes('deep dive'), `${file}: the board carries no pill buttons`);
  for (const [i, p] of ranked.entries()) {
    const at = html.indexOf(`href="/projects/${p.slug}/"`);
    const next = i + 1 < ranked.length ? html.indexOf(`href="/projects/${ranked[i + 1].slug}/"`) : html.length;
    for (const a of (p.artifacts ?? []).filter(a => a.href)) {
      const ai = html.indexOf(`href="${a.href}"`, at);
      assert.ok(ai > at && ai < next, `${file}: ${p.slug}'s ${a.kind} is not right after its card`);
    }
  }
}

const projectsPage = path.join('projects', 'index.html');

test('/projects/ is a real page with the whole board', { skip: skipUnlessBuilt(projectsPage) }, () => {
  assertBoard(region(projectsPage, 'data-board', '__NEXT_DATA__'), projectsPage);
});

const privatePage = path.join('projects', 'alternative-data-pipeline', 'index.html');

test('a private project says why its deep dive has no links', { skip: skipUnlessBuilt(privatePage) }, () => {
  const note = projects.find(p => p.slug === 'alternative-data-pipeline')?.linksNote;
  assert.ok(note, 'alternative-data-pipeline has no linksNote');
  const html = fs.readFileSync(path.join(OUT, privatePage), 'utf8');
  const body = html.slice(0, html.indexOf('__NEXT_DATA__'));
  assert.ok(body.includes(note), `${privatePage}: the rendered page does not show "${note}"`);
});

test('home: the board sits right under the hero, before about me', { skip: skipUnlessBuilt('index.html') }, () => {
  const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  const home = html.indexOf('id="home"');
  const board = html.indexOf('id="projects"');
  const about = html.indexOf('id="about"');
  assert.ok(home >= 0 && home < board && board < about, `order is home ${home}, projects ${board}, about ${about}`);
  assert.ok(!html.includes('a few things i built'), 'the hero fan is still there');
});

test('home: the board holds every board project in rank order', { skip: skipUnlessBuilt('index.html') }, () => {
  assertBoard(region('index.html', 'data-board', 'id="about"'), 'index.html');
});
