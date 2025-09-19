import { useState } from 'react';
import Section from '@/components/ui/Section';

const DEFAULT_STACK_OFFSET = 120; // px
const DEFAULT_BASE_GAP = 20;
const DEFAULT_FLOAT_OFFSET = 6;

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
  expandOnHover = false,
  activeSectionId = null,
  setActiveSectionId,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const shouldStack = items.length > 1;
  const collapsedMargin = shouldStack ? baseGap - stackOffset : baseGap;
  const isInteractive = expandOnHover && typeof setActiveSectionId === 'function';
  const isActive = isInteractive && activeSectionId === id;
  const isDimmed = isInteractive && activeSectionId && activeSectionId !== id;
  const sectionClassName = [
    'h-full transition-all duration-300 ease-out',
    isInteractive ? 'relative overflow-visible' : '',
    isActive ? 'md:col-span-2 lg:col-span-2 xl:col-span-2 z-30' : '',
    isDimmed ? 'opacity-0 pointer-events-none scale-95' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleSectionLeave = () => {
    if (isInteractive) {
      setActiveSectionId(null);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleFocusOut = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      if (isInteractive) {
        setActiveSectionId(null);
      } else {
        setHoveredIndex(null);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isInteractive) {
      setActiveSectionId(null);
    }
  };

  const renderPreviewStack = () => (
    <div
      className={[
        'relative flex flex-col transition-[opacity,transform] duration-300 ease-out',
        isActive ? 'absolute inset-0 opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={isActive}
    >
      {items.map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : index;
        const translateY = shouldStack ? -floatOffset * index : 0;
        const style = {
          marginTop: index === 0 ? 0 : collapsedMargin,
          transform: `translateY(${translateY}px) scale(0.96)`,
          transformOrigin: 'top center',
          zIndex: items.length - index,
        };

        return (
          <div
            key={key}
            className="relative transition-all duration-300 ease-out"
            style={style}
          >
            <div className="pointer-events-none select-none">
              {renderItem(item, index, { mode: 'preview', isActive })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderExpandedGrid = () => (
    <div
      className={[
        'absolute inset-0 transition-all duration-300 ease-out',
        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isActive}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 -m-1">
          <div className="h-full w-full max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-2xl dark:border-slate-800/60 dark:bg-slate-950/85">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => {
                const key = keyExtractor ? keyExtractor(item, index) : index;
                return (
                  <div key={key} className="h-full">
                    {renderItem(item, index, { mode: 'expanded', isActive })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isInteractive) {
    return (
      <Section id={id} title={title} icon={icon} className={sectionClassName}>
        <div
          className="relative min-h-[240px] sm:min-h-[260px]"
          onMouseEnter={() => setActiveSectionId(id)}
          onMouseLeave={handleSectionLeave}
          onFocusCapture={() => setActiveSectionId(id)}
          onBlurCapture={handleFocusOut}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {renderPreviewStack()}
          {renderExpandedGrid()}
        </div>
      </Section>
    );
  }

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        className="relative flex flex-col"
        onMouseLeave={handleSectionLeave}
      >
        {items.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          const isHovered = hoveredIndex === index;
          const translateY = shouldStack ? (isHovered ? 0 : -floatOffset * index) : 0;
          const marginTop = index === 0 ? 0 : isHovered ? baseGap : collapsedMargin;
          const style = {
            marginTop,
            transform: `translateY(${translateY}px)`,
            zIndex: isHovered ? items.length + 5 : items.length - index,
          };
          const dimOpacity = hoveredIndex !== null && !isHovered ? 0.6 : 1;
          const scaleClass =
            hoveredIndex === null
              ? 'scale-100'
              : isHovered
                ? 'scale-[1.015]'
                : 'scale-[0.99]';
          const emphasisClass = isHovered ? 'drop-shadow-xl' : '';

          return (
            <div
              key={key}
              className="relative transition-all duration-300 ease-out"
              style={style}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocusCapture={() => setHoveredIndex(index)}
              onBlurCapture={handleFocusOut}
            >
              <div
                className={`transition-all duration-300 transform origin-top ${scaleClass} ${emphasisClass}`.trim()}
                style={{ opacity: dimOpacity }}
              >
                {renderItem(item, index, { mode: 'stacked', isHovered })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
