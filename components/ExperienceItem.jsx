import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";

export default function ExperienceItem({ job, mode = 'expanded' }) {
  const { role, org, location, period, bullets = [], img, emoji } = job;
  const isPreview = mode === 'preview';

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={`${org} logo`} className="w-9 h-9 object-contain" />}
          {!img && emoji && <span className="text-2xl" aria-hidden="true">{emoji}</span>}
          <CardTitle className="text-base sm:text-lg">
            {role} — {org}
          </CardTitle>
        </div>
        {!isPreview && (
          <div className="text-sm opacity-70 flex flex-wrap items-center gap-2">
            {location && <span>{location}</span>}
            {location && period && <span aria-hidden="true">•</span>}
            {period && <span>{period}</span>}
          </div>
        )}
      </CardHeader>
      {!isPreview && (
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

