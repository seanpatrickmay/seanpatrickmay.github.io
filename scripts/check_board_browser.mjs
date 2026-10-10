/**
 * Browser checks for the project board: what the static-export tests cannot
 * see. Run against a served export:
 *
 *   npm run build
 *   python3 -m http.server 4321 --directory out &
 *   node scripts/check_board_browser.mjs http://localhost:4321 /projects/ /
 *
 * Exits non-zero on the first failure. Checks: overflow (390px), thread
 * (follows pins after a resize), keyboard (Tab walks cards in rank order with
 * a visible ring), contrast (artifact text in dark mode), motion (no tilts
 * under prefers-reduced-motion).
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { boardClusters } from '../lib/board.js';

const [base = 'http://localhost:4321', ...pages] = process.argv.slice(2);
const paths = pages.length ? pages : ['/projects/'];
const projects = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'public', 'projects.json'), 'utf8'));
const ranked = boardClusters(projects).flatMap(c => [...c.big, ...c.small]).map(p => p.slug);

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
};

const browser = await chromium.launch();

for (const p of paths) {
  const url = new URL(p, base).href;

  // overflow: hanging artifacts must not widen the page on a phone.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    check(scroll <= client, `${p} overflow: no horizontal scroll at 390px (${scroll} <= ${client})`);
    await page.close();
  }

  // thread: endpoints sit on the pins, before and after a resize.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    for (const width of [1440, 1100]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(300);
      const drift = await page.evaluate(() => {
        const board = document.querySelector('[data-board]');
        const box = board.getBoundingClientRect();
        return [...document.querySelectorAll('[data-thread-line]')].map(line => {
          const [from, to] = line.dataset.threadLine.split('->');
          const pin = slug => {
            const r = document.querySelector(`[data-board-slug="${slug}"]`).getBoundingClientRect();
            return { x: r.left - box.left + r.width / 2, y: r.top - box.top + 2 };
          };
          const a = pin(from);
          const b = pin(to);
          return Math.max(
            Math.abs(a.x - line.x1.baseVal.value), Math.abs(a.y - line.y1.baseVal.value),
            Math.abs(b.x - line.x2.baseVal.value), Math.abs(b.y - line.y2.baseVal.value),
          );
        });
      });
      check(drift.length > 0, `${p} thread: at least one line at ${width}px`);
      check(drift.every(d => d <= 4), `${p} thread: ends within 4px of the pins at ${width}px (${drift.map(d => d.toFixed(1)).join(', ')})`);
    }
    await page.close();
  }

  // keyboard: Tab walks the cards in rank order, and a focused card shows a ring.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    // Arrive by keyboard: :focus-visible is not guaranteed for focus set from code.
    await page.focus(`[data-board-slug="${ranked[0]}"] a`);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow);
    check(ring && ring !== 'none', `${p} keyboard: focused card shows a ring`);
    const seen = [];
    for (let i = 0; i < 40 && seen.length < ranked.length; i += 1) {
      const href = await page.evaluate(() => document.activeElement?.getAttribute('href') ?? '');
      const m = href.match(/^\/projects\/([a-z0-9-]+)\/$/);
      if (m && !seen.includes(m[1])) seen.push(m[1]);
      await page.keyboard.press('Tab');
    }
    check(JSON.stringify(seen) === JSON.stringify(ranked), `${p} keyboard: Tab order ${seen.join(' > ')}`);
    await page.close();
  }

  // contrast: artifact text stays legible in dark mode.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
    await page.goto(url, { waitUntil: 'networkidle' });
    const ratios = await page.evaluate(() => {
      const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const c = [r, g, b].map(v => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      };
      const bgOf = el => {
        for (let n = el; n; n = n.parentElement) {
          const c = rgb(getComputedStyle(n).backgroundColor);
          if (c.length >= 3 && (c.length < 4 || c[3] > 0.5)) return c;
        }
        return [255, 255, 255];
      };
      return [...document.querySelectorAll('[data-artifact]')].map(el => {
        const textEl = el.querySelector('span:not([aria-hidden]):not(.sr-only)') || el;
        const fg = lum(rgb(getComputedStyle(textEl).color));
        const bg = lum(bgOf(textEl));
        return { kind: el.dataset.artifact, ratio: (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) };
      });
    });
    for (const { kind, ratio } of ratios) check(ratio >= 4.5, `${p} contrast: ${kind} text ${ratio.toFixed(2)}:1 in dark mode`);
    await page.close();
  }

  // motion: no tilts under prefers-reduced-motion.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'networkidle' });
    const tilted = await page.evaluate(() =>
      [...document.querySelectorAll('[data-board] .pin-card, [data-artifact]')]
        .filter(el => {
          const t = getComputedStyle(el).transform;
          return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)';
        })
        .map(el => el.dataset.artifact || el.parentElement?.dataset.boardSlug || el.className),
    );
    check(tilted.length === 0, `${p} motion: nothing tilted under reduced motion (${tilted.join(', ') || 'none'})`);
    await page.close();
  }
}

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
