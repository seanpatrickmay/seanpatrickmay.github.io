import ThemeToggle from '@/components/ThemeToggle';
import PillLink from '@/components/ui/PillLink';
import { FileText } from 'lucide-react';

export default function Header({ links }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur border-b bg-white/70 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="section-container flex items-center justify-between h-16">
        <a href="#home" className="font-bold tracking-tight text-xl">Sean P. May</a>
        <nav className="hidden sm:flex items-center gap-2">
          {['about', 'projects', 'experience', 'education', 'skills'].map(id => (
            <PillLink
              key={id}
              href={`#${id}`}
              variant="solid"
              className="capitalize"
            >
              {id}
            </PillLink>
          ))}
          <PillLink href={links.resume} icon={FileText} external>
            Resume
          </PillLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

