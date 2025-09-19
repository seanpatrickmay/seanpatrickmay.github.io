// components/ui/BarSparkline.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Responsive bar sparkline with hover tooltip (no deps).
 * Fills the width of its container and recomputes on resize.
 *
 * Props:
 *   values: number[]           // chronological data
 *   height?: number            // default 64
 *   barGap?: number            // default 2
 *   minBarWidth?: number       // default 3
 *   maxBarWidth?: number       // default 22
 *   formatter?: (v,i)=>string  // tooltip text
 *   className?: string
 */
export default function BarSparkline({
  values = [],
  height = 64,
  barGap = 2,
  minBarWidth = 3,
  maxBarWidth = 22,
  className = "",
  formatter,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hover, setHover] = useState({ i: -1, x: 0, y: 0, text: "" });

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w !== containerWidth) setContainerWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { bars, width } = useMemo(() => {
    const n = Math.max(values.length, 1);
    const gap = Math.max(1, barGap);
    const available = Math.max(0, containerWidth);

    // Compute a bar width that fills the container while staying within min/max
    // totalWidth = n*barWidth + (n-1)*gap  => barWidth = (available - (n-1)*gap)/n
    let ideal = n > 0 ? (available - (n - 1) * gap) / n : available;
    const barW = Math.max(minBarWidth, Math.min(maxBarWidth, Math.floor(ideal)));
    const total = n * barW + (n - 1) * gap;

    const maxVal = Math.max(1, ...values);
    const toH = (v) => Math.max(2, Math.round((height - 8) * (v / (maxVal || 1))));
    const data = values.map((v, i) => {
      const h = toH(v);
      const x = i * (barW + gap);
      const y = height - h;
      return { x, y, w: barW, h, v, i };
    });

    return { bars: data, width: total };
  }, [values, containerWidth, height, barGap, minBarWidth, maxBarWidth]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ minWidth: 0 }}>
      <svg
        viewBox={`0 0 ${Math.max(width, 0)} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="block"
      >
        <line
          x1="0"
          y1={height - 0.5}
          x2={Math.max(width, 0)}
          y2={height - 0.5}
          stroke="currentColor"
          opacity="0.15"
        />
        {bars.map((b) => (
          <g key={b.i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill="currentColor"
              opacity="0.75"
              onMouseEnter={(e) => {
                const text = formatter ? formatter(b.v, b.i) : String(b.v);
                const rect = e.currentTarget.getBoundingClientRect();
                setHover({
                  i: b.i,
                  x: rect.x + rect.width / 2,
                  y: rect.y,
                  text,
                });
              }}
              onMouseLeave={() => setHover({ i: -1, x: 0, y: 0, text: "" })}
            />
            <title>{formatter ? formatter(b.v, b.i) : String(b.v)}</title>
          </g>
        ))}
      </svg>

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

