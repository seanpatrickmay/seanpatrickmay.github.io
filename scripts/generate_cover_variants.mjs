#!/usr/bin/env node
/**
 * Writes the -480 and -960 variants every photographic cover is expected to
 * have. Idempotent: re-running regenerates from the full-size file, which is
 * the one checked into the repo at its original dimensions.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';
import { COVER_VARIANT_WIDTHS } from '../lib/coverImage.js';

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const QUALITY = 80;

const projects = JSON.parse(await readFile(path.join(ROOT, 'public/projects.json'), 'utf8'));
const covers = projects.map(p => p.coverImage).filter(c => c?.src?.endsWith('.webp'));

for (const cover of covers) {
  const full = path.join(ROOT, 'public', cover.src);
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
