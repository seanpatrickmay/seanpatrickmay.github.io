import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_CLUSTERS, assertValidBoard, boardClusters, boardProps, threadPairs, validateBoard } from './board.js';

const card = (slug, cluster, size, order, extra = {}) => ({
  slug,
  title: slug,
  board: { cluster, size, order, ...(size === 'small' ? { line: `${slug} line` } : {}) },
  ...(size === 'big' ? { coverArt: { motif: 'graph', line: `${slug} caption` } } : {}),
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

test('a thread may not cross from one cluster to the other', () => {
  const projects = validBoard().map(p => (p.slug === 'a' ? { ...p, threadTo: ['b', 'd'] } : p));
  const errors = validateBoard(projects);
  assert.ok(errors.includes('a: thread to "d" crosses clusters'), errors.join('\n'));
  assert.ok(!errors.some(e => e.includes('"b"')), 'a thread inside its own cluster is fine');
});

test('a thread to a missing or off-board project is not also reported as crossing clusters', () => {
  const projects = validBoard().map(p => (p.slug === 'a' ? { ...p, threadTo: ['ghost', 'off'] } : p));
  assert.doesNotMatch(errorsFor(projects), /crosses clusters/);
});

test('a typo in a cluster is one error, not also a crossing for threads to that card', () => {
  const projects = validBoard().map(p => {
    if (p.slug === 'a') return { ...p, threadTo: ['b'] };
    if (p.slug === 'b') return { ...p, board: { ...p.board, cluster: 'rnu' } };
    return p;
  });
  const errors = errorsFor(projects);
  assert.match(errors, /b: unknown cluster "rnu"/);
  assert.doesNotMatch(errors, /crosses clusters/);
});

test('a big card needs a cover: a coverArt motif or a coverImage', () => {
  const bare = ({ coverArt, ...rest }) => rest;
  const projects = validBoard().map(p => {
    if (p.slug === 'a') return bare(p);
    if (p.slug === 'b') return { ...bare(p), coverArt: { line: 'a caption, no motif' } };
    if (p.slug === 'd') return { ...bare(p), coverImage: { src: '/images/d.webp' } };
    return p;
  });
  const errors = validateBoard(projects);
  assert.ok(errors.includes('a: big cards need coverArt with a known motif or a coverImage'), errors.join('\n'));
  assert.ok(errors.includes('b: big cards need coverArt with a known motif or a coverImage'), errors.join('\n'));
  assert.ok(!errors.some(e => e.startsWith('d:')), 'a coverImage is a cover');
  assert.doesNotMatch(errorsFor(validBoard().map(p => (p.slug === 'c' ? bare(p) : p))), /c: big cards/);
});

const BOARD_KEYS = [
  'slug', 'title', 'emoji', 'period', 'board', 'artifacts', 'threadTo',
  'coverArt', 'coverImage', 'showcaseTech', 'stack', 'languages',
];

test('boardProps keeps only on-board projects, in input order', () => {
  const projects = [...validBoard()].reverse();
  assert.deepEqual(boardProps(projects).map(p => p.slug), ['f', 'e', 'd', 'c', 'b', 'a']);
});

test('boardProps keeps exactly the fields the board renders, and no undefined values', () => {
  const full = {
    ...card('a', 'run', 'big', 1),
    emoji: 'x',
    period: '2026',
    artifacts: [{ kind: 'tag', text: 'Somewhere' }],
    threadTo: ['b'],
    coverImage: { src: '/a.webp' },
    showcaseTech: 'Rust',
    stack: ['Rust'],
    languages: ['Rust'],
    overview: 'deep-dive only',
    bullets: ['deep-dive only'],
    links: [{ kind: 'repo', href: 'https://example.com' }],
    linksNote: 'deep-dive only',
    gallery: [],
  };
  const [out] = boardProps([full]);
  assert.deepEqual(Object.keys(out).sort(), [...BOARD_KEYS].sort());
  assert.deepEqual(out.board, full.board);

  const sparse = boardProps([{ ...card('b', 'run', 'small', 2), emoji: undefined }])[0];
  assert.deepEqual(Object.keys(sparse).sort(), ['board', 'slug', 'title']);
  for (const p of boardProps(validBoard())) {
    for (const [key, value] of Object.entries(p)) {
      assert.ok(BOARD_KEYS.includes(key), `${p.slug}: unexpected key ${key}`);
      assert.notEqual(value, undefined, `${p.slug}.${key} is undefined`);
    }
  }
});

test('assertValidBoard throws with every error in the message on a broken board', () => {
  const projects = validBoard().map(p => (p.slug === 'c' ? card('c', 'thnk', 'small', 3) : p));
  assert.throws(
    () => assertValidBoard(projects),
    err => {
      assert.ok(err.message.startsWith('projects.json board is invalid:\n'), err.message);
      for (const e of validateBoard(projects)) assert.ok(err.message.includes(e), `missing "${e}"`);
      assert.match(err.message, /c: unknown cluster "thnk"/);
      return true;
    },
  );
  assert.throws(() => assertValidBoard([]), /expected 2 big cards, found 0/);
});

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'projects.json'), 'utf8'));

test('projects.json passes every board rule', () => {
  assert.deepEqual(validateBoard(real), []);
  assert.doesNotThrow(() => assertValidBoard(real));
});

test('every local artifact link and image points at a file that exists', () => {
  for (const p of real) {
    for (const a of p.artifacts ?? []) {
      for (const ref of [a.href, a.image].filter(r => typeof r === 'string' && r.startsWith('/'))) {
        assert.ok(fs.existsSync(path.join(ROOT, 'public', ref)), `${p.slug}: missing ${ref}`);
      }
    }
  }
});

test("RepoWiki's sticky counts the other wikied projects on the board", () => {
  // The number is a claim on the board, so it has to match the board.
  const wikied = real.filter(p => p.board && p.slug !== 'repowiki' && (p.links ?? []).some(l => l.kind === 'wiki'));
  const sticky = real.find(p => p.slug === 'repowiki')?.artifacts?.find(a => a.kind === 'sticky');
  assert.ok(sticky, 'RepoWiki has no sticky');
  assert.equal(sticky.text, `wrote the wikis for ${wikied.length} of these`);
});

test('nothing still reads the retired ranking fields', () => {
  for (const p of real) {
    assert.equal(p.caseStudyRank, undefined, `${p.slug} still has caseStudyRank`);
    assert.equal(p.coolness, undefined, `${p.slug} still has coolness`);
  }
});

test('projects that leave the board keep a slug, so their pages still build', () => {
  for (const slug of ['human-digit-classification', 'hex-reversi', 'linux-shell-c', 'seanpatrickmay-github-io', 'rototext']) {
    const p = real.find(x => x.slug === slug);
    assert.ok(p, `${slug} is gone from projects.json`);
    assert.equal(p.board, undefined, `${slug} should not be on the board`);
  }
});
