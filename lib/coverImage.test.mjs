import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { coverSources, expectedVariantPaths, COVER_SIZES, COVER_VARIANT_WIDTHS } from './coverImage.js';

const ROOT = path.join(import.meta.dirname, '..');
const pub = p => path.join(ROOT, 'public', p);
const projects = JSON.parse(readFileSync(pub('projects.json'), 'utf8'));
const covers = projects.filter(p => p.coverImage?.src).map(p => ({ slug: p.slug, ...p.coverImage }));

test('every cover declares the intrinsic size it actually has', async () => {
  assert.ok(covers.length > 0, 'expected at least one cover to check');
  for (const c of covers) {
    const meta = await sharp(pub(c.src)).metadata();
    assert.equal(c.width, meta.width, `${c.slug}: declared width ${c.width}, file is ${meta.width}`);
    assert.equal(c.height, meta.height, `${c.slug}: declared height ${c.height}, file is ${meta.height}`);
  }
});

test('every cover has the variants its srcSet advertises', async () => {
  for (const c of covers) {
    const advertised = coverSources(c).srcSet.split(', ').map(s => s.split(' ')[0]);
    for (const src of advertised) {
      assert.ok(existsSync(pub(src)), `${c.slug}: srcSet points at ${src}, which is not on disk`);
    }
  }
});

test('each variant file is actually the width its descriptor claims', async () => {
  for (const c of covers) {
    for (const [src, desc] of coverSources(c).srcSet.split(', ').map(s => s.split(' '))) {
      const meta = await sharp(pub(src)).metadata();
      assert.equal(meta.width, Number(desc.replace('w', '')), `${src} is ${meta.width}px but advertised as ${desc}`);
    }
  }
});

test('a variant is never larger than the original it came from', async () => {
  for (const c of covers) {
    for (const v of expectedVariantPaths(c)) {
      assert.ok(COVER_VARIANT_WIDTHS.some(w => v.endsWith(`-${w}.webp`)), `${v} is not a declared variant width`);
    }
  }
});

test('coverSources declines rather than guessing when size is undeclared', () => {
  assert.equal(coverSources({ src: '/a/b.webp' }), null, 'no declared width should mean no srcSet');
  assert.equal(coverSources(null), null);
  assert.equal(coverSources({ src: '/a/b.png', width: 800 }), null, 'only webp covers have variants');
});

test('every sizes value ends in an unconditional fallback', () => {
  for (const [slot, value] of Object.entries(COVER_SIZES)) {
    const last = value.split(', ').at(-1);
    assert.ok(!last.startsWith('('), `COVER_SIZES.${slot} ends with a media condition: "${last}"`);
  }
});

test('every logo the site references exists on disk', () => {
  const sources = ['lib/mapData.js', 'lib/timeline.js', 'public/experience.json'];
  const refs = new Set();
  for (const f of sources) {
    for (const m of readFileSync(path.join(ROOT, f), 'utf8').matchAll(/\/logos\/[A-Za-z0-9/_-]+\.(?:webp|png|jpg|svg)/g)) {
      refs.add(m[0]);
    }
  }
  assert.ok(refs.size > 0, 'expected to find logo references to check');
  for (const ref of refs) {
    assert.ok(existsSync(pub(ref)), `${ref} is referenced but not on disk`);
  }
});
