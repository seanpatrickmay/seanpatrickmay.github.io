const ROTATIONS = [-2, 1.5, -0.5, 2];

export default function HobbySpotlight({ hobbies = [] }) {
  if (!Array.isArray(hobbies) || hobbies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {hobbies.map((hobby, index) => (
        <span
          key={hobby.title}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-600 shadow-sm motion-reduce:!rotate-0 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          style={{ transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)` }}
        >
          <span aria-hidden="true">{hobby.emoji}</span>
          {hobby.title}
        </span>
      ))}
    </div>
  );
}
