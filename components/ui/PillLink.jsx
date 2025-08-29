export default function PillLink({ href, children, icon: Icon, variant = 'outline', external = false, className = '' }) {
  const base =
    variant === 'solid'
      ? 'pill bg-slate-900 text-white dark:bg-white dark:text-slate-900'
      : 'pill-outline';
  const classes = `${base} flex items-center gap-2 ${className}`.trim();
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={classes}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </a>
  );
}
