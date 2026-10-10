import { useEffect, useState } from 'react';

/**
 * Red string between related cards.
 *
 * Where one card sits wholly above the other, the string runs from the upper
 * card's bottom-centre to the lower card's pin, so it only crosses the gap
 * and never a card's caption, title or meta. Otherwise (side by side, or
 * overlapping) it runs pin to pin.
 *
 * Measured after layout, because the grid decides where cards land. Nothing
 * renders on the server or before the first measurement. The overlay shows
 * from lg; below it a cluster is a two-column phone grid and a string would
 * cut across the page. The clusters themselves stack below xl, so a string
 * between them would cross a heading and every card in between: validateBoard
 * rejects a thread that crosses clusters, and each one stays inside its own.
 * Re-measures on resize and once the web fonts land, since late fonts reflow
 * the cards underneath it.
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
      const rectOf = slug => {
        const el = container.querySelector(`[data-board-slug="${slug}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          top: r.top - box.top,
          bottom: r.bottom - box.top,
          cx: r.left - box.left + r.width / 2,
        };
      };
      // Same rule as scripts/check_board_browser.mjs: keep the two in step.
      // PinCard's pushpin sits centred on the card's top edge.
      const endpoints = (from, to) => {
        const f = rectOf(from);
        const t = rectOf(to);
        if (!f || !t) return null;
        const [upper, lower] = f.bottom <= t.top ? [f, t] : t.bottom <= f.top ? [t, f] : [null, null];
        if (upper) {
          const a = { x: upper.cx, y: upper.bottom };
          const b = { x: lower.cx, y: lower.top + 2 };
          return f === upper ? { a, b } : { a: b, b: a };
        }
        return { a: { x: f.cx, y: f.top + 2 }, b: { x: t.cx, y: t.top + 2 } };
      };
      setLines(
        pairs
          .map(([from, to]) => ({ key: `${from}->${to}`, ends: endpoints(from, to) }))
          .filter(line => line.ends)
          .map(({ key, ends }) => ({ key, a: ends.a, b: ends.b })),
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
