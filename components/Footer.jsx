/**
 * Deliberately thin: ContactSection sits directly above with the same three
 * destinations as large pill buttons, so repeating them here was pure
 * duplication. Quiet text links instead, plus the address in plain text for
 * anyone who would rather copy it than open a mail client.
 */
export default function Footer({ links, year }) {
  const items = [
    { href: links.email, label: links.emailDisplay },
    { href: links.github, label: 'GitHub', external: true },
    { href: links.linkedin, label: 'LinkedIn', external: true },
  ].filter(item => item.href && item.label);

  return (
    <footer className="mt-10 border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="section-container flex flex-col items-center gap-2 text-sm text-slate-500 sm:flex-row sm:justify-between dark:text-slate-400">
        <p>© {year} sean p. may</p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {items.map((item, i) => (
            <span key={item.label} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>}
              <a
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="transition hover:text-slate-900 dark:hover:text-slate-100"
              >
                {item.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
