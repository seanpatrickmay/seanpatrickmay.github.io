export default function Section({ id, title, icon, children }) {
  const Icon = icon;
  return (
    <section
      id={id}
      className="section-container py-10 scroll-mt-32 lg:scroll-mt-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl border bg-white dark:bg-slate-900 card">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
