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
const PREVIEW_VERTICAL_OVERLAP = 24;
const PREVIEW_VERTICAL_OFFSET = PREVIEW_CARD_HEIGHT - PREVIEW_VERTICAL_OVERLAP;
const PREVIEW_HORIZONTAL_OFFSET = 0;
const GRID_GAP = 24;
const ROW_GAP = GRID_GAP;
const MAX_GRID_COLUMNS = 3;
const TRANSITION_DURATION = 900;
const WIDTH_EXPAND_DELAY = 160;
const SHADOW_TRANSITION_DURATION = 560;
const TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EXPANDED_SHADOW = '0 32px 60px -30px rgba(15, 23, 42, 0.55)';
const POINTER_LEAVE_DELAY = 140;

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
  activeSectionId,
  onActiveSectionChange,
  columnsInRow = 1,
  columnIndex = 0,
  rowActiveId,
}) {
  const containerRef = useRef(null);
  const measurementRef = useRef(null);
  const isControlled = typeof onActiveSectionChange === 'function' && typeof activeSectionId !== 'undefined';
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isControlled ? activeSectionId === id : internalExpanded;
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [expandedLayout, setExpandedLayout] = useState({ positions: [], height: PREVIEW_CARD_HEIGHT });
  const [containerHeight, setContainerHeight] = useState(PREVIEW_CARD_HEIGHT);
  const [containerWidth, setContainerWidth] = useState(0);
  const [previewColumnWidth, setPreviewColumnWidth] = useState(0);
  const leaveTimeoutRef = useRef(null);

  const setExpanded = useCallback(
    next => {
      if (isControlled) {
        if (next) {
          onActiveSectionChange(id);
        } else if (activeSectionId === id) {
          onActiveSectionChange(null);
        }
      } else {
        setInternalExpanded(next);
      }
    },
    [isControlled, onActiveSectionChange, id, activeSectionId]
  );

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLeaveTimeout();
    };
  }, [clearLeaveTimeout]);

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

    return PREVIEW_CARD_HEIGHT + PREVIEW_VERTICAL_OFFSET * Math.max(0, itemCount - 1);
  }, [itemCount]);

  const expandedColumns = useMemo(() => {
    if (containerWidth === 0) {
      return 1;
    }

    if (containerWidth < 520) {
      return 1;
    }

    if (containerWidth < 960) {
      return Math.min(2, itemCount);
    }

    const ideal = Math.floor(containerWidth / 360);
    return Math.min(Math.max(ideal, 2), Math.min(itemCount, 3));
  }, [containerWidth, itemCount]);

  const collapsedLayout = useMemo(() => {
    const collapsedWidth = previewColumnWidth > 0 ? `${previewColumnWidth}px` : '100%';

    return items.map((_, index) => {
      const translateX = PREVIEW_HORIZONTAL_OFFSET * index;
      const translateY = index * PREVIEW_VERTICAL_OFFSET;

      return {
        transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
        width: collapsedWidth,
      };
    });
  }, [items, previewColumnWidth]);

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

  useEffect(() => {
    if (!isExpanded && containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setPreviewColumnWidth(previous => (previous === width ? previous : width));
    }
  }, [isExpanded, containerWidth, columnsInRow]);

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
        clearLeaveTimeout();
        setExpanded(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isCoarsePointer, isExpanded, setExpanded, clearLeaveTimeout]);

  const sectionClassName = [
    'relative w-full transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:min-w-0 md:self-start data-[expanded=true]:z-10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const collapsedFlexBasis =
    columnsInRow > 1
      ? `calc((100% - ${(columnsInRow - 1) * ROW_GAP}px) / ${columnsInRow})`
      : '100%';
  const rowHasActive = Boolean(rowActiveId);
  const isSiblingOfActive = rowHasActive && rowActiveId !== id;
  const collapsedOrder = isSiblingOfActive ? 1 : columnIndex + 1;
  const sectionStyle = isExpanded
    ? { order: 2, flexBasis: '100%', flexGrow: 1, flexShrink: 1, minWidth: 0 }
    : { order: collapsedOrder, flexBasis: collapsedFlexBasis, flexGrow: 1, flexShrink: 1, minWidth: 0 };

  const handlePointerEnter = event => {
    if (isCoarsePointer || event.pointerType === 'touch') {
      return;
    }

    clearLeaveTimeout();
    setExpanded(true);
  };

  const handlePointerLeave = event => {
    if (isCoarsePointer || event.pointerType === 'touch') {
      return;
    }

    if (containerRef.current?.contains(event.relatedTarget)) {
      return;
    }

    clearLeaveTimeout();

    if (typeof window === 'undefined') {
      setExpanded(false);
      return;
    }

    leaveTimeoutRef.current = window.setTimeout(() => {
      setExpanded(false);
      leaveTimeoutRef.current = null;
    }, POINTER_LEAVE_DELAY);
  };

  const handleFocusCapture = () => {
    clearLeaveTimeout();
    setExpanded(true);
  };

  const handleBlurCapture = event => {
    if (!containerRef.current?.contains(event.relatedTarget)) {
      clearLeaveTimeout();
      setExpanded(false);
    }
  };

  const handleClickCapture = event => {
    if (!isCoarsePointer) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    clearLeaveTimeout();

    if (!isExpanded) {
      setExpanded(true);
      return;
    }

    if (isControlled) {
      if (activeSectionId === id) {
        onActiveSectionChange(null);
      }
      return;
    }

    setExpanded(false);
  };

  const gridTemplateColumns = isExpanded
    ? `repeat(${expandedColumns}, minmax(0, 1fr))`
    : `repeat(${columns}, minmax(0, 1fr))`;
  const fallbackExpandedWidth = containerWidth > 0 && expandedColumns > 0
    ? `${containerWidth / expandedColumns}px`
    : '100%';
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
          className="relative transition-[height] duration-[900ms]"
          style={{
            height: containerHeight,
            transitionTimingFunction: TRANSITION_EASING,
            transitionDuration: `${TRANSITION_DURATION}ms`,
          }}
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
              : collapsedPreview.transform;
            const expandedHeight = layoutPosition?.height ?? PREVIEW_CARD_HEIGHT;
            const cardShadow = isExpanded ? EXPANDED_SHADOW : buildPreviewShadow(index);
            const targetTransform = isExpanded ? expandedTransform : collapsedPreview.transform;
            const targetWidth = isExpanded
              ? layoutPosition
                ? `${layoutPosition.width}px`
                : fallbackExpandedWidth
              : collapsedPreview.width;
            const targetHeight = isExpanded && layoutPosition ? `${expandedHeight}px` : `${PREVIEW_CARD_HEIGHT}px`;
            const transition = [
              `transform ${TRANSITION_DURATION}ms ${TRANSITION_EASING}`,
              `width ${TRANSITION_DURATION}ms ${TRANSITION_EASING} ${WIDTH_EXPAND_DELAY}ms`,
              `height ${TRANSITION_DURATION}ms ${TRANSITION_EASING} ${WIDTH_EXPAND_DELAY}ms`,
              `box-shadow ${SHADOW_TRANSITION_DURATION}ms ease`,
            ].join(', ');

            return (
              <div
                key={key}
                className="absolute top-0 left-0"
                data-state={isExpanded ? 'expanded' : 'preview'}
                style={{
                  transform: targetTransform,
                  width: targetWidth,
                  height: targetHeight,
                  zIndex: itemCount - index,
                  transition,
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
