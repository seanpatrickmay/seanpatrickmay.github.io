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
          <li key={`${entry.org}-${entry.start}`} className="flex items-start gap-2">
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
              {/* Organisation leads: it is what gets recognised at a glance,
                  and "SDE Co-op" alone says nothing about where. The wordmark
                  already names Capital One, so its text line is redundant. */}
              {!entry.wordmark && (
                <div className="font-medium text-slate-900 dark:text-slate-100">{entry.org}</div>
              )}
              {entry.role && (
                <div className="text-xs text-slate-600 dark:text-slate-300">{entry.role}</div>
              )}
              {entry.detail?.length > 0 && (
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {entry.detail.join(' · ')}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
