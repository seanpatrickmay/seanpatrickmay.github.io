import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CAVEAT_SUBSET, FONT_REQUESTS, PRELOAD } from './fontSpec.js';
import { BOARD_CLUSTERS, BOARD_NOTE } from './board.js';

/**
 * The fonts are self-hosted, generated from lib/fontSpec.js into
 * public/fonts and styles/fonts.css by scripts/fetch_fonts.mjs. That setup
 * has two silent failure modes, and these tests cover both:
 *
 * - Caveat is subset with `text=`. A character outside the subset renders in
 *   the fallback cursive, and nobody notices until they look closely at one
 *   card.
 * - The generated CSS and the files on disk can drift apart — a spec edit
 *   without a re-run leaves @font-face rules pointing at 404s, and a missing
 *   font is invisible in a diff and nearly invisible on the page.
 */

const ROOT = path.join(import.meta.dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const fontsCss = read('styles/fonts.css');
const caveatRequest = FONT_REQUESTS.find(r => r.query.startsWith('Caveat'));

function handwrittenStrings() {
  const raw = JSON.parse(read('public/projects.json'));
  const projects = Array.isArray(raw) ? raw : raw.projects;
  const out = [];
  for (const p of projects) {
    // Rendered in font-hand: cover captions, gallery captions, what's-next.
    if (p.coverArt?.line) out.push([`${p.slug} coverArt.line`, p.coverArt.line]);
    for (const [i, g] of (p.gallery ?? []).entries()) {
      if (g?.caption) out.push([`${p.slug} gallery[${i}].caption`, g.caption]);
    }
    for (const [i, s] of (p.nextSteps ?? []).entries()) {
      out.push([`${p.slug} nextSteps[${i}]`, s]);
    }
    // Sticky notes and polaroid captions are font-hand; tags and the paper's
    // title are not, but checking every artifact costs nothing.
    for (const [i, a] of (p.artifacts ?? []).entries()) {
      out.push([`${p.slug} artifacts[${i}].text`, a.text]);
    }
  }
  for (const c of BOARD_CLUSTERS) out.push([`board cluster ${c.id}`, c.label]);
  out.push(['board note', BOARD_NOTE.text]);
  return out;
}

test('the Caveat subset covers every handwritten string in projects.json', () => {
  const allowed = new Set([...CAVEAT_SUBSET]);
  const missing = [];
  for (const [where, text] of handwrittenStrings()) {
    for (const ch of text) {
      if (!allowed.has(ch)) missing.push(`${where}: ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16).toUpperCase()})`);
    }
  }
  assert.deepEqual([...new Set(missing)], [], 'characters outside the Caveat subset would fall back');
});

test('the subset at least covers printable ASCII', () => {
  const allowed = new Set([...CAVEAT_SUBSET]);
  const missing = [];
  for (let c = 0x20; c < 0x7f; c += 1) {
    if (!allowed.has(String.fromCharCode(c))) missing.push(String.fromCharCode(c));
  }
  assert.deepEqual(missing, [], 'printable ASCII must be fully covered');
});

test('Caveat is served at one weight, and it is one the family ships', () => {
  assert.equal(caveatRequest.query, 'Caveat:wght@600', 'font-hand sets no weight, so exactly one must be served');
});

test('only Caveat is subset — the body faces must keep their full charset', () => {
  for (const req of FONT_REQUESTS) {
    if (req === caveatRequest) continue;
    assert.equal(req.text, undefined, `${req.label} is subset, which would break names like "Les Misérables"`);
  }
});

test('no italic axis is requested for faces that do not use it', () => {
  for (const req of FONT_REQUESTS) {
    assert.ok(!/ital/.test(req.query), `${req.label} requests an italic axis nothing uses`);
  }
  assert.ok(!/font-style:\s*italic/.test(fontsCss), 'an italic face was generated but nothing renders one');
});

test('every face the stylesheet references is on disk, and is really a woff2', () => {
  const refs = [...fontsCss.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map(m => m[1]);
  assert.ok(refs.length > 0, 'expected @font-face rules to check');
  for (const file of refs) {
    const full = path.join(ROOT, 'public', 'fonts', file);
    assert.ok(fs.existsSync(full), `styles/fonts.css points at /fonts/${file}, which is not on disk`);
    const sig = fs.readFileSync(full).subarray(0, 4).toString('latin1');
    assert.equal(sig, 'wOF2', `${file} is not a woff2 — the legacy format is roughly twice the size`);
  }
});

test('no font file is orphaned by the stylesheet', () => {
  const refs = new Set([...fontsCss.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map(m => m[1]));
  for (const file of fs.readdirSync(path.join(ROOT, 'public', 'fonts'))) {
    if (file.endsWith('.woff2')) assert.ok(refs.has(file), `${file} ships but no @font-face uses it`);
  }
});

test('every preloaded face is one the stylesheet actually uses', () => {
  for (const file of PRELOAD) {
    assert.ok(fontsCss.includes(`/fonts/${file}`), `${file} is preloaded but no @font-face references it`);
  }
});

test('nothing reaches out to Google for fonts any more', () => {
  for (const f of ['pages/_document.jsx', 'pages/_app.jsx', 'styles/globals.css', 'styles/fonts.css']) {
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(read(f)), `${f} still links a Google font origin`);
  }
});
