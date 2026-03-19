import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
        <ExternalLink className="w-3 h-3 opacity-50" aria-hidden="true" />
        <span className="sr-only">(opens in new tab)</span>
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
