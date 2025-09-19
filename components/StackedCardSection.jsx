import { useEffect, useId, useRef, useState } from 'react';
import Section from '@/components/ui/Section';

const PREVIEW_PEEK_HEIGHT = 96; // px of each card visible while collapsed
const PREVIEW_VERTICAL_STEP = 54; // distance between preview card peeks
const PREVIEW_HORIZONTAL_STEP = 20; // lateral offset to create a diagonal stack
const PREVIEW_ROTATION_BASE = -6; // degrees applied to the top card
const PREVIEW_ROTATION_STEP = 2.4; // additional rotation per card in the stack
const PREVIEW_CARD_RADIUS = 20; // px radius for clipped previews
const OVERLAY_ENTRY_SCALE = 0.92; // slight scale when cards animate in
const OVERLAY_CARD_DELAY = 45; // stagger delay in ms for overlay grid

export default function StackedCardSection({
  id,
  title,
  icon,
  items = [],
  renderItem,
  keyExtractor,
  className = '',
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [overlayEntered, setOverlayEntered] = useState(false);
  const shouldStack = items.length > 1;
  const sectionClassName = `h-full ${className}`.trim();
  const Icon = icon;
  const dialogLabelId = useId();
  const overlayContentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const isExpanded = activeIndex !== null && items.length > 0;

  const previewHeight = shouldStack
    ? PREVIEW_PEEK_HEIGHT + (items.length - 1) * PREVIEW_VERTICAL_STEP
    : undefined;

  const getPreviewTransform = index => {
    if (!shouldStack) {
      return 'translate3d(0, 0, 0) rotate(0deg)';
    }

    const translateX = index * PREVIEW_HORIZONTAL_STEP;
    const translateY = index * PREVIEW_VERTICAL_STEP;
    const rotate = PREVIEW_ROTATION_BASE + index * PREVIEW_ROTATION_STEP;

    return `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`;
  };

  const handleActivate = index => {
    if (!items || items.length === 0) {
      return;
    }

    setActiveIndex(index);
  };

  const handleClearActive = () => {
    setActiveIndex(null);
  };

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

  useEffect(() => {
    if (!isExpanded) {
      setOverlayEntered(false);
      return undefined;
    }

    if (typeof window === 'undefined') {
      setOverlayEntered(true);
      return undefined;
    }

    let frameId = window.requestAnimationFrame(() => {
      setOverlayEntered(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isExpanded]);

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        className="relative transition-[opacity,transform] duration-500 ease-out"
        style={{
          opacity: isExpanded ? 0 : 1,
          transform: isExpanded ? 'scale(0.99) translateY(-4px)' : 'scale(1) translateY(0)',
          pointerEvents: isExpanded ? 'none' : 'auto',
          height: shouldStack && previewHeight ? `${previewHeight}px` : undefined,
          overflow: 'visible',
        }}
        aria-hidden={isExpanded}
      >
        {items.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          const previewTransform = getPreviewTransform(index);
          const style = shouldStack
            ? {
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                transform: previewTransform,
                zIndex: items.length - index,
                transition: 'transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                willChange: 'transform',
              }
            : {
                transform: previewTransform,
                transition: 'transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)',
              };

          return (
            <div
              key={key}
              className="relative cursor-pointer"
              style={style}
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
              onClick={() => handleActivate(index)}
            >
              <div
                className="transition-all duration-500 ease-out"
                style={
                  shouldStack
                    ? {
                        maxHeight: `${PREVIEW_PEEK_HEIGHT}px`,
                        overflow: 'hidden',
                        borderRadius: `${PREVIEW_CARD_RADIUS}px`,
                        boxShadow: '0 24px 56px -30px rgba(15, 23, 42, 0.55)',
                        transformOrigin: 'top center',
                      }
                    : undefined
                }
              >
                {renderItem(item, index, {
                  isPreview: true,
                  isExpanded: false,
                  isActive: activeIndex === index,
                })}
              </div>
            </div>
          );
        })}
      </div>
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:px-6 md:px-10"
        >
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={handleClearActive}
            onMouseEnter={handleClearActive}
          />
          <div
            ref={overlayContentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogLabelId}
            tabIndex={-1}
            className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/80 p-6 shadow-2xl shadow-[0_0_0_100vmax_rgba(15,23,42,0.72)] backdrop-blur"
          >
            <div className="flex items-center gap-3 mb-6 text-white">
              {Icon && (
                <div className="p-2 rounded-xl bg-white/10">
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
                const previewTransform = getPreviewTransform(index);
                const overlayTransform = overlayEntered
                  ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)'
                  : `${previewTransform} scale(${OVERLAY_ENTRY_SCALE})`;

                return (
                  <div
                    key={key}
                    className="h-full [&>div]:h-full [&>div]:flex [&>div]:flex-col"
                    style={{
                      transform: overlayTransform,
                      opacity: overlayEntered ? 1 : 0,
                      transition:
                        'transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 360ms ease',
                      transitionDelay: `${index * OVERLAY_CARD_DELAY}ms`,
                      willChange: 'transform, opacity',
                    }}
                  >
                    {renderItem(item, index, {
                      isPreview: false,
                      isExpanded: true,
                      isActive: activeIndex === index,
                    })}
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
