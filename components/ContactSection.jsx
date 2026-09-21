import { Mail, Github, Linkedin } from 'lucide-react';
import PillLink from '@/components/ui/PillLink';
import Pinboard from '@/components/Pinboard';
import PinCard from '@/components/PinCard';

/**
 * Contact, as a postcard.
 *
 * A postcard is already the shape of this content — a short message on the
 * left, who it goes to on the right — so the layout does not have to be
 * invented, only borrowed. The right-hand block is a real address block with
 * real links rather than decorative ruled lines; the whole point of the
 * section is that someone can act on it.
 */

/** Perforated postage stamp. Decorative, so it carries no text a reader needs. */
function Postage() {
  return (
    <div
      aria-hidden="true"
      className="postage absolute right-5 top-5 h-[4.5rem] w-[3.5rem] rotate-3 bg-teal-700/90 dark:bg-teal-500/80"
    >
      <div className="absolute inset-[5px] flex flex-col items-center justify-center border border-white/50 text-white">
        <span className="font-display text-xl leading-none">SM</span>
        <span className="mt-1 text-[7px] uppercase tracking-[0.18em]">boston</span>
      </div>
    </div>
  );
}

/** Cancellation mark, overlapping the stamp the way a real one does. */
function Postmark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="pointer-events-none absolute right-2 top-2 h-24 w-24 -rotate-12 text-stone-500/40 dark:text-stone-300/30"
    >
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        x="50"
        y="34"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2 }}
      >
        BOSTON MA
      </text>
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: 7, fontWeight: 600, letterSpacing: 1 }}
      >
        USA
      </text>
      <path
        d="M22 50 H78 M26 56 H74 M26 44 H74"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.7"
      />
    </svg>
  );
}

export default function ContactSection({ links }) {
  return (
    <section id="contact" className="section-container py-16 scroll-mt-32 lg:scroll-mt-16">
      <Pinboard>
        <PinCard rotation={-0.8} pinColor="red" fastener="tape">
          <div className="postcard mx-auto max-w-3xl overflow-hidden rounded-[10px]">
            <div className="grid md:grid-cols-[1.05fr_1fr]">
              {/* Message side */}
              <div className="px-7 py-8 sm:px-9 md:border-r md:border-dashed md:border-stone-400/50 dark:md:border-stone-500/40">
                <h2 className="font-display text-3xl tracking-tight text-stone-900 dark:text-stone-50">
                  let&apos;s talk
                </h2>
                <p className="font-hand mt-3 text-xl leading-snug text-stone-700 dark:text-stone-200">
                  i&apos;m always down for hard problems, interesting projects, or
                  just a good conversation. worst case you get a fast reply
                </p>
                <PillLink
                  href={links.email}
                  variant="solid"
                  icon={Mail}
                  className="mt-6 px-6"
                >
                  shoot me an email
                </PillLink>
              </div>

              {/* Address side */}
              <div className="relative px-7 pb-8 pt-8 sm:px-9">
                <Postage />
                <Postmark />

                <div className="mt-[5.5rem] space-y-2.5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                    send to
                  </div>
                  <div className="border-b border-stone-300/80 pb-1 text-base font-semibold text-stone-800 dark:border-stone-600/70 dark:text-stone-100">
                    Sean May
                  </div>
                  <a
                    href={links.email}
                    className="block break-all border-b border-stone-300/80 pb-1 text-sm text-stone-600 underline-offset-4 transition-colors hover:text-teal-700 hover:underline dark:border-stone-600/70 dark:text-stone-300 dark:hover:text-teal-400"
                  >
                    {links.emailDisplay}
                  </a>
                  <div className="flex gap-3 pt-1">
                    <PillLink href={links.github} icon={Github} external variant="ghost" className="text-sm">
                      GitHub
                    </PillLink>
                    <PillLink href={links.linkedin} icon={Linkedin} external variant="ghost" className="text-sm">
                      LinkedIn
                    </PillLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PinCard>
      </Pinboard>
    </section>
  );
}
