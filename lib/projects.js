// Optional runtime validation with a tiny guard (swap to zod if you want strictness).
export function validateProjects(arr) {
  return Array.isArray(arr) && arr.every(p =>
    typeof p.title === "string" &&
    typeof p.period === "string" &&
    Array.isArray(p.stack) &&
    Array.isArray(p.bullets)
    // Optional extended fields for project pages
    && (p.slug === undefined || typeof p.slug === "string")
  );
}
