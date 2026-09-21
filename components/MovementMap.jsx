import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import PinCard from '@/components/PinCard';
import { MOVEMENT_PINS, movementTotals } from '@/lib/mapData';

// react-simple-maps pulls topojson at runtime, so it renders client-side only
// — same as the experience map.
const PinMap = dynamic(() => import('@/components/PinMap'), { ssr: false });

const TOP_PLACES = 6;

/**
 * Everywhere he has moved under his own power, from four years of Garmin.
 *
 * Deliberately not the experience map's layout. That one pairs a map with a
 * scrollable list because it has five entries to read; this has forty-four,
 * and a forty-four-row list would be the tallest thing on the page for very
 * little. So the map goes full width with a totals strip above it and the
 * busiest places as chips below, and the detail lives in the hover tooltip.
 *
 * No inset and no connecting thread: the bounding box runs from Puerto Rico
 * to Hungary, which is a shape worth drawing whole, and these places are a
 * scatter rather than a journey.
 */
export default function MovementMap() {
  const [activePin, setActivePin] = useState(null);
  const totals = movementTotals();

  const handleHover = useCallback(pin => setActivePin(pin), []);
  const handleClick = useCallback(
    pin => setActivePin(prev => (prev && prev.org === pin.org ? null : pin)),
    [],
  );

  if (MOVEMENT_PINS.length === 0) return null;

  const topPlaces = [...MOVEMENT_PINS].sort((a, b) => b.weight - a.weight).slice(0, TOP_PLACES);

  return (
    <PinCard rotation={-0.6} pinColor="teal">
      <div className="paper rounded-sm border border-stone-200/80 p-4 dark:border-stone-700/80">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            everywhere i&apos;ve moved
          </div>
          <div className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            {totals.activities.toLocaleString()} activities · {totals.places} places ·{' '}
            {totals.distanceKm.toLocaleString()} km
            {totals.since ? ` · since ${totals.since}` : ''}
          </div>
        </div>

        {/* Sport mix, which is also the map's legend — it is the quickest way
            to see that this is not just running. */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
          {totals.sports.map(({ sport, n, emoji, label }) => (
            <span key={sport} className="inline-flex items-baseline gap-1">
              <span aria-hidden="true">{emoji}</span>
              <span className="tabular-nums font-semibold">{n}</span>
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
            </span>
          ))}
        </div>

        <div className="mt-3">
          <PinMap
            pins={MOVEMENT_PINS}
            activePin={activePin}
            onPinHover={handleHover}
            onPinClick={handleClick}
            useInset={false}
            showThread={false}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {topPlaces.map(pin => {
            const isActive = activePin?.org === pin.org;
            return (
              <button
                key={pin.org}
                type="button"
                onClick={() => handleClick(pin)}
                onMouseEnter={() => handleHover(pin)}
                onMouseLeave={() => handleHover(null)}
                className={[
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                  isActive
                    ? 'border-teal-700/40 bg-teal-700 text-white'
                    : 'border-stone-300/70 bg-stone-100 text-stone-700 hover:bg-white dark:border-stone-600/70 dark:bg-stone-800 dark:text-stone-200',
                ].join(' ')}
              >
                {pin.org} <span className="tabular-nums opacity-70">{pin.weight}</span>
              </button>
            );
          })}
        </div>
      </div>
    </PinCard>
  );
}
