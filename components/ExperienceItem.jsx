import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import StackedCardPreview from './StackedCardPreview';

export default function ExperienceItem({ job, mode = 'expanded' }) {
  const { role, org, location, period, bullets = [], img, emoji, oneLiner } = job;
  const isPreview = mode === 'preview';
  const previewLabel = oneLiner || [role, org].filter(Boolean).join(' — ');
  const imageAlt = img ? `${org} logo` : undefined;
  const hasMeta = Boolean(location || period);

  if (isPreview) {
    return (
      <Card className="h-full overflow-hidden" data-mode={mode}>
        <StackedCardPreview img={img} alt={imageAlt} emoji={emoji} label={previewLabel} meta={period} />
      </Card>
    );
  }

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={imageAlt} className="w-9 h-9 object-contain" />}
          {!img && emoji && (
            <span className="text-2xl" aria-hidden="true">
              {emoji}
            </span>
          )}
          <CardTitle className="text-base sm:text-lg">
            {role} — {org}
          </CardTitle>
        </div>
        {hasMeta && (
          <div className="text-sm opacity-70 flex flex-wrap items-center gap-2">
            {location && <span>{location}</span>}
            {location && period && <span aria-hidden="true">•</span>}
            {period && <span>{period}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

