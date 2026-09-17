import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchJsonWithRetry, fetchTop, getAccessToken } from './update_spotify.mjs';

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
