export default function Badge({
  children,
  icon: Icon,
  variant = 'solid',
  className = '',
}) {
  const base = 'badge';
  const variantClasses =
    variant === 'outline' ? 'border bg-white dark:bg-slate-900' : '';
  const gap = Icon ? 'gap-2' : '';
  return (
    <span className={`${base} ${variantClasses} ${gap} ${className}`.trim()}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}

