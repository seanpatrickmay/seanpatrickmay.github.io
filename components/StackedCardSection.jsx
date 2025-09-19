import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Section from '@/components/ui/Section';

const DEFAULT_BASE_GAP = 24; // matches gap-6 from Tailwind
const PREVIEW_PEEK_HEIGHT = 96; // px of each card visible while collapsed
const PREVIEW_STACK_X_OFFSET = 28; // px
const PREVIEW_STACK_Y_OFFSET = 44; // px
const PREVIEW_STACK_ROTATION = -3.5; // deg

export default function StackedCardSection({
  id,
  title,
  icon,
  items = [],
  renderItem,
  keyExtractor,
  className = '',
  baseGap = DEFAULT_BASE_GAP,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [overlayPhase, setOverlayPhase] = useState('idle');
  const shouldStack = items.length > 1;
  const sectionClassName = `h-full ${className}`.trim();
  const Icon = icon;
  const dialogLabelId = useId();
  const overlayContentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const isExpanded = activeIndex !== null && items.length > 0;
  const collapsedTransforms = useMemo(() => {
    if (!shouldStack) {
      return items.map(() => 'translate3d(0, 0, 0)');
    }

    return items.map((_, index) => {
      const translateX = PREVIEW_STACK_X_OFFSET * index;
      const translateY = PREVIEW_STACK_Y_OFFSET * index;
      const rotation = PREVIEW_STACK_ROTATION * index;

      return `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`;
    });
  }, [items, shouldStack]);
  const previewStackHeight = useMemo(() => {
    if (!shouldStack) {
      return undefined;
    }

    return PREVIEW_PEEK_HEIGHT + PREVIEW_STACK_Y_OFFSET * (items.length - 1) + 16;
  }, [shouldStack, items.length]);

  const handleActivate = index => {
    if (!items || items.length === 0) {
      return;
    }

    setActiveIndex(index);
  };

  const handleClearActive = () => {
    setActiveIndex(null);
  };

  useLayoutEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    setOverlayPhase('initial');

    const frame = requestAnimationFrame(() => {
      setOverlayPhase('entering');
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setOverlayPhase('idle');
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      return undefined;
    }

    if (typeof window !== 'undefined') {
      const handleKeyDown = event => {
        if (event.key === 'Escape') {
          handleClearActive();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return undefined;
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusTimer = setTimeout(() => {
      overlayContentRef.current?.focus?.({ preventScroll: true });
    }, 0);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [isExpanded]);

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        className="relative transition-[opacity,transform] duration-300 ease-out"
        style={{
          opacity: isExpanded ? 0 : 1,
          transform: isExpanded ? 'scale(0.97) translateY(-6px)' : 'scale(1) translateY(0)',
          pointerEvents: isExpanded ? 'none' : 'auto',
        }}
        aria-hidden={isExpanded}
      >
        <div className="relative" style={{ minHeight: previewStackHeight }}>
          {items.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index;
            const collapsedTransform = collapsedTransforms[index] || 'translate3d(0, 0, 0)';
            const baseStyle = shouldStack
              ? {
                  position: 'absolute',
                  insetInline: 0,
                  top: 0,
                  transform: collapsedTransform,
                  zIndex: items.length - index,
                  transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                }
              : {
                  position: 'relative',
                  marginTop: index === 0 ? 0 : baseGap,
                  transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
                };

            return (
              <div
                key={key}
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                style={baseStyle}
                onMouseEnter={() => handleActivate(index)}
                onFocusCapture={() => handleActivate(index)}
                onBlurCapture={event => {
                  if (overlayContentRef.current?.contains(event.relatedTarget)) {
                    return;
                  }

                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    handleClearActive();
                  }
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleActivate(index);
                  }
                }}
                onClick={() => handleActivate(index)}
                tabIndex={0}
              >
                <div
                  className="relative overflow-hidden rounded-3xl shadow-xl shadow-slate-950/35 transition-[box-shadow,filter] duration-500 ease-out"
                  style={{ maxHeight: shouldStack ? PREVIEW_PEEK_HEIGHT : undefined }}
                >
                  {shouldStack && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/80"
                      aria-hidden="true"
                    />
                  )}
                  <div className={`${shouldStack ? 'pointer-events-none select-none' : ''}`.trim()}>
                    {renderItem(item, index, {
                      isPreview: true,
                      isExpanded: false,
                      isActive: activeIndex === index,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:px-6 md:px-10">
          <div
            className="absolute inset-0 cursor-pointer"
            aria-hidden="true"
            onClick={handleClearActive}
          >
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" />
          </div>
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            aria-hidden="true"
          >
            <div
              className="h-[min(90vh,48rem)] w-[min(90vw,72rem)] max-w-full rounded-[32px]"
              style={{
                boxShadow:
                  '0 40px 140px rgba(15, 23, 42, 0.55), 0 0 0 9999px rgba(15, 23, 42, 0.65)',
              }}
            />
          </div>
          <div
            ref={overlayContentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogLabelId}
            tabIndex={-1}
            className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-slate-900/80 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55),0_0_0_9999px_rgba(15,23,42,0.55)] backdrop-blur-xl"
            style={{
              transform:
                overlayPhase === 'initial' ? 'translateY(32px) scale(0.95)' : 'translateY(0) scale(1)',
              opacity: overlayPhase === 'initial' ? 0 : 1,
              transition:
                'transform 520ms cubic-bezier(0.16, 1, 0.3, 1), opacity 360ms ease-out',
            }}
          >
            <div className="flex items-center gap-3 mb-6 text-white">
              {Icon && (
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <h2 id={dialogLabelId} className="text-2xl font-semibold">
                {title}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 auto-rows-fr sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => {
                const key = keyExtractor ? keyExtractor(item, index) : index;
                const initialTransform = collapsedTransforms[index] || 'translate3d(0, 0, 0)';
                const transitionDelay =
                  overlayPhase === 'entering' ? `${index * 50}ms` : '0ms';

                return (
                  <div
                    key={key}
                    className="h-full transition-[transform,opacity] duration-500 ease-out"
                    style={{
                      transform:
                        overlayPhase === 'initial' ? initialTransform : 'translate3d(0, 0, 0)',
                      opacity: overlayPhase === 'initial' ? 0 : 1,
                      transitionDelay,
                    }}
                  >
                    <div className="h-full [&>div]:h-full [&>div]:flex [&>div]:flex-col">
                      {renderItem(item, index, {
                        isPreview: false,
                        isExpanded: true,
                        isActive: activeIndex === index,
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
