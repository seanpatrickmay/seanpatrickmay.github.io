import { useState } from 'react';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';

// A dealt-cards cascade rather than a tight fan. The fan was tuned for a
// ~570px absolute overlay; inside the hero's own column it packed three 200px
// cards into ~460px and the third all but disappeared. Going down-and-right
// with increasing z keeps every title legible, and dropping the negative
// `top` stops the handwritten note above being overlapped.
const FAN_POSITIONS = [
  // z descends with rank: the fan is fed from caseStudyRank, so the strongest
  // project has to be the one on top and fully legible. Increasing z put the
  // third-ranked project in front, covering the titles of the first two.
  { rotation: -6, left: '0%', top: '0px', z: 3 },
  { rotation: 3, left: '25%', top: '58px', z: 2 },
  { rotation: 11, left: '48%', top: '116px', z: 1 },
];
const FAN_CARD_WIDTH = 190;

function ProjectPolaroidFan({ projects = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (projects.length === 0) return null;

  return (
    <>
      {projects.map((project, i) => {
        if (!project) return null;
        const pos = FAN_POSITIONS[i] || FAN_POSITIONS[0];
        const href = project.slug ? `/projects/${project.slug}/` : '/projects/';
        const coverSrc = project.coverImage?.src;
        const description = project.cardDescription || project.oneLiner || '';
        const isHovered = hoveredIndex === i;
        const zIndex = isHovered ? 20 : pos.z;

        return (
          <Link
            key={project.slug ?? project.title ?? i}
            href={href}
            className="group absolute block transition-all duration-300 ease-out"
            style={{
              top: pos.top,
              left: pos.left,
              zIndex,
              transform: `rotate(${pos.rotation}deg)${isHovered ? ' scale(1.06) translateY(-8px)' : ''}`,
              width: FAN_CARD_WIDTH,
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={[
                'overflow-hidden rounded-sm border bg-white p-1.5 pb-3 shadow-md transition-shadow duration-300',
                'border-stone-200 dark:border-stone-700 dark:bg-stone-800',
                isHovered ? 'shadow-xl' : '',
              ].join(' ')}
            >
              <div className="relative h-24 w-full overflow-hidden rounded-sm sm:h-28">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={project.coverImage?.alt || ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900/40" />
                )}
              </div>

              <div className="px-1.5 pt-2">
                <div className="flex items-center gap-1.5">
                  {project.emoji && (
                    <span className="text-base leading-none" aria-hidden="true">{project.emoji}</span>
                  )}
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {project.title}
                  </span>
                </div>
                {description && (
                  <p className="mt-1 text-[11px] leading-snug text-stone-500 dark:text-stone-400 line-clamp-2">
                    {description}
                  </p>
                )}
                <span className="mt-1.5 inline-block text-[10px] font-semibold tracking-wider text-teal-600 transition-colors group-hover:text-teal-700 dark:text-teal-400 dark:group-hover:text-teal-300">
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
              src="/images/headshot.png"
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

          <div className="relative min-h-[400px] sm:min-h-[430px]">
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
