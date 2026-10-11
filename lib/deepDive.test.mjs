import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEEP_DIVE_SECTIONS,
  assertValidDeepDives,
  deepDiveSections,
  figureKind,
  mentions,
  validateDeepDives,
} from './deepDive.js';

const SOURCE = { label: 'paper · Table 3', href: '/projects/demo/paper.pdf#page=15' };
const metric = (value, label = 'a label with no numbers') => ({ value, label, source: SOURCE });
const FIGURE = {
  src: '/projects/demo/figure.webp',
  width: 870,
  height: 460,
  alt: 'three panels of a fire map: previous hour, actual, predicted',
  caption: 'creek fire, hour 186',
  source: { label: 'paper, page 16', href: '/projects/demo/paper.pdf#page=17' },
};
const CHART = {
  kind: 'log-bars',
  unit: 'ns per step',
  domain: [10, 100000],
  bars: [{ label: 'a', value: 68.2 }, { label: 'b', value: 20691 }],
};

function validDive(extra = {}) {
  return {
    slug: 'demo',
    title: 'Demo',
    period: '2026',
    stack: ['Rust'],
    overview: 'a demo project with an overview and no numbers in it',
    whatIBuilt: ['the thing'],
    howItWorks: ['it works'],
    metrics: [metric('F1 0.929', 'on four held-out fires'), metric('700k', 'simulations a second')],
    findings: ['data beat architecture'],
    credits: 'with A & B',
    leadFigure: FIGURE,
    nextSteps: ['more'],
    ...extra,
  };
}

const errorsFor = p => validateDeepDives([p]).join('\n');

test('a well-formed deep dive has no errors', () => {
  assert.deepEqual(validateDeepDives([validDive()]), []);
});

test('projects without a slug have no deep dive, so they are not checked', () => {
  assert.deepEqual(validateDeepDives([{ title: 'x', metrics: [{}, {}, {}, {}] }]), []);
});

test('at most three metrics', () => {
  const p = validDive({ metrics: ['a1', 'b2', 'c3', 'd4'].map(v => metric(v)) });
  assert.match(errorsFor(p), /demo: at most 3 metrics, found 4/);
});

test('a metric needs a value, a label and a source', () => {
  const errors = errorsFor(validDive({ metrics: [{ value: ' ', label: '' }] }));
  assert.match(errors, /demo metrics\[0\]: needs a value/);
  assert.match(errors, /demo metrics\[0\]: needs a label/);
  assert.match(errors, /demo metrics\[0\]: needs a source/);
});

test('a source without a link must say it is self-reported', () => {
  const unlinked = validDive({ metrics: [{ ...metric('61%'), source: { label: 'trust me' } }] });
  assert.match(errorsFor(unlinked), /demo metrics\[0\]: a source without href must be labelled "self-reported/);
  const honest = validDive({ metrics: [{ ...metric('61%'), source: { label: 'self-reported, private repo' } }] });
  assert.deepEqual(validateDeepDives([honest]), []);
  const unlabelled = validDive({ metrics: [{ ...metric('61%'), source: { href: 'https://example.com' } }] });
  assert.match(errorsFor(unlabelled), /demo metrics\[0\]: source needs a label/);
});

test('a source href is https or a site path, nothing else', () => {
  for (const href of ['javascript:alert(1)', '//evil.example/x', 'http://example.com', '']) {
    const p = validDive({ metrics: [{ ...metric('61%'), source: { label: 'x', href } }] });
    assert.match(errorsFor(p), /demo metrics\[0\]: source href must be https:\/\/ or a site path/, href);
  }
});

test('two metrics with the same value are rejected', () => {
  const p = validDive({ metrics: [metric('F1 0.929'), metric('F1 0.929')] });
  assert.match(errorsFor(p), /demo metrics\[1\]: duplicate value "F1 0.929"/);
});

test('a metric value may not also appear in the page prose', () => {
  assert.match(
    errorsFor(validDive({ overview: 'it scored F1 0.929 on held-out fires' })),
    /demo metrics\[0\]: "F1 0.929" also appears in overview/,
  );
  assert.match(
    errorsFor(validDive({ findings: ['700k simulations is plenty'] })),
    /demo metrics\[1\]: "700k" also appears in findings/,
  );
  assert.match(
    errorsFor(validDive({ howItWorks: ['runs at 700K a second'] })),
    /"700k" also appears in howItWorks/,
  );
});

test('mentions matches the whole value, never a piece of a longer number', () => {
  assert.equal(mentions('F1 0.929 on four fires', 'F1 0.929'), true);
  assert.equal(mentions('scored F1 0.9291 once', 'F1 0.929'), false);
  assert.equal(mentions('16-way concurrency', '6'), false);
  assert.equal(mentions('a 6-stage ablation', '6'), true);
  assert.equal(mentions('2.6× faster', '6'), false);
  assert.equal(mentions('1,751 activities', '751'), false);
  assert.equal(mentions('about 700K a second', '700k'), true);
  assert.equal(mentions('', 'x'), false);
  assert.equal(mentions('x', ''), false);
});

test('findings are a list of text, and credits are text', () => {
  assert.match(errorsFor(validDive({ findings: 'one' })), /demo: findings must be a list/);
  assert.match(errorsFor(validDive({ findings: ['ok', '  '] })), /demo findings\[1\]: needs text/);
  assert.match(errorsFor(validDive({ credits: '' })), /demo: credits must be text/);
});

test('a gallery is no longer rendered, so a non-empty one is an error', () => {
  assert.match(errorsFor(validDive({ gallery: [{ src: '/x.webp' }] })), /demo: gallery is not rendered/);
  assert.deepEqual(validateDeepDives([validDive({ gallery: [] })]), []);
});

test('a lead figure is an image or a chart, never both or neither', () => {
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, chart: CHART } })), /demo leadFigure: needs exactly one of src or chart/);
  const { src, width, height, ...bare } = FIGURE;
  assert.match(errorsFor(validDive({ leadFigure: bare })), /demo leadFigure: needs exactly one of src or chart/);
  assert.deepEqual(validateDeepDives([validDive({ leadFigure: { ...bare, chart: CHART } })]), []);
});

test("an image lead figure is a sized webp in the project's own folder", () => {
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, src: '/projects/other/x.webp' } })), /src must be a \.webp under \/projects\/demo\//);
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, src: '/projects/demo/x.png' } })), /src must be a \.webp under \/projects\/demo\//);
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, width: undefined } })), /demo leadFigure: needs integer width and height/);
});

test('a lead figure needs real alt text, a caption and a source', () => {
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, alt: 'a fire' } })), /demo leadFigure: alt needs at least 6 words/);
  const same = 'the same six words in both places';
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, alt: same, caption: same } })), /alt must describe the figure, not repeat the caption/);
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, caption: '' } })), /demo leadFigure: needs a caption/);
  assert.match(errorsFor(validDive({ leadFigure: { ...FIGURE, source: undefined } })), /demo leadFigure: needs a source/);
});

test("a chart lead figure is checked by the chart's own rules", () => {
  const { src, width, height, ...bare } = FIGURE;
  const p = validDive({ leadFigure: { ...bare, chart: { ...CHART, domain: [10, 50000] } } });
  assert.match(errorsFor(p), /demo leadFigure\.chart: domain must be two powers of ten/);
});

test('every section renders when the project has everything', () => {
  assert.deepEqual(deepDiveSections(validDive()), DEEP_DIVE_SECTIONS);
});

test('absent sections are skipped, and a cover fills the figure slot', () => {
  const sparse = { slug: 's', title: 'S', period: '2026', stack: [], overview: 'x', whatIBuilt: ['y'] };
  assert.deepEqual(deepDiveSections(sparse), ['back', 'masthead', 'overview', 'built']);
  assert.deepEqual(deepDiveSections({ ...sparse, coverArt: { motif: 'pipes' } }), ['back', 'masthead', 'figure', 'overview', 'built']);
  assert.deepEqual(deepDiveSections({ ...sparse, overview: '', oneLiner: 'fallback text' }), ['back', 'masthead', 'overview', 'built']);
});

test('a motif fills the figure slot only if the cover art can draw it', () => {
  const sparse = { slug: 's', title: 'S', period: '2026', overview: 'x' };
  assert.equal(figureKind({ ...sparse, coverArt: { motif: 'graph' } }), null, 'an unknown motif would render an empty slot');
  assert.deepEqual(deepDiveSections({ ...sparse, coverArt: { motif: 'graph' } }), ['back', 'masthead', 'overview']);
  assert.equal(figureKind({ ...sparse, coverArt: { motif: 'pipes' } }), 'motif');
  assert.equal(figureKind({ ...sparse, coverArt: { motif: 'graph' }, coverImage: { src: '/c.webp' } }), 'cover');
  assert.equal(figureKind({ ...sparse, coverArt: { motif: 'pipes' }, leadFigure: FIGURE }), 'lead');
});

test('assertValidDeepDives throws with every error in the message', () => {
  const broken = [validDive({ credits: '', findings: ['  '] })];
  assert.throws(
    () => assertValidDeepDives(broken),
    err => {
      assert.ok(err.message.startsWith('projects.json deep dives are invalid:\n'), err.message);
      for (const e of validateDeepDives(broken)) assert.ok(err.message.includes(e), `missing "${e}"`);
      return true;
    },
  );
  assert.doesNotThrow(() => assertValidDeepDives([validDive()]));
});
