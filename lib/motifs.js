/**
 * The cover-art motifs components/projects/CoverArt.jsx can draw, by name.
 *
 * Kept apart from the component so the pure rules (lib/deepDive.js) can ask
 * whether a motif is real without importing JSX. lib/projectCovers.test.mjs
 * fails if this list and the component's MOTIFS drift apart.
 */
export const MOTIF_NAMES = ['pipeline', 'lanes', 'hand', 'satellite', 'range-grid', 'hex', 'pipes', 'browser', 'wiki', 'eye'];

const KNOWN = new Set(MOTIF_NAMES);

export function hasMotif(name) {
  return typeof name === 'string' && KNOWN.has(name);
}
