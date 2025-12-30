import Link from 'next/link';
import { MapPin, Github, Linkedin, Trophy } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';

export default function Hero({ links, featuredProjects = [] }) {
  const projects = Array.isArray(featuredProjects) ? featuredProjects.slice(0, 3) : [];

  return (
    <section id="home" className="section-container py-12 scroll-mt-32 lg:scroll-mt-16">
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <div className="space-y-5">
          <Badge icon={MapPin} variant="outline">
            Boston, MA
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="block">CS & Math @ NU</span>
            <span className="block">SWE + AI</span>
          </h1>
          <div className="space-y-2 text-base md:text-lg text-slate-600 dark:text-slate-300">
            <p>I'm a CS &amp; Math student at Northeastern, always trying to get better at everything I do.</p>
            <p>
              Most recently, I built an agentic AI tutor at NExT Consulting, and I'm currently doing quant research with NU Systematic Alpha.
            </p>
            <p>
              I love solving hard problems. If you have any for me, send me an email, I'd love to talk.
            </p>
          </div>
          <div className="pt-2 lg:hidden">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">🎓 Northeastern — B.S. CS &amp; Math (May 2027)</Badge>
              <Badge variant="outline" className="text-xs">📈 Quant Research — NU Systematic Alpha</Badge>
              <Badge variant="outline" className="text-xs">🧪 SWE Co-op — NExT Consulting (Fall 2025)</Badge>
              <Badge variant="outline" className="text-xs">🔎 Summer/Fall 2026 SWE/ML roles</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <PillLink href={links.github} icon={Github} external className="px-4">
              GitHub
            </PillLink>
            <PillLink href={links.linkedin} icon={Linkedin} external className="px-4">
              LinkedIn
            </PillLink>
            <PillLink href={links.email} variant="solid" className="px-4">
              ✉️ Contact
            </PillLink>
          </div>
        </div>

        <div>
          <div className="space-y-6">
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
                        className="group block rounded-2xl border border-slate-200/60 bg-white/60 p-3 shadow-sm transition hover:bg-white dark:border-slate-800/60 dark:bg-slate-950/50 dark:hover:bg-slate-900/60"
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
                          <span className="text-slate-400 transition group-hover:text-slate-600 dark:group-hover:text-slate-300">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <PillLink href="/projects/" variant="solid" className="px-3 text-sm">
                  🚀 Browse projects
                </PillLink>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
