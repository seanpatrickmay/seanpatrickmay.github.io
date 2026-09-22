/**
 * Shared chrome for the two maps in PinMap: the US map and the world inset.
 *
 * The maps used to be flat grey web maps sitting on a scrapbook board, which
 * was the same mismatch the genres card had — a real-looking artefact glued
 * onto a dashboard. These turn them into something closer to a printed chart:
 * aged paper and sepia ink in light mode, a nautical chart in dark mode.
 *
 * The coastlines are the trick. A `feTurbulence` + `feDisplacementMap` pair
 * applied to the whole geography group nudges every path by a couple of
 * pixels along a noise field, which is what separates an inked line from a
 * vector one. It is one raster pass over the group, not per-path, so it
 * costs about the same as drawing the group twice.
 */

// Ink, paper and water, as Tailwind classes rather than props: a CSS `fill`
// declaration beats SVG's `fill` presentation attribute, which is how the
// dark variants get to win.
export const LAND = 'fill-[#f2e7cf] stroke-[#9c8256] dark:fill-[#1a3d4f] dark:stroke-[#56a3b4]';
// Plain variant: flatter, quieter, no engraved-chart warmth.
export const LAND_PLAIN = 'fill-[#e3d9c4] stroke-[#a8987c] dark:fill-[#17313d] dark:stroke-[#3d6b79]';
export const LAND_INSET = 'fill-[#f2e7cf] stroke-[#a68c60] dark:fill-[#1a3d4f] dark:stroke-[#4d93a3]';
// Neighbouring countries: same paper, no inked border. us-atlas carries only
// US states, so without this layer Ontario and Quebec render as open ocean.
export const LAND_NEIGHBOUR = 'fill-[#eee1c5] dark:fill-[#16333f]';

/**
 * @param {string} id  Unique per map instance — two `feTurbulence` filters
 *                     sharing an id would make the inset reuse the main map's
 *                     noise field, and in Safari the second one wins.
 */
export function ChartDefs({ id, wobble = 2 }) {
  return (
    <defs>
      <filter id={`${id}-ink`} x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.016"
          numOctaves="3"
          seed="7"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={wobble}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Fine plotting grid, for the plain variant: graph paper rather than
          an engraved chart, so the two maps on the page stop reading as the
          same artefact printed twice. */}
      <pattern id={`${id}-plot`} width="12" height="12" patternUnits="userSpaceOnUse">
        <path
          d="M12 0 H0 V12"
          fill="none"
          className="stroke-[#c4b596] dark:stroke-[#24424f]"
          strokeWidth="0.5"
        />
      </pattern>

      {/* Diagonal swell lines, the way water is shaded on an engraved chart. */}
      <pattern
        id={`${id}-swell`}
        width="13"
        height="13"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="13"
          className="stroke-[#cfd9d2] dark:stroke-[#0d2430]"
          strokeWidth="1.1"
        />
      </pattern>

      {/* Darker towards the edges, like paper that has been handled. */}
      <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.78">
        <stop offset="55%" stopColor="#000000" stopOpacity="0" />
        <stop offset="100%" stopColor="#4a3a22" stopOpacity="0.2" />
      </radialGradient>
    </defs>
  );
}

/** Water, with swell hatching on the chart variant and a plot grid on the plain one. */
export function ChartWater({ id, width, height, variant = 'chart' }) {
  const plain = variant === 'plain';
  return (
    <>
      <rect
        width={width}
        height={height}
        className={plain ? 'fill-[#f3ece0] dark:fill-[#0a1a22]' : 'fill-[#e6ece8] dark:fill-[#061219]'}
      />
      <rect
        width={width}
        height={height}
        fill={`url(#${id}-${plain ? 'plot' : 'swell'})`}
        opacity={plain ? 0.85 : 0.55}
      />
    </>
  );
}

export function ChartVignette({ id, width, height }) {
  return (
    <rect
      width={width}
      height={height}
      fill={`url(#${id}-vignette)`}
      className="pointer-events-none"
    />
  );
}

/**
 * Eight-point rose. Decorative, so it is aria-hidden and lives outside the
 * projection — a compass that rotated with the map would be worse than none.
 */
export function CompassRose({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`text-[#9c8256] dark:text-[#3e7d8b] ${className}`}
    >
      <circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      {/* Secondary points, rotated 45°, drawn first so they sit behind. */}
      <g opacity="0.55">
        <path d="M32 32 L43 21 L34 30 Z M32 32 L43 43 L34 34 Z M32 32 L21 43 L30 34 Z M32 32 L21 21 L30 30 Z" fill="currentColor" />
      </g>
      {/* Cardinal points: one filled half and one hollow, the standard rose. */}
      <path d="M32 6 L35.5 32 L32 32 Z M32 58 L28.5 32 L32 32 Z M58 32 L32 28.5 L32 32 Z M6 32 L32 35.5 L32 32 Z" fill="currentColor" />
      <path d="M32 6 L28.5 32 L32 32 Z M32 58 L35.5 32 L32 32 Z M58 32 L32 35.5 L32 32 Z M6 32 L32 28.5 L32 32 Z" fill="currentColor" opacity="0.35" />
      <text
        x="32"
        y="5"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}
      >
        N
      </text>
    </svg>
  );
}
