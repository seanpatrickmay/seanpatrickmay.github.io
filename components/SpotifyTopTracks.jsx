// components/SpotifyTopTracks.jsx
import React, { useEffect, useRef } from "react";

export default function SpotifyTopTracks({
  tracks = [],
  visibleCount = 5,
  speed = 15,          // px/sec
  resumeDelayMs = 2000,
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const runnerRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const offsetRef = useRef(0);
  const listHeightRef = useRef(0);
  const pausedHoverRef = useRef(false);
  const userActiveUntilRef = useRef(0);

  const top10 = tracks.slice(0, 10);
  if (!top10.length) return null;

  useEffect(() => {
    const container = containerRef.current;
    const measureList = measureRef.current;
    const runner = runnerRef.current;
    if (!container || !measureList || !runner) return;

    // Measure: single list height & container visible height (5 rows)
    const measure = () => {
      const items = measureList.querySelectorAll("li");
      if (!items.length) return;
      const gap = items[1] ? parseFloat(getComputedStyle(items[1]).marginTop) : 0;

      let oneH = 0;
      for (let i = 0; i < Math.min(10, items.length); i++) {
        oneH += items[i].getBoundingClientRect().height;
        if (i > 0) oneH += gap;
      }
      listHeightRef.current = oneH;

      let visH = 0;
      for (let i = 0; i < Math.min(visibleCount, items.length); i++) {
        visH += items[i].getBoundingClientRect().height;
        if (i > 0) visH += gap;
      }
      container.style.height = `${visH}px`;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);

    // Animation loop (transform translate3d for GPU-smooth motion)
    const pxPerMs = Math.max(0, speed) / 1000;
    const tick = (ts) => {
      const oneH = listHeightRef.current || 0;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      const now = performance.now();
      const userActive = now < userActiveUntilRef.current;

      if (!pausedHoverRef.current && !userActive && oneH > 0) {
        offsetRef.current += dt * pxPerMs;
        if (offsetRef.current >= oneH) offsetRef.current %= oneH; // wrap
      }

      runner.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Helpers
    const pauseOnHover = () => { pausedHoverRef.current = true; };
    const resumeAfterHover = () => {
      pausedHoverRef.current = false;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };
    const nudge = (deltaY) => {
      const oneH = listHeightRef.current || 0;
      if (!oneH) return;
      offsetRef.current = ((offsetRef.current + deltaY) % oneH + oneH) % oneH;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    // Wheel: prevent page scroll & nudge our list
    const onWheel = (e) => {
      e.preventDefault();               // <-- stops page from scrolling
      nudge(e.deltaY);
    };

    // Touch: prevent page scroll & nudge
    let lastTouchY = 0;
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length) lastTouchY = e.touches[0].clientY;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };
    const onTouchMove = (e) => {
      if (!e.touches || !e.touches.length) return;
      e.preventDefault();               // <-- stops page scroll on touch
      const y = e.touches[0].clientY;
      const dy = lastTouchY - y;        // swipe up => positive
      lastTouchY = y;
      nudge(dy);
    };
    const onTouchEnd = () => {
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    // Attach native listeners (non-passive so we can preventDefault)
    container.addEventListener("mouseenter", pauseOnHover);
    container.addEventListener("mouseleave", resumeAfterHover);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener("mouseenter", pauseOnHover);
      container.removeEventListener("mouseleave", resumeAfterHover);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [tracks, visibleCount, speed, resumeDelayMs]);

  // Render two copies for seamless loop
  const doubled = [...top10, ...top10];

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      aria-label="Top Spotify Tracks"
    >
      <div ref={runnerRef} className="will-change-transform">
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

      {/* Soft masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/90 dark:from-slate-900/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent" />

      <style jsx>{`
        .will-change-transform { will-change: transform; }
        /* Prevent scroll chaining to the page & disable native touch panning inside */
        div[aria-label="Top Spotify Tracks"] {
          overscroll-behavior: contain;
          touch-action: none;
        }
      `}</style>
    </div>
  );
}

