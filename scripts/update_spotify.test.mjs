import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchJsonWithRetry, fetchTop } from './update_spotify.mjs';

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
