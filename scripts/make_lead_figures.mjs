#!/usr/bin/env node
/**
 * Crops the deep dives' raster lead figures out of their originals.
 *
 * As much a record as a tool: each entry below is what that figure is, where
 * it came from, and the exact box cut out of it. It runs on Sean's machine,
 * where the sibling repos sit next to this one; it needs poppler's pdftoppm
 * for the paper (brew install poppler). Afterwards, write the variants:
 *
 *   node scripts/make_lead_figures.mjs
 *   node scripts/generate_cover_variants.mjs <each src it printed>
 *
 * To swap a figure (Life-Dashboard has ten other screenshots), change its
 * `from` and `crop` and run both again.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(import.meta.dirname, '..');
const SIBLINGS = path.join(ROOT, '..');

const FIGURES = [
  {
    // "Page 16" is the printed number; it is the PDF's 17th page. 288 dpi is
    // 4x the PDF's 72, so the 752px figure slot stays sharp on a 2x screen.
    // The box is the CreekFire t=186 title, its three panels and the legend.
    out: 'public/projects/wildfire-modeling/creek-fire-186.webp',
    from: { pdf: 'public/projects/wildfire-modeling/hourly-wildfire-spread-prediction.pdf', page: 17, dpi: 288 },
    crop: { left: 360, top: 1100, width: 1740, height: 920 },
    // Flat colour and small type: lossless is both sharper and smaller.
    webp: { lossless: true, effort: 6 },
  },
  {
    // RepoWiki's own article on wiki freshness. The crop keeps the lead, the
    // infobox and the overview with its citation marks.
    out: 'public/projects/repowiki/wiki-freshness.webp',
    from: { repo: 'RepoWiki', ref: 'origin/main', file: 'docs/images/wiki-page.webp' },
    crop: { left: 0, top: 0, width: 1200, height: 900 },
    webp: { quality: 85, effort: 6 },
  },
  {
    // The body view in guest mode (demo data, nothing personal). The box
    // starts below the guest-mode banner and the Today/Read/Reflect nav, so
    // it shows the back link, the health/nutrition tabs, a readiness score,
    // the morning briefing, and HRV, resting HR, sleep and training load.
    // Not today-desktop.png, whose AI briefing quotes real news headlines,
    // and not guest-projects.png, whose demo todos are lab work.
    out: 'public/projects/life-dashboard/body-view.webp',
    from: { repo: 'Life-Dashboard', ref: 'origin/main', file: 'docs/screenshots/body-desktop.png' },
    crop: { left: 40, top: 300, width: 1200, height: 660 },
    webp: { quality: 85, effort: 6 },
  },
];

function original({ pdf, page, dpi, repo, ref, file }) {
  if (pdf) {
    const prefix = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'lead-figure-')), 'page');
    execFileSync('pdftoppm', ['-f', String(page), '-l', String(page), '-r', String(dpi), '-png', '-singlefile', path.join(ROOT, pdf), prefix]);
    return fs.readFileSync(`${prefix}.png`);
  }
  return execFileSync('git', ['-C', path.join(SIBLINGS, repo), 'show', `${ref}:${file}`], { maxBuffer: 64 * 1024 * 1024 });
}

for (const fig of FIGURES) {
  const out = path.join(ROOT, fig.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const info = await sharp(original(fig.from)).extract(fig.crop).webp(fig.webp).toFile(out);
  console.log(`✔ ${fig.out.replace(/^public/, '')} ${info.width}x${info.height} ${(info.size / 1024).toFixed(1)} KB`);
}
