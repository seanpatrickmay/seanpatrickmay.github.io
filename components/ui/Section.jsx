export default function Section({ id, title, icon, children, className = '', ...props }) {
  const Icon = icon;
  const sectionClassName = `section-container py-6 scroll-mt-36 lg:scroll-mt-16 ${className}`.trim();

  return (
    <section id={id} className={sectionClassName} {...props}>
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
        <h2 className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
