import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import PillLink from '@/components/ui/PillLink';

/**
 * Who, what, and how to reach me. One column since the project fan left: the
 * board starts directly below, so the hero no longer previews it, and the
 * same three projects stop appearing twice within one scroll.
 */
export default function Hero({ links, timeline = { current: [] } }) {
  const highlights = (timeline.current || []).filter(e => e.highlight);

  return (
    <section id="home" className="section-container scroll-mt-32 py-12 lg:scroll-mt-16">
      <div className="max-w-3xl space-y-5">
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
            the way "SWE Intern — Capital One" did after August. A role with an
            href links to the project built there. */}
        {highlights.length > 0 && (
          <div className="animate-fade-up flex flex-wrap gap-2 pt-1 [animation-delay:150ms] lg:hidden">
            {highlights.map(entry => {
              const badge = (
                <Badge variant="outline" className="text-xs">
                  {entry.role} &mdash; {entry.org}
                </Badge>
              );
              return entry.href ? (
                <Link
                  key={entry.org}
                  href={entry.href}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  {badge}
                </Link>
              ) : (
                <span key={entry.org}>{badge}</span>
              );
            })}
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
    </section>
  );
}
