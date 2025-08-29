import { MapPin, Brain, FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PillLink from '@/components/ui/PillLink';

export default function Hero({ links }) {
  return (
    <section id="home" className="section-container py-16 scroll-mt-16">
      <div className="grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3 space-y-5">
          <Badge icon={MapPin} variant="outline">
            Boston, MA
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            CS/Math engineer building ML + systems projects
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            I design and ship clean, usable software — from low-level C to applied ML.
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>🎓 Northeastern University — B.S. CS & Math (May 2027)</li>
            <li>🧪 Incoming: NExT Program SWE Co-op (Fall 2025)</li>
            <li>🔎 Open to Summer/Fall 2026 SWE/ML roles</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <PillLink href="#projects" variant="solid" className="px-4">
              See projects
            </PillLink>
            <PillLink href={links.github} external className="px-4">
              GitHub
            </PillLink>
            <PillLink href={links.linkedin} external className="px-4">
              LinkedIn
            </PillLink>
            <PillLink href={links.email} variant="solid" className="px-4">
              Contact
            </PillLink>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle icon={Brain}>Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge>ML</Badge>
                <Badge>Systems</Badge>
                <Badge>Full-stack</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Focused on game theory, computer vision, and performance-minded code.
              </p>
              <PillLink href={links.resume} icon={FileText} external>
                Resume
              </PillLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

