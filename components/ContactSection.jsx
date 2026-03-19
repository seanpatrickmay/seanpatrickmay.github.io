import { Mail } from 'lucide-react';
import PillLink from '@/components/ui/PillLink';

export default function ContactSection({ links }) {
  return (
    <section id="contact" className="section-container py-16 scroll-mt-32 lg:scroll-mt-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
          Let&apos;s talk.
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          I&apos;m always up for hard problems, interesting projects, or just
          a good conversation. Worst case, you&apos;ll get a fast reply.
        </p>
        <div className="mt-6">
          <PillLink href={links.email} variant="solid" icon={Mail} className="px-6">
            Send an email
          </PillLink>
        </div>
      </div>
    </section>
  );
}
