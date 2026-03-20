import PinCard from '@/components/PinCard';

const ENTRY_ROTATIONS = [-0.8, 0.6, -0.5, 0.9, -0.7, 0.4];
const ENTRY_PIN_COLORS = ['red', 'blue', 'green', 'yellow', 'teal'];

export default function MapEntryList({ pins = [], activePin, onEntryClick, onEntryHover }) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {pins.map((pin, i) => {
        const isActive =
          activePin &&
          activePin.org === pin.org &&
          (activePin.location === pin.location ||
            (pin.locations && pin.locations.includes(activePin.location)));
        const locationLabel = pin.locations ? pin.locations.join(' → ') : pin.location;

        return (
          <PinCard
            key={`${pin.org}-${i}`}
            rotation={ENTRY_ROTATIONS[i % ENTRY_ROTATIONS.length]}
            pinColor={ENTRY_PIN_COLORS[i % ENTRY_PIN_COLORS.length]}
          >
            <button
              type="button"
              onClick={() => onEntryClick(pin)}
              onMouseEnter={() => onEntryHover(pin)}
              onMouseLeave={() => onEntryHover(null)}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200',
                isActive
                  ? 'border-2 bg-white shadow-sm dark:bg-stone-800'
                  : 'border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600',
              ].join(' ')}
              style={isActive ? { borderColor: { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', teal: '#14b8a6' }[ENTRY_PIN_COLORS[i % ENTRY_PIN_COLORS.length]] } : undefined}
            >
              {pin.emoji ? (
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {pin.emoji}
                </span>
              ) : pin.img ? (
                <img
                  src={pin.img}
                  alt=""
                  className="w-7 h-7 rounded-md object-contain flex-shrink-0 bg-stone-50 dark:bg-stone-700"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-xs font-bold text-stone-500 flex-shrink-0 dark:bg-stone-700 dark:text-stone-400">
                  {pin.org.charAt(0)}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {pin.org}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {pin.role}{locationLabel ? ` · ${locationLabel}` : ''}
                  {pin.period ? ` · ${pin.period}` : ''}
                </div>
              </div>
              {isActive && (
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', teal: '#14b8a6' }[ENTRY_PIN_COLORS[i % ENTRY_PIN_COLORS.length]] }}
                />
              )}
            </button>
          </PinCard>
        );
      })}
    </div>
  );
}
