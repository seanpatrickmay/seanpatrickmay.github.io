import { Mail, Linkedin, Github } from 'lucide-react';
import PillLink from '@/components/ui/PillLink';

export default function ContactSection({ links }) {
  return (
    <section id="contact" className="section-container py-16 scroll-mt-32 lg:scroll-mt-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Let&apos;s talk.
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          I&apos;m always up for hard problems, poker strategy debates, or just
          a good conversation. Worst case, you&apos;ll get a fast reply.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <PillLink href={links.email} variant="solid" icon={Mail} className="px-5">
            Send an email
          </PillLink>
          <PillLink href={links.linkedin} icon={Linkedin} external className="px-5">
            LinkedIn
          </PillLink>
          <PillLink href={links.github} icon={Github} external className="px-5">
            GitHub
          </PillLink>
        </div>
      </div>
    </section>
  );
}
