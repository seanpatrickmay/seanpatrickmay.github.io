import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import PinCard from '@/components/PinCard';
import { MOVEMENT_GENERATED_AT, MOVEMENT_PINS, movementTotals } from '@/lib/mapData';
import { useNearViewport } from '@/hooks/useNearViewport';

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
  const [mapRef, mapNear] = useNearViewport();
  const totals = movementTotals();

  const handleHover = useCallback(pin => setActivePin(pin), []);
  const handleClick = useCallback(
    pin => setActivePin(prev => (prev && prev.org === pin.org ? null : pin)),
    [],
  );

  if (MOVEMENT_PINS.length === 0) return null;

  const topPlaces = [...MOVEMENT_PINS].sort((a, b) => b.weight - a.weight).slice(0, TOP_PLACES);
  const generated = MOVEMENT_GENERATED_AT ? new Date(MOVEMENT_GENERATED_AT) : null;
  const generatedLabel =
    generated && !Number.isNaN(generated.getTime())
      ? generated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
      : null;

  return (
    <PinCard rotation={-0.6} pinColor="teal">
      <div className="paper rounded-sm border border-stone-200/80 p-4 dark:border-stone-700/80">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            everywhere i&apos;ve moved
          </div>
          <div className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            {totals.activities.toLocaleString()} activities · {totals.distanceKm.toLocaleString()} km ·{' '}
            {totals.hours.toLocaleString()} h
            {totals.since ? ` · since ${totals.since}` : ''}
          </div>
        </div>
        {generatedLabel && (
          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            map data refreshed {generatedLabel}; coordinates are coarse place-level aggregates.
          </p>
        )}

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
          {totals.otherCount > 0 && (
            <span className="text-slate-500 dark:text-slate-400">
              +{totals.otherCount} more
            </span>
          )}
        </div>

        <div ref={mapRef} className="relative mt-3">
          {mapNear ? (
            <PinMap
              pins={MOVEMENT_PINS}
              activePin={activePin}
              onPinHover={handleHover}
              onPinClick={handleClick}
              useInset={false}
              showThread={false}
              variant="plain"
            />
          ) : (
            <div className="plain-frame flex min-h-[320px] items-center justify-center rounded-xl text-sm text-stone-600 dark:text-stone-300">
              movement map loads when visible
            </div>
          )}

          {/* Cartouche, bottom-right, where a chart puts its scale. The map
              plots 553 activities; the distance counts all 1,751, so the
              caption says which is which rather than letting the two
              numbers quietly disagree. */}
          <div className="pointer-events-none absolute bottom-3 right-3 max-w-[15rem] rounded-sm bg-[#faf6ec]/92 px-3 py-2 shadow-sm ring-1 ring-[#9c8256]/45 backdrop-blur-[1px] dark:bg-[#0d2029]/92 dark:ring-[#3e7d8b]/45">
            <div className="stat-figure text-xl leading-none text-stone-800 dark:text-stone-100">
              {totals.distanceKm.toLocaleString()} km
            </div>
            <div
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-400/30 dark:bg-stone-200/20"
            >
              <div
                className="h-full rounded-full bg-teal-700 dark:bg-teal-400"
                style={{ width: `${Math.min(100, totals.earthPercent)}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] leading-tight text-stone-600 dark:text-stone-300">
              {totals.earthPercent}% of the way around the earth
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-stone-500 dark:text-stone-400">
              {totals.placedActivities} of them mapped, in {totals.places} places
            </div>
          </div>
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

        <details className="mt-3 rounded-sm border border-stone-200/70 bg-white/45 px-3 py-2 text-xs text-stone-600 dark:border-stone-700/70 dark:bg-stone-900/35 dark:text-stone-300">
          <summary className="cursor-pointer font-semibold text-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:text-stone-200">
            list all mapped places
          </summary>
          <ol className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...MOVEMENT_PINS].sort((a, b) => b.weight - a.weight).map(pin => (
              <li key={pin.org}>
                <button
                  type="button"
                  onClick={() => handleClick(pin)}
                  className="w-full rounded px-1.5 py-1 text-left transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:hover:bg-stone-800"
                >
                  <span className="font-medium">{pin.org}</span>{' '}
                  <span className="text-stone-500 dark:text-stone-400">
                    {pin.role}
                    {pin.period ? ` · ${pin.period}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </PinCard>
  );
}
