/**
 * The project board: which projects are pinned, in which cluster, in what
 * order, and what evidence hangs off each card.
 *
 * Everything here is pure, so the rules are tested without rendering. A
 * project is on the board when it has a `board` field. One without it still
 * gets its deep-dive page; it just is not linked from the board.
 */

export const BOARD_CLUSTERS = [
  { id: 'run', label: 'things that run' },
  { id: 'think', label: 'things that think' },
];

export const BOARD_NOTE = {
  text: 'everything else lives on GitHub',
  href: 'https://github.com/seanpatrickmay',
};

// `linked`: the artifact is a link to its evidence. A tag is a label.
export const ARTIFACT_KINDS = {
  paper: { linked: true },
  sticky: { linked: true },
  polaroid: { linked: true, image: true },
  tag: { linked: false },
};

const SIZES = new Set(['big', 'small']);
const BIG_PER_CLUSTER = 2;

export function isOnBoard(project) {
  return Boolean(project && project.board);
}

export function boardClusters(projects = []) {
  const onBoard = projects.filter(isOnBoard);
  return BOARD_CLUSTERS.map(({ id, label }) => {
    const items = onBoard
      .filter(p => p.board.cluster === id)
      .sort((a, b) => a.board.order - b.board.order);
    return {
      id,
      label,
      big: items.filter(p => p.board.size === 'big'),
      small: items.filter(p => p.board.size === 'small'),
    };
  });
}

export function threadPairs(projects = []) {
  const onBoard = projects.filter(isOnBoard);
  const slugs = new Set(onBoard.map(p => p.slug));
  return onBoard.flatMap(p =>
    (p.threadTo ?? []).filter(target => target !== p.slug && slugs.has(target)).map(target => [p.slug, target]),
  );
}

const hasText = value => typeof value === 'string' && value.trim().length > 0;

export function validateBoard(projects = []) {
  const errors = [];
  const clusterIds = BOARD_CLUSTERS.map(c => c.id);
  const allSlugs = new Set(projects.map(p => p.slug).filter(Boolean));
  const onBoard = projects.filter(isOnBoard);
  const onBoardSlugs = new Set(onBoard.map(p => p.slug));

  for (const p of onBoard) {
    const where = p.slug || p.title || '(unnamed)';
    const { cluster, size, order, line } = p.board;

    if (!p.slug) errors.push(`${where}: on the board but has no slug`);
    if (!clusterIds.includes(cluster)) errors.push(`${where}: unknown cluster "${cluster}"`);
    if (!SIZES.has(size)) errors.push(`${where}: unknown size "${size}"`);
    if (!Number.isInteger(order)) errors.push(`${where}: order must be an integer`);
    if (size === 'small' && !hasText(line)) errors.push(`${where}: small cards need board.line`);

    for (const [i, artifact] of (p.artifacts ?? []).entries()) {
      const at = `${where} artifacts[${i}]`;
      const kind = ARTIFACT_KINDS[artifact?.kind];
      if (!kind) {
        errors.push(`${at}: unknown kind "${artifact?.kind}"`);
        continue;
      }
      if (!hasText(artifact.text)) errors.push(`${at}: needs text`);
      if (kind.linked && !(hasText(artifact.href) && hasText(artifact.label))) {
        errors.push(`${at}: a ${artifact.kind} needs href and label`);
      }
      if (!kind.linked && artifact.href) errors.push(`${at}: a ${artifact.kind} is not a link`);
      if (kind.image && !hasText(artifact.image)) errors.push(`${at}: a ${artifact.kind} needs an image`);
    }

    for (const target of p.threadTo ?? []) {
      if (target === p.slug) errors.push(`${where}: thread to itself`);
      else if (!allSlugs.has(target)) errors.push(`${where}: thread to unknown project "${target}"`);
      else if (!onBoardSlugs.has(target)) errors.push(`${where}: thread to "${target}", which is not on the board`);
    }
  }

  for (const id of clusterIds) {
    const items = onBoard.filter(p => p.board.cluster === id);
    const big = items.filter(p => p.board.size === 'big');
    const small = items.filter(p => p.board.size === 'small');

    if (big.length !== BIG_PER_CLUSTER) {
      errors.push(`cluster "${id}": expected ${BIG_PER_CLUSTER} big cards, found ${big.length}`);
    }
    const orders = items.map(p => p.board.order);
    if (new Set(orders).size !== orders.length) errors.push(`cluster "${id}": duplicate order values`);

    const lastBig = Math.max(-Infinity, ...big.map(p => p.board.order));
    const firstSmall = Math.min(Infinity, ...small.map(p => p.board.order));
    if (lastBig > firstSmall) errors.push(`cluster "${id}": big cards must rank ahead of small ones`);
  }

  return errors;
}
