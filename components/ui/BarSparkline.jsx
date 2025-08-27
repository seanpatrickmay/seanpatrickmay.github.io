// components/ui/BarSparkline.jsx
import { useMemo, useState } from "react";

/**
 * A tiny bar sparkline with hover tooltips (no dependencies).
 * Props:
 *   values: number[]  // chronological data
 *   height?: number   // px height (default 64)
 *   barGap?: number   // px gap between bars (default 2)
 *   formatter?: (v:number, i:number) => string // tooltip text
 */
export default function BarSparkline({
  values = [],
  height = 64,
  barGap = 2,
  className = "",
  formatter,
}) {
  const [hover, setHover] = useState({ i: -1, x: 0, y: 0, text: "" });

  const { max, bars, width } = useMemo(() => {
    const m = Math.max(1, ...values);
    const n = Math.max(values.length, 1);
    const bw = Math.max(2, Math.floor(240 / n)); // auto bar width (target ~240px)
    const gap = Math.max(1, barGap);
    const w = n * bw + (n - 1) * gap;

    const toH = (v) => {
      const t = v / (m || 1);
      // pad top/bottom a touch
      return Math.max(2, Math.round((height - 8) * t));
    };

    const data = values.map((v, i) => {
      const h = toH(v);
      const x = i * (bw + gap);
      const y = height - h;
      return { x, y, w: bw, h };
    });

    return { max: m, bars: data, width: w };
  }, [values, height, barGap]);

  return (
    <div className={`relative ${className}`} style={{ width }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block">
        {/* subtle baseline */}
        <line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke="currentColor" opacity="0.15" />
        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill="currentColor"
              opacity={hover.i === i ? 0.9 : 0.7}
              onMouseEnter={(e) => {
                const text =
                  formatter ? formatter(values[i], i) : String(values[i]);
                const rect = e.currentTarget.getBoundingClientRect();
                setHover({
                  i,
                  x: rect.x + rect.width / 2,
                  y: rect.y,
                  text,
                });
              }}
              onMouseLeave={() => setHover({ i: -1, x: 0, y: 0, text: "" })}
            />
            {/* Accessible title (fallback tooltip) */}
            <title>{formatter ? formatter(values[i], i) : String(values[i])}</title>
          </g>
        ))}
      </svg>

      {/* simple tooltip */}
      {hover.i >= 0 && (
        <div
          className="pointer-events-none fixed z-50 px-2 py-1 rounded-md text-xs bg-black/80 text-white shadow"
          style={{ left: hover.x, top: hover.y - 8, transform: "translate(-50%, -100%)" }}
        >
          {hover.text}
        </div>
      )}
    </div>
  );
}

