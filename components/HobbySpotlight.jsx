export default function HobbySpotlight({ hobbies = [] }) {
  if (!Array.isArray(hobbies) || hobbies.length === 0) return null;

  const lgColumnsClass = (() => {
    if (hobbies.length >= 4) return 'lg:grid-cols-4';
    if (hobbies.length === 3) return 'lg:grid-cols-3';
    if (hobbies.length === 2) return 'lg:grid-cols-2';
    return 'lg:grid-cols-1';
  })();

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${lgColumnsClass}`}>
      {hobbies.map(hobby => (
        <div
          key={hobby.title}
          className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 dark:border-slate-800/50 dark:bg-slate-900/30"
        >
          <span className="text-xl mt-0.5" aria-hidden="true">{hobby.emoji}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {hobby.title}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {hobby.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
