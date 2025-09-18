import ThemeToggle from '@/components/ThemeToggle';
import PillLink from '@/components/ui/PillLink';
import {
  Briefcase,
  ClipboardList,
  Cpu,
  FileText,
  GraduationCap,
  Home,
  Mail,
  Sparkles,
  Trophy,
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'other-work', label: 'Other Work', icon: ClipboardList },
  { id: 'projects', label: 'Projects', icon: Trophy },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Cpu },
];

export default function Header({ links }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70 lg:hidden">
        <div className="section-container flex h-16 items-center justify-between">
          <a href="#home" className="font-bold tracking-tight text-xl">
            Sean P. May
          </a>
          <div className="flex items-center gap-2">
            <PillLink href={links.resume} icon={FileText} external className="px-4">
              Resume
            </PillLink>
            <ThemeToggle />
          </div>
        </div>
        <nav className="border-t border-slate-200/70 bg-white/90 py-3 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
          <div className="section-container flex gap-2 overflow-x-auto no-scrollbar">
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex flex-none items-center rounded-full border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <aside className="hidden lg:block">
        <div className="fixed left-8 top-1/2 z-40 w-60 -translate-y-1/2">
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div>
              <a
                href="#home"
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              >
                Sean P. May
              </a>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                CS & Math student exploring ML, systems, and strategy.
              </p>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent bg-slate-100 text-slate-600 transition group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:border-slate-700 dark:group-hover:bg-slate-800 dark:group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </a>
              ))}
            </nav>
            <div className="space-y-3">
              <PillLink
                href={links.resume}
                icon={FileText}
                external
                className="w-full justify-center px-4"
                variant="solid"
              >
                View Resume
              </PillLink>
              <PillLink
                href={links.email}
                icon={Mail}
                className="w-full justify-center px-4"
              >
                Say Hello
              </PillLink>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
