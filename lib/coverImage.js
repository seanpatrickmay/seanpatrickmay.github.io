/**
 * Responsive sources for the photographic project covers.
 *
 * The same file was being served to every slot that shows it: a 220px card in
 * the hero, a 368px featured block, and a 1145px masthead on the detail page.
 * Sized for the masthead, it cost 93KB on the home page's critical path to
 * fill a thumbnail. The detail page really does need the full width, so the
 * fix is variants plus an honest `sizes`, not one smaller file.
 *
 * Variants are a naming convention -- `foo.webp` implies `foo-480.webp` and
 * `foo-960.webp`, written by scripts/generate_cover_variants.mjs.
 * lib/coverImage.test.mjs fails if a declared cover is missing one, so the
 * convention cannot rot silently into a 404.
 */
export const COVER_VARIANT_WIDTHS = [480, 640, 960];

/**
 * Slot widths per render site, so the browser can pick honestly.
 *
 * These are measured, not guessed. A `sizes` that overstates the slot buys a
 * needlessly large file; one that understates it serves a soft image. The
 * first draft here did both at once -- `92vw` on a slot that is really
 * `100vw - 76px`, and `320px` on a wall card that renders at 386px at the lg
 * breakpoint. Re-measure before editing these.
 */
export const COVER_SIZES = {
  // A big card on the board: half a cluster at every width from lg. From xl
  // the two clusters sit side by side, so that is a quarter of the board;
  // between lg and xl they stack, so it is half the page less the gutters.
  // Below lg a big card spans the full width.
  board: '(min-width: 1280px) 300px, (min-width: 1024px) calc(50vw - 100px), calc(100vw - 80px)',
  // The detail-page masthead, the one slot that genuinely wants the original.
  masthead: '(min-width: 1280px) 1150px, 95vw',
};

/**
 * Build srcSet/width/height for a coverImage entry. Returns null when the
 * cover has no declared intrinsic width, so callers fall back to a plain src
 * rather than advertising widths that were never generated.
 */
export function coverSources(coverImage) {
  if (!coverImage?.src || !coverImage.width) return null;
  const base = coverImage.src.replace(/\.webp$/, '');
  if (base === coverImage.src) return null;

  const srcSet = [
    ...COVER_VARIANT_WIDTHS.filter(w => w < coverImage.width).map(w => `${base}-${w}.webp ${w}w`),
    `${coverImage.src} ${coverImage.width}w`,
  ].join(', ');

  return { src: coverImage.src, srcSet, width: coverImage.width, height: coverImage.height };
}

/** Variant paths a given cover is expected to have on disk. */
export function expectedVariantPaths(coverImage) {
  if (!coverImage?.src || !coverImage.width) return [];
  const base = coverImage.src.replace(/\.webp$/, '');
  return COVER_VARIANT_WIDTHS.filter(w => w < coverImage.width).map(w => `${base}-${w}.webp`);
}
