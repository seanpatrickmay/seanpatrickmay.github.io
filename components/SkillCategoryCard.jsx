import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SkillCategoryCard({ category }) {
  const { title, items = [] } = category;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
