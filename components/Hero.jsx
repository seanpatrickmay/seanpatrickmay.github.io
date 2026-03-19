import { useState } from 'react';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';

const FAN_POSITIONS = [
  { rotation: -10, left: '10%', top: '-20px', z: 3 },
  { rotation: 5, left: '48%', top: '-5px', z: 2 },
  { rotation: 16, left: '26%', top: '30px', z: 1 },
];

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
              width: 200,
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

export default function Hero({ links, featuredProjects = [] }) {
  const projects = Array.isArray(featuredProjects) ? featuredProjects.slice(0, 3) : [];

  return (
    <section id="home" className="section-container py-12 scroll-mt-32 lg:scroll-mt-16">
      <div className="relative">
        {/* Cards positioned behind text in top-right */}
        <div className="hidden md:block absolute -top-4 right-0 w-[55%] h-[calc(100%-40px)] pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
          <div className="relative w-full h-full [&_a]:pointer-events-auto animate-fade-up [animation-delay:400ms]">
            <ProjectPolaroidFan projects={projects} />
          </div>
        </div>

        <div className="relative pointer-events-none" style={{ zIndex: 10 }}>
          <div className="space-y-5 max-w-md [&>*]:pointer-events-auto">
            <div className="flex items-center gap-4 animate-fade-up">
              <img
                src="/images/headshot.png"
                alt="Sean P. May"
                width={400}
                height={400}
                className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-slate-200/80 dark:ring-slate-700/80 shadow-md flex-shrink-0"
              />
              <div>
                <h1 className="font-display text-3xl md:text-4xl tracking-tight text-slate-900 dark:text-white">
                  Sean P. May
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Boston, MA</p>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:100ms]">
              <p className="text-xl md:text-2xl font-semibold leading-snug text-slate-800 dark:text-slate-200">
                swe, math, and whatever looks interesting
              </p>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 mt-1">
                i really like hard problems
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 lg:hidden animate-fade-up [animation-delay:150ms]">
              <Badge variant="outline" className="text-xs">Quant Research &mdash; NU Systematic Alpha</Badge>
              <Badge variant="outline" className="text-xs">Incoming SWE Intern &mdash; Capital One</Badge>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-up [animation-delay:200ms]">
              built an agentic AI tutor at NExT, now i'm doing quant research and heading to Capital One this summer. triathlons, prompting, reading, and stacking some chips in between
            </p>

            <div className="flex flex-wrap gap-3 pt-2 animate-fade-up [animation-delay:300ms]">
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
        </div>

        {/* "see all" link below */}
        <div className="flex justify-end mt-6 md:mt-2 animate-fade-up [animation-delay:500ms]">
          <PillLink href="#projects" variant="solid" className="px-4 text-sm">
            see all projects
          </PillLink>
        </div>

        {/* Mobile: show cards normally */}
        <div className="md:hidden mt-8 animate-fade-up [animation-delay:400ms]">
          <div className="relative" style={{ minHeight: 340 }}>
            <ProjectPolaroidFan projects={projects} />
          </div>
        </div>
      </div>
    </section>
  );
}
