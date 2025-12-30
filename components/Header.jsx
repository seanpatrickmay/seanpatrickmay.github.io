import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import PillLink from '@/components/ui/PillLink';
import {
  Briefcase,
  ClipboardList,
  Github,
  GraduationCap,
  Home,
  Linkedin,
  Mail,
  Sparkles,
  Trophy,
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: Sparkles },
  { id: 'projects', label: 'Projects', icon: Trophy },
  { id: 'experience', label: 'Work Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'other-work', label: 'Leadership & Activities', icon: ClipboardList },
];

export default function Header({ links }) {
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
            Sean P. May
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <nav className="border-t border-slate-200/70 bg-white/90 py-3 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
          <div className="section-container flex gap-2 overflow-x-auto no-scrollbar">
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={id === 'projects' ? '/projects/' : `#${id}`}
                className="flex flex-none items-center rounded-full border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <aside className="hidden lg:block lg:flex-none lg:self-stretch">
        <div className="sticky top-6">
          <div className="flex min-h-[calc(100vh_-_3rem)] flex-col justify-center py-6">
            <div
              className="flex w-72 flex-col gap-5 transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translateY(${scrollOffset}px)` }}
            >
              <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <a
                      href="#home"
                      className="text-2xl font-bold tracking-tight text-slate-900 transition hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                    >
                      Sean P. May
                    </a>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      CS & Math @ NU.
                      <br />
                      SWE + AI.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ThemeToggle />
                  </div>
                </div>
                <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Now
                    </div>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          🎓
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">B.S. CS &amp; Math</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Northeastern University · May 2027
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          📈
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Quant Research</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            NU Systematic Alpha
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          📝
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Calc III Grader</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            NU College of Science
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Previously
                    </div>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          🧪
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">SWE Co-op</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            NExT Consulting · Fall 2025
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Looking for
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        🔎
                      </span>
                      <div className="min-w-0 leading-snug">
                        <div className="font-medium text-slate-900 dark:text-slate-100">SWE/ML roles</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Summer/Fall 2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Navigate
                </div>
                <nav aria-label="Primary" className="mt-4 space-y-1.5">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={id === 'projects' ? '/projects/' : `#${id}`}
                      className="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent bg-slate-100 text-slate-600 transition group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:border-slate-700 dark:group-hover:bg-slate-800 dark:group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </a>
                  ))}
                </nav>
              </section>

              <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Get in touch
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <PillLink
                    href={links.email}
                    icon={Mail}
                    variant="solid"
                    className="w-full justify-center px-4"
                  >
                    Say Hello
                  </PillLink>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <a
                    href={links.github}
                    className="group inline-flex items-center gap-2 transition hover:text-slate-700 dark:hover:text-slate-200"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200" />
                    GitHub
                  </a>
                  <a
                    href={links.linkedin}
                    className="group inline-flex items-center gap-2 transition hover:text-slate-700 dark:hover:text-slate-200"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Linkedin className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200" />
                    LinkedIn
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
