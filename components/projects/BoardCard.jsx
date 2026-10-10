import Link from 'next/link';
import CoverArt, { hasMotif } from '@/components/projects/CoverArt';
import { coverSources, COVER_SIZES } from '@/lib/coverImage';
import { pickHighlightTech } from '@/lib/projectDisplay';

/**
 * One card on the board, and one link: the whole card opens the deep dive.
 *
 * No pill buttons. Fourteen of them made the old wall read as a form, and the
 * repo, live and paper links all live on the deep dive anyway. Evidence that
 * deserves a direct link hangs off the card as an Artifact instead.
 *
 * Big cards lead with the cover's handwritten caption, the one-line proof.
 * Small cards are a title and the line written for them in board.line.
 */
export default function BoardCard({ project }) {
  const big = project.board.size === 'big';
  const meta = big
    ? [project.period, pickHighlightTech(project)].filter(Boolean).join(' · ')
    : project.board.line;

  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="paper group block overflow-hidden rounded-sm border border-stone-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-stone-700/80"
    >
      {big && (
        <div className="aspect-[2/1] overflow-hidden">
          {hasMotif(project.coverArt?.motif) ? (
            <CoverArt motif={project.coverArt.motif} line={project.coverArt.line} />
          ) : project.coverImage?.src ? (
            <img
              src={project.coverImage.src}
              {...(coverSources(project.coverImage) || {})}
              sizes={COVER_SIZES.board}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      )}
      <div className={big ? 'p-4' : 'p-3'}>
        <p
          className={`flex items-center gap-2 font-semibold leading-tight text-stone-900 transition-colors group-hover:text-teal-700 dark:text-stone-50 dark:group-hover:text-teal-400 ${big ? 'text-base' : 'text-sm'}`}
        >
          {project.emoji && <span aria-hidden="true">{project.emoji}</span>}
          {project.title}
        </p>
        {meta && <p className="mt-1 text-xs leading-snug text-stone-600 dark:text-stone-300">{meta}</p>}
      </div>
    </Link>
  );
}
