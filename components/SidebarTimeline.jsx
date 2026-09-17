/**
 * Renders one derived sidebar list ("now" or "previously").
 *
 * Entries come pre-split from getStaticProps — resolving "is this current?" at
 * build time rather than at render keeps the markup crawler-visible and avoids
 * a hydration mismatch when a role's end date falls between build and view.
 */
export default function SidebarTimeline({ label, entries = [] }) {
  if (!entries.length) return null;

  return (
    <div>
      <div className="text-xs font-semibold lowercase tracking-wide text-slate-500 dark:text-slate-300">
        {label}
      </div>
      <ul className="mt-3 space-y-2">
        {entries.map(entry => (
          <li key={`${entry.title}-${entry.start}`} className="flex items-start gap-2">
            {entry.wordmark ? (
              <>
                <img
                  src={entry.wordmark.light}
                  alt={entry.wordmark.alt}
                  loading="lazy"
                  className="mt-1 h-3.5 w-auto flex-none dark:hidden"
                />
                <img
                  src={entry.wordmark.dark}
                  alt={entry.wordmark.alt}
                  loading="lazy"
                  className="mt-1 hidden h-3.5 w-auto flex-none dark:block"
                />
              </>
            ) : (
              <span className="mt-0.5" aria-hidden="true">
                {entry.emoji}
              </span>
            )}
            <div className="min-w-0 leading-snug">
              <div className="font-medium text-slate-900 dark:text-slate-100">{entry.title}</div>
              {entry.meta?.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-300">
                  {entry.meta.join(' · ')}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
