import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StackedCardPreview from './StackedCardPreview';

function splitIntoColumns(items = []) {
  if (items.length <= 6) {
    return [items];
  }

  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export default function SkillCategoryCard({ category, mode = 'expanded' }) {
  const items = category.items ?? [];
  const columns = splitIntoColumns(items);

  if (mode === 'preview') {
    return (
      <StackedCardPreview
        emoji={category.emoji}
        label={category.oneLiner || category.title}
      />
    );
  }

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {category.emoji}
          </span>
          <CardTitle className="text-lg sm:text-xl">{category.title}</CardTitle>
        </div>
        {category.summary && (
          <p className="text-sm text-slate-600 dark:text-white/70">
            {category.summary}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`grid gap-3 ${columns.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {columns.map((column, index) => (
            <ul key={index} className="space-y-2">
              {column.map(item => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-white/60">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
