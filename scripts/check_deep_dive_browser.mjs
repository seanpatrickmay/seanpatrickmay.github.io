/**
 * Browser checks for the deep dives: what the static-export tests cannot
 * see. Run against a served export, with the server in the same command:
 *
 *   npm run build
 *   (python3 -m http.server 4321 --directory out >/dev/null 2>&1 & S=$!; sleep 1; \
 *    node scripts/check_deep_dive_browser.mjs http://localhost:4321; R=$?; kill $S; exit $R)
 *
 * Optional: slugs to check (default: every project with a slug), and
 * --shots=DIR to also save 1440 and 390 screenshots in light and dark.
 *
 * Checks, on every deep dive:
 * - overflow: no horizontal scroll at 320 and 390px
 * - first screen: the figure slot shows at least 200px at 1440x900 and 120px
 *   at 390x844, before any scrolling
 * - alt: a real lead figure has an alt (or a chart's aria-label) of at least
 *   six words
 * - contrast: every visible text node clears 4.5:1 (3:1 when large), and
 *   every chart bar 3:1, in light and in dark
 * - motion: nothing on the page is rotated under prefers-reduced-motion
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { MIN_ALT_WORDS } from '../lib/deepDive.js';

const args = process.argv.slice(2);
const shots = args.find(a => a.startsWith('--shots='))?.slice('--shots='.length) ?? null;
const [base = 'http://localhost:4321', ...only] = args.filter(a => !a.startsWith('--'));
const projects = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'public', 'projects.json'), 'utf8'));
const slugs = only.length ? only : projects.filter(p => p.slug).map(p => p.slug);

// The worst case behind text with no opaque ancestor. On the kraft board:
// its darkest gradient stop in light, its lightest in dark. Off the board
// (the back link): the page gradient's darkest stop in light (slate-50), its
// lightest in dark (slate-900).
const BACKDROP = {
  light: { board: [237, 232, 219], page: [248, 250, 252] },
  dark: { board: [28, 25, 23], page: [15, 23, 42] },
};
const FIRST_SCREEN = [
  { width: 1440, height: 900, min: 200 },
  { width: 390, height: 844, min: 120 },
];

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
};

const browser = await chromium.launch();

async function open(url, options) {
  const page = await browser.newPage(options);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

if (shots) fs.mkdirSync(shots, { recursive: true });

for (const slug of slugs) {
  const url = new URL(`/projects/${slug}/`, base).href;

  // overflow: long titles, source labels and chart ticks must wrap, not scroll.
  for (const width of [320, 390]) {
    const page = await open(url, { viewport: { width, height: 844 } });
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(scroll <= client, `${slug} overflow: no horizontal scroll at ${width}px (${scroll} <= ${client})`);
    await page.close();
  }

  // first screen, and alt: the figure slot is visible before any scrolling.
  for (const { width, height, min } of FIRST_SCREEN) {
    const page = await open(url, { viewport: { width, height } });
    const found = await page.evaluate(() => {
      const slot = document.querySelector('[data-section="figure"]');
      if (!slot) return null;
      const media = slot.querySelector('[data-lead-figure] img, [data-lead-figure] [role="img"]');
      return {
        top: slot.getBoundingClientRect().top,
        description: media ? media.getAttribute('alt') ?? media.getAttribute('aria-label') ?? '' : null,
      };
    });
    if (!found) {
      console.log(`--   ${slug}: no figure slot (no lead figure and no cover)`);
    } else {
      const visible = height - found.top;
      check(visible >= min, `${slug} first screen: ${visible.toFixed(0)}px of the figure visible at ${width}x${height} (needs ${min})`);
      if (found.description !== null && width === 1440) {
        const words = found.description.trim().split(/\s+/).filter(Boolean).length;
        check(words >= MIN_ALT_WORDS, `${slug} alt: lead figure described in ${words} words`);
      }
    }
    await page.close();
  }

  // contrast: every visible text node, and every chart bar, in both themes.
  for (const scheme of ['light', 'dark']) {
    const page = await open(url, { viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    const { dark, low } = await page.evaluate(backdrop => {
      const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const c = [r, g, b].map(v => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      const ratio = (a, b) => {
        const [hi, lo] = [lum(a), lum(b)].sort((m, n) => n - m);
        return (hi + 0.05) / (lo + 0.05);
      };
      const bgOf = el => {
        for (let n = el; n; n = n.parentElement) {
          if (n.hasAttribute('data-pinboard')) return backdrop.board;
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c.length < 4 || c[3] > 0.5)) return c.slice(0, 3);
        }
        return backdrop.page;
      };
      const low = [];
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const el = t.parentElement;
        if (!t.textContent.trim() || el.closest('[aria-hidden="true"], .sr-only')) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        // WCAG large text: 24px, or 18.66px bold.
        const min = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5;
        const r = ratio(rgb(style.color).slice(0, 3), bgOf(el));
        if (r < min) low.push(`"${t.textContent.trim().slice(0, 32)}" ${r.toFixed(2)}:1 (needs ${min})`);
      }
      for (const bar of document.querySelectorAll('[data-bar]')) {
        const r = ratio(rgb(getComputedStyle(bar).backgroundColor).slice(0, 3), bgOf(bar.parentElement));
        if (r < 3) low.push(`chart bar ${r.toFixed(2)}:1 (needs 3)`);
      }
      return { dark: document.documentElement.classList.contains('dark'), low };
    }, BACKDROP[scheme]);
    check(dark === (scheme === 'dark'), `${slug} contrast: page is in ${scheme} mode`);
    check(low.length === 0, `${slug} contrast in ${scheme}: ${low.join('; ') || 'all text clears'}`);
    await page.close();
  }

  // motion: no rotation or skew anywhere on the page under reduced motion.
  {
    const page = await open(url, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const rotated = await page.evaluate(() =>
      [...document.querySelectorAll('main *')]
        .filter(el => {
          const t = getComputedStyle(el).transform;
          if (t === 'none') return false;
          const m = t.match(/^matrix\(([^)]+)\)$/);
          if (!m) return true;
          const [, b, c] = m[1].split(',').map(Number);
          return Math.abs(b) > 1e-6 || Math.abs(c) > 1e-6;
        })
        .map(el => String(el.className?.baseVal ?? el.className).slice(0, 40)),
    );
    check(rotated.length === 0, `${slug} motion: nothing rotated under reduced motion (${rotated.join(', ') || 'none'})`);
    await page.close();
  }

  if (shots) {
    for (const { width, height } of FIRST_SCREEN) {
      for (const scheme of ['light', 'dark']) {
        const page = await open(url, { viewport: { width, height }, colorScheme: scheme });
        await page.screenshot({ path: path.join(shots, `${slug}-${width}-${scheme}.png`), fullPage: true });
        await page.close();
      }
    }
  }
}

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
