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
  { id: 'home', label: 'home', icon: Home },
  { id: 'about', label: 'about me', icon: Sparkles },
  { id: 'projects', label: 'projects', icon: Trophy },
  { id: 'experience', label: 'work', icon: Briefcase },
  { id: 'education', label: 'education', icon: GraduationCap },
  { id: 'other-work', label: 'other', icon: ClipboardList },
];

export default function Header({ links }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [sidebarHidden, setSidebarHidden] = useState(false);
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const aboutEl = document.getElementById('about');
    if (!aboutEl) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide sidebar once the top of the about section nears the top of the viewport
        setSidebarHidden(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0 },
    );

    observer.observe(aboutEl);

    return () => observer.disconnect();
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

      <aside
        aria-label="Sidebar navigation"
        className="hidden lg:block lg:flex-none lg:self-stretch overflow-hidden transition-all duration-500 ease-out"
        style={{ width: sidebarHidden ? 0 : 288 }}
      >
        <div className="sticky top-6">
          <div className="flex min-h-[calc(100vh_-_3rem)] flex-col justify-center py-6">
            <div
              className="flex w-72 flex-col gap-5 transition-all duration-500 ease-out will-change-transform"
              style={{
                transform: sidebarHidden
                  ? `translateX(-120%) translateY(${scrollOffset}px)`
                  : `translateY(${scrollOffset}px)`,
                opacity: sidebarHidden ? 0 : 1,
              }}
            >
              <section aria-label="About" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <img
                    src="/images/headshot.png"
                    alt="Sean P. May"
                    width={400}
                    height={400}
                    className="w-14 h-14 rounded-full object-cover object-top ring-2 ring-slate-200/60 dark:ring-slate-700/60"
                  />
                  <ThemeToggle />
                </div>
                <div className="mt-3 space-y-1">
                  <a
                    href="#home"
                    className="font-display text-2xl tracking-tight text-slate-900 transition hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                  >
                    Sean P. May
                  </a>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    i write code and do math
                  </p>
                </div>
                <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <div className="text-xs font-semibold lowercase tracking-wide text-slate-500 dark:text-slate-300">
                      now
                    </div>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          🎓
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">B.S. CS &amp; Math</div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">
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
                          <div className="text-xs text-slate-500 dark:text-slate-300">
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
                          <div className="text-xs text-slate-500 dark:text-slate-300">
                            NU College of Science
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          💼
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">Freelance SWE</div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">
                            Comic Book Grading App
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold lowercase tracking-wide text-slate-500 dark:text-slate-300">
                      previously
                    </div>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          🧪
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">SWE Co-op</div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">
                            NExT Consulting · Fall 2025
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5" aria-hidden="true">
                          🔧
                        </span>
                        <div className="min-w-0 leading-snug">
                          <div className="font-medium text-slate-900 dark:text-slate-100">SDE Co-op</div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">
                            General Dynamics Electric Boat · 2024
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold lowercase tracking-wide text-slate-500 dark:text-slate-300">
                      up next
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <span className="mt-0.5" aria-hidden="true">
                        🏦
                      </span>
                      <div className="min-w-0 leading-snug">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Incoming SWE Intern</div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">
                          Capital One · Richmond, VA · June 1 – August 8, 2026
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section aria-label="Navigation" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900">
                <div className="text-xs font-semibold lowercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  navigate
                </div>
                <nav aria-label="Primary" className="mt-4 space-y-1.5">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={`#${id}`}
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

              <section aria-label="Contact" className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900">
                <div className="text-xs font-semibold lowercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                  say hi
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <PillLink
                    href={links.email}
                    icon={Mail}
                    variant="solid"
                    className="w-full justify-center px-4"
                  >
                    say hi
                  </PillLink>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <PillLink href={links.github} icon={Github} external variant="ghost" className="text-sm">
                    GitHub
                  </PillLink>
                  <PillLink href={links.linkedin} icon={Linkedin} external variant="ghost" className="text-sm">
                    LinkedIn
                  </PillLink>
                </div>
              </section>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
