import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import SidebarTimeline from '@/components/SidebarTimeline';
import PinCard from '@/components/PinCard';
import { Briefcase, Github, Home, Linkedin, Mail, Sparkles, Trophy } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'home', icon: Home },
  { id: 'about', label: 'about me', icon: Sparkles },
  { id: 'projects', label: 'projects', icon: Trophy },
  { id: 'experience', label: 'work', icon: Briefcase },
];

export default function Header({ links, timeline = { current: [], past: [] } }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollRef = useRef(0);
  const resetTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    lastScrollRef.current = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      const delta = lastScrollRef.current - current;
      lastScrollRef.current = current;

      const offset = Math.max(Math.min(delta * 0.35, 10), -10);
      setScrollOffset(offset);

      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = window.setTimeout(() => {
        setScrollOffset(0);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);


  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70 lg:hidden">
        <div className="section-container flex h-16 items-center justify-between">
          <a href="#home" className="font-bold tracking-tight text-xl">
            sean p. may
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <nav className="border-t border-slate-200/70 bg-white/90 py-3 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
          <div
            className="section-container flex gap-2 overflow-x-auto no-scrollbar"
            style={{
              maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
              WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent)',
            }}
          >
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex flex-none items-center rounded-full border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* Stays put for the whole page. It used to slide away 300px before the
          map section, which meant it vanished mid-scroll through "about me"
          with no way to get it back. */}
      <aside
        aria-label="Sidebar"
        className="hidden w-72 lg:block lg:flex-none lg:self-stretch"
      >
        <div className="sticky top-6">
          <div className="flex min-h-[calc(100vh_-_3rem)] flex-col justify-center py-6">
            <div
              className="flex w-72 flex-col gap-5 will-change-transform"
              style={{ transform: `translateY(${scrollOffset}px)` }}
            >
              <PinCard rotation={-1.2} pinColor="red">
                <section
                  aria-label="About"
                  className="rounded-3xl border border-stone-300/80 bg-stone-50 p-6 shadow-lg dark:border-stone-700/70 dark:bg-stone-900"
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
          </div>
        </div>
      </aside>
    </>
  );
}
