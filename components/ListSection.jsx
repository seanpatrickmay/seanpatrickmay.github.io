import Section from '@/components/ui/Section';

export default function ListSection({ id, title, icon, items, renderItem, columns = 1 }) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : '';
  return (
    <Section id={id} title={title} icon={icon}>
      <div className={`grid gap-6 ${gridCols}`.trim()}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </Section>
  );
}
