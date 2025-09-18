import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";

export default function ExperienceItem({ job, compact = false }) {
  const { role, org, location, period, bullets = [], img, emoji } = job;
  const locationPeriod = [location, period].filter(Boolean);
  const firstBullet = bullets[0];

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className={`flex items-center justify-between gap-4 ${compact ? 'flex-nowrap' : 'flex-wrap'}`}>
          <div className="flex items-center gap-3">
            {img && <img src={img} alt={`${org} logo`} className="w-8 h-8 object-contain" />}
            {!img && emoji && <span className="text-2xl">{emoji}</span>}
            <CardTitle className={compact ? 'text-base font-semibold' : ''}>
              {role} — {org}
            </CardTitle>
          </div>
          {!compact && (
            <div className="text-sm opacity-70 flex items-center gap-3">
              {location && <span>{location}</span>}
              {location && period && <span>•</span>}
              {period && <span>{period}</span>}
            </div>
          )}
        </div>
        {compact && locationPeriod.length > 0 && (
          <div className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-2">
            {location && <span>{location}</span>}
            {location && period && <span>•</span>}
            {period && <span>{period}</span>}
          </div>
        )}
      </CardHeader>
      {compact ? (
        firstBullet ? (
          <CardContent className="px-6 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300">
            <p className="truncate">{firstBullet}</p>
          </CardContent>
        ) : null
      ) : (
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

