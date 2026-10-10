import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateDeepDives } from './deepDive.js';

/**
 * The deep-dive rules and content, against the real projects.json. The
 * fixture tests in deepDive.test.mjs say what the rules are; these say the
 * data meets them, and pin the content this milestone migrated.
 */

const ROOT = path.join(import.meta.dirname, '..');
const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));
const localFile = href => path.join(ROOT, 'public', decodeURI(href.split('#')[0]));

test('projects.json passes every deep-dive rule', () => {
  assert.deepEqual(validateDeepDives(real), []);
});

test('the five lead figures this milestone ships are in place, and only those', () => {
  const withFigure = real.filter(p => p.leadFigure).map(p => p.slug).sort();
  assert.deepEqual(withFigure, ['alphasettler', 'lecteuraide', 'life-dashboard', 'repowiki', 'wildfire-modeling']);
  assert.ok(real.find(p => p.slug === 'alphasettler').leadFigure.chart, "AlphaSettler's figure is the chart");
});

test('every local lead-figure image and source points at a file that exists', () => {
  for (const p of real.filter(x => x.leadFigure)) {
    const { src, source } = p.leadFigure;
    for (const ref of [src, source?.href].filter(r => typeof r === 'string' && r.startsWith('/'))) {
      assert.ok(fs.existsSync(localFile(ref)), `${p.slug}: missing ${ref}`);
    }
  }
});

test('lead-figure captions are lowercase, like the rest of the handwriting', () => {
  for (const p of real.filter(x => x.leadFigure)) {
    const first = p.leadFigure.caption[0];
    assert.equal(first, first.toLowerCase(), `${p.slug}: "${p.leadFigure.caption}"`);
  }
});
