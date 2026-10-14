import { Pause, Play } from 'lucide-react';
import { useMotionPause } from '@/hooks/useMotionPause';

export default function MotionPauseToggle({ compact = false }) {
  const { mounted, paused, togglePaused } = useMotionPause();
  const label = paused ? 'Resume animations' : 'Pause animations';
  const Icon = paused ? Play : Pause;

  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-pressed={mounted ? paused : false}
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white',
        compact ? 'h-9 w-9' : 'px-3 py-1.5 text-xs font-medium',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {!compact && <span>{paused ? 'motion on' : 'pause motion'}</span>}
    </button>
  );
}
