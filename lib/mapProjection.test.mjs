import test from 'node:test';
import assert from 'node:assert/strict';

import { MAP_WIDTH, computeProjection, mercatorY } from './mapProjection.js';

const RAD = Math.PI / 180;

/**
 * Where d3-geo's Mercator would actually put a point, given what
 * computeProjection returned. Mirrors d3: x grows east from the centre
 * meridian, y grows *down* from the centre parallel.
 */
function project([lon, lat], { center, scale, height }) {
  return {
    x: MAP_WIDTH / 2 + scale * (lon - center[0]) * RAD,
    y: height / 2 - scale * (mercatorY(lat) - mercatorY(center[1])),
  };
}

function assertAllOnCanvas(coords, projection, label) {
  for (const c of coords) {
    const { x, y } = project(c, projection);
    assert.ok(x >= 0 && x <= MAP_WIDTH, `${label}: lon ${c[0]} -> x=${x.toFixed(1)} off canvas`);
    assert.ok(y >= 0 && y <= projection.height, `${label}: lat ${c[1]} -> y=${y.toFixed(1)} off canvas`);
  }
}

const US_EAST = [
  [-71.06, 42.36], // Boston
  [-77.44, 37.54], // Richmond
  [-72.08, 41.35], // Groton
  [-76.74, 39.11], // Fort Meade
  [-74.01, 40.71], // New York
];

const TRANSATLANTIC = [
  ...US_EAST,
  [-6.26, 53.35], // Dublin
  [19.06, 47.47], // Budapest
];

test('fits a US east-coast spread on canvas', () => {
  const p = computeProjection(US_EAST);
  assertAllOnCanvas(US_EAST, p, 'us-east');
});

test('fits a transatlantic spread on canvas', () => {
  // The old heuristic clamped scale to a floor of 1200; this set needs
  // roughly 260, so every European pin used to land off the right edge.
  const p = computeProjection(TRANSATLANTIC);
  assert.ok(p.scale < 1200, `expected a wide scale, got ${p.scale}`);
  assertAllOnCanvas(TRANSATLANTIC, p, 'transatlantic');
});

test('a wider spread produces a smaller scale', () => {
  assert.ok(computeProjection(TRANSATLANTIC).scale < computeProjection(US_EAST).scale);
});

test('centres on the middle of the padded bounding box', () => {
  const p = computeProjection([[-80, 30], [-60, 50]]);
  assert.equal(p.center[0], -70);
  assert.equal(p.center[1], 40);
});

test('a single pin gets a floor of padding rather than a street-level zoom', () => {
  const p = computeProjection([[-71.06, 42.36]]);
  assert.ok(Number.isFinite(p.scale));
  assertAllOnCanvas([[-71.06, 42.36]], p, 'single');
  // 1.5 degrees of padding either side, not zero span.
  assert.ok(p.scale < MAP_WIDTH / (2 * RAD), `scale ${p.scale} implies under 2 degrees of view`);
});

test('two pins at the same place do not divide by zero', () => {
  const p = computeProjection([[-71.06, 42.36], [-71.06, 42.36]]);
  assert.ok(Number.isFinite(p.scale) && p.scale > 0);
  assert.ok(Number.isFinite(p.height) && p.height > 0);
});

test('a near-square spread is capped wide rather than rendered as a tower', () => {
  // US east coast is marginally taller than wide in Mercator terms. Letting
  // it have the height it asks for gave a 600x560 viewBox.
  const { height } = computeProjection(US_EAST);
  assert.equal(height, 420);
  assertAllOnCanvas(US_EAST, computeProjection(US_EAST), 'capped');
});

test('height stays within the bounds the card can hold', () => {
  for (const coords of [US_EAST, TRANSATLANTIC, [[0, 0]], [[-170, -60], [170, 70]]]) {
    const { height } = computeProjection(coords);
    assert.ok(height >= 240 && height <= 420, `height ${height} out of bounds`);
  }
});

test('an empty set falls back rather than producing NaN', () => {
  const p = computeProjection([]);
  assert.ok(Number.isFinite(p.scale) && Number.isFinite(p.height));
  assert.equal(p.height, 420);
});

test('clamps latitude so a polar pin cannot send mercatorY to infinity', () => {
  assert.ok(Number.isFinite(mercatorY(90)));
  assert.ok(Number.isFinite(mercatorY(-90)));
  const p = computeProjection([[0, 89], [10, 88]]);
  assert.ok(Number.isFinite(p.scale) && Number.isFinite(p.height));
});
