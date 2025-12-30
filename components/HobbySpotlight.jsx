import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function HobbySpotlight({ hobbies = [] }) {
  if (!Array.isArray(hobbies) || hobbies.length === 0) return null;

  const lgColumnsClass = (() => {
    if (hobbies.length >= 4) return 'lg:grid-cols-4';
    if (hobbies.length === 3) return 'lg:grid-cols-3';
    if (hobbies.length === 2) return 'lg:grid-cols-2';
    return 'lg:grid-cols-1';
  })();

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${lgColumnsClass}`}>
      {hobbies.map(hobby => (
        <Card key={hobby.title} className="bg-white/70 shadow-sm dark:bg-slate-900/60">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-xl" aria-hidden="true">
                {hobby.emoji}
              </span>
              {hobby.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">{hobby.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
