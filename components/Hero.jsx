import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';
import CoverArt, { hasMotif } from '@/components/projects/CoverArt';
import { coverSources, COVER_SIZES } from '@/lib/coverImage';

// Three cards pinned to the board, staggered rather than fanned.
//
// The cascade this replaces overlapped them by design, which only works if
// the covered strip is dead space. It never was: each card is ~190px wide in
// a ~400px column, so the card on top buried the *start* of the next one's
// title and "AI Chief of Staff" read as "...Staff". Three cards of that width
// cannot sit side by side in that column, so the fan had to go rather than be
// re-tuned. Two up, one below, each on its own tilt, still reads as pinned
// paper and every title survives.
//
// Rotation lives in a CSS custom property, not an inline transform, because
// the mobile layout needs a different one -- and below sm the cards go
// full-width and stack, which is also what fixed the 6px of horizontal page
// scroll the third card used to cause at 390px. See .fan-card.
const FAN_ROTATIONS = [-3.4, 2.6, -1.8];
// Mobile tilts are smaller: a full-width card at a jaunty angle is just crooked.
const STACK_ROTATIONS = [-1.2, 0.9, -0.7];

function ProjectPolaroidFan({ projects = [] }) {
  if (projects.length === 0) return null;

  return (
    <>
      {projects.map((project, i) => {
        const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
        const coverSrc = project.coverImage?.src;
        const cover = coverSources(project.coverImage);
        const motif = project.coverArt?.motif;
        const description = project.cardDescription || project.oneLiner || '';

        return (
          <Link
            key={project.slug ?? project.title ?? i}
            href={href}
            className="fan-card group block"
            style={{
              '--fan-rot': `${FAN_ROTATIONS[i % FAN_ROTATIONS.length]}deg`,
              '--fan-rot-stacked': `${STACK_ROTATIONS[i % STACK_ROTATIONS.length]}deg`,
              // Descending, so where tilted corners do cross, the
              // highest-ranked project is the one on top.
              zIndex: 3 - i,
            }}
          >
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-white p-1.5 pb-3 shadow-md transition-shadow duration-300 group-hover:shadow-xl dark:border-stone-700 dark:bg-stone-800">
              {/* showLine is off for the fan: at 190px the handwritten
                  caption is unreadable, and the title prints underneath. */}
              <div className="relative h-24 w-full overflow-hidden rounded-sm sm:h-28">
                {hasMotif(motif) ? (
                  <CoverArt motif={motif} line={project.coverArt.line} showLine={false} />
                ) : coverSrc ? (
                  <img
                    src={coverSrc}
                    {...(cover || {})}
                    sizes={COVER_SIZES.fan}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
                )}
              </div>

              <div className="px-1.5 pt-2">
                {/* Wraps rather than truncates. At 190px "Alternative Data
                    Pipeline" came out as "Alternative Data Pipe..." — a
                    truncated title is worse than a second line, because the
                    card's whole job is naming the thing. */}
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900 group-hover:text-teal-700 dark:text-stone-50 dark:group-hover:text-teal-400">
                  {project.emoji && (
                    <span className="mr-1" aria-hidden="true">{project.emoji}</span>
                  )}
                  {project.title}
                </p>
                {description && (
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-stone-500 dark:text-stone-400">
                    {description}
                  </p>
                )}
                <span className="mt-1.5 inline-block text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  deep dive →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}

export default function Hero({ links, featuredProjects = [], timeline = { current: [] } }) {
  const projects = Array.isArray(featuredProjects) ? featuredProjects.slice(0, 3) : [];
  const highlights = (timeline.current || []).filter(e => e.highlight);

  return (
    <section id="home" className="section-container scroll-mt-32 py-12 lg:scroll-mt-16">
      {/* A real two-column grid rather than a fan absolutely positioned over
          the text. The old version left a hole under the bio, orphaned the
          "see all projects" pill bottom-right, and capped the copy at
          max-w-md inside a column twice that wide. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
        <div className="max-w-xl space-y-5">
          <div className="animate-fade-up flex items-center gap-4">
            <img
              src="/images/headshot.webp"
              alt="Sean P. May"
              width={400}
              height={400}
              className="h-20 w-20 flex-shrink-0 rounded-full object-cover object-top shadow-md ring-2 ring-slate-200/80 dark:ring-slate-700/80"
            />
            <div>
              <h1 className="font-display text-3xl tracking-tight text-slate-900 md:text-4xl dark:text-white">
                Sean P. May
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Boston, MA</p>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:100ms]">
            <p className="text-2xl font-semibold leading-snug text-slate-800 md:text-3xl dark:text-slate-200">
              swe, math, and whatever looks interesting
            </p>
            <p className="mt-1 text-lg text-slate-500 md:text-xl dark:text-slate-300">
              i really like hard problems
            </p>
          </div>

          {/* Derived from the timeline, so a finished role cannot linger here
              the way "SWE Intern — Capital One" did after August. */}
          {highlights.length > 0 && (
            <div className="animate-fade-up flex flex-wrap gap-2 pt-1 [animation-delay:150ms] lg:hidden">
              {highlights.map(entry => (
                <Badge key={entry.org} variant="outline" className="text-xs">
                  {entry.role} &mdash; {entry.org}
                </Badge>
              ))}
            </div>
          )}

          <p className="animate-fade-up text-base leading-relaxed text-slate-600 [animation-delay:200ms] dark:text-slate-300">
            built an agentic AI tutor at NExT, spent this past summer interning at Capital One, and now i&apos;m doing quant research. training for the indianapolis monumental marathon, prompting, reading, and stacking some chips in between
          </p>

          <div className="animate-fade-up flex flex-wrap gap-3 pt-2 [animation-delay:300ms]">
            <PillLink href={links.github} icon={Github} external className="px-4">
              GitHub
            </PillLink>
            <PillLink href={links.linkedin} icon={Linkedin} external className="px-4">
              LinkedIn
            </PillLink>
            <PillLink href={links.email} variant="solid" icon={Mail} className="px-4">
              say hi
            </PillLink>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:400ms]">
          {/* Handwritten aside — the one place on the page a marker face earns
              its keep, because it is an annotation about the thing next to it
              rather than content in its own right. */}
          <div
            aria-hidden="true"
            className="mb-1 hidden items-end gap-2 pl-6 md:flex"
          >
            <span className="font-hand text-2xl leading-none text-stone-500 dark:text-stone-400">
              a few things i built
            </span>
            <svg viewBox="0 0 48 34" className="h-7 w-10 flex-none text-stone-400 dark:text-stone-500" fill="none">
              <path
                d="M2 4c14 0 26 8 32 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.5 5"
              />
              <path
                d="M28 25l6.5 3 1.5-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="fan-deck">
            <ProjectPolaroidFan projects={projects} />
          </div>

          <div className="mt-2 flex justify-center md:justify-end">
            <PillLink href="#projects" variant="solid" className="px-4 text-sm">
              see all projects
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
