import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function EducationItem({ item }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.school}</CardTitle>
        <div className="text-sm opacity-70">{item.degree}</div>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          {item.extras.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
