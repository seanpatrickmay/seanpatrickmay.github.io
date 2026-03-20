import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from 'react-simple-maps';
import { toMapCoords, isWorldInset } from '@/lib/mapData';

const US_TOPO = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const WORLD_TOPO = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const PIN_COLOR_HEX = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  teal: '#14b8a6',
};
const PIN_COLOR_CYCLE = ['red', 'blue', 'green', 'yellow', 'teal'];

function pinColorForIndex(i) {
  return PIN_COLOR_HEX[PIN_COLOR_CYCLE[i % PIN_COLOR_CYCLE.length]];
}

function getMainPins(pins) {
  const result = [];
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    if (pin.locations) {
      for (const loc of pin.locations) {
        if (!isWorldInset(loc)) {
          result.push({ ...pin, location: loc, _multi: true, _origIndex: i });
        }
      }
    } else if (!isWorldInset(pin.location)) {
      result.push({ ...pin, _origIndex: i });
    }
  }
  return result;
}

function getInsetPins(pins) {
  const result = [];
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    if (pin.locations) {
      for (const loc of pin.locations) {
        if (isWorldInset(loc)) {
          result.push({ ...pin, location: loc, _multi: true, _origIndex: i });
        }
      }
    } else if (isWorldInset(pin.location)) {
      result.push({ ...pin, _origIndex: i });
    }
  }
  return result;
}

/**
 * Compute center + scale to fit all main pins with padding.
 * Returns { center, scale, height } — height adapts to lat span.
 */
function computeProjection(mainPins) {
  const coords = mainPins.map((p) => toMapCoords(p.location)).filter(Boolean);
  if (coords.length === 0) {
    return { center: [-76, 38], scale: 2000, height: 420 };
  }

  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;

  const PAD = 2.5;
  const latSpan = maxLat - minLat + PAD * 2;
  const lonSpan = maxLon - minLon + PAD * 2;

  // Use the aspect ratio of the pin spread to choose SVG height
  const aspectRatio = latSpan / Math.max(lonSpan, 1);
  const height = Math.min(Math.max(Math.round(600 * aspectRatio * 0.7), 380), 560);

  // Scale based on the larger of the two spans, tuned per height
  const span = Math.max(latSpan, lonSpan * (420 / height));
  const scale = Math.min(Math.max(26000 / span, 1200), 4500);

  return { center: [centerLon, centerLat], scale, height };
}

function ThreadPath({ pins }) {
  const mapped = pins
    .map((p) => ({ coords: toMapCoords(p.location), origIndex: p._origIndex ?? 0 }))
    .filter((m) => m.coords);

  if (mapped.length < 2) return null;

  return (
    <>
      {mapped.slice(0, -1).map((from, i) => {
        const to = mapped[i + 1];
        return (
          <Line
            key={`${from.coords[0]}-${from.coords[1]}-${i}`}
            from={from.coords}
            to={to.coords}
            stroke={pinColorForIndex(to.origIndex)}
            strokeWidth={1.5}
            strokeDasharray="6,4"
            strokeOpacity={0.6}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function PinMarker({ pin, isActive, onHover, onClick, scale = 2000, color = '#ef4444' }) {
  const coords = toMapCoords(pin.location);
  if (!coords) return null;

  // Scale pin size inversely with zoom — larger pins when zoomed out
  const sizeFactor = Math.max(0.9, Math.min(2000 / scale, 1.6));
  const baseR = (isActive ? 7 : 5.5) * sizeFactor;
  const pulseR = 10 * sizeFactor;
  const sw = (isActive ? 2.5 : 2) * Math.min(sizeFactor, 1.2);

  return (
    <Marker coordinates={coords}>
      {isActive && (
        <circle
          r={pulseR}
          fill={color}
          opacity={0.2}
          className="animate-pulse"
        />
      )}
      <circle
        r={baseR}
        fill={color}
        stroke="white"
        strokeWidth={sw}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => onHover(pin, e)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(pin)}
      />
    </Marker>
  );
}

const GEO_STYLE = {
  default: { outline: 'none' },
  hover: { outline: 'none' },
  pressed: { outline: 'none' },
};

export default function PinMap({
  pins = [],
  activePin = null,
  onPinHover,
  onPinClick,
}) {
  const mainPins = useMemo(() => getMainPins(pins), [pins]);
  const insetPins = useMemo(() => getInsetPins(pins), [pins]);
  const projection = useMemo(() => computeProjection(mainPins), [mainPins]);
  const insetProjection = useMemo(() => {
    if (insetPins.length === 0) return { center: [-20, 46], scale: 100 };
    const coords = insetPins.map((p) => toMapCoords(p.location)).filter(Boolean);
    // Midpoint between Boston anchor and the inset pin(s)
    const allLons = [-71, ...coords.map((c) => c[0])];
    const allLats = [42.3, ...coords.map((c) => c[1])];
    const centerLon = (Math.min(...allLons) + Math.max(...allLons)) / 2;
    const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
    const lonSpan = Math.max(...allLons) - Math.min(...allLons);
    // Tighter zoom for nearby pins (Montreal), wider for far pins (Budapest)
    const scale = lonSpan < 20 ? 250 : lonSpan < 60 ? 150 : 100;
    return { center: [centerLon, centerLat], scale };
  }, [insetPins]);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const handlePinHover = useCallback((pin, e) => {
    if (!pin || !e || !containerRef.current) {
      setTooltip(null);
      onPinHover(pin);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ x, y, pin });
    onPinHover(pin);
  }, [onPinHover]);

  const handlePinClick = useCallback((pin) => {
    onPinClick(pin);
  }, [onPinClick]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Main US map — key on projection to force re-render on category change */}
      <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30 dark:border-stone-700 dark:from-stone-800 dark:via-stone-850 dark:to-stone-800 transition-all duration-500">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: projection.center, scale: projection.scale }}
          width={600}
          height={projection.height}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={US_TOPO}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e7e5e4"
                  stroke="#c4bfb8"
                  strokeWidth={0.5}
                  style={GEO_STYLE}
                />
              ))
            }
          </Geographies>

          <ThreadPath pins={mainPins} />

          {[...mainPins]
            .sort((a, b) => {
              const aActive = activePin && activePin.org === a.org && activePin.location === a.location;
              const bActive = activePin && activePin.org === b.org && activePin.location === b.location;
              // Also bring to front if same org (multi-location pins)
              const aOrgActive = activePin && activePin.org === a.org;
              const bOrgActive = activePin && activePin.org === b.org;
              if (aActive !== bActive) return aActive ? 1 : -1;
              if (aOrgActive !== bOrgActive) return aOrgActive ? 1 : -1;
              return 0;
            })
            .map((pin, i) => (
            <PinMarker
              key={`${pin.org}-${pin.location}-${pin._origIndex}`}
              pin={pin}
              isActive={
                activePin &&
                activePin.org === pin.org &&
                activePin.location === pin.location
              }
              onHover={handlePinHover}
              onClick={handlePinClick}
              scale={projection.scale}
              color={pinColorForIndex(pin._origIndex ?? i)}
            />
          ))}
        </ComposableMap>
      </div>

      {/* HTML tooltip — outside SVG, never clipped */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: tooltip.x,
            top: tooltip.y < 60 ? tooltip.y + 16 : tooltip.y - 8,
            transform: tooltip.y < 60
              ? 'translateX(-50%)'
              : 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-md px-2.5 py-1.5 shadow-lg text-center whitespace-nowrap">
            <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
              {tooltip.pin.org}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
              {tooltip.pin.location}
            </div>
          </div>
        </div>
      )}

      {/* World inset */}
      {insetPins.length > 0 && (
        <div className="absolute bottom-3 right-3 w-40 h-28 rounded-lg border border-stone-300 bg-stone-100/95 dark:border-stone-600 dark:bg-stone-800/95 overflow-hidden backdrop-blur-sm shadow-sm">
          <div className="absolute top-1 left-2 text-[8px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 z-10">
            world
          </div>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={insetProjection}
            width={160}
            height={112}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={WORLD_TOPO}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e7e5e4"
                    stroke="#c4bfb8"
                    strokeWidth={0.3}
                    style={GEO_STYLE}
                  />
                ))
              }
            </Geographies>
            {/* Thread connecting US anchor to international pins */}
            {insetPins.length > 0 && (
              <>
                {insetPins.map((pin, i) => {
                  const coords = toMapCoords(pin.location);
                  if (!coords) return null;
                  const clr = pinColorForIndex(pin._origIndex ?? i);
                  return (
                    <Line
                      key={`inset-thread-${i}`}
                      from={[-71, 42.3]}
                      to={coords}
                      stroke={clr}
                      strokeWidth={1}
                      strokeDasharray="4,3"
                      strokeOpacity={0.5}
                      strokeLinecap="round"
                    />
                  );
                })}
              </>
            )}
            {/* US anchor dot (Boston area) */}
            <Marker coordinates={[-71, 42.3]}>
              <circle r={2.5} fill="#ef4444" stroke="white" strokeWidth={0.8} opacity={0.7} />
            </Marker>
            {insetPins.map((pin, i) => {
              const coords = toMapCoords(pin.location);
              if (!coords) return null;
              const clr = pinColorForIndex(pin._origIndex ?? i);
              return (
                <Marker key={`inset-${pin.location}-${i}`} coordinates={coords}>
                  <circle r={4} fill={clr} stroke="white" strokeWidth={1.2} />
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{ fontSize: 6, fill: '#57534e', fontWeight: 600 }}
                  >
                    {pin.location}
                  </text>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>
      )}
    </div>
  );
}
