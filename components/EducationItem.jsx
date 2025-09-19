import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function EducationItem({ item, compact = false }) {
  const { school, degree, extras = [], img } = item;
  const firstExtra = extras[0];

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={`${school} logo`} className="w-8 h-8 object-contain" />}
          <CardTitle className={compact ? 'text-base font-semibold' : ''}>{school}</CardTitle>
        </div>
        <div className={compact ? 'text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400' : 'text-sm opacity-70'}>
          {degree}
        </div>
      </CardHeader>
      {compact ? (
        firstExtra ? (
          <CardContent className="px-6 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-300">
            <p className="truncate">{firstExtra}</p>
          </CardContent>
        ) : null
      ) : (
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {extras.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
