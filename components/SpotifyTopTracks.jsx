// components/SpotifyTopTracks.jsx
import React, { useEffect, useRef } from "react";

export default function SpotifyTopTracks({
  tracks = [],          // [{ id, name, artists, image, url }]
  visibleCount = 5,     // rows visible
  speed = 10,           // px/sec
  resumeDelayMs = 2000,
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);  // first list (for measuring)
  const runnerRef = useRef(null);   // wrapper that we translate
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const offsetRef = useRef(0);
  const oneListHeightRef = useRef(0);
  const pausedHoverRef = useRef(false);
  const userActiveUntilRef = useRef(0);
  const lastSetContainerHRef = useRef(0);

  // Compute arrays but DO NOT early-return before hooks
  const top10 = tracks.slice(0, 10);
  const doubled = [...top10, ...top10];

  // Measure once (and on window resize)
  useEffect(() => {
    const container = containerRef.current;
    const measureList = measureRef.current;
    if (!container || !measureList) return;

    const measure = () => {
      const items = measureList.querySelectorAll("li");
      if (!items.length) return;

      const gap = items[1] ? parseFloat(getComputedStyle(items[1]).marginTop) : 0;

      // Height of ONE list (top10)
      let oneH = 0;
      for (let i = 0; i < Math.min(10, items.length); i++) {
        const r = items[i].getBoundingClientRect();
        oneH += r.height;
        if (i > 0) oneH += gap;
      }
      oneListHeightRef.current = oneH;

      // Height of visible window (visibleCount rows)
      let visH = 0;
      for (let i = 0; i < Math.min(visibleCount, items.length); i++) {
        const r = items[i].getBoundingClientRect();
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

    // Debounced window resize
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 100);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, [tracks, visibleCount]);

  // Animation + interaction
  useEffect(() => {
    const container = containerRef.current;
    const runner = runnerRef.current;
    if (!container || !runner) return;

    const pxPerMs = Math.max(0, speed) / 1000;

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
    const nudge = (deltaY) => {
      const oneH = oneListHeightRef.current || 0;
      if (!oneH) return;
      offsetRef.current = ((offsetRef.current + deltaY) % oneH + oneH) % oneH;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    // Non-passive to trap scroll inside component
    const onWheel = (e) => {
      e.preventDefault();
      nudge(e.deltaY);
    };

    // Touch scrolling
    let lastTouchY = 0;
    const onTouchStart = (e) => {
      if (e.touches?.length) lastTouchY = e.touches[0].clientY;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };
    const onTouchMove = (e) => {
      if (!e.touches?.length) return;
      const y = e.touches[0].clientY;
      const dy = lastTouchY - y;
      lastTouchY = y;
      e.preventDefault();
      nudge(dy);
    };
    const onTouchEnd = () => {
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    container.addEventListener("mouseenter", pauseOnHover);
    container.addEventListener("mouseleave", resumeAfterHover);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mouseenter", pauseOnHover);
      container.removeEventListener("mouseleave", resumeAfterHover);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [tracks, speed, resumeDelayMs]);

  // ---- Render ----
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      aria-label="Top Spotify Tracks"
    >
      {top10.length === 0 ? (
        <div className="text-sm opacity-60 p-2">No top tracks yet</div>
      ) : (
        <div ref={runnerRef} className="will-change-transform">
          {/* List A (measure & display) */}
          <ul ref={measureRef} className="space-y-2">
            {top10.map((t, i) => (
              <li key={`${t.id || t.name}-A-${i}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {t.image && <img src={t.image} alt="" className="w-8 h-8 rounded shrink-0" />}
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm truncate"
                    title={`${t.name} — ${t.artists || ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-medium">{t.name}</span>
                    {t.artists && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {" "}– {t.artists}
                      </span>
                    )}
                  </a>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 w-6 text-right shrink-0">
                  #{i + 1}
                </span>
              </li>
            ))}
          </ul>

          {/* List B (duplicate for seamless loop) */}
          <ul className="space-y-2">
            {top10.map((t, i) => (
              <li key={`${t.id || t.name}-B-${i}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {t.image && <img src={t.image} alt="" className="w-8 h-8 rounded shrink-0" />}
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm truncate"
                    title={`${t.name} — ${t.artists || ""}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-medium">{t.name}</span>
                    {t.artists && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {" "}– {t.artists}
                      </span>
                    )}
                  </a>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 w-6 text-right shrink-0">
                  #{i + 1}
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
        /* prevent scroll chaining to the page */
        div[aria-label="Top Spotify Tracks"] { overscroll-behavior: contain; touch-action: none; }
      `}</style>
    </div>
  );
}

