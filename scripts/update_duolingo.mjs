#!/usr/bin/env node
/**
 * Fetches Duolingo progress and writes public/duolingo.json.
 *
 * Usage: node scripts/update_duolingo.mjs
 *
 * No credentials needed. Duolingo has no official API; this is the unofficial
 * `/2017-06-30/users` endpoint the whole README-badge ecosystem runs on.
 * Verified 2026-09-17 to answer HTTP 200 with usable JSON from a GitHub
 * Actions runner (Azure westus2), with the default curl UA and no throttling
 * across rapid requests — so a daily cron is viable.
 *
 * Environment variables:
 *   DUOLINGO_USERNAME  profile to read (default: maydotsean)
 *   DUOLINGO_OUT       output path (default: public/duolingo.json)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(process.env.DUOLINGO_OUT
  ? process.env.DUOLINGO_OUT
  : resolve(__dirname, '..', 'public', 'duolingo.json'));

const USERNAME = process.env.DUOLINGO_USERNAME || 'maydotsean';
const ENDPOINT = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(USERNAME)}`;
const TIMEOUT_MS = 15_000;

// Hides languages that were only dabbled in, so the card shows what is
// actually being studied rather than every course ever opened.
const MIN_XP = 200;

// `learningLanguage` is an ISO-ish code; map the ones in play to a flag.
const FLAGS = {
  zh: '🇨🇳', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹', ja: '🇯🇵',
  ko: '🇰🇷', pt: '🇧🇷', ru: '🇷🇺', nl: '🇳🇱', sv: '🇸🇪', pl: '🇵🇱',
  tr: '🇹🇷', ar: '🇸🇦', hi: '🇮🇳', el: '🇬🇷', he: '🇮🇱', ga: '🇮🇪',
  cy: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', la: '🏛️', eo: '🌍', nb: '🇳🇴', da: '🇩🇰', vi: '🇻🇳',
};

async function fetchProfile() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(ENDPOINT, {
      signal: controller.signal,
      headers: { 'User-Agent': 'seanpatrickmay.me profile refresh' },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const user = data?.users?.[0];
    if (!user) throw new Error(`no such public profile: ${USERNAME}`);
    return user;
  } finally {
    clearTimeout(timer);
  }
}

function buildOutput(user) {
  const courses = (Array.isArray(user.courses) ? user.courses : [])
    // `crowns` is deliberately dropped: the endpoint returns 9999 for every
    // course regardless of XP, so it is a sentinel and not real data.
    .map(c => ({
      title: c.title,
      language: c.learningLanguage,
      flag: FLAGS[c.learningLanguage] || '🌐',
      xp: Number(c.xp) || 0,
    }))
    .filter(c => c.xp >= MIN_XP)
    .sort((a, b) => b.xp - a.xp);

  const streak = Number(user.streak) || Number(user.streakData?.currentStreak) || 0;
  const totalXp = Number(user.totalXp) || 0;

  return {
    generated_at: new Date().toISOString(),
    username: user.username || USERNAME,
    streak,
    totalXp,
    // Total across shown courses, so the card's bars sum to their own 100%.
    shownXp: courses.reduce((sum, c) => sum + c.xp, 0),
    courses,
    joined: user.creationDate ? new Date(user.creationDate * 1000).toISOString() : null,
    profileUrl: `https://www.duolingo.com/profile/${user.username || USERNAME}`,
  };
}

async function main() {
  console.log(`Fetching Duolingo profile for ${USERNAME}...`);

  let user;
  try {
    user = await fetchProfile();
  } catch (err) {
    // Never overwrite good data with zeros. A failed fetch means Duolingo is
    // unreachable or the endpoint changed shape — not that the streak is 0.
    // Exiting non-zero keeps the last-good file and surfaces a red X in CI,
    // instead of silently publishing an empty card.
    let existing = null;
    try {
      existing = JSON.parse(readFileSync(OUTPUT, 'utf8'));
    } catch { /* no previous file */ }

    throw new Error(
      `fetch failed (${err.message})` +
      (existing
        ? ` — keeping existing ${OUTPUT} from ${existing.generated_at}`
        : ` — no previous data to fall back on`),
    );
  }

  const out = buildOutput(user);
  if (!out.courses.length) {
    throw new Error(
      `profile returned no courses at or above ${MIN_XP} XP; refusing to write an empty card`,
    );
  }

  writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`  streak: ${out.streak} days | total XP: ${out.totalXp}`);
  for (const c of out.courses) {
    console.log(`  ${c.flag} ${c.title}: ${c.xp} XP`);
  }
  console.log(`Written to ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
