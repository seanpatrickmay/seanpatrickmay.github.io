import ThemeToggle from '@/components/ThemeToggle';
import SidebarTimeline from '@/components/SidebarTimeline';
import PinCard from '@/components/PinCard';
import { Github, Linkedin, Mail } from 'lucide-react';

/**
 * Pinned to the top-left beside the hero, not a full-height sticky column.
 *
 * It used to run the height of the page, which squeezed every section below
 * into ~1150px and made the whole site feel narrow. Now it sits at the top and
 * scrolls away, and everything under it gets the full width.
 */
export default function Sidebar({ links, timeline = { current: [], past: [] } }) {
  return (
    <aside aria-label="Sidebar" className="hidden w-72 flex-none lg:block">
      <div className="flex w-72 flex-col gap-5">
          <PinCard rotation={-1.2} pinColor="red">
            <section
              aria-label="About"
              className="paper rounded-3xl border border-stone-300/80 p-6 shadow-lg dark:border-stone-700/70"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href="#home"
                  className="font-display text-2xl leading-none tracking-tight text-slate-900 transition hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                >
                  Sean P. May
                </a>
                <ThemeToggle />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                i write code and do math
              </p>

              <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <SidebarTimeline label="now" entries={timeline.current} />
                <SidebarTimeline label="previously" entries={timeline.past} />
              </div>

              {/* Contact folded in rather than given its own card. The page
                  already has a "say hi" button in the hero and a full
                  contact section at the bottom; a third card for the same
                  action was the least useful thing in the sidebar. */}
              <div className="mt-5 border-t border-stone-200 pt-4 dark:border-stone-700">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                  <a
                    href={links.email}
                    className="inline-flex items-center gap-1.5 font-medium text-teal-700 transition hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {links.emailDisplay || 'say hi'}
                  </a>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <a
                    href={links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                  <a
                    href={links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </section>
          </PinCard>
      </div>
    </aside>
  );
}
