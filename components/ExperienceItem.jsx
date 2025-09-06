import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";

export default function ExperienceItem({ job }) {
  const { role, org, location, period, bullets = [], img, emoji } = job;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {img && <img src={img} alt={`${org} logo`} className="w-8 h-8 object-contain" />}
            {!img && emoji && <span className="text-2xl">{emoji}</span>}
            <CardTitle>{role} — {org}</CardTitle>
          </div>
          <div className="text-sm opacity-70 flex items-center gap-3">
            <span>{location}</span><span>•</span><span>{period}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}

