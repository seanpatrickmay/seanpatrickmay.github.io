import { useEffect, useState } from 'react';

export default function StackedCardSection({
  id,
  title,
  icon: Icon,
  items = [],
  renderItem,
  getKey = (_, index) => index,
  stackOffset = 32,
  className = '',
  contentClassName = '',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = event => setPrefersReducedMotion(event.matches);

    // Initialize state on mount
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const handleFocus = index => {
    setHoveredIndex(index);
  };

  const handleBlur = event => {
    const { currentTarget, relatedTarget } = event;
    if (!currentTarget.contains(relatedTarget)) {
      setHoveredIndex(null);
    }
  };

  const handleLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <section
      id={id}
      className={`flex h-full flex-col py-10 scroll-mt-16 ${className}`.trim()}
      onMouseLeave={handleLeave}
    >
      <div className="mb-6 flex items-center gap-3">
        {Icon && (
          <div className="card rounded-xl border bg-white p-2 dark:bg-slate-900">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <div className={`relative flex flex-col ${contentClassName}`.trim()}>
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const translateY = isHovered ? 0 : -index * stackOffset;
          const transition = prefersReducedMotion ? '0s' : '300ms';

          return (
            <div
              key={getKey(item, index)}
              tabIndex={0}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              onMouseEnter={() => handleFocus(index)}
              className={`relative ${index !== 0 ? 'mt-6' : ''} rounded-2xl transition-transform transition-[filter] duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-opacity-70 dark:focus-visible:ring-offset-slate-950`}
              style={{
                transform: `translateY(${translateY}px)`,
                transitionDuration: transition,
                zIndex: isHovered ? items.length + 10 : items.length - index,
                filter:
                  hoveredIndex !== null && hoveredIndex !== index
                    ? 'brightness(0.92)'
                    : 'none',
              }}
            >
              {renderItem(item, index, isHovered)}
            </div>
          );
        })}
      </div>
    </section>
  );
}
