import test from 'node:test';
import assert from 'node:assert/strict';
import { sortProjectLinks } from './projectDisplay.js';

test('links sort live, writeup, paper, wiki, repo, then unknown kinds', () => {
  const links = ['repo', 'mystery', 'wiki', 'paper', 'live', 'writeup'].map(kind => ({ kind, label: kind }));
  assert.deepEqual(
    sortProjectLinks(links).map(l => l.kind),
    ['live', 'writeup', 'paper', 'wiki', 'repo', 'mystery'],
  );
});

test('links of the same kind sort by label', () => {
  const links = [
    { kind: 'repo', label: "Partner's Repo" },
    { kind: 'repo', label: 'Git Repo' },
  ];
  assert.deepEqual(sortProjectLinks(links).map(l => l.label), ['Git Repo', "Partner's Repo"]);
});
