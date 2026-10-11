import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validateProjects } from './projects.js';

const base = { title: 'a', period: '2026', stack: [] };

test('a project validates without bullets', () => {
  assert.equal(validateProjects([base]), true);
});

test('title, period and stack are still required, and slug must be text', () => {
  assert.equal(validateProjects([{ ...base, title: undefined }]), false);
  assert.equal(validateProjects([{ ...base, period: 2026 }]), false);
  assert.equal(validateProjects([{ ...base, stack: 'Rust' }]), false);
  assert.equal(validateProjects([{ ...base, slug: 7 }]), false);
  assert.equal(validateProjects('nope'), false);
});

test('the real projects.json validates', () => {
  const real = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'public', 'projects.json'), 'utf8'));
  assert.equal(validateProjects(real), true);
});
