/**
 * Muted "as of <date>" marker shown only when a feed has gone stale.
 *
 * Staleness is computed in getStaticProps, not here: the site is a static
 * export, so evaluating it at build time keeps the markup crawler-visible and
 * avoids a hydration mismatch if a visitor loads the page after the threshold
 * is crossed. The daily deploy cron re-evaluates it.
 */
export default function StaleBadge({ staleness, className = '' }) {
  if (!staleness?.label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-500 dark:bg-stone-700/60 dark:text-stone-300 ${className}`.trim()}
      title={`This data is ${staleness.days} days old — its refresh job may be failing.`}
    >
      <span aria-hidden="true">⏳</span>
      {staleness.label}
    </span>
  );
}
