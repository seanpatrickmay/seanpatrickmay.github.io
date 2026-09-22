/**
 * The site's typefaces, in one place.
 *
 * Fonts are self-hosted rather than linked from Google. Three reasons, in
 * order of weight:
 *
 * 1. Google picks the format from the User-Agent, and it guesses wrong more
 *    often than you would think. Measured from this very build, a browser it
 *    did not recognise was served *woff*, not woff2: Caveat at 56KB instead
 *    of 47KB, Instrument Serif at 29.8KB instead of 14.7KB. Self-hosting
 *    means one format, chosen here, for everyone.
 * 2. It put two extra origins on the critical path. The chain was
 *    HTML -> fonts.googleapis.com CSS -> fonts.gstatic.com woff2, and the
 *    body font landing late was what moved LCP: the hero paragraph painted
 *    in the fallback, then re-rendered a second later in DM Sans.
 * 3. Visitors stop being announced to a third party to read the page.
 *
 * scripts/fetch_fonts.mjs turns this spec into public/fonts/*.woff2 and the
 * generated styles/fonts.css. lib/fontSubset.test.mjs checks the result.
 */

/** 0x20-0x7E. Spelled out so the subset is legible in a diff. */
const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(0x20 + i)).join('');

/**
 * Punctuation and accents that appear in handwritten text but not in ASCII.
 * Anything outside the subset renders in the fallback cursive, which is the
 * kind of bug nobody spots until they look closely at one card.
 */
export const CAVEAT_EXTRA_CHARS = '·–—‘’“”…→×°éèêàüö';

export const CAVEAT_SUBSET = PRINTABLE_ASCII + CAVEAT_EXTRA_CHARS;

/**
 * One entry per Google Fonts request.
 *
 * `text` subsets a request, and it applies to every family in that request —
 * which is why Caveat is fetched alone. Subsetting the body faces would
 * break any name outside the list, and the reading list has "Les Misérables"
 * and "Angèle" in it.
 *
 * No italic axis anywhere: DM Sans's italic was a second download serving two
 * "private repo" notes, and Instrument Serif's was never used at all. Both
 * synthesise an oblique if something asks for one.
 */
export const FONT_REQUESTS = [
  { label: 'dm-sans', query: 'DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700' },
  { label: 'instrument-serif', query: 'Instrument+Serif' },
  // font-hand sets no weight, so exactly one must be served — it was
  // rendering a 400 the family does not ship.
  { label: 'caveat', query: 'Caveat:wght@600', text: CAVEAT_SUBSET },
];

/** Faces worth preloading: both are used above the fold on every page. */
export const PRELOAD = ['dm-sans-latin.woff2', 'instrument-serif-400-latin.woff2'];
