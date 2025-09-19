export default function StackedCardPreview({ img, alt, emoji, label }) {
  const hasImage = Boolean(img);
  const displayEmoji = !hasImage ? emoji ?? '🗂️' : null;

  return (
    <div className="flex h-full items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/70 text-lg shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
        {hasImage ? (
          <img src={img} alt={alt || ''} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            {displayEmoji}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-base">
        {label}
      </span>
    </div>
  );
}

