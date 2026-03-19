import { Mail, Github, Linkedin } from 'lucide-react';
import PillLink from '@/components/ui/PillLink';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';

export default function ContactSection({ links }) {
  return (
    <section id="contact" className="section-container py-16 scroll-mt-32 lg:scroll-mt-16">
      <Pinboard>
        <PinCard rotation={1} pinColor="teal">
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 px-8 py-10 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            {/* Decorative scattered emoji */}
            <span aria-hidden="true" className="absolute -top-1 left-6 text-2xl opacity-20 motion-reduce:!rotate-0" style={{ transform: 'rotate(-12deg)' }}>💬</span>
            <span aria-hidden="true" className="absolute -bottom-1 right-8 text-xl opacity-20 motion-reduce:!rotate-0" style={{ transform: 'rotate(8deg)' }}>👋</span>
            <span aria-hidden="true" className="absolute top-4 right-4 text-lg opacity-15 motion-reduce:!rotate-0" style={{ transform: 'rotate(15deg)' }}>✉️</span>

            <h2 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
              let's talk
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              i'm always down for hard problems, interesting projects, or just
              a good conversation. worst case you get a fast reply
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <PillLink href={links.email} variant="solid" icon={Mail} className="px-6">
                shoot me an email
              </PillLink>
            </div>
            <div className="mt-4 flex justify-center gap-3">
              <PillLink href={links.github} icon={Github} external variant="ghost" className="text-sm">
                GitHub
              </PillLink>
              <PillLink href={links.linkedin} icon={Linkedin} external variant="ghost" className="text-sm">
                LinkedIn
              </PillLink>
            </div>
          </div>
        </PinCard>
      </Pinboard>
    </section>
  );
}
