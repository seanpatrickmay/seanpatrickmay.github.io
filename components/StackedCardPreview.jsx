function getInitials(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}

export default function StackedCardPreview({
  title,
  imageSrc,
  imageAlt = '',
  emoji,
  fallbackInitials,
  className = '',
}) {
  const initials = fallbackInitials ? getInitials(fallbackInitials) : getInitials(title);
  let mediaContent = null;

  if (imageSrc) {
    mediaContent = (
      <img
        src={imageSrc}
        alt={imageAlt || `${title} logo`}
        className="h-full w-full object-contain"
      />
    );
  } else if (emoji) {
    mediaContent = <span className="text-2xl leading-none">{emoji}</span>;
  } else if (initials) {
    mediaContent = (
      <span className="text-sm font-semibold uppercase tracking-widest text-white/90">
        {initials}
      </span>
    );
  } else {
    mediaContent = <span aria-hidden className="text-lg text-white/70">✦</span>;
  }

  const containerClassName = [
    'flex h-full items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-sm shadow-slate-950/20 backdrop-blur',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {mediaContent}
      </div>
      <p className="text-base font-semibold leading-snug text-white line-clamp-2">{title}</p>
    </div>
  );
}
