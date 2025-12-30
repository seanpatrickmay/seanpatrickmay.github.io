import Link from 'next/link';

export default function PillLink({ href, children, icon: Icon, variant = 'outline', external = false, className = '' }) {
  const variantClass =
    ({
      solid: 'pill-accent',
      outline: 'pill-outline',
      ghost: 'pill-ghost',
    }[variant]) ?? 'pill-outline';
  const classes = `${variantClass} ${className}`.trim();

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );
}
