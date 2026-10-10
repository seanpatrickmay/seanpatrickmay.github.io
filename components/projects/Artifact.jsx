/**
 * Evidence pinned beside a card: a job tag, a sticky note with a checkable
 * claim, the first page of a paper, a polaroid of a live product.
 *
 * Every kind except the tag is a link straight to its evidence, so a claim on
 * the board is one click from its source without opening the deep dive. Each
 * renders right after its card in the DOM (Board puts it there), so a screen
 * reader hears the card, then the evidence for it.
 *
 * Tilts use motion-safe: so prefers-reduced-motion gets them straight.
 */

const BASE = 'absolute z-10 shadow-md';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2';
const PAPER_LINES = [0, 1, 2, 3];

function EvidenceLink({ artifact, className, children }) {
  return (
    <a
      href={artifact.href}
      target="_blank"
      rel="noopener noreferrer"
      data-artifact={artifact.kind}
      className={`${BASE} ${FOCUS} ${className}`}
    >
      {children}
      <span className="sr-only"> — {artifact.label} (opens in new tab)</span>
    </a>
  );
}

export default function Artifact({ artifact }) {
  switch (artifact.kind) {
    case 'tag':
      return (
        <span
          data-artifact="tag"
          className={`${BASE} -bottom-8 left-3 rounded-r-md bg-[#e8d5a6] py-0.5 pl-5 pr-2.5 text-[11px] font-semibold text-[#57452a] motion-safe:-rotate-3 sm:-bottom-4`}
        >
          <span
            aria-hidden="true"
            className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#f5f0e6] ring-1 ring-[#a8946a]"
          />
          {artifact.text}
        </span>
      );
    case 'sticky':
      return (
        <EvidenceLink
          artifact={artifact}
          className="-right-2 -top-5 w-28 bg-amber-200 p-2 font-hand text-lg leading-none text-stone-900 motion-safe:rotate-3 sm:w-32"
        >
          {artifact.text}
        </EvidenceLink>
      );
    case 'paper':
      return (
        <EvidenceLink artifact={artifact} className="-bottom-9 -right-5 w-28 bg-white p-2 text-stone-900 motion-safe:rotate-3 sm:-bottom-6 sm:w-24 xl:-right-10 xl:w-20">
          <span className="block font-display text-[11px] leading-tight">{artifact.text}</span>
          <span aria-hidden="true" className="mt-1.5 hidden space-y-1 sm:block">
            {PAPER_LINES.map(i => (
              <span key={i} className="block h-1 rounded-sm bg-stone-200" />
            ))}
          </span>
        </EvidenceLink>
      );
    case 'polaroid':
      return (
        <EvidenceLink
          artifact={artifact}
          className="-bottom-12 -right-2 w-14 bg-white p-1 pb-4 motion-safe:-rotate-6 xl:-right-4"
        >
          <img src={artifact.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0.5 text-center font-hand text-xs text-stone-800 sm:text-sm">
            {artifact.text}
          </span>
        </EvidenceLink>
      );
    default:
      return null;
  }
}
