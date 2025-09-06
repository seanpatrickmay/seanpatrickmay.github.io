import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function EducationItem({ item }) {
  const { school, degree, extras = [], img } = item;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {img && <img src={img} alt={`${school} logo`} className="w-8 h-8 object-contain" />}
          <CardTitle>{school}</CardTitle>
        </div>
        <div className="text-sm opacity-70">{degree}</div>
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
