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
 * - overflow: at 320 and 390px, no horizontal scroll; nothing under <main>
 *   pokes past the viewport; no element that clips (overflow-x hidden or
 *   clip, the board among them) holds content wider than itself; and no
 *   text runs wider than the element it sits in. The board is
 *   overflow-hidden, so content too wide for it is clipped rather than
 *   scrolled, and the document width alone cannot see it. Intentional
 *   scrollers (overflow-x auto/scroll) and .sr-only are exempt. A box merely
 *   wider than its parent is not a failure while it stays on screen and
 *   unclipped: tilted cards, tape ends and chart values sit in the padding
 *   by design.
 * - figure: the slot is there exactly when the data says (figureKind), with
 *   its media (the lead figure's img or chart, or the cover's img or svg)
 * - first screen: the media itself shows at least 200px at 1440x900 and
 *   120px at 390x844, before any scrolling. A cover fallback shorter than
 *   that (a 3:1 strip is 86px tall on a phone) must show whole.
 * - alt: a lead figure has an alt (or a chart's aria-label) of at least six
 *   words
 * - contrast: every visible text node clears 4.5:1 (3:1 when large), and
 *   every chart bar 3:1, in light and in dark. A colour's alpha and its
 *   ancestors' opacity are blended over the resolved background. At least
 *   one text node, and every bar the chart data has, must be measured.
 * - motion: nothing on the page is rotated under prefers-reduced-motion
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { MIN_ALT_WORDS, figureKind } from '../lib/deepDive.js';

const args = process.argv.slice(2);
const shots = args.find(a => a.startsWith('--shots='))?.slice('--shots='.length) ?? null;
const [base = 'http://localhost:4321', ...only] = args.filter(a => !a.startsWith('--'));
const projects = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'public', 'projects.json'), 'utf8'));
const slugs = only.length ? only : projects.filter(p => p.slug).map(p => p.slug);
const bySlug = new Map(projects.filter(p => p.slug).map(p => [p.slug, p]));

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
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  // A 404 has no deep dive to check: stop rather than pass it by default.
  if (!response?.ok()) throw new Error(`${url} answered ${response?.status() ?? 'nothing'}; is the export served?`);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

if (shots) fs.mkdirSync(shots, { recursive: true });

for (const slug of slugs) {
  const url = new URL(`/projects/${slug}/`, base).href;
  const project = bySlug.get(slug);
  if (!project) {
    check(false, `${slug}: no project with this slug in public/projects.json`);
    continue;
  }
  const kind = figureKind(project);
  const expectedBars = project.leadFigure?.chart?.bars?.length ?? 0;

  // overflow: long titles, source labels and chart ticks must wrap, not
  // scroll and not be clipped by the board.
  for (const width of [320, 390]) {
    const page = await open(url, { viewport: { width, height: 844 } });
    const { scroll, client, wide } = await page.evaluate(() => {
      const client = document.documentElement.clientWidth;
      const scrolls = el => /^(auto|scroll)$/.test(getComputedStyle(el).overflowX);
      const name = el => {
        const marker = ['data-section', 'data-pinboard', 'data-lead-figure', 'data-chart', 'data-metric']
          .find(a => el.hasAttribute(a));
        const tag = marker ? `${el.tagName.toLowerCase()}[${marker}${el.getAttribute(marker) ? `=${el.getAttribute(marker)}` : ''}]` : el.tagName.toLowerCase();
        return `${tag} "${(el.textContent || '').trim().slice(0, 24)}"`;
      };
      const wide = [];
      const main = document.querySelector('main');
      for (const el of [main, ...main.querySelectorAll('*')]) {
        if (el.closest('.sr-only')) continue;
        // Inside an intentional scroller, wide content is the point.
        let scroller = false;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          if (scrolls(n)) { scroller = true; break; }
        }
        if (scroller) continue;
        const box = el.getBoundingClientRect();
        if (box.width > 0 && (box.right > client + 0.5 || box.left < -0.5)) {
          wide.push(`${name(el)} spans ${box.left.toFixed(0)} to ${box.right.toFixed(0)}`);
        }
        if (el.clientWidth === 0 || el.scrollWidth <= el.clientWidth) continue;
        const clips = /^(hidden|clip)$/.test(getComputedStyle(el).overflowX);
        const text = [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (clips) wide.push(`${name(el)} clips ${el.scrollWidth}px of content to ${el.clientWidth}px`);
        else if (text && !scrolls(el)) wide.push(`${name(el)} has text ${el.scrollWidth}px wide in a ${el.clientWidth}px box`);
      }
      return { scroll: document.documentElement.scrollWidth, client, wide };
    });
    check(scroll <= client, `${slug} overflow: no horizontal scroll at ${width}px (${scroll} <= ${client})`);
    check(wide.length === 0, `${slug} overflow: nothing wider than its box or the viewport at ${width}px (${wide.slice(0, 4).join('; ') || 'none'}${wide.length > 4 ? `; and ${wide.length - 4} more` : ''})`);
    await page.close();
  }

  // figure, first screen and alt: the slot is there exactly when the data
  // says, and its media, not just the slot, is visible before any scrolling.
  for (const { width, height, min } of FIRST_SCREEN) {
    const page = await open(url, { viewport: { width, height } });
    const found = await page.evaluate(() => {
      const slot = document.querySelector('[data-section="figure"]');
      if (!slot) return null;
      const media = slot.querySelector(
        '[data-lead-figure] img, [data-lead-figure] [role="img"], [data-cover-fallback] img, [data-cover-fallback] svg',
      );
      if (!media) return { lead: !!slot.querySelector('[data-lead-figure]'), media: null };
      const r = media.getBoundingClientRect();
      return {
        lead: !!slot.querySelector('[data-lead-figure]'),
        media: {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          shown: media.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
          description: media.getAttribute('alt') ?? media.getAttribute('aria-label') ?? '',
        },
      };
    });
    const at = `at ${width}x${height}`;
    if (kind === null) {
      check(found === null, `${slug} figure: no slot ${at}, as the data has no lead figure and no cover`);
    } else if (found === null) {
      check(false, `${slug} figure: the data has a ${kind} figure, but there is no figure slot ${at}`);
    } else if (found.lead !== (kind === 'lead')) {
      check(false, `${slug} figure: the data has a ${kind} figure, but the slot renders ${found.lead ? 'a lead figure' : 'the cover fallback'} ${at}`);
    } else if (found.media === null) {
      check(false, `${slug} figure: the ${kind} slot has no img, chart or svg ${at}`);
    } else {
      const { top, bottom, height: tall, shown, description } = found.media;
      const visible = Math.min(bottom, height) - Math.max(top, 0);
      // A lead figure always owes the full amount. A cover strip shorter than
      // that owes all of itself (half a pixel of rounding aside).
      const needs = kind === 'lead' ? min : Math.min(min, tall - 0.5);
      check(
        shown && tall > 0 && visible >= needs,
        `${slug} first screen: ${Math.max(visible, 0).toFixed(0)}px of the ${kind} figure's media visible ${at} (needs ${Math.ceil(needs)}; height ${tall.toFixed(0)}${shown ? '' : ', hidden'})`,
      );
      if (kind === 'lead' && width === 1440) {
        const words = description.trim().split(/\s+/).filter(Boolean).length;
        check(words >= MIN_ALT_WORDS, `${slug} alt: lead figure described in ${words} words (needs ${MIN_ALT_WORDS})`);
      }
    }
    await page.close();
  }

  // contrast: every visible text node, and every chart bar, in both themes.
  for (const scheme of ['light', 'dark']) {
    const page = await open(url, { viewport: { width: 1440, height: 900 }, colorScheme: scheme });
    const { dark, low, texts, bars } = await page.evaluate(backdrop => {
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
      // The background behind el, and the element that paints it (null for
      // the page backdrop).
      const bgOf = el => {
        for (let n = el; n; n = n.parentElement) {
          if (n.hasAttribute('data-pinboard')) return { color: backdrop.board, at: n };
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c.length < 4 || c[3] > 0.5)) return { color: c.slice(0, 3), at: n };
        }
        return { color: backdrop.page, at: null };
      };
      // A colour as it lands on that background: its own alpha, times the
      // opacity of every element from el up to (not including) the one that
      // paints the background, since opacity above that fades both alike.
      const onBackground = (color, el, bg) => {
        let alpha = color.length >= 4 ? color[3] : 1;
        for (let n = el; n && n !== bg.at; n = n.parentElement) alpha *= Number(getComputedStyle(n).opacity);
        return color.slice(0, 3).map((v, i) => alpha * v + (1 - alpha) * bg.color[i]);
      };
      const low = [];
      let texts = 0;
      let bars = 0;
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
        const bg = bgOf(el);
        const r = ratio(onBackground(rgb(style.color), el, bg), bg.color);
        texts += 1;
        if (r < min) low.push(`"${t.textContent.trim().slice(0, 32)}" ${r.toFixed(2)}:1 (needs ${min})`);
      }
      for (const bar of document.querySelectorAll('[data-bar]')) {
        const bg = bgOf(bar.parentElement);
        const r = ratio(onBackground(rgb(getComputedStyle(bar).backgroundColor), bar, bg), bg.color);
        bars += 1;
        if (r < 3) low.push(`chart bar ${r.toFixed(2)}:1 (needs 3)`);
      }
      return { dark: document.documentElement.classList.contains('dark'), low, texts, bars };
    }, BACKDROP[scheme]);
    check(dark === (scheme === 'dark'), `${slug} contrast: page is in ${scheme} mode`);
    check(texts > 0 && bars === expectedBars, `${slug} contrast in ${scheme}: measured ${texts} text nodes and ${bars} of ${expectedBars} chart bars`);
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
