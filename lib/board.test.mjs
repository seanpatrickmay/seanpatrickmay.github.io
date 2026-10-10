import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_CLUSTERS, boardClusters, threadPairs, validateBoard } from './board.js';

const card = (slug, cluster, size, order, extra = {}) => ({
  slug,
  title: slug,
  board: { cluster, size, order, ...(size === 'small' ? { line: `${slug} line` } : {}) },
  ...extra,
});

function validBoard() {
  return [
    card('a', 'run', 'big', 1),
    card('b', 'run', 'big', 2),
    card('c', 'run', 'small', 3),
    card('d', 'think', 'big', 1),
    card('e', 'think', 'big', 2, { threadTo: ['f'] }),
    card('f', 'think', 'small', 3),
    { slug: 'off', title: 'not on the board' },
  ];
}

const errorsFor = projects => validateBoard(projects).join('\n');

test('a well-formed board has no errors', () => {
  assert.deepEqual(validateBoard(validBoard()), []);
});

test('the clusters are "things that run" then "things that think"', () => {
  assert.deepEqual(BOARD_CLUSTERS, [
    { id: 'run', label: 'things that run' },
    { id: 'think', label: 'things that think' },
  ]);
});

test('boardClusters groups by cluster in rank order and leaves off-board projects out', () => {
  const [run, think] = boardClusters([...validBoard()].reverse());
  assert.equal(run.id, 'run');
  assert.equal(think.id, 'think');
  assert.deepEqual(run.big.map(p => p.slug), ['a', 'b']);
  assert.deepEqual(run.small.map(p => p.slug), ['c']);
  assert.deepEqual(think.big.map(p => p.slug), ['d', 'e']);
  assert.deepEqual(think.small.map(p => p.slug), ['f']);
});

test('a cluster without exactly two big cards is rejected', () => {
  const projects = validBoard().filter(p => p.slug !== 'b');
  assert.match(errorsFor(projects), /cluster "run": expected 2 big cards, found 1/);
});

test('two cards with the same order in one cluster are rejected', () => {
  const projects = validBoard().map(p => (p.slug === 'c' ? card('c', 'run', 'small', 2) : p));
  assert.match(errorsFor(projects), /cluster "run": duplicate order values/);
});

test('a big card ranked behind a small one is rejected', () => {
  const projects = validBoard().map(p => (p.slug === 'c' ? card('c', 'run', 'small', 0) : p));
  assert.match(errorsFor(projects), /cluster "run": big cards must rank ahead of small ones/);
});

test('unknown clusters and sizes are rejected', () => {
  const projects = [...validBoard(), card('x', 'dream', 'huge', 9)];
  const errors = errorsFor(projects);
  assert.match(errors, /x: unknown cluster "dream"/);
  assert.match(errors, /x: unknown size "huge"/);
});

test('a small card needs its one line', () => {
  const projects = validBoard().map(p => (p.slug === 'c' ? { ...p, board: { cluster: 'run', size: 'small', order: 3 } } : p));
  assert.match(errorsFor(projects), /c: small cards need board.line/);
});

test('linked artifacts need href and label, tags never link, polaroids need an image', () => {
  const projects = validBoard().map(p =>
    p.slug === 'a'
      ? {
          ...p,
          artifacts: [
            { kind: 'sticky', text: 'a claim' },
            { kind: 'tag', text: 'Somewhere', href: 'https://example.com' },
            { kind: 'polaroid', text: 'live', href: 'https://example.com', label: 'demo' },
            { kind: 'banner', text: 'nope' },
            { kind: 'paper', text: '  ', href: '/x.pdf', label: 'paper' },
          ],
        }
      : p,
  );
  const errors = errorsFor(projects);
  assert.match(errors, /a artifacts\[0\]: a sticky needs href and label/);
  assert.match(errors, /a artifacts\[1\]: a tag is not a link/);
  assert.match(errors, /a artifacts\[2\]: a polaroid needs an image/);
  assert.match(errors, /a artifacts\[3\]: unknown kind "banner"/);
  assert.match(errors, /a artifacts\[4\]: needs text/);
});

test('thread targets must exist, be on the board, and not be the card itself', () => {
  const projects = validBoard().map(p => (p.slug === 'a' ? { ...p, threadTo: ['a', 'ghost', 'off'] } : p));
  const errors = errorsFor(projects);
  assert.match(errors, /a: thread to itself/);
  assert.match(errors, /a: thread to unknown project "ghost"/);
  assert.match(errors, /a: thread to "off", which is not on the board/);
});

test('threadPairs keeps only pairs whose two ends are on the board', () => {
  const projects = validBoard().map(p => (p.slug === 'a' ? { ...p, threadTo: ['off', 'd'] } : p));
  assert.deepEqual(threadPairs(projects), [['a', 'd'], ['e', 'f']]);
});
