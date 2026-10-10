import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TIMELINE } from './timeline.js';

const ROOT = path.join(import.meta.dirname, '..');
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));
const onBoard = new Set(projects.filter(p => p.board).map(p => p.slug));

test('every job that links to its work points at a project on the board', () => {
  for (const entry of TIMELINE.filter(e => e.href)) {
    const m = entry.href.match(/^\/projects\/([a-z0-9-]+)\/$/);
    assert.ok(m, `${entry.org}: href must look like /projects/<slug>/, got ${entry.href}`);
    assert.ok(onBoard.has(m[1]), `${entry.org}: "${m[1]}" is not on the board`);
  }
});

test('the two jobs with a project on the board link to it', () => {
  const hrefOf = org => TIMELINE.find(e => e.org === org)?.href;
  assert.equal(hrefOf('NU Systematic Alpha'), '/projects/alternative-data-pipeline/');
  assert.equal(hrefOf('NExT Consulting'), '/projects/ai-chief-of-staff/');
});
