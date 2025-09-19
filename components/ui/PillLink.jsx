export default function PillLink({ href, children, icon: Icon, variant = 'outline', external = false, className = '' }) {
  const variantClass =
    ({
      solid: 'pill-accent',
      outline: 'pill-accent',
    }[variant]) ?? 'pill-accent';
  const classes = `${variantClass} ${className}`.trim();
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
