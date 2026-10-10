import { ArrowUpRight } from 'lucide-react';

/**
 * Where a number or a figure comes from: a link when there is something to
 * check, plain text when there is not. Only a private project may have no
 * link, and then its label says "self-reported" (lib/deepDive.js enforces
 * this).
 *
 * The visible text is the source's own label, so three links in a row can
 * all read "paper · Table 3". `about` names what each one backs, so a
 * screen reader hears three different links.
 */
const TONE = 'text-stone-600 dark:text-stone-300';

export default function Source({ source, about, className = '' }) {
  if (!source?.href) return <span className={`${TONE} ${className}`}>{source?.label}</span>;
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      data-source=""
      className={`${TONE} rounded-sm underline decoration-stone-400/70 underline-offset-2 [overflow-wrap:anywhere] hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:text-teal-400 ${className}`}
    >
      {source.label}
      <ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" aria-hidden="true" />
      <span className="sr-only">{about ? `, the source for ${about}` : ''} (opens in new tab)</span>
    </a>
  );
}
