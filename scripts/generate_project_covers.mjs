#!/usr/bin/env node
// Generate covers for projects whose repos are private or have no screenshot
// worth showing.
//
// These are deliberately NOT title cards. Every card on the projects wall
// already prints the project title directly under its cover, so a cover that
// also renders the title just says the same thing twice in two typefaces. The
// cover's job is to be the thing the title is not: one number, big enough to
// read at thumbnail size, that makes you want the sentence underneath.
//
// Everything lives inside a central safe zone (see SAFE_* below), because
// these are rendered with object-cover into containers of several different
// aspect ratios — the featured slot crops a 16:9 source to roughly square and
// takes ~28% off each edge. An earlier left-aligned version lost its first
// word there and read "…ternative Data Pipeli…".
//
// WebP, not PNG. These are smooth gradients with a little text on top, which
// is the worst case for PNG's row filters — the same image was 240KB as a PNG
// and is ~15KB as WebP, and eight of them were most of the page's image
// weight. Nothing here is used as an og:image (that is the headshot), so
// there is no social-card reason to keep a PNG around.
//
// Generated once and committed rather than built in CI: SVG text depends on
// the renderer finding the font, and that is the failure that looks fine
// locally and comes out in Times New Roman on a runner.

import fs from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 675;

// The square centre crop the featured slot takes. Nothing legible may sit
// outside this; the patterns run full-bleed because they tile.
const SAFE_W = H;

// Background textures, so eight covers from one generator do not read as
// eight copies of the same file. Each tiles, so any crop still shows it.
const PATTERNS = {
  dots: `<circle cx="9" cy="9" r="2"/>`,
  grid: `<path d="M0 0 H36 M0 0 V36" fill="none" stroke-width="1.5"/>`,
  diagonals: `<path d="M-6 6 L6 -6 M0 36 L36 0 M30 42 L42 30" fill="none" stroke-width="2"/>`,
  rings: `<circle cx="18" cy="18" r="13" fill="none" stroke-width="1.5"/>`,
};

// One figure per project: the number a reader would repeat to someone else.
// Titles are not here on purpose — see the header comment.
const COVERS = [
  {
    slug: 'alternative-data-pipeline',
    metric: '175K',
    caption: 'postings a day',
    pattern: 'grid',
    accent: '#5eead4',
    glow: '#0d9488',
  },
  {
    slug: 'ai-chief-of-staff',
    metric: '32',
    caption: 'webhook types',
    pattern: 'dots',
    accent: '#a5b4fc',
    glow: '#4f46e5',
  },
  {
    slug: 'human-digit-classification',
    metric: '7.5M',
    caption: 'params, twice over',
    pattern: 'dots',
    accent: '#fca5a5',
    glow: '#b91c1c',
  },
  {
    slug: 'wildfire-modeling',
    metric: '0.929',
    caption: 'F1, held-out fires',
    pattern: 'rings',
    accent: '#fdba74',
    glow: '#c2410c',
  },
  {
    slug: 'nlhe-alpha-beta',
    metric: '100K',
    caption: 'CFR+ iterations',
    pattern: 'diagonals',
    accent: '#86efac',
    glow: '#15803d',
  },
  {
    slug: 'hex-reversi',
    metric: '48',
    caption: 'classes, one MVC',
    pattern: 'rings',
    accent: '#93c5fd',
    glow: '#1d4ed8',
  },
  {
    slug: 'linux-shell-c',
    metric: '793',
    caption: 'lines of C',
    pattern: 'diagonals',
    accent: '#d8b4fe',
    glow: '#7e22ce',
  },
  {
    slug: 'seanpatrickmay-github-io',
    metric: '4',
    caption: 'live data feeds',
    pattern: 'grid',
    accent: '#67e8f9',
    glow: '#0e7490',
  },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Long figures need to shrink or they run past the safe zone. Measured against
// Helvetica Bold, where a digit is about 0.56em.
function metricSize(metric) {
  const width = metric.length * 0.56;
  return Math.min(210, Math.floor((SAFE_W * 0.82) / width));
}

function svg({ metric, caption, pattern, accent, glow }) {
  const cx = W / 2;
  const size = metricSize(metric);

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${glow}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.12" r="0.75">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="texture" width="36" height="36" patternUnits="userSpaceOnUse"
             fill="${accent}" stroke="${accent}" fill-opacity="0.5" stroke-opacity="0.5">
      ${PATTERNS[pattern] ?? PATTERNS.dots}
    </pattern>
    <style>
      .metric  { font-family: Helvetica, Arial, sans-serif; font-size: ${size}px; font-weight: 700; fill: #f8fafc; text-anchor: middle; }
      .caption { font-family: Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 500; fill: #e2e8f0; text-anchor: middle; letter-spacing: 2px; }
      .rule    { stroke: ${accent}; stroke-width: 6; stroke-linecap: round; }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#texture)" opacity="0.14"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <line x1="${cx - 44}" y1="214" x2="${cx + 44}" y2="214" class="rule"/>
  <text x="${cx}" y="404" class="metric">${esc(metric)}</text>
  <text x="${cx}" y="476" class="caption">${esc(caption)}</text>
</svg>`;
}

// projects.json is the source of truth for which slugs exist, so a rename
// there fails loudly here instead of silently writing an orphan file.
function knownSlugs() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.projects;
  return new Set((list ?? []).map(p => p.slug));
}

async function main() {
  const slugs = knownSlugs();

  for (const cover of COVERS) {
    if (!slugs.has(cover.slug)) {
      console.warn(`  skipped ${cover.slug}: no such slug in projects.json`);
      continue;
    }
    const dir = path.join(ROOT, 'public', 'projects', cover.slug);
    await mkdir(dir, { recursive: true });
    await sharp(Buffer.from(svg(cover)))
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(dir, 'cover.webp'));
    // Clear the PNG this script used to emit, so a stale 240KB file cannot
    // sit in public/ being served to nobody.
    await rm(path.join(dir, 'cover.png'), { force: true });
    console.log(`  ${cover.slug}/cover.webp  ${cover.metric} ${cover.caption}`);
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
