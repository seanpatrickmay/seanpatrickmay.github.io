import { useState } from 'react';
import Section from '@/components/ui/Section';

const DEFAULT_STACK_OFFSET = 56; // px
const DEFAULT_BASE_GAP = 24; // matches gap-6 from Tailwind
const DEFAULT_FLOAT_OFFSET = 4; // subtle vertical drift between cards

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
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const shouldStack = items.length > 1;
  const sectionClassName = `h-full ${className}`.trim();

  return (
    <Section id={id} title={title} icon={icon} className={sectionClassName}>
      <div
        className="relative flex flex-col"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {items.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          const isHovered = hoveredIndex === index;
          const collapsedMargin = shouldStack ? baseGap - stackOffset : baseGap;
          const marginTop = index === 0 ? 0 : isHovered ? baseGap : collapsedMargin;
          const translateY = shouldStack ? (isHovered ? 0 : -floatOffset * index) : 0;
          const style = {
            marginTop,
            transform: `translateY(${translateY}px)`,
            zIndex: isHovered ? items.length + 5 : items.length - index,
          };
          const dimOpacity = hoveredIndex !== null && !isHovered ? 0.65 : 1;
          const scaleClass =
            hoveredIndex === null
              ? 'scale-100'
              : isHovered
                ? 'scale-[1.01]'
                : 'scale-[0.995]';
          const emphasisClass = isHovered ? 'drop-shadow-xl' : '';

          return (
            <div
              key={key}
              className="relative transition-all duration-300 ease-out"
              style={style}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocusCapture={() => setHoveredIndex(index)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setHoveredIndex(null);
                }
              }}
            >
              <div
                className={`transition-all duration-300 transform origin-top ${scaleClass} ${emphasisClass}`.trim()}
                style={{ opacity: dimOpacity }}
              >
                {renderItem(item, index, { isHovered })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
