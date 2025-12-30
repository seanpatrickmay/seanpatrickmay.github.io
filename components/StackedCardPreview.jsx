export default function StackedCardPreview({ img, alt, emoji, label, meta }) {
  const hasImage = Boolean(img);
  const displayEmoji = !hasImage ? emoji ?? '🗂️' : null;

  return (
    <div className="flex h-full items-center gap-4 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/70 text-2xl shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
          {hasImage ? (
            <img src={img} alt={alt || ''} className="h-full w-full object-contain" />
          ) : (
            <span className="text-3xl" aria-hidden="true">
              {displayEmoji}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-base">
            {label}
          </div>
          {meta && (
            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              {meta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
