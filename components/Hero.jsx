import Link from 'next/link';
import { Github, Linkedin, Mail, Trophy } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';

export default function Hero({ links, featuredProjects = [] }) {
  const projects = Array.isArray(featuredProjects) ? featuredProjects.slice(0, 3) : [];

  return (
    <section id="home" className="section-container py-12 scroll-mt-32 lg:scroll-mt-16">
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <div className="space-y-5">
          <div className="flex items-center gap-4 animate-fade-up">
            <img
              src="/images/headshot.png"
              alt="Sean P. May"
              className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-slate-200/80 dark:ring-slate-700/80 shadow-md flex-shrink-0"
            />
            <div>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight text-slate-900 dark:text-white">
                Sean P. May
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Boston, MA</p>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:100ms]">
            <p className="text-xl md:text-2xl font-semibold leading-snug text-slate-800 dark:text-slate-200">
              SWE &amp; Math.
            </p>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mt-1">
              Big fan of hard problems.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 lg:hidden animate-fade-up [animation-delay:150ms]">
            <Badge variant="outline" className="text-xs">Quant Research &mdash; NU Systematic Alpha</Badge>
            <Badge variant="outline" className="text-xs">Incoming SWE Intern &mdash; Capital One</Badge>
          </div>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-up [animation-delay:200ms]">
            Built an agentic AI tutor at NExT, now doing quant research and heading to Capital One this summer. Triathlons, prompting, reading, and stacking some chips in between.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 animate-fade-up [animation-delay:300ms]">
            <PillLink href={links.github} icon={Github} external className="px-4">
              GitHub
            </PillLink>
            <PillLink href={links.linkedin} icon={Linkedin} external className="px-4">
              LinkedIn
            </PillLink>
            <PillLink href={links.email} variant="solid" icon={Mail} className="px-4">
              Get in touch
            </PillLink>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:400ms]">
          <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle icon={Trophy}>Featured Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {projects.map(project => {
                  const href = project?.slug ? `/projects/${project.slug}/` : '/projects/';
                  const description = project?.cardDescription || project?.featuredDescription || project?.oneLiner || project?.summary || '';

                  return (
                    <Link
                      key={project?.slug ?? project?.title ?? href}
                      href={href}
                      className="group block rounded-2xl border border-slate-200/60 bg-white/60 p-3 shadow-sm transition hover:bg-white hover:border-teal-200 dark:border-slate-800/60 dark:bg-slate-950/50 dark:hover:bg-slate-900/60 dark:hover:border-teal-500/30"
                    >
                      <div className="flex items-start gap-3">
                        {project?.emoji && (
                          <span className="text-xl leading-none" aria-hidden="true">
                            {project.emoji}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 dark:text-slate-50 leading-snug break-words">
                            {project?.title ?? 'Project'}
                          </div>
                          {description && (
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                              {description}
                            </div>
                          )}
                        </div>
                        <span className="text-slate-400 transition group-hover:text-teal-500 dark:group-hover:text-teal-400">
                          &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <PillLink href="/projects/" variant="solid" className="px-3 text-sm">
                Browse all projects
              </PillLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
