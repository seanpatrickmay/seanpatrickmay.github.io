#!/usr/bin/env node
import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const LOGO_SIZE = 200;
const OUTPUT_FORMAT = 'png';
const VALID_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const ROOT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const LOGO_DIR = path.join(ROOT_DIR, '..', 'public', 'logos');
const OUTPUT_DIR = path.join(LOGO_DIR, 'normalized');

async function ensureDirectoryExists(dirPath) {
  try {
    const stats = await stat(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`${dirPath} exists but is not a directory`);
    }
  } catch (error) {
    throw new Error(`Logos directory not found at ${dirPath}. Create it and add your logo assets before running this script.`);
  }
}

async function listLogoFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => path.join(dirPath, entry.name))
    .filter(filePath => VALID_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
}

async function normalizeLogo(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(OUTPUT_DIR, `${fileName}.${OUTPUT_FORMAT}`);

  await sharp(filePath)
    .resize(LOGO_SIZE, LOGO_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat(OUTPUT_FORMAT)
    .toFile(outputPath);

  return outputPath;
}

async function main() {
  await ensureDirectoryExists(LOGO_DIR);
  await mkdir(OUTPUT_DIR, { recursive: true });
  const files = await listLogoFiles(LOGO_DIR);

  if (files.length === 0) {
    console.log('No logo files found in public/logos.');
    return;
  }

  console.log(`Normalizing ${files.length} logo${files.length === 1 ? '' : 's'} to ${LOGO_SIZE}x${LOGO_SIZE}px in logos/normalized…`);

  for (const file of files) {
    try {
      const outputPath = await normalizeLogo(file);
      console.log(`✔ Processed ${path.basename(file)} → ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`✖ Failed to process ${path.basename(file)}:`, error.message);
    }
  }

  console.log('Done.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
