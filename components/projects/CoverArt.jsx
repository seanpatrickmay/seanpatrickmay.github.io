/**
 * Project covers, as index cards.
 *
 * These replaced generated PNG/WebP tiles. Three reasons the images had to go:
 * they were dark slate gradients sitting on a cream kraft board, they could
 * not respond to dark mode because they were baked, and they cost 320KB plus
 * a regeneration step.
 *
 * So the card is CSS — paper, ruled lines, a red margin rule — and only the
 * motif is SVG. That keeps the caption as real HTML text, which means it
 * reflows between the 2:1 archive card and the near-square featured panel
 * instead of being cropped, and stays selectable and translatable.
 *
 * The caption is also not a number for its own sake. An earlier set led with
 * "7.5M params" and "48 classes", which are respectively meaningless and
 * actively unflattering — a big number is not a result.
 */

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/** Six source adapters funnelling into one store. */
function PipelineMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        {[10, 34, 58, 82, 106, 130].map((x, i) => (
          <rect key={i} x={x - 8} y="6" width="16" height="12" rx="2" />
        ))}
        {[10, 34, 58, 82, 106, 130].map((x, i) => (
          <path key={i} d={`M${x} 18 L70 38`} strokeWidth="1" opacity="0.65" />
        ))}
        <path d="M70 38 L70 50" />
        <ellipse cx="70" cy="56" rx="22" ry="6" />
        <path d="M48 56 L48 70" />
        <path d="M92 56 L92 70" />
        <path d="M48 70 A22 6 0 0 0 92 70" />
        <path d="M48 63 A22 6 0 0 0 92 63" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}

/** Three projects, events ordered within each lane, lanes running together. */
function LanesMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        {[18, 42, 66].map(y => (
          <path key={y} d={`M12 ${y} H128`} strokeWidth="1" opacity="0.5" />
        ))}
        {[[20, 18], [44, 18], [68, 18], [96, 18], [26, 42], [58, 42], [90, 42], [118, 42], [32, 66], [64, 66], [104, 66]].map(
          ([x, y], i) => <circle key={i} cx={x} cy={y} r="4" />,
        )}
        <path d="M12 8 V76" strokeWidth="1" opacity="0.45" />
        <path d="M128 8 V76" strokeWidth="1" opacity="0.45" />
      </g>
    </svg>
  );
}

/** Find the hand, then count what it is holding up. */
function HandMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        <rect x="34" y="8" width="72" height="68" rx="3" strokeDasharray="6 5" strokeWidth="1.4" opacity="0.6" />
        <path d="M58 72 V52 a4 4 0 0 1 8 0 V30 a4 4 0 0 1 8 0 v22" />
        <path d="M74 52 V34 a4 4 0 0 1 8 0 v18" />
        <path d="M82 52 V40 a4 4 0 0 1 8 0 v14" />
        <path d="M58 58 l-8 -6 a4 4 0 0 1 5 -6 l5 4" />
        <path d="M58 72 h32 v-20" />
      </g>
    </svg>
  );
}

/** A satellite pass over terrain contours. */
function SatelliteMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        <path d="M8 34 A70 40 0 0 1 132 34" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.7" />
        <rect x="62" y="6" width="16" height="12" rx="2" />
        <path d="M62 12 H50 M78 12 H90" />
        <path d="M50 8 v8 M90 8 v8" />
        <path d="M70 18 v8" strokeWidth="1" opacity="0.6" />
        <path d="M14 66 q22 -14 40 -4 t34 -6 38 2" strokeWidth="1.4" />
        <path d="M14 74 q26 -12 44 -2 t36 -6 32 2" strokeWidth="1.1" opacity="0.65" />
        <path d="M20 58 q18 -10 32 -3" strokeWidth="1" opacity="0.45" />
      </g>
    </svg>
  );
}

/** The 13x13 preflop range grid, with the strong corner shaded. */
function RangeGridMotif() {
  const cells = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const strong = r + c <= 3;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={22 + c * 12}
          y={4 + r * 9.5}
          width={12}
          height={9.5}
          fill={strong ? 'currentColor' : 'none'}
          fillOpacity={strong ? 0.75 - (r + c) * 0.12 : 0}
          stroke="currentColor"
          strokeWidth="0.8"
          opacity={strong ? 1 : 0.55}
        />,
      );
    }
  }
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      {cells}
    </svg>
  );
}

/** A hex board, mid-game. */
function HexMotif() {
  const hex = (cx, cy, r) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  const R = 13;
  const dx = R * Math.sqrt(3);
  const centres = [
    [70, 42, 1], [70 - dx, 42, 0], [70 + dx, 42, 1],
    [70 - dx / 2, 42 - R * 1.5, 0], [70 + dx / 2, 42 - R * 1.5, 1],
    [70 - dx / 2, 42 + R * 1.5, 1], [70 + dx / 2, 42 + R * 1.5, 0],
  ];
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      {centres.map(([cx, cy, filled], i) => (
        <polygon
          key={i}
          points={hex(cx, cy, R)}
          fill={filled ? 'currentColor' : 'none'}
          fillOpacity={filled ? 0.55 : 0}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Pipes nesting into pipes, which is the whole trick of the shell. */
function PipesMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        {[0, 1, 2, 3].map(i => {
          const inset = i * 15;
          return (
            <rect
              key={i}
              x={10 + inset}
              y={8 + inset * 0.55}
              width={120 - inset * 2}
              height={68 - inset * 1.1}
              rx="4"
              strokeWidth={1.8 - i * 0.3}
              opacity={1 - i * 0.18}
            />
          );
        })}
        <path d="M68 34 v16" strokeWidth="2.4" />
        <path d="M72 34 v16" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

/** A browser window, pointed at itself. */
function BrowserMotif() {
  return (
    <svg viewBox="0 0 140 84" aria-hidden="true" className="h-full w-full">
      <g {...STROKE}>
        <rect x="16" y="10" width="108" height="62" rx="4" />
        <path d="M16 26 H124" />
        <circle cx="26" cy="18" r="2.4" />
        <circle cx="35" cy="18" r="2.4" />
        <circle cx="44" cy="18" r="2.4" />
        <path d="M28 40 H72 M28 50 H92 M28 60 H60" strokeWidth="1.4" opacity="0.6" />
        <path d="M96 44 l14 22 4 -9 9 -1 z" strokeWidth="1.6" fill="currentColor" fillOpacity="0.15" />
      </g>
    </svg>
  );
}

export const MOTIFS = {
  pipeline: PipelineMotif,
  lanes: LanesMotif,
  hand: HandMotif,
  satellite: SatelliteMotif,
  'range-grid': RangeGridMotif,
  hex: HexMotif,
  pipes: PipesMotif,
  browser: BrowserMotif,
};

export function hasMotif(name) {
  return Boolean(name && MOTIFS[name]);
}

export default function CoverArt({ motif, line, className = '' }) {
  const Motif = MOTIFS[motif];
  if (!Motif) return null;

  return (
    <div className={`index-card relative flex h-full w-full flex-col justify-between overflow-hidden ${className}`}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-[14%] pb-1 pt-4">
        {/* No height cap: the SVG's own preserveAspectRatio fits it to the
            box, so the motif grows into the tall featured panel instead of
            floating in a sea of ruled paper. */}
        <div className="h-full w-full max-w-[320px] text-[#6b5c45] dark:text-[#b0a081]">
          <Motif />
        </div>
      </div>
      {line && (
        <div className="relative pb-3 pl-[14%] pr-4">
          <p className="font-hand text-[15px] leading-tight text-stone-700 dark:text-stone-200 sm:text-base">
            {line}
          </p>
        </div>
      )}
    </div>
  );
}
