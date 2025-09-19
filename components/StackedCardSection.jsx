import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Section from '@/components/ui/Section';

const PREVIEW_PEEK_HEIGHT = 112;
const CASCADE_OFFSET_X = 26;
const CASCADE_OFFSET_Y = 48;
const CASCADE_ROTATION = -3.5;
const GRID_GAP = 24;
const MAX_GRID_COLUMNS = 3;
const TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

function getGridColumns(count) {
  if (count <= 1) {
    return 1;
  }

  const ideal = Math.ceil(Math.sqrt(count));
  return Math.max(2, Math.min(MAX_GRID_COLUMNS, ideal));
}

export default function StackedCardSection({
  id,
  title,
  icon,
  items = [],
  renderItem,
  keyExtractor,
  className = '',
}) {
  const containerRef = useRef(null);
  const measurementRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [expandedLayout, setExpandedLayout] = useState({ positions: [], height: 0 });
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const itemCount = items.length;
  const columns = useMemo(() => {
    if (itemCount <= 1) {
      return 1;
    }

    if (containerWidth > 0) {
      if (containerWidth < 420) {
        return 1;
      }

      if (containerWidth < 640) {
        return Math.min(itemCount, 2);
      }
    }

    return getGridColumns(itemCount);
  }, [itemCount, containerWidth]);

  const collapsedHeight = useMemo(() => {
    if (itemCount === 0) {
      return PREVIEW_PEEK_HEIGHT;
    }

    return PREVIEW_PEEK_HEIGHT + CASCADE_OFFSET_Y * Math.max(0, itemCount - 1) + 32;
  }, [itemCount]);

  const collapsedTransforms = useMemo(() => {
    return items.map((_, index) => {
      const translateX = CASCADE_OFFSET_X * index;
      const translateY = CASCADE_OFFSET_Y * index;
      const rotation = CASCADE_ROTATION * index;

      return `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`;
    });
  }, [items]);

  useEffect(() => {
    setContainerHeight(collapsedHeight);
  }, [collapsedHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerType = event => {
      setIsCoarsePointer(event.matches);
    };

    setIsCoarsePointer(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePointerType);

    return () => {
      mediaQuery.removeEventListener('change', updatePointerType);
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      setContainerHeight(expandedLayout.height || collapsedHeight);
    } else {
      setContainerHeight(collapsedHeight);
    }
  }, [isExpanded, expandedLayout.height, collapsedHeight]);

  const measureLayout = useCallback(() => {
    const measureEl = measurementRef.current;
    if (!measureEl) {
      return;
    }

    const containerRect = measureEl.getBoundingClientRect();
    const width = measureEl.offsetWidth;
    setContainerWidth(previous => (previous === width ? previous : width));
    const children = Array.from(measureEl.children);

    if (children.length === 0) {
      setExpandedLayout({ positions: [], height: 0 });
      return;
    }

    const positions = children.map(child => {
      const rect = child.getBoundingClientRect();

      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    const height = positions.reduce((accumulator, position) => {
      const bottom = position.y + position.height;
      return Math.max(accumulator, bottom);
    }, 0);

    setExpandedLayout({ positions, height });
  }, []);

  useLayoutEffect(() => {
    measureLayout();
  }, [measureLayout, columns, items]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      measureLayout();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [measureLayout]);

  useEffect(() => {
    if (!isCoarsePointer || !isExpanded) {
      return undefined;
    }

    const handleDocumentClick = event => {
      if (!containerRef.current?.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isCoarsePointer, isExpanded]);

  const sectionClassName = `h-full ${className}`.trim();

  const handlePointerEnter = event => {
    if (isCoarsePointer || event.pointerType === 'touch') {
      return;
    }

    setIsExpanded(true);
  };

  const handlePointerLeave = event => {
    if (isCoarsePointer || event.pointerType === 'touch') {
      return;
    }

    setIsExpanded(false);
  };

  const handleFocusCapture = () => {
    setIsExpanded(true);
  };

  const handleBlurCapture = event => {
    if (!containerRef.current?.contains(event.relatedTarget)) {
      setIsExpanded(false);
    }
  };

  const handleClickCapture = event => {
    if (!isCoarsePointer) {
      return;
    }

    if (!isExpanded) {
      setIsExpanded(true);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        ref={containerRef}
        className="relative"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
        onClickCapture={handleClickCapture}
      >
        <div
          className="relative transition-[height] duration-[620ms]"
          style={{ height: containerHeight, transitionTimingFunction: TRANSITION_EASING }}
        >
          {itemCount === 0 && (
            <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Nothing to display yet.
            </div>
          )}

          {items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;
            const collapsedTransform = collapsedTransforms[index] || 'translate3d(0, 0, 0)';
            const layoutPosition = expandedLayout.positions[index];
            const expandedTransform = layoutPosition
              ? `translate3d(${layoutPosition.x}px, ${layoutPosition.y}px, 0)`
              : 'translate3d(0, 0, 0)';
            const expandedHeight = layoutPosition?.height ?? PREVIEW_PEEK_HEIGHT;
            const collapsedCardHeight = Math.min(expandedHeight, PREVIEW_PEEK_HEIGHT);

            return (
              <div
                key={key}
                className="absolute top-0 left-0"
                style={{
                  transform: isExpanded ? expandedTransform : collapsedTransform,
                  width: isExpanded && layoutPosition ? `${layoutPosition.width}px` : '100%',
                  height: isExpanded ? `${expandedHeight}px` : `${collapsedCardHeight}px`,
                  zIndex: itemCount - index,
                  transition: `transform 620ms ${TRANSITION_EASING}, width 620ms ${TRANSITION_EASING}, height 620ms ${TRANSITION_EASING}, box-shadow 420ms ease`,
                }}
              >
                <div
                  className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-slate-900/30 backdrop-blur"
                >
                  <div className={isExpanded ? '' : 'pointer-events-none select-none'}>
                    {renderItem(item, index, {
                      isPreview: !isExpanded,
                      isExpanded,
                      isActive: isExpanded,
                    })}
                  </div>
                  {!isExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-950/80" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          ref={measurementRef}
          aria-hidden="true"
          className="absolute inset-0 grid opacity-0"
          style={{
            pointerEvents: 'none',
            visibility: 'hidden',
            gridTemplateColumns,
            gap: GRID_GAP,
          }}
        >
          {items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;

            return (
              <div key={key} className="h-full">
                <div className="h-full rounded-3xl border border-white/10 bg-white/5">
                  {renderItem(item, index, {
                    isPreview: false,
                    isExpanded: true,
                    isActive: true,
                    isMeasuring: true,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

