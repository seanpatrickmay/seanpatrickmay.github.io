export default function StackedCardPreview({ img, alt, emoji, label, meta }) {
  const hasImage = Boolean(img);
  const displayEmoji = !hasImage ? emoji ?? '🗂️' : null;

  return (
    <div className="flex h-full items-center gap-4 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          {hasImage ? (
            <img src={img} alt={alt || ''} loading="lazy" className="h-full w-full object-contain" />
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
            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300 sm:text-sm">
              {meta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
