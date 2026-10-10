import PinCard from '@/components/PinCard';
import CoverArt, { hasMotif } from '@/components/projects/CoverArt';
import LogBarChart from '@/components/projects/LogBarChart';
import Source from '@/components/projects/Source';
import { coverSources, COVER_SIZES } from '@/lib/coverImage';

/**
 * Real output first. The lead figure is the first picture on the page, so
 * it is evidence: a figure from the paper, a benchmark, a real screenshot.
 *
 * A project without one keeps its hand-drawn cover in the same slot, with no
 * caption: that caption is the board's one-line proof, and its number is
 * already in the metrics strip above.
 *
 * Both sit in the first screen, so both load eagerly.
 */
const FRAME = 'mx-auto w-full max-w-3xl';
const EDGE = 'rounded-sm border border-stone-200/80 dark:border-stone-700/80';

export default function LeadFigure({ project }) {
  const { leadFigure: fig, coverArt, coverImage } = project;

  if (fig) {
    return (
      <div data-section="figure" className={FRAME}>
        <PinCard rotation={-0.5} pinColor="red">
          <figure data-lead-figure="" className={`paper ${EDGE} p-2 pb-3`}>
            {fig.chart ? (
              <LogBarChart chart={fig.chart} label={fig.alt} />
            ) : (
              <img
                src={fig.src}
                {...(coverSources(fig) || {})}
                sizes={COVER_SIZES.figure}
                alt={fig.alt}
                loading="eager"
                className="h-auto w-full rounded-sm"
              />
            )}
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 pt-2">
              <span className="font-hand text-lg leading-tight text-stone-700 dark:text-stone-200">{fig.caption}</span>
              <Source source={fig.source} about={`the figure: ${fig.caption}`} className="text-xs" />
            </figcaption>
          </figure>
        </PinCard>
      </div>
    );
  }

  const motif = hasMotif(coverArt?.motif);
  if (!motif && !coverImage?.src) return null;
  return (
    <div data-section="figure" data-cover-fallback="" className={FRAME}>
      <PinCard rotation={-0.7} pinColor="red">
        <div className={`aspect-[3/1] overflow-hidden ${EDGE}`}>
          {motif ? (
            <CoverArt motif={coverArt.motif} showLine={false} />
          ) : (
            <img
              src={coverImage.src}
              {...(coverSources(coverImage) || {})}
              sizes={COVER_SIZES.figure}
              alt={coverImage.alt || ''}
              loading="eager"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </PinCard>
    </div>
  );
}
