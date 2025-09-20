import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StackedCardPreview from './StackedCardPreview';

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
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={imageAlt} className="w-10 h-10 object-contain" />}
          {!img && emoji && (
            <span className="text-2xl" aria-hidden="true">
              {emoji}
            </span>
          )}
          <CardTitle className="text-base sm:text-lg">{school}</CardTitle>
        </div>
        {degree && <div className="text-sm opacity-70">{degree}</div>}
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          {extras.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

