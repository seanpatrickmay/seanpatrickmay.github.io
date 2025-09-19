import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function EducationItem({ item, mode = 'expanded' }) {
  const { school, degree, extras = [], img } = item;
  const isPreview = mode === 'preview';

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={`${school} logo`} className="w-10 h-10 object-contain" />}
          <CardTitle className="text-base sm:text-lg">{school}</CardTitle>
        </div>
        {!isPreview && degree && <div className="text-sm opacity-70">{degree}</div>}
      </CardHeader>
      {!isPreview && (
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
