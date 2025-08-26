export function Card({ children, className = "" }) {
  return <div className={`card rounded-2xl border bg-white dark:bg-slate-900 ${className}`}>{children}</div>;
}
export const CardHeader  = ({ children, className = "" }) => <div className={`px-6 pt-6 ${className}`}>{children}</div>;
export const CardTitle   = ({ children, className = "" }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
export const CardContent = ({ children, className = "" }) => <div className={`px-6 pb-6 pt-2 space-y-3 ${className}`}>{children}</div>;

