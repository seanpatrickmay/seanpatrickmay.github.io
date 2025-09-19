import { forwardRef } from 'react';

const Section = forwardRef(function Section(
  { id, title, icon, children, className = '' },
  ref,
) {
  const Icon = icon;
  const sectionClassName = `section-container py-10 scroll-mt-16 ${className}`.trim();

  return (
    <section id={id} ref={ref} className={sectionClassName}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
});

export default Section;

