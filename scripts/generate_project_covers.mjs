#!/usr/bin/env node
// Generate placeholder covers for projects whose repos are private.
//
// Alternative Data Pipeline and AI Chief of Staff are the two highest-ranked
// projects, so they lead the hero polaroid fan — and with no coverImage they
// rendered as a bare gradient, which reads as unfinished exactly where the
// page should look strongest.
//
// Deliberately generated once and committed rather than built in CI: SVG text
// depends on the renderer finding the font, and that is the failure that looks
// fine locally and comes out in Times New Roman on a runner.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 675;

const COVERS = [
  {
    slug: 'alternative-data-pipeline',
    title: 'Alternative Data Pipeline',
    lines: ['175,000+ postings / day', '6 ATS platforms · 61% of the S&P 500', 'under $15 / month'],
    accent: '#5eead4',
    glow: '#0d9488',
  },
  {
    slug: 'ai-chief-of-staff',
    title: 'AI Chief of Staff',
    lines: ['32 webhook types', 'Notion · Slack · Linear · GitHub', 'per-project ordered ingest'],
    accent: '#a5b4fc',
    glow: '#4f46e5',
  },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svg({ title, lines, accent, glow }) {
  // Centred inside a safe zone, not left-aligned: these are rendered with
  // object-cover into containers of several different aspect ratios, and the
  // hero crops hard from both edges. Left-aligned text lost its first word.
  const cx = W / 2;
  const body = lines
    .map((line, i) => `<text x="${cx}" y="${402 + i * 52}" class="sub">${esc(line)}</text>`)
    .join('\n    ');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${glow}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.1" r="0.7">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <style>
      .title { font-family: Helvetica, Arial, sans-serif; font-size: 62px; font-weight: 700; fill: #f8fafc; text-anchor: middle; }
      .sub   { font-family: Helvetica, Arial, sans-serif; font-size: 28px; fill: #cbd5e1; text-anchor: middle; }
      .rule  { stroke: ${accent}; stroke-width: 6; stroke-linecap: round; }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <line x1="${cx - 48}" y1="252" x2="${cx + 48}" y2="252" class="rule"/>
  <text x="${cx}" y="330" class="title">${esc(title)}</text>
  ${body}
</svg>`;
}

async function main() {
  for (const cover of COVERS) {
    const dir = path.join(ROOT, 'public', 'projects', cover.slug);
    await mkdir(dir, { recursive: true });
    const out = path.join(dir, 'cover.png');
    await sharp(Buffer.from(svg(cover))).png({ compressionLevel: 9 }).toFile(out);
    console.log(`  ${cover.slug}/cover.png`);
  }
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
