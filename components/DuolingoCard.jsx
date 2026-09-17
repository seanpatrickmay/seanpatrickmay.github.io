import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Languages } from 'lucide-react';

const NUM = new Intl.NumberFormat('en-US');

export default function DuolingoCard({ data = null, bare = false }) {
  const courses = Array.isArray(data?.courses) ? data.courses : [];
  if (!data || !courses.length) return null;

  const streak = Number(data.streak) || 0;
  const totalXp = Number(data.totalXp) || 0;
  // Percentages are of the shown courses, so the bars sum to 100% even when a
  // dabbled-in language has been filtered out upstream.
  const shownXp = Number(data.shownXp) || courses.reduce((s, c) => s + (Number(c.xp) || 0), 0);

  const since = data.joined
    ? new Date(data.joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : null;

  const content = (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-lime-700/80 dark:text-lime-400/80">
          duolingo
        </div>
        {since && (
          <div className="text-[10px] text-stone-400 dark:text-stone-500">since {since}</div>
        )}
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold leading-none text-stone-900 dark:text-stone-50">
          {streak}
        </span>
        <span className="text-sm font-semibold text-stone-400 dark:text-stone-500">
          day streak
        </span>
      </div>
      <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
        {NUM.format(totalXp)} XP total
      </div>

      <ul className="mt-3 space-y-2">
        {courses.map(course => {
          const xp = Number(course.xp) || 0;
          const pct = shownXp > 0 ? (xp / shownXp) * 100 : 0;
          const label = `${course.title}: ${NUM.format(xp)} XP, ${Math.round(pct)}% of tracked XP`;
          return (
            <li key={course.language || course.title}>
              <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[11px]">
                <span className="truncate font-medium text-stone-700 dark:text-stone-200">
                  <span aria-hidden="true">{course.flag}</span> {course.title}
                </span>
                <span className="shrink-0 tabular-nums text-stone-500 dark:text-stone-400">
                  {NUM.format(xp)}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-lime-100 dark:bg-lime-900/30"
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
              >
                <div
                  className="h-full rounded-full bg-lime-500 dark:bg-lime-400"
                  // Floor at 2% so a small language stays visible rather than
                  // rendering as an empty track.
                  style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {data.profileUrl && (
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-block text-[10px] text-stone-400 transition-colors hover:text-lime-600 dark:text-stone-500 dark:hover:text-lime-400"
        >
          view profile →
        </a>
      )}
    </div>
  );

  if (bare) return content;

  return (
    <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle icon={Languages}>Duolingo</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
