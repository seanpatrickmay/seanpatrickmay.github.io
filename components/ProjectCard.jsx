import Badge from './ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import PillLink from './ui/PillLink';

export default function ProjectCard({ project, compact = false }) {
  const { title, period, stack = [], bullets = [], links = [], emoji } = project;
  const previewStack = stack.slice(0, 3);
  const stackOverflow = stack.length - previewStack.length;
  const firstBullet = bullets[0];
  const primaryLink = links[0];

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className={compact ? 'text-base font-semibold' : ''}>
            {emoji ? `${emoji} ${title}` : title}
          </CardTitle>
          <span className={compact ? 'text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400' : 'text-sm opacity-70'}>
            {period}
          </span>
        </div>
        {compact && previewStack.length > 0 && (
          <div className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 flex flex-wrap gap-2">
            {previewStack.map((s) => (
              <span key={s}>{s}</span>
            ))}
            {stackOverflow > 0 && <span>+{stackOverflow}</span>}
          </div>
        )}
      </CardHeader>
      {compact ? (
        <CardContent className="px-6 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300 space-y-2">
          {firstBullet && <p className="truncate">{firstBullet}</p>}
          {primaryLink && (
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {primaryLink.label}
            </p>
          )}
        </CardContent>
      ) : (
        <CardContent>
          {!!stack.length && (
            <div className="flex flex-wrap gap-2">
              {stack.map((s) => <Badge key={s}>{s}</Badge>)}
            </div>
          )}
          {!!bullets.length && (
            <ul className="list-disc pl-5 space-y-2">
              {bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {!!links.length && (
            <div className="flex flex-wrap gap-3 pt-1">
              {links.map((l, i) => (
                <PillLink key={i} href={l.href} external>
                  {l.label}
                </PillLink>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

