import Badge from "./ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";

export default function SkillsGrid({ skills }) {
  const Block = ({ title, items }) => (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">{items.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      </CardContent>
    </Card>
  );
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Block title="Languages" items={skills.languages} />
      <Block title="Tools & Libraries" items={skills.tools} />
      <Block title="Platforms" items={skills.platforms} />
    </div>
  );
}

