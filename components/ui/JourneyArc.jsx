/**
 * Schematic progress arc for the "you have run X% of the way to Y" stat.
 *
 * The line used to be text only — "98% of Boston → Halifax" — which is a
 * number you have to picture yourself. This draws it.
 *
 * Not a map projection: it is a deliberate schematic, so the two endpoints are
 * fixed and only the fill varies. Position is solved by arc length rather than
 * by bezier parameter, so the marker actually sits where the stroke stops
 * instead of drifting ahead of it.
 */

const START = [8, 30];
const CONTROL = [100, 3];
const END = [192, 30];
const SAMPLES = 240;

function pointAt(t) {
  const u = 1 - t;
  return [
    u * u * START[0] + 2 * u * t * CONTROL[0] + t * t * END[0],
    u * u * START[1] + 2 * u * t * CONTROL[1] + t * t * END[1],
  ];
}

// Walk the curve once, then read off the t whose cumulative length matches the
// requested fraction. Cheap, and it runs at build time for the static export.
function pointAtFraction(fraction) {
  const lengths = [0];
  let prev = pointAt(0);
  let total = 0;

  for (let i = 1; i <= SAMPLES; i += 1) {
    const next = pointAt(i / SAMPLES);
    total += Math.hypot(next[0] - prev[0], next[1] - prev[1]);
    lengths.push(total);
    prev = next;
  }

  const wanted = total * fraction;
  for (let i = 1; i <= SAMPLES; i += 1) {
    if (lengths[i] >= wanted) {
      const span = lengths[i] - lengths[i - 1];
      const within = span > 0 ? (wanted - lengths[i - 1]) / span : 0;
      return pointAt((i - 1 + within) / SAMPLES);
    }
  }
  return pointAt(1);
}

const PATH = `M ${START[0]} ${START[1]} Q ${CONTROL[0]} ${CONTROL[1]} ${END[0]} ${END[1]}`;

export default function JourneyArc({ percent, origin, destination, className = '' }) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const [markerX, markerY] = pointAtFraction(pct / 100);

  return (
    <div className={className}>
      <svg
        viewBox="0 0 200 40"
        className="w-full"
        role="img"
        aria-label={`${pct}% of the way from ${origin} to ${destination}`}
      >
        {/* full route */}
        <path
          d={PATH}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="stroke-slate-300 dark:stroke-slate-600"
        />
        {/* distance covered — pathLength normalises the dash to a percentage */}
        <path
          d={PATH}
          fill="none"
          pathLength="100"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${pct} 100`}
          className="stroke-teal-500 dark:stroke-teal-400"
        />
        <circle cx={START[0]} cy={START[1]} r="3" className="fill-teal-600 dark:fill-teal-400" />
        <circle
          cx={END[0]}
          cy={END[1]}
          r="3"
          strokeWidth="1.5"
          className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600"
        />
        {pct > 4 && pct < 97 && (
          <circle
            cx={markerX}
            cy={markerY}
            r="2.5"
            strokeWidth="1.5"
            className="fill-teal-500 stroke-white dark:fill-teal-400 dark:stroke-slate-900"
          />
        )}
      </svg>
      <div className="-mt-1 flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
        <span>{origin}</span>
        <span>{destination}</span>
      </div>
    </div>
  );
}
