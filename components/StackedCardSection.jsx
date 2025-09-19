import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Section from '@/components/ui/Section';

const PREVIEW_CARD_HEIGHT = 72;
const PREVIEW_VERTICAL_GAP = 12;
const PREVIEW_HORIZONTAL_OFFSET = 16;
const GRID_GAP = 24;
const MAX_GRID_COLUMNS = 3;
const TRANSITION_DURATION = 520;
const TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EXPANDED_SHADOW = '0 32px 60px -30px rgba(15, 23, 42, 0.55)';

function buildPreviewShadow(index) {
  const offset = 8 + index * 3;
  const blur = 18 + index * 4;
  return `0 ${offset}px ${blur}px -28px rgba(15, 23, 42, 0.35)`;
}

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
  const [expandedLayout, setExpandedLayout] = useState({ positions: [], height: PREVIEW_CARD_HEIGHT });
  const [containerHeight, setContainerHeight] = useState(PREVIEW_CARD_HEIGHT);
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
      return PREVIEW_CARD_HEIGHT;
    }

    return PREVIEW_CARD_HEIGHT * itemCount + PREVIEW_VERTICAL_GAP * Math.max(0, itemCount - 1);
  }, [itemCount]);

  const collapsedLayout = useMemo(() => {
    return items.map((_, index) => {
      const translateX = PREVIEW_HORIZONTAL_OFFSET * index;
      const translateY = index * (PREVIEW_CARD_HEIGHT + PREVIEW_VERTICAL_GAP);

      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        width: index === 0 ? '100%' : `calc(100% - ${translateX}px)`,
      };
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
      const measuredHeight = expandedLayout.height || PREVIEW_CARD_HEIGHT;
      setContainerHeight(Math.max(collapsedHeight, measuredHeight));
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
      setExpandedLayout({ positions: [], height: PREVIEW_CARD_HEIGHT });
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

    setExpandedLayout({ positions, height: Math.max(height, PREVIEW_CARD_HEIGHT) });
  }, []);

  useLayoutEffect(() => {
    measureLayout();
  }, [measureLayout, columns, items, isExpanded]);

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

  const sectionClassName = [
    'relative transition-[grid-column,transform] duration-500 md:col-span-1 data-[expanded=true]:md:col-span-2 data-[expanded=true]:z-10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sectionStyle = isExpanded ? { order: -1 } : undefined;

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
  const renderState = {
    mode: isExpanded ? 'expanded' : 'preview',
    isExpanded,
    isPreview: !isExpanded,
    isActive: isExpanded,
    isMeasuring: false,
  };

  return (
    <Section
      id={id}
      title={title}
      icon={icon}
      className={sectionClassName}
      data-expanded={isExpanded ? 'true' : 'false'}
      aria-expanded={isExpanded}
      style={sectionStyle}
    >
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
          className="relative transition-[height] duration-[520ms]"
          style={{ height: containerHeight, transitionTimingFunction: TRANSITION_EASING }}
        >
          {itemCount === 0 && (
            <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Nothing to display yet.
            </div>
          )}

          {items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;
            const collapsedPreview = collapsedLayout[index] || {
              transform: 'translate3d(0, 0, 0)',
              width: '100%',
            };
            const layoutPosition = expandedLayout.positions[index];
            const expandedTransform = layoutPosition
              ? `translate3d(${layoutPosition.x}px, ${layoutPosition.y}px, 0)`
              : 'translate3d(0, 0, 0)';
            const expandedHeight = layoutPosition?.height ?? PREVIEW_CARD_HEIGHT;
            const cardShadow = isExpanded ? EXPANDED_SHADOW : buildPreviewShadow(index);

            return (
              <div
                key={key}
                className="absolute top-0 left-0"
                data-state={isExpanded ? 'expanded' : 'preview'}
                style={{
                  transform: isExpanded ? expandedTransform : collapsedPreview.transform,
                  width: isExpanded && layoutPosition ? `${layoutPosition.width}px` : collapsedPreview.width,
                  height: isExpanded ? `${expandedHeight}px` : `${PREVIEW_CARD_HEIGHT}px`,
                  zIndex: itemCount - index,
                  transition: `transform ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, width ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, height ${TRANSITION_DURATION}ms ${TRANSITION_EASING}, box-shadow 360ms ease`,
                  boxShadow: cardShadow,
                  willChange: 'transform, width, height',
                }}
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className={isExpanded ? 'h-full' : 'pointer-events-none select-none h-full'}>
                    {renderItem(item, index, renderState)}
                  </div>
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
                    mode: 'expanded',
                    isExpanded: true,
                    isPreview: false,
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
