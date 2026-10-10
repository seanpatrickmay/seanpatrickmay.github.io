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

function skipUnlessBuilt(file) {
  const full = path.join(OUT, file);
  if (!fs.existsSync(full)) return `no ${file} in out/; run npm run build first`;
  if (fs.statSync(full).mtimeMs < fs.statSync(DATA).mtimeMs) return `out/${file} is older than projects.json; rebuild`;
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

export function assertBoard(html, file) {
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
  const html = fs.readFileSync(path.join(OUT, projectsPage), 'utf8');
  assert.ok(!html.includes('router.replace'), '/projects/ is still a redirect');
  assertBoard(region(projectsPage, 'data-board', '__NEXT_DATA__'), projectsPage);
});
