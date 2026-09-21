import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_OUT_PATH = 'public/spotify.json';
const DEFAULT_LIMIT = 10;
// Tracks are fetched deep and then thinned: a four-week chart is usually one
// artist on repeat, and a top-10 that is 9x the same name says nothing about
// taste. 50 is the API maximum for this endpoint.
const TRACK_FETCH_LIMIT = 50;
const MAX_TRACKS_PER_ARTIST = 2;
// Spotify has no "top genres" endpoint for a user. The artists response
// carries a genres[] per artist, so the chart is derived from it: an artist's
// rank is its weight, because #1 says more about taste than #20.
const ARTIST_FETCH_LIMIT = 50;
const MAX_GENRES = 6;
// Spotify returns each image at 640/300/64px, largest first. The cards render
// artwork around 48px, so taking images[0] meant shipping a 640px JPEG per
// row — three of them were the heaviest requests on the page. 160 is 48px at
// 3x, which lands on the 300px variant and leaves retina headroom.
const MIN_ARTWORK_PX = 160;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 3;
const TIME_RANGE = 'short_term';

function getCredentials(env = process.env) {
  return {
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    refreshToken: env.SPOTIFY_REFRESH_TOKEN,
  };
}

function getOutPath(env = process.env) {
  return env.SPOTIFY_OUT || DEFAULT_OUT_PATH;
}

function getRequestTimeoutMs(env = process.env) {
  const value = Number.parseInt(env.SPOTIFY_REQUEST_TIMEOUT_MS ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_REQUEST_TIMEOUT_MS;
}

function getMaxRetries(env = process.env) {
  const value = Number.parseInt(env.SPOTIFY_MAX_RETRIES ?? '', 10);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_MAX_RETRIES;
}

function normalizeItems(items) {
  return Array.isArray(items) ? items : [];
}

function warn(logger, message) {
  if (logger && typeof logger.warn === 'function') {
    logger.warn(message);
  }
}

function isRetriableStatus(status) {
  return status === 429 || status >= 500;
}

function getRetryDelayMs(retryAfterHeader, attempt) {
  const retryAfter = Number.parseInt(retryAfterHeader ?? '', 10);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return Math.min(1000 * 2 ** attempt, 8000);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function fetchJsonWithRetry(url, options, {
  label,
  fetchImpl = fetch,
  logger = console,
  maxRetries = DEFAULT_MAX_RETRIES,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let res;
    try {
      res = await fetchImpl(url, {
        ...options,
        signal: options?.signal ?? AbortSignal.timeout(requestTimeoutMs),
      });
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delayMs = getRetryDelayMs(null, attempt);
      warn(
        logger,
        `[spotify] ${label} request failed: ${error.message}. Retrying in ${delayMs}ms (${attempt + 1}/${maxRetries}).`,
      );
      await sleep(delayMs);
      continue;
    }

    if (res.ok) {
      return res.json();
    }

    const text = await res.text();
    const message = `Failed to fetch ${label}: ${res.status} ${text}`;

    if (!isRetriableStatus(res.status) || attempt === maxRetries) {
      throw new Error(message);
    }

    const delayMs = getRetryDelayMs(res.headers.get('retry-after'), attempt);
    warn(
      logger,
      `[spotify] ${message}. Retrying in ${delayMs}ms (${attempt + 1}/${maxRetries}).`,
    );
    await sleep(delayMs);
  }

  throw new Error(`Failed to fetch ${label}`);
}

async function readCachedOutput(outPath = DEFAULT_OUT_PATH) {
  try {
    const raw = await fs.readFile(outPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      artists: normalizeItems(parsed.artists),
      tracks: normalizeItems(parsed.tracks),
      hasArtists: Array.isArray(parsed.artists),
      hasTracks: Array.isArray(parsed.tracks),
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        artists: [],
        tracks: [],
        hasArtists: false,
        hasTracks: false,
      };
    }
    throw error;
  }
}

async function getAccessToken({
  env = process.env,
  fetchImpl = fetch,
  logger = console,
  maxRetries = getMaxRetries(env),
  requestTimeoutMs = getRequestTimeoutMs(env),
} = {}) {
  const { clientId, clientSecret, refreshToken } = getCredentials(env);
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const data = await fetchJsonWithRetry(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    },
    {
      label: 'access token',
      fetchImpl,
      logger,
      maxRetries,
      requestTimeoutMs,
    },
  );

  // Spotify may hand back a rotated refresh token on any refresh. Dropping it
  // is how a long-lived integration silently dies, so surface it to the caller.
  return {
    accessToken: data.access_token,
    rotatedRefreshToken:
      data.refresh_token && data.refresh_token !== refreshToken ? data.refresh_token : null,
  };
}

/**
 * Keeps Spotify's ordering but allows at most `perArtist` tracks from any one
 * act, then trims to `limit`.
 *
 * Relaxes rather than under-fills: if capping leaves fewer than `limit`
 * tracks, the skipped ones are appended in their original order, so a genuinely
 * single-artist month still yields a full card instead of a stub.
 */
/**
 * Rank-weighted genre chart from the top-artists list.
 *
 * Counting genres flat would let twenty mid-list artists outvote the one you
 * actually listen to, so each artist contributes 1/(rank+1) — a smooth decay
 * that keeps the top of the list dominant without erasing the tail.
 *
 * `share` is normalised against the leader, so the bars read as "relative to
 * my top genre" rather than implying a percentage of listening time, which
 * this data cannot support.
 */
/**
 * Smallest image at least `minWidth` across, falling back to the largest
 * available when nothing is big enough. Spotify orders images largest-first
 * but does not promise it, and some artists have only one size, so this
 * sorts rather than indexing.
 */
export function pickImage(images, minWidth = MIN_ARTWORK_PX) {
  const sized = (images ?? []).filter(image => image?.url);
  if (sized.length === 0) return null;
  const ascending = [...sized].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const big = ascending.find(image => (image.width ?? 0) >= minWidth);
  return (big ?? ascending[ascending.length - 1]).url;
}

export function topGenres(artists, limit) {
  const weights = new Map();

  artists.forEach((artist, index) => {
    const weight = 1 / (index + 1);
    for (const genre of artist?.genres ?? []) {
      const key = String(genre).trim().toLowerCase();
      if (!key) continue;
      weights.set(key, (weights.get(key) || 0) + weight);
    }
  });

  if (weights.size === 0) return [];

  const ranked = [...weights.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const top = ranked[0][1];

  return ranked.map(([name, weight]) => ({
    name,
    share: Math.round((weight / top) * 100),
  }));
}

export function capPerArtist(tracks, perArtist, limit) {
  const counts = new Map();
  const kept = [];
  const overflow = [];

  for (const track of tracks) {
    const key = track._primary || track.artist || track.name;
    const seen = counts.get(key) || 0;
    if (seen < perArtist) {
      counts.set(key, seen + 1);
      kept.push(track);
    } else {
      overflow.push(track);
    }
  }

  return [...kept, ...overflow].slice(0, limit);
}

async function fetchTop(token, type, limit, {
  fetchImpl = fetch,
  logger = console,
  maxRetries = DEFAULT_MAX_RETRIES,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  fallbackItems = [],
  canFallback = false,
} = {}) {
  try {
    return await fetchJsonWithRetry(
      `https://api.spotify.com/v1/me/top/${type}?limit=${limit}&time_range=${TIME_RANGE}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        label: `top ${type}`,
        fetchImpl,
        logger,
        maxRetries,
        requestTimeoutMs,
      },
    );
  } catch (error) {
    if (!canFallback) {
      throw error;
    }

    warn(logger, `[spotify] ${error.message}. Reusing cached top ${type}.`);
    return { items: fallbackItems };
  }
}

async function main({
  env = process.env,
  fetchImpl = fetch,
  logger = console,
  outPath = getOutPath(env),
} = {}) {
  const maxRetries = getMaxRetries(env);
  const requestTimeoutMs = getRequestTimeoutMs(env);
  const cached = await readCachedOutput(outPath);
  const { accessToken: token, rotatedRefreshToken } = await getAccessToken({
    env,
    fetchImpl,
    logger,
    maxRetries,
    requestTimeoutMs,
  });

  // The workflow points SPOTIFY_ROTATED_TOKEN_PATH at a scratch file and, if it
  // appears, writes the value back into the repo secret.
  if (rotatedRefreshToken && env.SPOTIFY_ROTATED_TOKEN_PATH) {
    await fs.writeFile(env.SPOTIFY_ROTATED_TOKEN_PATH, rotatedRefreshToken, 'utf8');
    warn(logger, '[spotify] Refresh token was rotated; wrote replacement for the workflow to persist.');
  }
  const [artistsRes, tracksRes] = await Promise.all([
    fetchTop(token, 'artists', ARTIST_FETCH_LIMIT, {
      fetchImpl,
      logger,
      maxRetries,
      requestTimeoutMs,
      fallbackItems: cached.artists,
      canFallback: cached.hasArtists,
    }),
    fetchTop(token, 'tracks', TRACK_FETCH_LIMIT, {
      fetchImpl,
      logger,
      maxRetries,
      requestTimeoutMs,
      fallbackItems: cached.tracks,
      canFallback: cached.hasTracks,
    }),
  ]);

  const rankedArtists = normalizeItems(artistsRes.items);
  const genres = topGenres(rankedArtists, MAX_GENRES);

  // The card still shows ten; the deeper fetch exists for the genre chart.
  const artists = rankedArtists.slice(0, DEFAULT_LIMIT).map(a => ({
    name: a.name,
    image: pickImage(a.images),
    url: a.external_urls?.spotify || null,
  }));

  const tracks = capPerArtist(
    normalizeItems(tracksRes.items).map(t => ({
      name: t.name,
      artist: t.artists?.map(a => a.name).join(', ') || '',
      image: pickImage(t.album?.images),
      url: t.external_urls?.spotify || null,
      // Keyed on the primary artist so "X" and "X, Y" are not treated as
      // different acts. Stripped before writing.
      _primary: (t.artists?.[0]?.name || '').trim().toLowerCase(),
    })),
    MAX_TRACKS_PER_ARTIST,
    DEFAULT_LIMIT,
  ).map(({ _primary, ...track }) => track);

  const out = {
    generated_at: new Date().toISOString(),
    // The cards used to say "top artists" with no window, which reads as
    // all-time. Emitted rather than hardcoded in the component so changing
    // TIME_RANGE updates the label too.
    time_range: TIME_RANGE,
    artists,
    genres,
    tracks,
  };

  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}

export {
  fetchJsonWithRetry,
  fetchTop,
  getAccessToken,
  getRetryDelayMs,
  main,
  readCachedOutput,
};
