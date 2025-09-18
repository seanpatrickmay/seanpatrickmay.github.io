import { useEffect, useId, useRef, useState } from 'react';
import Section from '@/components/ui/Section';

const DEFAULT_STACK_OFFSET = 144; // px
const DEFAULT_BASE_GAP = 24; // matches gap-6 from Tailwind
const DEFAULT_FLOAT_OFFSET = 6; // subtle vertical drift between cards

export default function StackedCardSection({
  id,
  title,
  icon,
  items = [],
  renderItem,
  keyExtractor,
  className = '',
  stackOffset = DEFAULT_STACK_OFFSET,
  baseGap = DEFAULT_BASE_GAP,
  floatOffset = DEFAULT_FLOAT_OFFSET,
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const shouldStack = items.length > 1;
  const sectionClassName = `h-full ${className}`.trim();
  const Icon = icon;
  const dialogLabelId = useId();
  const overlayContentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const isExpanded = activeIndex !== null && items.length > 0;

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

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        className="relative flex flex-col transition-[opacity,transform] duration-300 ease-out"
        style={{
          opacity: isExpanded ? 0 : 1,
          transform: isExpanded ? 'scale(0.99) translateY(-4px)' : 'scale(1) translateY(0)',
          pointerEvents: isExpanded ? 'none' : 'auto',
        }}
        aria-hidden={isExpanded}
      >
        {items.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          const collapsedMargin = shouldStack ? baseGap - stackOffset : baseGap;
          const marginTop = index === 0 ? 0 : collapsedMargin;
          const translateY = shouldStack ? -floatOffset * index : 0;
          const style = {
            marginTop,
            transform: `translateY(${translateY}px)`,
            zIndex: items.length - index,
          };

          return (
            <div
              key={key}
              className="relative transition-all duration-300 ease-out cursor-pointer"
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
                className="transition-transform duration-300 transform origin-top scale-100"
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
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
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
            className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6 text-white">
              {Icon && (
                <div className="p-2 rounded-xl border border-white/20 bg-white/10">
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

                return (
                  <div
                    key={key}
                    className="h-full [&>div]:h-full [&>div]:flex [&>div]:flex-col"
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
