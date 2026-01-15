export const TAG_PRIORITY = [
  'Agentic AI',
  'Machine Learning',
  'Computer Vision',
  'NLP',
  'Game Theory',
  'Full-stack',
  'Data Engineering',
  'Cloud/Infra',
  'Concurrency',
  'Algorithms',
];

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

export function pickHighlightTag(project) {
  if (project?.showcaseTag) return project.showcaseTag;
  const tags = Array.isArray(project?.tags) ? project.tags : [];
  if (!tags.length) return '';

  for (const preferred of TAG_PRIORITY) {
    if (tags.includes(preferred)) return preferred;
  }

  return tags[0];
}

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

export function pickProofPoints(project, limit = 2) {
  const points = Array.isArray(project?.proofPoints) && project.proofPoints.length
    ? project.proofPoints
    : Array.isArray(project?.bullets)
      ? project.bullets
      : [];
  return points.slice(0, limit);
}

export function sortProjectLinks(links = []) {
  const order = { live: 0, writeup: 1, paper: 2, repo: 3 };
  return [...links].sort((a, b) => {
    const aRank = order[a?.kind] ?? 99;
    const bRank = order[b?.kind] ?? 99;
    if (aRank === bRank) return (a?.label || '').localeCompare(b?.label || '');
    return aRank - bRank;
  });
}
