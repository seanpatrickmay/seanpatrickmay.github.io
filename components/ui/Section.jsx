export default function Section({ id, title, icon, children, className = '', ...props }) {
  const Icon = icon;
  const isExpanded = props['data-expanded'] === 'true';
  const sectionClassName = `section-container py-10 scroll-mt-16 ${className}`.trim();
  const headingClassName = [
    'flex items-center gap-3 mb-6 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-90',
  ]
    .filter(Boolean)
    .join(' ');
  const iconContainerClassName = [
    'card p-2 rounded-xl border bg-white dark:bg-slate-900 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    isExpanded ? 'scale-[1.05] border-white/40 shadow-lg' : 'scale-100 border-white/10 shadow',
  ]
    .filter(Boolean)
    .join(' ');
  const titleClassName = [
    'text-2xl font-semibold transition-colors duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    isExpanded
      ? 'text-slate-900 dark:text-slate-50'
      : 'text-slate-700 dark:text-slate-200',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={sectionClassName} {...props}>
      <div className={headingClassName}>
        <div className={iconContainerClassName}>
          <Icon className="w-5 h-5 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
        </div>
        <h2 className={titleClassName}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
