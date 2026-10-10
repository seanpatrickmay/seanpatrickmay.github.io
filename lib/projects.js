// The minimum every project needs for any page to render it. The deep-dive
// rules live in lib/deepDive.js and the board's in lib/board.js.
export function validateProjects(arr) {
  return Array.isArray(arr) && arr.every(p =>
    typeof p.title === 'string' &&
    typeof p.period === 'string' &&
    Array.isArray(p.stack) &&
    (p.slug === undefined || typeof p.slug === 'string'),
  );
}
