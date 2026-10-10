import fs from 'node:fs';
import path from 'node:path';

/**
 * Helpers for the tests that read the static export in out/. They skip,
 * rather than fail, without a fresh `npm run build`, so a plain `npm test`
 * stays usable.
 */

export const ROOT = path.join(import.meta.dirname, '..');
export const OUT = path.join(ROOT, 'out');
export const DATA = path.join(ROOT, 'public', 'projects.json');

const filesUnder = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });

// The export is stale if anything that shapes a page changed after it: the
// data, any lib module, any component, or any page.
const SOURCES = [
  DATA,
  ...fs.readdirSync(path.join(ROOT, 'lib')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'lib', f)),
  ...filesUnder(path.join(ROOT, 'components')),
  ...filesUnder(path.join(ROOT, 'pages')),
];
const newestSource = SOURCES.reduce(
  (newest, file) => {
    const mtimeMs = fs.statSync(file).mtimeMs;
    return mtimeMs > newest.mtimeMs ? { file, mtimeMs } : newest;
  },
  { file: null, mtimeMs: 0 },
);

export function skipUnlessBuilt(file) {
  const full = path.join(OUT, file);
  if (!fs.existsSync(full)) return `no ${file} in out/; run npm run build first`;
  if (fs.statSync(full).mtimeMs < newestSource.mtimeMs) {
    return `out/${file} is older than ${path.relative(ROOT, newestSource.file)}; rebuild`;
  }
  return false;
}

export const readExport = file => fs.readFileSync(path.join(OUT, file), 'utf8');

/** The rendered page, without Next's data blob (which repeats the props). */
export function exportBody(file) {
  const html = readExport(file);
  const end = html.indexOf('__NEXT_DATA__');
  return end >= 0 ? html.slice(0, end) : html;
}

/** How React escapes text and attribute values in server-rendered HTML. */
export const escapeHtml = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
