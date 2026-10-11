import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DATA, escapeHtml, exportBody, skipUnlessBuilt } from './exportTestUtils.mjs';
import { deepDiveSections, MAX_STACK_CHIPS } from './deepDive.js';

/**
 * Every deep dive in the static export: its sections in the spec's order
 * (absent ones skipped), and the promises each section makes to a reader.
 */

const projects = JSON.parse(fs.readFileSync(DATA, 'utf8')).filter(p => p.slug);
const count = (html, needle) => html.split(needle).length - 1;
const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** The HTML of one section, from its marker to the next one. */
function sectionHtml(body, id) {
  const start = body.indexOf(`data-section="${id}"`);
  if (start < 0) return null;
  const next = body.indexOf('data-section="', start + 1);
  return body.slice(start, next > 0 ? next : undefined);
}

for (const p of projects) {
  const file = path.join('projects', p.slug, 'index.html');
  const skip = skipUnlessBuilt(file);

  test(`${p.slug}: sections in the spec's order, absent ones skipped`, { skip }, () => {
    const order = [...exportBody(file).matchAll(/data-section="([a-z]+)"/g)].map(m => m[1]);
    assert.deepEqual(order, deepDiveSections(p));
  });

  test(`${p.slug}: at most ${MAX_STACK_CHIPS} stack chips, and one strip entry per metric`, { skip }, () => {
    const body = exportBody(file);
    assert.equal(count(body, 'data-stack-chip'), Math.min(MAX_STACK_CHIPS, (p.stack ?? []).length));
    assert.equal(count(body, 'data-metric='), (p.metrics ?? []).length);
  });

  test(`${p.slug}: no empty lists`, { skip }, () => {
    assert.ok(!/<ul[^>]*>\s*<\/ul>/.test(exportBody(file)), 'an empty <ul> renders as a box of air');
  });

  test(`${p.slug}: credits follow the period, in the masthead`, { skip }, () => {
    const masthead = sectionHtml(exportBody(file), 'masthead');
    if (!p.credits) return assert.ok(!masthead.includes('data-credits'));
    const period = masthead.indexOf(escapeHtml(p.period));
    const credits = masthead.indexOf(escapeHtml(p.credits));
    assert.ok(period >= 0 && credits > period, `period at ${period}, credits at ${credits}`);
  });

  test(`${p.slug}: every source link says which number it backs`, { skip }, () => {
    const names = [...exportBody(file).matchAll(/<a [^>]*data-source=""[^>]*>([\s\S]*?)<\/a>/g)].map(m => stripTags(m[1]));
    const linked = (p.metrics ?? []).filter(m => m.source?.href);
    assert.equal(names.length, linked.length + (p.leadFigure?.source?.href ? 1 : 0), names.join(' | '));
    assert.equal(new Set(names).size, names.length, `two source links share a name: ${names.join(' | ')}`);
    // By position: the strip's links come first, in metric order, then the
    // figure's. Matching any name would let "6" pass on "2026-10-10".
    linked.forEach((m, i) => {
      assert.ok(names[i].includes(`the source for ${escapeHtml(m.value)} `), `link ${i} ("${names[i]}") does not name "${m.value}"`);
    });
    if (p.leadFigure?.source?.href) assert.ok(names.at(-1).includes('the source for the figure: '), names.at(-1));
  });

  test(`${p.slug}: the figure slot loads eagerly and describes itself`, { skip }, () => {
    const figure = sectionHtml(exportBody(file), 'figure');
    if (!deepDiveSections(p).includes('figure')) return assert.equal(figure, null);
    if (p.leadFigure?.src) {
      assert.match(figure, /<img [^>]*loading="eager"/, 'the lead figure is in the first screen; lazy-loading it delays it');
      assert.ok(figure.includes(`alt="${escapeHtml(p.leadFigure.alt)}"`), 'alt text missing');
      // React writes the attribute as srcSet; HTML attribute names are case-insensitive.
      assert.match(figure, /<img [^>]*srcset="[^"]+"/i, 'no responsive sources');
    } else if (p.leadFigure?.chart) {
      assert.ok(figure.includes('role="img"'));
      assert.ok(figure.includes(`aria-label="${escapeHtml(p.leadFigure.alt)}"`), 'chart has no accessible name');
    } else {
      assert.ok(figure.includes('data-cover-fallback'), 'no lead figure, so the cover should fill the slot');
      assert.ok(!figure.includes('font-hand'), "the fallback cover has no caption: its number belongs to the metrics");
    }
  });

  test(`${p.slug}: the proof cards, results list and gallery are gone`, { skip }, () => {
    const body = exportBody(file);
    for (const heading of ['>results<', '>screenshots<']) assert.ok(!body.includes(heading), `still renders ${heading}`);
  });
}
