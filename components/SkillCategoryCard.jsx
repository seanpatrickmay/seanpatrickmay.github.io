import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import StackedCardPreview from '@/components/StackedCardPreview';

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
              {column.map((item, i) => {
                const dotColors = [
                  'text-teal-500',
                  'text-sky-500',
                  'text-amber-500',
                  'text-rose-400',
                  'text-violet-500',
                  'text-emerald-500',
                ];
                return (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <span className={`text-xs font-bold ${dotColors[(index * column.length + i) % dotColors.length]}`}>•</span>
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
