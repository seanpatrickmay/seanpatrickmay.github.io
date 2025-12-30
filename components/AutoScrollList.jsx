// components/AutoScrollList.jsx
import React, { useEffect, useRef } from "react";

export default function AutoScrollList({
  items = [], // [{ id, title, subtitle, image, emoji, url, info, trailing }]
  visibleCount = 5,
  fillHeight = false,
  speed = 10,
  resumeDelayMs = 2000,
  ariaLabel = "Auto scrolling list",
  emptyMessage = "No items",
  className = "",
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const runnerRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const offsetRef = useRef(0);
  const oneListHeightRef = useRef(0);
  const pausedHoverRef = useRef(false);
  const userActiveUntilRef = useRef(0);
  const lastSetContainerHRef = useRef(0);

  // Compute arrays but DO NOT early-return before hooks
  const top10 = items.slice(0, 10);

  // Measure once (and on window resize)
  useEffect(() => {
    const container = containerRef.current;
    const measureList = measureRef.current;
    if (!container || !measureList) return;

    const measure = () => {
      const nodes = measureList.querySelectorAll("li");
      if (!nodes.length) return;

      const gap = nodes[1] ? parseFloat(getComputedStyle(nodes[1]).marginTop) : 0;

      // Height of ONE list (top10)
      let oneH = 0;
      for (let i = 0; i < Math.min(10, nodes.length); i++) {
        const r = nodes[i].getBoundingClientRect();
        oneH += r.height;
        if (i > 0) oneH += gap;
      }
      oneListHeightRef.current = oneH;

      if (fillHeight) {
        container.style.height = "100%";
        lastSetContainerHRef.current = container.getBoundingClientRect().height;
        return;
      }

      // Height of visible window (visibleCount rows)
      let visH = 0;
      for (let i = 0; i < Math.min(visibleCount, nodes.length); i++) {
        const r = nodes[i].getBoundingClientRect();
        visH += r.height;
        if (i > 0) visH += gap;
      }

      // Only write if changed (prevents layout thrash/feedback)
      if (Math.abs(visH - lastSetContainerHRef.current) > 0.5) {
        container.style.height = `${visH}px`;
        lastSetContainerHRef.current = visH;
      }
    };

    // Initial measure
    measure();

    let ro = null;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => measure());
      ro.observe(container);
    }

    // Debounced window resize
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 100);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [items, visibleCount, fillHeight]);

  // Animation + interaction
  useEffect(() => {
    const container = containerRef.current;
    const runner = runnerRef.current;
    if (!container || !runner) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const effectiveSpeed = prefersReducedMotion ? 0 : speed;
    const pxPerMs = Math.max(0, effectiveSpeed) / 1000;

    if (!pxPerMs || top10.length <= 1) {
      runner.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const tick = (ts) => {
      const oneH = oneListHeightRef.current || 0;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      const now = performance.now();
      const userActive = now < userActiveUntilRef.current;

      if (!pausedHoverRef.current && !userActive && oneH > 0) {
        offsetRef.current += dt * pxPerMs;
        if (offsetRef.current >= oneH) {
          // wrap with modulo to handle long idle gaps
          offsetRef.current = offsetRef.current % oneH;
        }
      }

      runner.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    // Start loop
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    // Helpers
    const pauseOnHover = () => { pausedHoverRef.current = true; };
    const resumeAfterHover = () => {
      pausedHoverRef.current = false;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    container.addEventListener("mouseenter", pauseOnHover);
    container.addEventListener("mouseleave", resumeAfterHover);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mouseenter", pauseOnHover);
      container.removeEventListener("mouseleave", resumeAfterHover);
    };
  }, [top10.length, speed, resumeDelayMs]);

  useEffect(() => {
    const container = containerRef.current;
    const runner = runnerRef.current;
    if (!container || !runner) return;

    const onWheel = (event) => {
      if (top10.length <= 1) return;
      const oneH = oneListHeightRef.current || 0;
      const visH = lastSetContainerHRef.current || 0;
      if (!oneH || oneH <= visH + 1) return;
      if (!event.deltaY) return;

      event.preventDefault();

      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= Math.max(container.clientHeight, 1);

      offsetRef.current += delta;
      offsetRef.current = ((offsetRef.current % oneH) + oneH) % oneH;
      runner.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [top10.length, resumeDelayMs]);

  // ---- Render ----
  return (
    <div
      ref={containerRef}
      data-autoscroll
      className={`relative overflow-hidden select-none min-h-0 ${fillHeight ? "h-full" : ""} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {top10.length === 0 ? (
        <div className="text-sm opacity-60 p-2">{emptyMessage}</div>
      ) : (
        <div
          ref={runnerRef}
          className={`will-change-transform ${fillHeight ? "absolute inset-x-0 top-0" : ""}`.trim()}
        >
          {/* List A (measure & display) */}
          <ul ref={measureRef} className="space-y-2">
            {top10.map((item, i) => (
              <li
                key={`${item.id || item.title}-A-${i}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-8 h-8 rounded shrink-0" />
                  ) : item.emoji ? (
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center">
                      {item.emoji}
                    </span>
                  ) : null}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm truncate flex-1 min-w-0"
                      title={item.title}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ) : (
                    <span
                      className="text-sm truncate flex-1 min-w-0"
                      title={item.title}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </span>
                  )}
                  {item.info && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                      {item.info}
                    </span>
                  )}
                </div>
                <span
                  className="text-sm text-slate-500 dark:text-slate-400 text-right shrink-0 w-6"
                >
                  {item.trailing || `#${i + 1}`}
                </span>
              </li>
            ))}
          </ul>

          {/* List B (duplicate for seamless loop) */}
          <ul className="space-y-2" aria-hidden="true">
            {top10.map((item, i) => (
              <li
                key={`${item.id || item.title}-B-${i}`}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-8 h-8 rounded shrink-0" />
                  ) : item.emoji ? (
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center">
                      {item.emoji}
                    </span>
                  ) : null}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm truncate flex-1 min-w-0"
                      title={item.title}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  ) : (
                    <span
                      className="text-sm truncate flex-1 min-w-0"
                      title={item.title}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </span>
                  )}
                  {item.info && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                      {item.info}
                    </span>
                  )}
                </div>
                <span
                  className="text-sm text-slate-500 dark:text-slate-400 text-right shrink-0 w-6"
                >
                  {item.trailing || `#${i + 1}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Soft masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/90 dark:from-slate-900/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent" />

      <style jsx>{`
        .will-change-transform { will-change: transform; }
        div[data-autoscroll] { overscroll-behavior: auto; touch-action: pan-y; }
      `}</style>
    </div>
  );
}
