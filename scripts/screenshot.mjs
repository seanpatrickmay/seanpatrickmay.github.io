#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/screenshot.mjs <url> [output-path] [--width=1280] [--height=800] [--full-page] [--dark]
 *
 * Examples:
 *   node scripts/screenshot.mjs http://localhost:4321/ /tmp/claude/homepage.png
 *   node scripts/screenshot.mjs http://localhost:4321/projects/ /tmp/claude/projects.png --full-page
 *   node scripts/screenshot.mjs http://localhost:4321/ /tmp/claude/dark.png --dark
 */

import puppeteer from 'puppeteer';
import { resolve } from 'path';

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const url = positional[0];
if (!url) {
  console.error('Usage: screenshot.mjs <url> [output-path] [--width=N] [--height=N] [--full-page] [--dark]');
  process.exit(1);
}

const output = positional[1] || '/tmp/claude/screenshot.png';
const width = Number(flags.find(f => f.startsWith('--width='))?.split('=')[1]) || 1280;
const height = Number(flags.find(f => f.startsWith('--height='))?.split('=')[1]) || 800;
const fullPage = flags.includes('--full-page');
const dark = flags.includes('--dark');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });

if (dark) {
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
}

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
// Let animations finish
await new Promise(r => setTimeout(r, 1500));

await page.screenshot({ path: resolve(output), fullPage, type: 'png' });
console.log(`Screenshot saved to ${resolve(output)}`);

await browser.close();
