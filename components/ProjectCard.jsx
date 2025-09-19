import Badge from './ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import PillLink from './ui/PillLink';
import StackedCardPreview from './StackedCardPreview';

export default function ProjectCard({ project, mode = 'expanded' }) {
  const { title, period, stack = [], bullets = [], links = [], emoji, oneLiner } = project;
  const isPreview = mode === 'preview';
  const previewLabel = oneLiner || title;

  if (isPreview) {
    return (
      <Card className="h-full overflow-hidden" data-mode={mode}>
        <StackedCardPreview emoji={emoji} label={previewLabel} meta={period} />
      </Card>
    );
  }

  return (
    <Card className="h-full" data-mode={mode}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base sm:text-lg">
            {emoji ? `${emoji} ${title}` : title}
          </CardTitle>
          {period && <span className="text-sm opacity-70">{period}</span>}
        </div>
      </CardHeader>
      <CardContent>
        {!!stack.length && (
          <div className="flex flex-wrap gap-2">
            {stack.map(s => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        )}
        {!!bullets.length && (
          <ul className="list-disc pl-5 space-y-2">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        {!!links.length && (
          <div className="flex flex-wrap gap-3 pt-1">
            {links.map((l, i) => (
              <PillLink key={i} href={l.href} external>
                {l.label}
              </PillLink>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

