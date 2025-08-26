export default function Section({ title, icon, children }) {
  const Icon = icon;
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

