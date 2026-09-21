export default function Section({ id, title, icon, children, className = '', ...props }) {
  const Icon = icon;
  const sectionClassName = `section-container py-6 scroll-mt-36 lg:scroll-mt-16 ${className}`.trim();

  return (
    <section id={id} className={sectionClassName} {...props}>
      <div className="mb-5">
        {/* The stamp is a <div> wrapping the real <h2>, not a styled heading:
            the frame is decoration and has no business in the outline. */}
        <div className="stamp">
          {Icon && <Icon className="h-5 w-5 flex-none" aria-hidden="true" />}
          <h2 className="font-display text-3xl tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
