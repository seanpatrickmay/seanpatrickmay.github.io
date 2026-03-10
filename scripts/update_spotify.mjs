import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_OUT_PATH = 'public/spotify.json';
const DEFAULT_LIMIT = 10;
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

  return data.access_token;
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
  const token = await getAccessToken({
    env,
    fetchImpl,
    logger,
    maxRetries,
    requestTimeoutMs,
  });
  const [artistsRes, tracksRes] = await Promise.all([
    fetchTop(token, 'artists', DEFAULT_LIMIT, {
      fetchImpl,
      logger,
      maxRetries,
      requestTimeoutMs,
      fallbackItems: cached.artists,
      canFallback: cached.hasArtists,
    }),
    fetchTop(token, 'tracks', DEFAULT_LIMIT, {
      fetchImpl,
      logger,
      maxRetries,
      requestTimeoutMs,
      fallbackItems: cached.tracks,
      canFallback: cached.hasTracks,
    }),
  ]);

  const artists = normalizeItems(artistsRes.items).map(a => ({
    name: a.name,
    image: a.images?.[0]?.url || null,
    url: a.external_urls?.spotify || null,
  }));

  const tracks = normalizeItems(tracksRes.items).map(t => ({
    name: t.name,
    artist: t.artists?.map(a => a.name).join(', ') || '',
    image: t.album?.images?.[0]?.url || null,
    url: t.external_urls?.spotify || null,
  }));

  const out = {
    generated_at: new Date().toISOString(),
    artists,
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
