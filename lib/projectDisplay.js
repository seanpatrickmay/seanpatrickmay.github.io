export const TECH_PRIORITY = [
  'FastAPI',
  'Next.js',
  'React',
  'PyTorch',
  'PostgreSQL',
  'Tailwind CSS',
  'LangChain',
  'CrewAI',
  'ChromaDB',
  'Vertex AI Gemini',
  'Cloud Translation',
  'Garmin API',
  'Spotify API',
];

export function pickHighlightTech(project) {
  if (project?.showcaseTech) return project.showcaseTech;
  const stack = Array.isArray(project?.stack) ? project.stack : [];
  const languages = Array.isArray(project?.languages) ? project.languages : [];
  const languageSet = new Set(languages);

  for (const preferred of TECH_PRIORITY) {
    if (stack.includes(preferred)) return preferred;
  }

  for (const tech of stack) {
    if (!languageSet.has(tech)) return tech;
  }

  return stack[0] || languages[0] || '';
}

export function sortProjectLinks(links = []) {
  const order = { live: 0, writeup: 1, paper: 2, wiki: 3, repo: 4 };
  return [...links].sort((a, b) => {
    const aRank = order[a?.kind] ?? 99;
    const bRank = order[b?.kind] ?? 99;
    if (aRank === bRank) return (a?.label || '').localeCompare(b?.label || '');
    return aRank - bRank;
  });
}
