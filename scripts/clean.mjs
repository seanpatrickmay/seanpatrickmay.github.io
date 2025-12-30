import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function removePath(relativePath) {
  const absolutePath = path.join(process.cwd(), relativePath);
  fs.rmSync(absolutePath, { recursive: true, force: true });
}

const args = new Set(process.argv.slice(2));
const hasExplicitArgs = args.size > 0;

const shouldCleanNextProd =
  args.has('--next-prod') || args.has('--next') || args.has('--all') || !hasExplicitArgs;
const shouldCleanNextDev =
  args.has('--next-dev') || args.has('--next') || args.has('--all') || !hasExplicitArgs;
const shouldCleanOut = args.has('--out') || args.has('--all');

if (shouldCleanNextProd) removePath('.next');
if (shouldCleanNextDev) removePath('.next-dev');
if (shouldCleanOut) removePath('out');
