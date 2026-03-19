import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Section from '@/components/ui/Section';
import MapEntryList from '@/components/MapEntryList';
import Pinboard from '@/components/Pinboard';
import { CATEGORIES } from '@/lib/mapData';
import { MapPin } from 'lucide-react';

const PinMap = dynamic(() => import('@/components/PinMap'), { ssr: false });

export default function MapSection() {
  const [categoryId, setCategoryId] = useState('work');
  const [activePin, setActivePin] = useState(null);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const pins = category?.pins ?? [];

  const handlePinHover = useCallback((pin) => {
    setActivePin(pin);
  }, []);

  const handlePinClick = useCallback((pin) => {
    setActivePin((prev) =>
      prev && prev.org === pin.org && prev.location === pin.location
        ? null
        : pin,
    );
  }, []);

  const handleEntryClick = useCallback((pin) => {
    // For multi-location entries, activate on the first location
    const resolved = pin.locations
      ? { ...pin, location: pin.locations[0] }
      : pin;
    setActivePin((prev) =>
      prev && prev.org === resolved.org ? null : resolved,
    );
  }, []);

  const handleEntryHover = useCallback((pin) => {
    if (!pin) {
      setActivePin(null);
      return;
    }
    const resolved = pin.locations
      ? { ...pin, location: pin.locations[0] }
      : pin;
    setActivePin(resolved);
  }, []);

  const handleCategorySwitch = useCallback((id) => {
    setCategoryId(id);
    setActivePin(null);
  }, []);

  return (
    <Section id="experience" title="where i've been" icon={MapPin}>
      <Pinboard>
        {/* Category pills */}
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySwitch(cat.id)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200',
                cat.id === categoryId
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
              ].join(' ')}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <PinMap
          pins={pins}
          activePin={activePin}
          onPinHover={handlePinHover}
          onPinClick={handlePinClick}
        />

        {/* Entry list */}
        <MapEntryList
          pins={pins}
          activePin={activePin}
          onEntryClick={handleEntryClick}
          onEntryHover={handleEntryHover}
        />
      </Pinboard>
    </Section>
  );
}
