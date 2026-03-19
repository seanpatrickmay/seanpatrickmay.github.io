import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StackedCardPreview from '@/components/StackedCardPreview';

export default function EducationItem({ item, mode = 'expanded' }) {
  const { school, degree, extras = [], img, oneLiner, emoji } = item;
  const isPreview = mode === 'preview';
  const previewLabel = oneLiner || school;
  const imageAlt = img ? `${school} logo` : undefined;

  if (isPreview) {
    return <StackedCardPreview img={img} alt={imageAlt} emoji={emoji} label={previewLabel} />;
  }

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-5">
          {img && <img src={img} alt={imageAlt} loading="lazy" className="w-16 h-16 object-contain" />}
          {!img && emoji && (
            <span className="text-3xl" aria-hidden="true">
              {emoji}
            </span>
          )}
          <CardTitle className="text-base sm:text-lg">{school}</CardTitle>
        </div>
        {degree && <div className="text-sm text-slate-500 dark:text-slate-300">{degree}</div>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {extras.map((x, i) => (
            <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
