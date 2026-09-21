// components/AutoScrollShelf.jsx
//
// Horizontal sibling of AutoScrollList: same auto-scroll / hover-pause /
// wheel-scrub behaviour, but translating on X so a row of book covers drifts
// sideways like a shelf. Differences that matter:
//
//  - A shelf usually holds fewer items than its own width, so instead of a
//    fixed A/B duplicate this measures one set and repeats it enough times to
//    cover the viewport twice. Too few items to overflow => no animation at
//    all, which is the right call for a 3-book shelf in a wide card.
//  - Pointer drag is supported, because horizontal wheel input is awkward on
//    a plain mouse.
import { useEffect, useRef, useState } from 'react';

const MIN_COPIES = 2;
const MAX_COPIES = 8;

export default function AutoScrollShelf({
  items = [], // [{ id, title, subtitle, image, url, badge }]
  speed = 14, // px per second
  // Hold on the first cover long enough to read it, matching AutoScrollList.
  startDelayMs = 2600,
  resumeDelayMs = 2000,
  ariaLabel = 'Auto scrolling shelf',
  emptyMessage = 'Nothing here yet',
  coverClassName = 'h-[76px] w-[52px]',
  className = '',
}) {
  const containerRef = useRef(null);
  const runnerRef = useRef(null);
  const measureRef = useRef(null);

  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const offsetRef = useRef(0);
  const oneSetWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const pausedHoverRef = useRef(false);
  const userActiveUntilRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const startTsRef = useRef(0);

  const [copies, setCopies] = useState(MIN_COPIES);
  const [overflows, setOverflows] = useState(false);

  // Measure one set and decide how many copies are needed to loop seamlessly.
  useEffect(() => {
    const container = containerRef.current;
    const measureSet = measureRef.current;
    if (!container || !measureSet) return;

    const measure = () => {
      const width = measureSet.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;
      if (!width || !containerWidth) return;

      // Include the gap that follows the set, otherwise the seam is tight.
      const styles = getComputedStyle(measureSet);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const setWidth = width + gap;

      oneSetWidthRef.current = setWidth;
      containerWidthRef.current = containerWidth;

      // The runner wraps once it has travelled one full set, so the rendered
      // strip must still cover the viewport at that point:
      //   copies * setWidth >= containerWidth + setWidth
      // The +1 is that trailing set; anything less shows a gap at the seam.
      const needed = Math.ceil(containerWidth / setWidth) + 1;
      setCopies(Math.min(MAX_COPIES, Math.max(MIN_COPIES, needed)));
      setOverflows(setWidth > containerWidth + 1);
    };

    measure();

    let ro = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => measure());
      ro.observe(container);
      ro.observe(measureSet);
    }

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 100);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [items]);

  // Animation loop.
  useEffect(() => {
    const container = containerRef.current;
    const runner = runnerRef.current;
    if (!container || !runner) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pxPerMs = prefersReducedMotion ? 0 : Math.max(0, speed) / 1000;

    // A shelf that fits has nothing to scroll to.
    if (!pxPerMs || !overflows || items.length <= 1) {
      offsetRef.current = 0;
      runner.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    const tick = ts => {
      const setWidth = oneSetWidthRef.current || 0;
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      if (!startTsRef.current) startTsRef.current = ts;
      const dwellOver = ts - startTsRef.current >= startDelayMs;

      const userActive = performance.now() < userActiveUntilRef.current;
      if (dwellOver && !pausedHoverRef.current && !userActive && !dragRef.current.active && setWidth > 0) {
        offsetRef.current = (offsetRef.current + dt * pxPerMs) % setWidth;
      }

      runner.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTsRef.current = 0;
    startTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    const pause = () => {
      pausedHoverRef.current = true;
    };
    const resume = () => {
      pausedHoverRef.current = false;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);
    container.addEventListener('focusin', pause);
    container.addEventListener('focusout', resume);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
      container.removeEventListener('focusin', pause);
      container.removeEventListener('focusout', resume);
    };
  }, [items.length, speed, startDelayMs, resumeDelayMs, overflows, copies]);

  // Wheel + pointer drag scrubbing.
  useEffect(() => {
    const container = containerRef.current;
    const runner = runnerRef.current;
    if (!container || !runner || !overflows) return;

    const applyOffset = delta => {
      const setWidth = oneSetWidthRef.current || 0;
      if (!setWidth) return;
      offsetRef.current = ((offsetRef.current + delta) % setWidth + setWidth) % setWidth;
      runner.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    // Trackpads send deltaX; a plain mouse only has deltaY, so honour both
    // rather than swallowing the gesture.
    const onWheel = event => {
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!raw) return;
      let delta = raw;
      if (event.deltaMode === 1) delta *= 16;
      if (event.deltaMode === 2) delta *= Math.max(container.clientWidth, 1);
      applyOffset(delta);
    };

    const onPointerDown = event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragRef.current = {
        active: true,
        startX: event.clientX,
        startOffset: offsetRef.current,
        moved: false,
      };
    };

    const onPointerMove = event => {
      const drag = dragRef.current;
      if (!drag.active) return;
      const dx = event.clientX - drag.startX;
      if (Math.abs(dx) > 3) drag.moved = true;
      const setWidth = oneSetWidthRef.current || 0;
      if (!setWidth) return;
      const next = drag.startOffset - dx;
      offsetRef.current = ((next % setWidth) + setWidth) % setWidth;
      runner.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const endDrag = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      userActiveUntilRef.current = performance.now() + resumeDelayMs;
    };

    // Suppress the click that ends a drag so dragging never opens a book.
    const onClickCapture = event => {
      if (dragRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.moved = false;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    container.addEventListener('click', onClickCapture, true);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      container.removeEventListener('click', onClickCapture, true);
    };
  }, [overflows, resumeDelayMs]);

  if (!items.length) {
    return <div className="py-2 text-xs text-stone-500 dark:text-stone-400">{emptyMessage}</div>;
  }

  const renderBook = (item, index, copyIndex) => {
    const key = `${item.id ?? item.title}-${copyIndex}-${index}`;
    const inner = (
      <>
        <div
          className={`relative ${coverClassName} flex-none overflow-hidden rounded-[3px] bg-stone-200 shadow-[0_2px_5px_rgba(28,25,23,0.28)] ring-1 ring-black/10 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_6px_14px_rgba(28,25,23,0.32)] dark:bg-stone-700 dark:ring-white/10`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              draggable="false"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] font-semibold leading-tight text-stone-600 dark:text-stone-200">
              {item.title}
            </span>
          )}
          {/* page-edge sheen down the spine side */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-black/25 to-transparent"
          />
          {item.badge && (
            <span className="absolute bottom-0 right-0 rounded-tl bg-black/65 px-1 text-[9px] font-semibold leading-[13px] text-amber-300">
              {item.badge}
            </span>
          )}
        </div>
        <div className="mt-1.5 w-[52px] flex-none">
          <div className="truncate text-[10px] font-semibold leading-tight text-stone-800 group-hover:text-teal-600 dark:text-stone-100 dark:group-hover:text-teal-400">
            {item.title}
          </div>
          {item.subtitle && (
            <div className="truncate text-[9px] leading-tight text-stone-500 dark:text-stone-400">
              {item.subtitle}
            </div>
          )}
        </div>
      </>
    );

    const shared = 'group flex flex-none flex-col';

    return item.url ? (
      <a
        key={key}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={shared}
        title={item.subtitle ? `${item.title} — ${item.subtitle}` : item.title}
        tabIndex={copyIndex === 0 ? 0 : -1}
        aria-hidden={copyIndex === 0 ? undefined : 'true'}
      >
        {inner}
      </a>
    ) : (
      <div key={key} className={shared} title={item.title} aria-hidden={copyIndex === 0 ? undefined : 'true'}>
        {inner}
      </div>
    );
  };

  const sets = Array.from({ length: overflows ? copies : 1 });

  return (
    <div
      ref={containerRef}
      data-autoscroll-shelf
      className={`relative select-none overflow-hidden ${overflows ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
      style={
        overflows
          ? {
              maskImage:
                'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            }
          : undefined
      }
    >
      <div ref={runnerRef} className="flex w-max gap-3 will-change-transform">
        {sets.map((_, copyIndex) => (
          <div
            key={`set-${copyIndex}`}
            ref={copyIndex === 0 ? measureRef : undefined}
            className="flex flex-none gap-3"
          >
            {items.map((item, index) => renderBook(item, index, copyIndex))}
          </div>
        ))}
      </div>
    </div>
  );
}
