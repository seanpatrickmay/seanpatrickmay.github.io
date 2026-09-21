#!/usr/bin/env node
// Normalise project cover images.
//
// life-dashboard-cover.png shipped at 2545x1460 / 2.7MB and was the page's
// largest-contentful-paint element: Lighthouse measured LCP at 19.8s against
// an otherwise healthy page (FCP 1.7s, CLS 0, TBT 130ms). Every other cover
// was already 1200px wide, so this brings the outliers in line.
//
// Idempotent: an image already within budget is left untouched, so it is safe
// to re-run and safe to wire into a build.

import { readdir, stat, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const MAX_WIDTH = 1200;
const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = path.join(ROOT, 'public', 'projects');
const IMAGE_RE = /\.(png|jpe?g)$/i;

async function optimize(file) {
  const before = (await stat(file)).size;
  const meta = await sharp(file).metadata();
  if (!meta.width || meta.width <= MAX_WIDTH) return null;

  // Write beside the original then swap, so a failure mid-encode cannot leave
  // a truncated cover in the repo.
  const tmp = `${file}.tmp`;
  const pipeline = sharp(file).resize({ width: MAX_WIDTH, withoutEnlargement: true });
  await (/\.png$/i.test(file)
    ? pipeline.png({ compressionLevel: 9, palette: true })
    : pipeline.jpeg({ quality: 82, mozjpeg: true })
  ).toFile(tmp);

  const after = (await stat(tmp)).size;
  if (after >= before) {
    await unlink(tmp);
    return null;
  }
  await rename(tmp, file);
  return { before, after, from: meta.width };
}

async function main() {
  const dirs = await readdir(PROJECTS_DIR, { withFileTypes: true });
  let saved = 0;

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const dirPath = path.join(PROJECTS_DIR, dir.name);
    for (const file of await readdir(dirPath)) {
      if (!IMAGE_RE.test(file)) continue;
      const full = path.join(dirPath, file);
      const result = await optimize(full);
      if (result) {
        saved += result.before - result.after;
        console.log(
          `  ${dir.name}/${file}: ${result.from}px ${Math.round(result.before / 1024)}KB -> ${MAX_WIDTH}px ${Math.round(result.after / 1024)}KB`,
        );
      }
    }
  }

  console.log(saved ? `Saved ${Math.round(saved / 1024)}KB` : 'All covers already within budget.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
