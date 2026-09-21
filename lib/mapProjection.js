/**
 * Fitting a Mercator projection to a set of pins.
 *
 * Lives apart from PinMap because it is pure arithmetic with one failure
 * mode that is invisible in review — a pin quietly landing off-canvas — and
 * that is exactly the kind of thing that should have tests rather than a
 * screenshot.
 */
const RAD = Math.PI / 180;
export const MAP_WIDTH = 600;
// The viewBox renders at `width: 100%`, so these are ratios against 600
// rather than pixels: at a 640px-wide column they come out as roughly
// 256px and 448px tall.
const MIN_HEIGHT = 240;
const MAX_HEIGHT = 420;

/** Mercator's y, in projection units (d3 multiplies this by `scale`). */
export function mercatorY(lat) {
  const clamped = Math.max(-84, Math.min(84, lat));
  return Math.log(Math.tan(Math.PI / 4 + (clamped * RAD) / 2));
}

/**
 * Fit every pin, exactly.
 *
 * This used to be a heuristic — `26000 / span`, with scale clamped to
 * [1200, 4500] — which was tuned by eye against a US-east-coast spread and
 * could not express anything wider. A transatlantic set of pins needs a
 * scale near 260, so the clamp alone would have put Ireland off-canvas.
 *
 * d3's geoMercator maps one radian of longitude to `scale` pixels, and
 * latitude to `scale * mercatorY(lat)`. Both are invertible, so solve each
 * for the scale that just fits and take the tighter of the two.
 *
 * @param {Array<[number, number]>} coords  [lon, lat] pairs, as
 *   react-simple-maps orders them. Takes coordinates rather than pins so it
 *   stays import-free and testable on its own.
 */
export function computeProjection(coords = []) {
  if (coords.length === 0) {
    return { center: [-76, 38], scale: 2000, height: 420 };
  }

  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);

  // Proportional padding, with a floor so a lone pin is not zoomed to the
  // street it sits on.
  const PAD_FRACTION = 0.1;
  const MIN_PAD_DEG = 1.5;
  const lonPad = Math.max((Math.max(...lons) - Math.min(...lons)) * PAD_FRACTION, MIN_PAD_DEG);
  const latPad = Math.max((Math.max(...lats) - Math.min(...lats)) * PAD_FRACTION, MIN_PAD_DEG);

  const minLon = Math.min(...lons) - lonPad;
  const maxLon = Math.max(...lons) + lonPad;
  const minLat = Math.max(-84, Math.min(...lats) - latPad);
  const maxLat = Math.min(84, Math.max(...lats) + latPad);

  const lonSpanRad = Math.max((maxLon - minLon) * RAD, 1e-6);
  const ySpan = Math.max(mercatorY(maxLat) - mercatorY(minLat), 1e-6);

  // Height follows the spread's own aspect, bounded so the card never
  // becomes a letterbox slit or a tower. The ceiling matters: a US
  // east-coast spread is very slightly taller than it is wide once Mercator
  // has stretched the latitudes, and letting it have the height it asks for
  // produced a 600x560 viewBox — a map about 600px tall in a 640px column.
  const height = Math.round(Math.min(Math.max((MAP_WIDTH * ySpan) / lonSpanRad, MIN_HEIGHT), MAX_HEIGHT));

  // Taking the min means whichever axis binds sets the zoom, and the other
  // simply shows more than it needed to. Capping the height above therefore
  // widens the view rather than cropping a pin off the edge.
  const scale = Math.min(MAP_WIDTH / lonSpanRad, height / ySpan);

  return { center: [(minLon + maxLon) / 2, (minLat + maxLat) / 2], scale, height };
}
