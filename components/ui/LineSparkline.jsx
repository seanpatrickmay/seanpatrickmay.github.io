import { useMemo } from 'react';

export default function LineSparkline({ values = [], height = 64, className = '' }) {
  const points = useMemo(() => {
    const data = Array.isArray(values) ? values.map(v => (Number.isFinite(Number(v)) ? Number(v) : 0)) : [];
    if (data.length === 0) return [];

    const min = Math.min(...data, 0);
    const max = Math.max(...data, 1);
    const range = Math.max(1e-9, max - min);

    return data.map((value, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return { x, y, value };
    });
  }, [values]);

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = points.length
    ? `M 0 100 L ${polylinePoints} L 100 100 Z`
    : '';

  return (
    <div className={`w-full ${className}`} style={{ minWidth: 0 }}>
      <svg viewBox="0 0 100 100" width="100%" height={height} preserveAspectRatio="none" className="block">
        <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" opacity="0.15" />
        {areaPath && <path d={areaPath} fill="currentColor" opacity="0.12" />}
        {polylinePoints && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.length ? (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2.6"
            fill="currentColor"
          />
        ) : null}
      </svg>
    </div>
  );
}

