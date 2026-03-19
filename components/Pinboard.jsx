export default function Pinboard({ children, className = '' }) {
  return (
    <div
      className={`relative rounded-2xl border border-stone-300 shadow-lg overflow-hidden dark:border-stone-700 px-5 py-8 sm:px-7 sm:py-10 lg:px-9 lg:py-12 ${className}`}
    >
      {/* Light mode background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 dark:hidden"
        style={{ background: 'linear-gradient(135deg, #f5f0e6 0%, #ede8db 50%, #f0ebe0 100%)' }}
      />
      {/* Dark mode background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden dark:block"
        style={{ background: 'linear-gradient(135deg, #1c1917 0%, #1a1816 50%, #1c1917 100%)' }}
      />
      {/* Noise texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
