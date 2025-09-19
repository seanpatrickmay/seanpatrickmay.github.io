import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Section from '@/components/ui/Section';

const DEFAULT_BASE_GAP = 24;
const STACK_PEEK_HEIGHT = 124;
const STACK_Y_OFFSET = 44;
const STACK_X_OFFSET = 18;
const COLLAPSED_GAP = 6;
const MAX_GRID_COLUMNS = 3;
const EXPANDED_CARD_MAX_HEIGHT = 1400;

const isBrowser = typeof window !== 'undefined';
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

function computeColumnCount(count) {
  if (!count) {
    return 1;
  }

  const approximateSquare = Math.ceil(Math.sqrt(count));
  return Math.min(MAX_GRID_COLUMNS, Math.max(1, approximateSquare));
}

export default function StackedCardSection({
  id,
  title,
  icon,
  items = [],
  renderItem,
  keyExtractor,
  className = '',
  baseGap = DEFAULT_BASE_GAP,
  activeSectionId,
  setActiveSectionId,
  isTouchDevice = false,
}) {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [localActive, setLocalActive] = useState(false);

  const isControlled =
    typeof activeSectionId !== 'undefined' && typeof setActiveSectionId === 'function';
  const isExpanded = isControlled ? activeSectionId === id : localActive;

  const collapsedHeight = useMemo(() => {
    if (!items.length) {
      return 0;
    }

    return STACK_PEEK_HEIGHT + STACK_Y_OFFSET * Math.max(0, items.length - 1) + 24;
  }, [items.length]);

  const gridColumns = isExpanded ? computeColumnCount(items.length) : 1;
  const gapValue = isExpanded ? baseGap : COLLAPSED_GAP;

  const collapsedTransforms = useMemo(
    () =>
      items.map((_, index) => {
        const translateX = STACK_X_OFFSET * index;
        const translateY = STACK_Y_OFFSET * index;
        const rotation = (index % 2 === 0 ? -1 : 1) * (4 + index * 0.35);

        return `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`;
      }),
    [items],
  );

  const activate = useCallback(() => {
    if (!items.length) {
      return;
    }

    if (isControlled) {
      setActiveSectionId(previous => (previous === id ? previous : id));
    } else {
      setLocalActive(true);
    }
  }, [id, isControlled, items.length, setActiveSectionId]);

  const deactivate = useCallback(() => {
    if (isControlled) {
      setActiveSectionId(previous => (previous === id ? null : previous));
    } else {
      setLocalActive(false);
    }
  }, [id, isControlled, setActiveSectionId]);

  const toggle = useCallback(() => {
    if (!items.length) {
      return;
    }

    if (isControlled) {
      setActiveSectionId(previous => (previous === id ? null : id));
    } else {
      setLocalActive(value => !value);
    }
  }, [id, isControlled, items.length, setActiveSectionId]);

  useIsomorphicLayoutEffect(() => {
    const node = gridRef.current;
    if (!node) {
      return undefined;
    }

    const measure = () => {
      setContentHeight(node.scrollHeight);
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        measure();
      });

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }

    if (isBrowser) {
      window.addEventListener('resize', measure);

      return () => {
        window.removeEventListener('resize', measure);
      };
    }

    return undefined;
  }, [items.length]);

  useEffect(() => {
    if (!isBrowser || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      setReduceMotion(media.matches);
    };

    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);

      return () => {
        media.removeEventListener('change', update);
      };
    }

    media.addListener(update);

    return () => {
      media.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (!isTouchDevice || !isExpanded) {
      return undefined;
    }

    const handlePointerDown = event => {
      const sectionNode = sectionRef.current;

      if (!sectionNode || sectionNode.contains(event.target)) {
        return;
      }

      deactivate();
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [deactivate, isExpanded, isTouchDevice]);

  const handleMouseEnter = () => {
    if (isTouchDevice) {
      return;
    }

    activate();
  };

  const handleMouseLeave = event => {
    if (isTouchDevice) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (
      sectionRef.current &&
      nextTarget &&
      typeof Node !== 'undefined' &&
      nextTarget instanceof Node &&
      sectionRef.current.contains(nextTarget)
    ) {
      return;
    }

    deactivate();
  };

  const handleFocusCapture = () => {
    if (isTouchDevice) {
      return;
    }

    activate();
  };

  const handleBlurCapture = event => {
    if (isTouchDevice) {
      return;
    }

    if (
      sectionRef.current &&
      typeof Node !== 'undefined' &&
      event.relatedTarget instanceof Node &&
      sectionRef.current.contains(event.relatedTarget)
    ) {
      return;
    }

    deactivate();
  };

  const handleClick = event => {
    if (!isTouchDevice) {
      return;
    }

    const gridNode = gridRef.current;
    const clickedInsideGrid = gridNode?.contains(event.target);

    if (!isExpanded) {
      toggle();
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!clickedInsideGrid) {
      deactivate();
      event.preventDefault();
    }
  };

  const transitionDuration = reduceMotion ? 0 : 540;
  const transitionTiming = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const maxHeightValue =
    isExpanded && contentHeight ? contentHeight : collapsedHeight;

  const sectionClassName = `h-full ${className}`.trim();

  return (
    <Section
      id={id}
      title={title}
      icon={icon}
      className={sectionClassName}
      ref={sectionRef}
    >
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        onClick={handleClick}
        aria-expanded={isExpanded}
      >
        <div
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_18px_48px_rgba(15,23,42,0.28)] backdrop-blur-sm transition-[box-shadow,background-color,padding] dark:bg-slate-950/40"
          style={{
            padding: isExpanded ? '1.75rem' : '1rem',
            maxHeight: maxHeightValue ? `${maxHeightValue}px` : undefined,
            boxShadow: isExpanded
              ? '0 32px 85px rgba(15, 23, 42, 0.45)'
              : '0 18px 48px rgba(15, 23, 42, 0.28)',
            transition: transitionDuration
              ? `max-height ${transitionDuration}ms ${transitionTiming}, padding ${Math.max(
                  280,
                  transitionDuration - 120,
                )}ms ease, box-shadow ${transitionDuration}ms ease`
              : 'none',
          }}
        >
          <div
            ref={gridRef}
            className="relative grid items-stretch"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
              gap: `${gapValue}px`,
              transition: transitionDuration ? `gap ${transitionDuration}ms ease` : 'none',
            }}
          >
            {items.map((item, index) => {
              const key = keyExtractor ? keyExtractor(item, index) : index;
              const transform = isExpanded
                ? 'translate3d(0, 0, 0) rotate(0deg)'
                : collapsedTransforms[index] || 'translate3d(0, 0, 0)';

              return (
                <div
                  key={key}
                  className="relative"
                  style={{
                    transform,
                    zIndex: isExpanded ? 'auto' : items.length - index,
                    transition: transitionDuration
                      ? `transform ${transitionDuration}ms ${transitionTiming}, filter 320ms ease, opacity 320ms ease`
                      : 'none',
                  }}
                >
                  <div
                    className="relative h-full overflow-hidden rounded-3xl shadow-[0_16px_36px_rgba(15,23,42,0.24)] transition-[max-height,box-shadow] duration-500 ease-out"
                    style={{
                      maxHeight: isExpanded ? EXPANDED_CARD_MAX_HEIGHT : STACK_PEEK_HEIGHT,
                      pointerEvents: isExpanded ? 'auto' : 'none',
                    }}
                  >
                    <div className={`${!isExpanded ? 'pointer-events-none select-none' : ''}`}>
                      {renderItem(item, index, {
                        isExpanded,
                        isPreview: !isExpanded,
                        isActive: isExpanded,
                      })}
                    </div>
                    {!isExpanded && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-950/65 dark:to-slate-950" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
