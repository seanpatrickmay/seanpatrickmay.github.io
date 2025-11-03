import { Tab } from '@headlessui/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Section from '@/components/ui/Section';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
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
}) {
  const containerRef = useRef(null);
  const panelRefs = useRef([]);
  const isControlled = typeof onActiveSectionChange === 'function' && typeof activeSectionId !== 'undefined';
  const [internalActive, setInternalActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex(previous => (previous < items.length ? previous : 0));
  }, [items.length]);

  const isActive = isControlled ? activeSectionId === id : internalActive;

  const activate = useCallback(() => {
    if (isControlled) {
      if (activeSectionId !== id) {
        onActiveSectionChange(id);
      }
    } else {
      setInternalActive(true);
    }
  }, [isControlled, activeSectionId, id, onActiveSectionChange]);

  const deactivate = useCallback(() => {
    if (isControlled) {
      if (activeSectionId === id) {
        onActiveSectionChange(null);
      }
    } else {
      setInternalActive(false);
    }
  }, [isControlled, activeSectionId, id, onActiveSectionChange]);

  const handlePointerEnter = useCallback(() => {
    activate();
  }, [activate]);

  const handlePointerLeave = useCallback(
    event => {
      if (containerRef.current?.contains(event.relatedTarget)) {
        return;
      }
      deactivate();
    },
    [deactivate]
  );

  const handleFocusCapture = useCallback(() => {
    activate();
  }, [activate]);

  const handleBlurCapture = useCallback(
    event => {
      if (containerRef.current?.contains(event.relatedTarget)) {
        return;
      }
      deactivate();
    },
    [deactivate]
  );

  const keyedItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      key: keyExtractor ? keyExtractor(item, index) : index,
    }));
  }, [items, keyExtractor]);

  const measurePanels = useCallback(() => {
    const heights = panelRefs.current.map(panel => (panel ? panel.scrollHeight : 0));
    const nextHeight = heights.length ? Math.max(...heights) : 0;

    setPanelHeight(previous => (Math.abs(previous - nextHeight) > 1 ? nextHeight : previous));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    measurePanels();
  }, [measurePanels, keyedItems, selectedIndex]);

  useEffect(() => {
    const handleResize = () => {
      measurePanels();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [measurePanels]);

  const handleTabHover = useCallback(
    index => {
      setSelectedIndex(index);
      activate();
    },
    [activate]
  );

  panelRefs.current.length = keyedItems.length;

  const sectionClassName = [
    'relative w-full transition-colors duration-500 ease-out data-[expanded=true]:z-10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (items.length === 0) {
    return (
      <Section
        id={id}
        title={title}
        icon={icon}
        className={sectionClassName}
        data-expanded={isActive ? 'true' : 'false'}
        aria-expanded={isActive}
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 dark:border-white/10 dark:bg-white/5">
          Nothing to display yet.
        </div>
      </Section>
    );
  }

  return (
    <Section
      id={id}
      title={title}
      icon={icon}
      className={sectionClassName}
      data-expanded={isActive ? 'true' : 'false'}
      aria-expanded={isActive}
    >
      <div
        ref={containerRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex} orientation="vertical">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:gap-8">
            <Tab.List className="flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:flex lg:flex-col">
              {keyedItems.map(({ item, index, key }) => (
                <Tab
                  key={key}
                  onMouseEnter={() => handleTabHover(index)}
                  onFocus={() => handleTabHover(index)}
                  className={({ selected }) =>
                    classNames(
                      'group relative flex min-w-[220px] flex-1 cursor-pointer items-stretch rounded-3xl border border-white/10 bg-white/5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/0 dark:border-white/10 dark:bg-white/5',
                      selected
                        ? 'border-white/40 bg-white/10 shadow-xl ring-1 ring-white/40 dark:border-white/20 dark:bg-white/10 dark:ring-white/25'
                        : 'hover:border-white/20 hover:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/10'
                    )
                  }
                >
                  <div className="pointer-events-none w-full">
                    {renderItem(item, index, {
                      mode: 'preview',
                      isExpanded: false,
                      isPreview: true,
                      isActive: selectedIndex === index,
                      isMeasuring: false,
                    })}
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels
              className="relative w-full"
              style={panelHeight ? { minHeight: panelHeight } : undefined}
            >
              {keyedItems.map(({ item, index, key }) => (
                <Tab.Panel key={key} static className="focus:outline-none">
                  <div
                    ref={element => {
                      panelRefs.current[index] = element;
                    }}
                    data-state={selectedIndex === index ? 'active' : 'inactive'}
                    className={classNames(
                      'transition duration-500 ease-out',
                      selectedIndex === index
                        ? 'relative opacity-100 translate-y-0'
                        : 'absolute inset-0 pointer-events-none opacity-0 translate-y-2'
                    )}
                    style={{
                      visibility: selectedIndex === index ? 'visible' : 'hidden',
                    }}
                    aria-hidden={selectedIndex === index ? undefined : 'true'}
                  >
                    {renderItem(item, index, {
                      mode: 'expanded',
                      isExpanded: true,
                      isPreview: false,
                      isActive: selectedIndex === index,
                      isMeasuring: false,
                    })}
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </Section>
  );
}

