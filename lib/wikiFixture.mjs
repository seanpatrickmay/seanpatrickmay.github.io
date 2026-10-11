/**
 * A trimmed export.json in the real schema (schemaVersion 3), for the
 * strip's tests. Three pages, two of them in TypeScript one way or another,
 * one bot in the people snapshot. A fresh copy per call, so a test can
 * mutate it.
 */
export function fixtureExport() {
  return {
    schemaVersion: 3,
    repo: 'demo',
    head: 'e662257dff042823d06bd93a5aed49054ebcf76b',
    exportedAt: '2026-10-09T04:27:49.136Z',
    manifest: {
      features: [
        { id: 'ai-digest', title: 'AI digest' },
        { id: 'garmin-integration', title: 'Garmin integration' },
        { id: 'read-page', title: 'Read page' },
      ],
    },
    pages: [
      {
        featureId: 'ai-digest',
        infobox: { languages: ['Python', 'Markdown'], firstCommitDate: '2025-10-19T12:12:48-04:00', lastCommitDate: '2026-04-02T17:24:46-04:00' },
        sections: [{ key: 'overview', claims: [{ id: 'c1', citations: [] }, { id: 'c2', citations: [{}, {}] }] }],
      },
      {
        featureId: 'garmin-integration',
        infobox: { languages: ['TSX', 'JSON', 'Python'], firstCommitDate: '2026-01-05T09:00:00-05:00', lastCommitDate: '2026-06-08T08:25:24-04:00' },
        sections: [
          { key: 'overview', claims: [{ id: 'c1', citations: [{}] }] },
          { key: 'internals', claims: [{ id: 'c2', citations: [{}] }, { id: 'c3' }] },
        ],
      },
      {
        featureId: 'read-page',
        infobox: { languages: ['TypeScript', 'CSS', 'Shell', 'YAML', 'TOML', 'HTML'], firstCommitDate: '2026-02-01T00:00:00Z', lastCommitDate: '2026-03-01T00:00:00Z' },
        sections: [{ key: 'overview', claims: [{ id: 'c1', citations: [{}] }] }],
      },
    ],
    people: {
      snapshot: {
        commits: 345,
        people: [
          { id: 'sean-may', kind: 'human', currentLines: 98227 },
          { id: 'dependabot', kind: 'bot', currentLines: 40 },
        ],
      },
    },
  };
}
