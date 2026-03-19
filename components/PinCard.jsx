const PIN_COLORS = {
  red: 'radial-gradient(circle at 40% 35%, #f87171, #dc2626)',
  blue: 'radial-gradient(circle at 40% 35%, #60a5fa, #2563eb)',
  green: 'radial-gradient(circle at 40% 35%, #4ade80, #16a34a)',
  yellow: 'radial-gradient(circle at 40% 35%, #fbbf24, #d97706)',
  teal: 'radial-gradient(circle at 40% 35%, #2dd4bf, #0d9488)',
};

const PIN_POSITIONS = {
  center: 'left-1/2 -translate-x-1/2',
  left: 'left-5',
  right: 'right-5',
};

export default function PinCard({
  rotation = 0,
  pinColor = 'red',
  pinPosition = 'center',
  className = '',
  children,
}) {
  return (
    <div
      className={`pin-card relative shadow-[3px_4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:scale-[1.01] motion-reduce:!rotate-0 ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Pushpin */}
      <div
        aria-hidden="true"
        className={`absolute -top-[7px] z-10 h-3.5 w-3.5 rounded-full ${PIN_POSITIONS[pinPosition] || PIN_POSITIONS.center}`}
        style={{
          background: PIN_COLORS[pinColor] || PIN_COLORS.red,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)',
        }}
      />
      {children}
    </div>
  );
}
