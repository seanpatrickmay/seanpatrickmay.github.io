import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));
const projects = Array.isArray(raw) ? raw : raw.projects;

// Kept in step with MOTIFS in components/projects/CoverArt.jsx by the test
// below, which reads the component rather than trusting this list.
const EXPECTED_MOTIFS = ['pipeline', 'lanes', 'hand', 'satellite', 'range-grid', 'hex', 'pipes', 'browser'];

function motifKeys() {
  const src = fs.readFileSync(path.join(ROOT, 'components', 'projects', 'CoverArt.jsx'), 'utf8');
  const block = src.slice(src.indexOf('export const MOTIFS = {'), src.indexOf('};', src.indexOf('export const MOTIFS = {')));
  return [...block.matchAll(/^\s+'?([a-z-]+)'?:/gm)].map(m => m[1]);
}

test('every project has exactly one kind of cover', () => {
  for (const p of projects) {
    const art = Boolean(p.coverArt?.motif);
    const img = Boolean(p.coverImage?.src);
    assert.ok(art || img, `${p.slug} has no cover at all`);
    assert.ok(!(art && img), `${p.slug} has both coverArt and coverImage`);
  }
});

test('every coverArt motif is one the component can actually draw', () => {
  // The real failure mode: a renamed motif renders an empty card, which no
  // build step and no type checker would catch.
  const known = new Set(motifKeys());
  for (const p of projects.filter(p => p.coverArt)) {
    assert.ok(known.has(p.coverArt.motif), `${p.slug}: unknown motif "${p.coverArt.motif}"`);
  }
});

test('every coverArt has a caption, and it is not a bare number', () => {
  for (const p of projects.filter(p => p.coverArt)) {
    const line = p.coverArt.line;
    assert.ok(line && line.trim().length > 0, `${p.slug} has no caption`);
    assert.ok(/[a-z]/i.test(line), `${p.slug} caption has no words: "${line}"`);
  }
});

test('every coverImage file exists on disk', () => {
  for (const p of projects.filter(p => p.coverImage?.src)) {
    const file = path.join(ROOT, 'public', p.coverImage.src);
    assert.ok(fs.existsSync(file), `${p.slug}: missing ${p.coverImage.src}`);
  }
});

test('no motif in the component is left unused', () => {
  const used = new Set(projects.filter(p => p.coverArt).map(p => p.coverArt.motif));
  for (const key of motifKeys()) {
    assert.ok(used.has(key), `motif "${key}" is defined but no project uses it`);
  }
});

test('the motif list matches what this suite was written against', () => {
  assert.deepEqual(motifKeys().sort(), [...EXPECTED_MOTIFS].sort());
});
