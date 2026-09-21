// Build sitemap.xml and robots.txt from what actually exists.
//
// The committed sitemap had drifted to 13 URLs against 8 projects, handing
// search engines five 404s. Both files also hardcoded the domain that CNAME
// already knows.
//
// Routes come from the filesystem, not a list: every non-dynamic page under
// pages/ becomes a URL, and the one dynamic route ([slug]) is expanded from
// projects.json. Adding a page therefore adds it to the sitemap with no
// second edit, which is the whole point.
//
// Runs from `prebuild`, so the files are on disk before next build copies
// public/ into out/.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, 'pages');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FALLBACK_ORIGIN = 'https://seanpatrickmay.me';

// Pages that exist but should never be advertised to a crawler.
const EXCLUDED = new Set(['/404']);

function readOrigin() {
  try {
    const host = fs.readFileSync(path.join(ROOT, 'CNAME'), 'utf8').trim();
    if (host) return `https://${host.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  } catch {
    // no CNAME checked in — fall through
  }
  return FALLBACK_ORIGIN;
}

function walkPages(dir = PAGES_DIR, prefix = '') {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...walkPages(path.join(dir, entry.name), `${prefix}/${entry.name}`));
      continue;
    }
    if (!/\.(jsx?|tsx?)$/.test(entry.name)) continue;

    const base = entry.name.replace(/\.(jsx?|tsx?)$/, '');
    if (base.startsWith('_')) continue; // _app, _document

    routes.push(base === 'index' ? prefix || '/' : `${prefix}/${base}`);
  }
  return routes;
}

function projectSlugs() {
  try {
    const raw = fs.readFileSync(path.join(PUBLIC_DIR, 'projects.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.projects;
    return (list ?? []).map(project => project?.slug).filter(Boolean);
  } catch {
    return [];
  }
}

// trailingSlash: true in next.config, so every URL needs one to match what
// the export actually serves — otherwise each entry is a redirect.
function withTrailingSlash(route) {
  if (route === '/') return '/';
  return route.endsWith('/') ? route : `${route}/`;
}

export function buildRoutes() {
  const staticRoutes = walkPages()
    .filter(route => !route.includes('['))
    .filter(route => !EXCLUDED.has(route));

  const dynamic = projectSlugs().map(slug => `/projects/${slug}`);

  return [...new Set([...staticRoutes, ...dynamic])]
    .map(withTrailingSlash)
    .sort((a, b) => {
      // Shallow before deep, then alphabetical — stable output, clean diffs.
      const depth = route => route.split('/').filter(Boolean).length;
      return depth(a) - depth(b) || a.localeCompare(b);
    });
}

function renderSitemap(origin, routes) {
  const urls = routes.map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRobots(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

function main() {
  const origin = readOrigin();
  const routes = buildRoutes();

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), renderSitemap(origin, routes));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), renderRobots(origin));

  console.log(`sitemap: ${routes.length} routes at ${origin}`);
  for (const route of routes) console.log(`  ${route}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
