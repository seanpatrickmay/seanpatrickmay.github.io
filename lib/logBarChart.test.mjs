import test from 'node:test';
import assert from 'node:assert/strict';
import { logBarLayout, tickLabel, validateLogBars } from './logBarChart.js';

const CHART = {
  kind: 'log-bars',
  unit: 'ns per engine step',
  domain: [10, 100000],
  bars: [
    { label: 'AlphaSettler', value: 68.2, highlight: true },
    { label: 'catan-rl', value: 88 },
    { label: 'Catanatron', value: 20691 },
  ],
};
const near = (actual, expected, at) => assert.ok(Math.abs(actual - expected) < 0.01, `${at}: ${actual} is not ~${expected}`);

test('ticks fall on each power of ten, evenly spaced', () => {
  const { ticks } = logBarLayout(CHART);
  assert.deepEqual(ticks.map(t => t.label), ['10', '100', '1k', '10k', '100k']);
  ticks.forEach((t, i) => near(t.percent, i * 25, t.label));
});

test('bars sit on the log scale, with their numbers formatted', () => {
  const { bars } = logBarLayout(CHART);
  assert.deepEqual(bars.map(b => b.display), ['68.2', '88', '20,691']);
  near(bars[0].percent, 20.85, 'AlphaSettler');
  near(bars[1].percent, 23.61, 'catan-rl');
  near(bars[2].percent, 82.9, 'Catanatron');
  assert.deepEqual(bars.map(b => b.highlight), [true, false, false]);
});

test('tick labels shorten thousands and millions', () => {
  assert.equal(tickLabel(1), '1');
  assert.equal(tickLabel(10), '10');
  assert.equal(tickLabel(1000), '1k');
  assert.equal(tickLabel(100000), '100k');
  assert.equal(tickLabel(1000000), '1M');
});

test('a well-formed chart has no errors', () => {
  assert.deepEqual(validateLogBars(CHART), []);
});

test('bad charts are rejected, each for its own reason', () => {
  assert.deepEqual(validateLogBars({ ...CHART, kind: 'pie' }), ['unknown kind "pie"']);
  assert.match(validateLogBars({ ...CHART, unit: ' ' }).join('\n'), /needs a unit/);
  assert.match(validateLogBars({ ...CHART, domain: [10, 50000] }).join('\n'), /domain must be two powers of ten/);
  assert.match(validateLogBars({ ...CHART, domain: [0.1, 1000] }).join('\n'), /domain must be two powers of ten, at least 1/);
  assert.match(validateLogBars({ ...CHART, bars: CHART.bars.slice(0, 1) }).join('\n'), /needs 2 to 6 bars, found 1/);
  const outside = { ...CHART, bars: [...CHART.bars, { label: 'Huge', value: 500000 }] };
  assert.match(validateLogBars(outside).join('\n'), /bars\[3\]: 500000 is outside the domain/);
  const blank = { ...CHART, bars: [{ label: '', value: -1 }, CHART.bars[0]] };
  const errors = validateLogBars(blank).join('\n');
  assert.match(errors, /bars\[0\]: needs a label/);
  assert.match(errors, /bars\[0\]: value must be a positive number/);
});
