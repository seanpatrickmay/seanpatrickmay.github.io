import { useEffect, useState } from 'react';

/**
 * Red string between related cards, pin to pin.
 *
 * Measured after layout, because the grid decides where cards land. Nothing
 * renders on the server or before the first measurement, and the overlay is
 * hidden below lg, where the clusters stack and a string would cut across the
 * page. Re-measures on resize and once the web fonts land, since late fonts
 * reflow the cards underneath it.
 *
 * `pairs` must be referentially stable (Board memoises it): a fresh array
 * every render would re-run the effect, set state, and loop.
 */
export default function Thread({ containerRef, pairs }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pairs.length === 0) return undefined;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const box = container.getBoundingClientRect();
      const pinOf = slug => {
        const el = container.querySelector(`[data-board-slug="${slug}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        // PinCard's pushpin sits centred on the card's top edge.
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + 2 };
      };
      setLines(
        pairs
          .map(([from, to]) => ({ key: `${from}->${to}`, a: pinOf(from), b: pinOf(to) }))
          .filter(line => line.a && line.b),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [containerRef, pairs]);

  if (lines.length === 0) return null;

  return (
    <svg
      data-thread=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
    >
      {lines.map(({ key, a, b }) => (
        <line
          key={key}
          data-thread-line={key}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeOpacity="0.75"
        />
      ))}
    </svg>
  );
}
