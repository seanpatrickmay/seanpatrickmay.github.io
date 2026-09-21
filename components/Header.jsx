import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { id: 'home', label: 'home' },
  { id: 'about', label: 'about me' },
  { id: 'projects', label: 'projects' },
  { id: 'experience', label: 'work' },
];

/**
 * Mobile-only top bar. The desktop sidebar lives in Sidebar.jsx.
 *
 * The scroll-nudge state that used to live here only existed to translate the
 * sidebar by a few pixels; it left with the sidebar.
 */
export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70 lg:hidden">
      <div className="section-container flex h-16 items-center justify-between">
        <a href="#home" className="text-xl font-bold tracking-tight">
          sean p. may
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <nav className="border-t border-slate-200/70 bg-white/90 py-3 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
        <div
          className="section-container no-scrollbar flex gap-2 overflow-x-auto"
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
  );
}
