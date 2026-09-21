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

// Same anchors, minus the centring translate. The tape needs an inline
// `transform` to counter-rotate, and an inline transform overwrites Tailwind's
// `-translate-x-1/2` wholesale — a centred tape ended up half its own width
// off to the right. So the translate is composed into the inline value below.
const TAPE_POSITIONS = {
  center: 'left-1/2',
  left: 'left-5',
  right: 'right-5',
};

export default function PinCard({
  rotation = 0,
  pinColor = 'red',
  pinPosition = 'center',
  // 'pin' | 'tape'. A board where every card is fixed the same way reads as a
  // grid of widgets; mixing fasteners is most of what sells the metaphor.
  fastener = 'pin',
  className = '',
  children,
}) {
  return (
    /* The tilt arrives as a custom property rather than an inline
       `transform`, because an inline transform beats every class-based one:
       the `hover:scale-[1.01]` that used to sit here never fired once.
       .pin-card composes the tilt and the hover lift in one place. */
    <div
      className={`pin-card relative ${className}`}
      style={{ '--pin-rotate': `${rotation}deg` }}
    >
      {fastener === 'tape' ? (
        /* Counter-rotated so the tape sits level against the board while the
           card underneath stays tilted — that mismatch is what makes it look
           stuck on rather than drawn on. */
        <div
          aria-hidden="true"
          className={`tape absolute -top-3.5 z-10 h-7 w-28 ${TAPE_POSITIONS[pinPosition] || TAPE_POSITIONS.center}`}
          style={{
            transform: [
              pinPosition === 'left' || pinPosition === 'right' ? null : 'translateX(-50%)',
              `rotate(${(-rotation - 1.5).toFixed(2)}deg)`,
            ]
              .filter(Boolean)
              .join(' '),
          }}
        />
      ) : (
        <>
          {/* Pushpin, with a shadow cast onto the card so it reads as sitting
              above the paper instead of printed on it. */}
          <div
            aria-hidden="true"
            className={`absolute -top-[7px] z-10 h-3.5 w-3.5 rounded-full ${PIN_POSITIONS[pinPosition] || PIN_POSITIONS.center}`}
            style={{
              background: PIN_COLORS[pinColor] || PIN_COLORS.red,
              boxShadow:
                '0 3px 5px rgba(0,0,0,0.28), 0 1px 0 rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.55)',
            }}
          />
        </>
      )}
      {children}
    </div>
  );
}
