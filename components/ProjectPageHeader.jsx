import ThemeToggle from '@/components/ThemeToggle';

export default function ProjectPageHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70">
      <div className="section-container flex h-14 items-center justify-between">
        <a href="/" className="font-bold tracking-tight text-lg text-slate-900 dark:text-slate-100 transition hover:text-slate-700 dark:hover:text-slate-300">
          Sean P. May
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
