#!/usr/bin/env node
/**
 * Writes the -480/-640/-960 variants every photographic cover and lead
 * figure is expected to have (see lib/coverImage.js). Idempotent: it
 * regenerates from the full-size file, the one checked into the repo.
 *
 *   node scripts/generate_cover_variants.mjs            # every image
 *   node scripts/generate_cover_variants.mjs /projects/x/y.webp …   # only these
 *
 * Pass paths when adding an image, so existing variants are not rewritten.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';
import { COVER_VARIANT_WIDTHS } from '../lib/coverImage.js';

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const QUALITY = 80;
const only = new Set(process.argv.slice(2));

const projects = JSON.parse(await readFile(path.join(ROOT, 'public/projects.json'), 'utf8'));
// One entry per file: LecteurAide's lead figure is its cover.
const images = new Map();
for (const p of projects) {
  for (const img of [p.coverImage, p.leadFigure]) {
    if (img?.src?.endsWith('.webp') && (only.size === 0 || only.has(img.src))) images.set(img.src, img);
  }
}

for (const src of images.keys()) {
  const full = path.join(ROOT, 'public', src);
  const meta = await sharp(full).metadata();
  for (const width of COVER_VARIANT_WIDTHS) {
    if (width >= meta.width) continue;
    const out = full.replace(/\.webp$/, `-${width}.webp`);
    await sharp(full).resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 6 }).toFile(out);
    const { size } = await stat(out);
    console.log(`✔ ${path.basename(out)} ${(size / 1024).toFixed(1)} KB`);
  }
}
console.log('Done.');
