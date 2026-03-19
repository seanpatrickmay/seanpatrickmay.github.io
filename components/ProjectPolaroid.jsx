import Link from 'next/link';
import PinCard from '@/components/PinCard';

export default function ProjectPolaroid({
  project,
  rotation = 0,
  pinColor = 'teal',
  peek = false,
}) {
  if (!project) return null;

  const coverSrc = project.coverImage?.src;
  const description = project.cardDescription || project.oneLiner || '';
  const href = project.slug ? `/projects/${project.slug}/` : '/projects/';

  const coverStyle = coverSrc
    ? { backgroundImage: `url(${coverSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  if (peek) {
    return (
      <PinCard
        rotation={rotation}
        pinColor={pinColor}
        pinPosition="right"
        className="absolute -bottom-2 -right-2 z-[5] w-[140px] border border-stone-200 bg-white p-1.5 pb-2.5 dark:border-stone-700 dark:bg-stone-800"
      >
        <div
          className="h-[50px] w-full rounded-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
          style={coverStyle}
        />
        <div className="px-1.5 pt-1.5">
          <div className="truncate text-[11px] font-semibold text-slate-900 dark:text-slate-100">
            {project.emoji && <span className="mr-1">{project.emoji}</span>}
            {project.title}
          </div>
        </div>
      </PinCard>
    );
  }

  return (
    <PinCard
      rotation={rotation}
      pinColor={pinColor}
      className="border border-stone-200 bg-white p-1.5 pb-3.5 dark:border-stone-700 dark:bg-stone-800"
    >
      <div
        className="h-20 w-full rounded-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 sm:h-24"
        style={coverStyle}
      />
      <div className="px-2 pt-2">
        {project.emoji && <span className="text-base">{project.emoji}</span>}
        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {project.title}
        </div>
        {description && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-stone-500 dark:text-stone-400">
            {description}
          </p>
        )}
        <Link
          href={href}
          className="mt-2 inline-block border-b border-teal-200 text-[10px] font-semibold uppercase tracking-wider text-teal-600 transition-colors hover:text-teal-700 dark:border-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
        >
          deep dive →
        </Link>
      </div>
    </PinCard>
  );
}
