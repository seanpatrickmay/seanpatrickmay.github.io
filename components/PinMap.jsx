import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Line,
} from 'react-simple-maps';
import { toMapCoords, isWorldInset } from '@/lib/mapData';
import { MAP_WIDTH, computeProjection } from '@/lib/mapProjection';
import {
  ChartDefs,
  ChartVignette,
  ChartWater,
  CompassRose,
  LAND,
  LAND_INSET,
  LAND_NEIGHBOUR,
} from '@/components/map/chart';

/**
 * A pin's own coordinates win over a lookup by name. Movement pins resolve
 * theirs from GPS at backfill time, which is how "Dover" stays in Vermont;
 * the curated work and education pins keep using the COORDINATES table.
 */
function coordsOf(pin) {
  return pin?.coords ?? toMapCoords(pin?.location);
}

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

// `useInset: false` keeps everything on one map. The movement category wants
// that: with Ireland and Hungary in the set, the bounding box is the North
// Atlantic, and relegating Europe to a 160px corner box would throw away the
// most interesting thing the map has to say.
function getMainPins(pins, useInset = true) {
  const result = [];
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    for (const loc of pin.locations ?? [pin.location]) {
      if (!useInset || !isWorldInset(loc)) {
        result.push({ ...pin, location: loc, _multi: !!pin.locations, _origIndex: i });
      }
    }
  }
  return result;
}

function getInsetPins(pins, useInset = true) {
  if (!useInset) return [];
  const result = [];
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    for (const loc of pin.locations ?? [pin.location]) {
      if (isWorldInset(loc)) {
        result.push({ ...pin, location: loc, _multi: !!pin.locations, _origIndex: i });
      }
    }
  }
  return result;
}

function ThreadPath({ pins }) {
  const mapped = pins
    .map((p) => ({ coords: coordsOf(p), origIndex: p._origIndex ?? 0 }))
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
  const coords = coordsOf(pin);
  if (!coords) return null;

  // Scale pin size inversely with zoom — larger pins when zoomed out
  const sizeFactor = Math.max(0.9, Math.min(2000 / scale, 1.6));

  // Weighted pins size themselves and ignore sizeFactor entirely. The two
  // used to multiply, and on the world-scale movement map that bottomed out
  // at 1.6 x 2.6 — a radius of 23 viewBox units, which drew the whole
  // Boston-to-Baltimore cluster as one blob. Radius grows with the square
  // root of the count so 193 activities reads as bigger than 1 without
  // drawing 193 times the ink.
  const baseR = pin.weight
    ? Math.min(9, 3 + Math.sqrt(pin.weight) * 0.42) * (isActive ? 1.15 : 1)
    : (isActive ? 7 : 5.5) * sizeFactor;
  const pulseR = baseR * 1.8;
  // Stroke follows the dot rather than the zoom, or a small pin ends up
  // mostly outline.
  const sw = Math.max(0.6, baseR * (isActive ? 0.3 : 0.24));

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
  // The world inset and the connecting thread both assume a category that
  // reads as a journey between a handful of places. Movement is neither: it
  // is a scatter of everywhere, in no order.
  useInset = true,
  showThread = true,
}) {
  const mainPins = useMemo(() => getMainPins(pins, useInset), [pins, useInset]);
  const insetPins = useMemo(() => getInsetPins(pins, useInset), [pins, useInset]);
  const projection = useMemo(
    () => computeProjection(mainPins.map(coordsOf).filter(Boolean)),
    [mainPins],
  );
  const insetProjection = useMemo(() => {
    if (insetPins.length === 0) return { center: [-20, 46], scale: 100 };
    const coords = insetPins.map(coordsOf).filter(Boolean);
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
      {/* The double rule is the chart's printed border: an outer ink line and
          an inner hairline, which is what stops the paper from reading as a
          div with a border-radius. */}
      <div className="chart-frame relative overflow-hidden rounded-xl transition-all duration-500">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: projection.center, scale: projection.scale }}
          width={MAP_WIDTH}
          height={projection.height}
          style={{ width: '100%', height: 'auto' }}
        >
          {/* The wobble is in viewBox units, so it has to shrink as the map
              zooms out: ±2 units is a pleasing hand-inked coastline across a
              few US states, and a smear that closes the Irish Sea and the
              English Channel across the whole North Atlantic. */}
          <ChartDefs id="chart-main" wobble={projection.scale > 1000 ? 2 : 0.7} />
          <ChartWater id="chart-main" width={MAP_WIDTH} height={projection.height} />

          <Graticule
            step={[5, 5]}
            className="stroke-[#c2ab84] dark:stroke-[#1f4a5b]"
            strokeWidth={0.4}
            fill="none"
            opacity={0.55}
          />

          <g filter="url(#chart-main-ink)">
            {/* Canada and Mexico first, from the world file. The US is
                excluded here because states-10m draws it at a much higher
                resolution a moment later, and two versions of the same
                coastline a pixel apart looks like a printing misregistration. */}
            <Geographies geography={WORLD_TOPO}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => geo.properties?.name !== 'United States of America')
                  .map((geo) => (
                    <Geography
                      key={`neighbour-${geo.rsmKey}`}
                      geography={geo}
                      className={LAND_NEIGHBOUR}
                      stroke="none"
                      style={GEO_STYLE}
                    />
                  ))
              }
            </Geographies>

            <Geographies geography={US_TOPO}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={LAND}
                    strokeWidth={0.6}
                    style={GEO_STYLE}
                  />
                ))
              }
            </Geographies>
          </g>

          {showThread && <ThreadPath pins={mainPins} />}

          {[...mainPins]
            .sort((a, b) => {
              const aActive = activePin && activePin.org === a.org && activePin.location === a.location;
              const bActive = activePin && activePin.org === b.org && activePin.location === b.location;
              // Also bring to front if same org (multi-location pins)
              const aOrgActive = activePin && activePin.org === a.org;
              const bOrgActive = activePin && activePin.org === b.org;
              if (aActive !== bActive) return aActive ? 1 : -1;
              if (aOrgActive !== bOrgActive) return aOrgActive ? 1 : -1;
              // Heaviest first, so it paints underneath: a one-activity place
              // inside a 193-activity circle would otherwise be unclickable.
              return (b.weight ?? 0) - (a.weight ?? 0);
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

          <ChartVignette id="chart-main" width={MAP_WIDTH} height={projection.height} />
        </ComposableMap>

        <CompassRose className="pointer-events-none absolute right-3.5 top-3.5 h-14 w-14 opacity-85" />
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
            {/* When, not just where — the entry list below already says it, but
                the tooltip is what you read while scanning the map. */}
            {tooltip.pin.period && (
              <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                {tooltip.pin.period}
              </div>
            )}
          </div>
        </div>
      )}

      {/* World inset */}
      {insetPins.length > 0 && (
        <div className="chart-frame absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-lg shadow-sm">
          <div className="absolute left-2 top-1 z-10 font-display text-[9px] uppercase tracking-[0.2em] text-[#8a7047] dark:text-[#4d94a3]">
            world
          </div>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={insetProjection}
            width={160}
            height={112}
            style={{ width: '100%', height: '100%' }}
          >
            <ChartDefs id="chart-inset" wobble={0.9} />
            <ChartWater id="chart-inset" width={160} height={112} />

            <g filter="url(#chart-inset-ink)">
              <Geographies geography={WORLD_TOPO}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={LAND_INSET}
                      strokeWidth={0.35}
                      style={GEO_STYLE}
                    />
                  ))
                }
              </Geographies>
            </g>
            {/* Thread connecting US anchor to international pins */}
            {insetPins.length > 0 && (
              <>
                {insetPins.map((pin, i) => {
                  const coords = coordsOf(pin);
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
              const coords = coordsOf(pin);
              if (!coords) return null;
              const clr = pinColorForIndex(pin._origIndex ?? i);
              return (
                <Marker key={`inset-${pin.location}-${i}`} coordinates={coords}>
                  <circle r={4} fill={clr} stroke="white" strokeWidth={1.2} />
                  <text
                    textAnchor="middle"
                    y={-8}
                    className="fill-stone-600 dark:fill-stone-300"
                    style={{ fontSize: 6, fontWeight: 600 }}
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
