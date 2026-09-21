import test from 'node:test';
import assert from 'node:assert/strict';

import {
  capPerArtist,
  fetchJsonWithRetry,
  fetchTop,
  getAccessToken,
  pickImage,
  topGenres,
} from './update_spotify.mjs';

function createLogger() {
  const messages = [];
  return {
    logger: {
      warn(message) {
        messages.push(message);
      },
    },
    messages,
  };
}

test('fetchJsonWithRetry retries a transient 502 and succeeds', async () => {
  let calls = 0;
  const { logger, messages } = createLogger();
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(
        JSON.stringify({ error: { status: 502, message: 'temporary failure' } }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    return new Response(JSON.stringify({ items: [{ name: 'ok' }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const data = await fetchJsonWithRetry('https://example.com/top', {}, {
    label: 'top tracks',
    fetchImpl,
    logger,
    maxRetries: 2,
    requestTimeoutMs: 100,
  });

  assert.equal(calls, 2);
  assert.deepEqual(data, { items: [{ name: 'ok' }] });
  assert.equal(messages.length, 1);
  assert.match(messages[0], /Failed to fetch top tracks: 502/);
});

test('fetchTop falls back to cached items after repeated 502 responses', async () => {
  const { logger, messages } = createLogger();
  const fallbackItems = [
    {
      name: 'Cached Track',
      artists: [{ name: 'Cached Artist' }],
      album: { images: [{ url: 'https://example.com/image.jpg' }] },
      external_urls: { spotify: 'https://open.spotify.com/track/cached' },
    },
  ];
  const fetchImpl = async () => new Response(
    JSON.stringify({ error: { status: 502, message: 'temporary failure' } }),
    {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const data = await fetchTop('token', 'tracks', 10, {
    fetchImpl,
    logger,
    maxRetries: 1,
    requestTimeoutMs: 100,
    fallbackItems,
    canFallback: true,
  });

  assert.deepEqual(data, { items: fallbackItems });
  assert.equal(messages.length, 2);
  assert.match(messages[0], /Retrying in/);
  assert.match(messages[1], /Reusing cached top tracks/);
});

test('getAccessToken surfaces a rotated refresh token', async () => {
  const fetchImpl = async () => new Response(
    JSON.stringify({ access_token: 'new-access', refresh_token: 'rotated-refresh' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );

  const result = await getAccessToken({
    env: {
      SPOTIFY_CLIENT_ID: 'id',
      SPOTIFY_CLIENT_SECRET: 'secret',
      SPOTIFY_REFRESH_TOKEN: 'original-refresh',
    },
    fetchImpl,
    logger: createLogger().logger,
    maxRetries: 0,
    requestTimeoutMs: 100,
  });

  assert.equal(result.accessToken, 'new-access');
  assert.equal(result.rotatedRefreshToken, 'rotated-refresh');
});

test('getAccessToken reports no rotation when the refresh token is unchanged', async () => {
  const fetchImpl = async () => new Response(
    JSON.stringify({ access_token: 'new-access', refresh_token: 'original-refresh' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );

  const result = await getAccessToken({
    env: {
      SPOTIFY_CLIENT_ID: 'id',
      SPOTIFY_CLIENT_SECRET: 'secret',
      SPOTIFY_REFRESH_TOKEN: 'original-refresh',
    },
    fetchImpl,
    logger: createLogger().logger,
    maxRetries: 0,
    requestTimeoutMs: 100,
  });

  assert.equal(result.accessToken, 'new-access');
  assert.equal(result.rotatedRefreshToken, null);
});

function track(artist, name) {
  return { _primary: artist.toLowerCase(), artist, name };
}

test('capPerArtist thins a chart dominated by one artist', () => {
  const pool = [
    track('Malcolm Todd', 'Earrings'),
    track('Malcolm Todd', 'On My Shoulder'),
    track('Malcolm Todd', 'Ladygirl'),
    track('Malcolm Todd', 'Thailand'),
    track('Zedd', 'Clarity'),
    track('Adele', 'Hello'),
  ];

  const result = capPerArtist(pool, 2, 4);

  assert.deepEqual(
    result.map(t => t.name),
    ['Earrings', 'On My Shoulder', 'Clarity', 'Hello'],
  );
});

test('capPerArtist preserves Spotify ordering among the tracks it keeps', () => {
  const pool = [
    track('A', 'a1'),
    track('B', 'b1'),
    track('A', 'a2'),
    track('C', 'c1'),
  ];

  const result = capPerArtist(pool, 2, 4);

  assert.deepEqual(result.map(t => t.name), ['a1', 'b1', 'a2', 'c1']);
});

test('capPerArtist still fills the card when one artist is all there is', () => {
  const pool = Array.from({ length: 12 }, (_, i) => track('Solo Act', `t${i + 1}`));

  const result = capPerArtist(pool, 2, 10);

  assert.equal(result.length, 10, 'relaxes the cap rather than returning a stub');
  assert.deepEqual(result.slice(0, 2).map(t => t.name), ['t1', 't2']);
});

test('capPerArtist treats a featured credit as the same primary artist', () => {
  const pool = [
    { _primary: 'malcolm todd', artist: 'Malcolm Todd', name: 'solo' },
    { _primary: 'malcolm todd', artist: 'Malcolm Todd, Guest', name: 'feature' },
    { _primary: 'malcolm todd', artist: 'Malcolm Todd', name: 'third' },
    { _primary: 'zedd', artist: 'Zedd', name: 'clarity' },
  ];

  const result = capPerArtist(pool, 2, 3);

  assert.deepEqual(result.map(t => t.name), ['solo', 'feature', 'clarity']);
});

test('topGenres weights a genre by the rank of the artists carrying it', () => {
  const result = topGenres(
    [
      { name: 'Top', genres: ['indie pop'] },
      { name: 'Second', genres: ['edm'] },
      { name: 'Third', genres: ['edm'] },
    ],
    5,
  );

  // indie pop scores 1/1 = 1.0; edm scores 1/2 + 1/3 = 0.83.
  assert.equal(result[0].name, 'indie pop');
  assert.equal(result[0].share, 100);
  assert.equal(result[1].name, 'edm');
  assert.ok(result[1].share < 100 && result[1].share > 75, `got ${result[1].share}`);
});

test('topGenres folds case and whitespace together', () => {
  const result = topGenres(
    [
      { name: 'A', genres: ['Indie Pop'] },
      { name: 'B', genres: ['  indie pop  '] },
    ],
    5,
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'indie pop');
});

test('topGenres survives artists with no genres at all', () => {
  assert.deepEqual(topGenres([{ name: 'A' }, { name: 'B', genres: [] }], 5), []);
});

test('topGenres respects the limit', () => {
  const artists = Array.from({ length: 10 }, (_, i) => ({ name: `a${i}`, genres: [`g${i}`] }));

  assert.equal(topGenres(artists, 4).length, 4);
});

test('pickImage takes the smallest variant that still covers the render size', () => {
  const images = [
    { url: 'big', width: 640, height: 640 },
    { url: 'mid', width: 300, height: 300 },
    { url: 'small', width: 64, height: 64 },
  ];
  assert.equal(pickImage(images, 160), 'mid');
});

test('pickImage falls back to the largest when nothing is big enough', () => {
  const images = [{ url: 'small', width: 64, height: 64 }];
  assert.equal(pickImage(images, 160), 'small');
});

test('pickImage does not assume Spotify ordered the array', () => {
  const images = [
    { url: 'small', width: 64 },
    { url: 'big', width: 640 },
    { url: 'mid', width: 300 },
  ];
  assert.equal(pickImage(images, 160), 'mid');
});

test('pickImage returns null for missing or empty artwork', () => {
  assert.equal(pickImage(undefined), null);
  assert.equal(pickImage([]), null);
  assert.equal(pickImage([{ width: 640 }]), null);
});
