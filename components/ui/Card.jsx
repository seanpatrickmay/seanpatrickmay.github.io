export function Card({ children, className = '' }) {
  return (
    <div className={`card rounded-2xl border bg-white dark:bg-slate-900 ${className}`}>{children}</div>
  );
}
export const CardHeader = ({ children, action, className = '' }) => (
  <div
    className={`px-6 pt-6 ${action ? 'flex items-center justify-between' : ''} ${className}`.trim()}
  >
    {children}
    {action}
  </div>
);
export const CardTitle = ({ children, icon: Icon, className = '' }) => (
  <h3
    className={`text-lg font-semibold ${Icon ? 'flex items-center gap-2' : ''} ${className}`.trim()}
  >
    {Icon && <Icon className="w-5 h-5" />}
    {children}
  </h3>
);
export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 pt-2 space-y-3 ${className}`}>{children}</div>
);

