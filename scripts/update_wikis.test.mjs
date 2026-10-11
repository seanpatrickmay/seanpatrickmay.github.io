import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWikis, fetchExport } from './update_wikis.mjs';
import { fixtureExport } from '../lib/wikiFixture.mjs';

const NOW = new Date('2026-10-11T13:32:00.000Z');
const project = (slug, highlight = ['ai-digest']) => ({ slug: `p-${slug}`, wiki: { slug, highlight } });

function createLogger() {
  const messages = [];
  return { logger: { warn: m => messages.push(m) }, messages };
}

function fetchFrom(routes) {
  const calls = [];
  const fetchImpl = async url => {
    calls.push(url);
    const route = routes[url];
    if (route instanceof Error) throw route;
    if (route === undefined) return new Response('not found', { status: 404 });
    return new Response(JSON.stringify(route), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  return { fetchImpl, calls };
}

const url = slug => `https://seanpatrickmay.me/wiki/${slug}/export.json`;

test('fetchExport asks for the export and rejects a non-OK response', async () => {
  const { fetchImpl, calls } = fetchFrom({ [url('a')]: { ok: 1 } });
  assert.deepEqual(await fetchExport('a', { fetchImpl }), { ok: 1 });
  assert.deepEqual(calls, [url('a')]);
  await assert.rejects(fetchExport('b', { fetchImpl }), /export.json: HTTP 404/);
});

test('a fetched wiki gets a fresh entry stamped with this run', async () => {
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport() });
  const { file, failed } = await buildWikis([project('a'), { slug: 'plain' }], null, { fetchImpl, now: NOW });
  assert.deepEqual(failed, []);
  assert.deepEqual(Object.keys(file.wikis), ['a']);
  assert.equal(file.wikis.a.features, 3);
  assert.equal(file.wikis.a.fetchedAt, NOW.toISOString());
  assert.equal(file.generated_at, NOW.toISOString());
});

test('projects without a wiki are never fetched', async () => {
  const { fetchImpl, calls } = fetchFrom({ [url('a')]: fixtureExport() });
  await buildWikis([project('a'), { slug: 'plain' }, { slug: 'other', wiki: {} }], null, { fetchImpl, now: NOW });
  assert.deepEqual(calls, [url('a')]);
});

test('a failed fetch keeps the previous entry and its old fetchedAt, and generated_at becomes the oldest', async () => {
  const old = { features: 9, citations: 1, fetchedAt: '2026-09-20T13:32:00.000Z' };
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport(), [url('b')]: new Error('timeout') });
  const { logger, messages } = createLogger();
  const { file, failed } = await buildWikis([project('a'), project('b')], { wikis: { b: old } }, { fetchImpl, now: NOW, logger });
  assert.deepEqual(failed, ['b']);
  assert.deepEqual(file.wikis.b, old);
  assert.equal(file.generated_at, old.fetchedAt);
  assert.match(messages.join('\n'), /b: timeout; keeping the previous entry/);
});

test('a failed fetch with no previous entry leaves the wiki out', async () => {
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport() });
  const { logger, messages } = createLogger();
  const { file, failed } = await buildWikis([project('a'), project('b')], null, { fetchImpl, now: NOW, logger });
  assert.deepEqual(failed, ['b']);
  assert.deepEqual(Object.keys(file.wikis), ['a']);
  assert.match(messages.join('\n'), /b: .*HTTP 404; no previous entry, so its strip is hidden/);
});

test('a previous entry for a wiki no longer configured is dropped', async () => {
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport() });
  const { file } = await buildWikis([project('a')], { wikis: { gone: { fetchedAt: '2026-01-01T00:00:00Z' } } }, { fetchImpl, now: NOW });
  assert.deepEqual(Object.keys(file.wikis), ['a']);
  assert.equal(file.generated_at, NOW.toISOString());
});

test('a highlight with no page fails the run even though the fetch worked', async () => {
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport() });
  const previous = { wikis: { a: { fetchedAt: '2026-10-01T00:00:00Z' } } };
  await assert.rejects(buildWikis([project('a', ['renamed-feature'])], previous, { fetchImpl, now: NOW }), /a: no wiki page for highlight renamed-feature/);
});

test('an entry stays about 1KB', async () => {
  const { fetchImpl } = fetchFrom({ [url('a')]: fixtureExport() });
  const { file } = await buildWikis([project('a', ['ai-digest', 'garmin-integration', 'read-page'])], null, { fetchImpl, now: NOW });
  assert.ok(JSON.stringify(file.wikis.a, null, 2).length < 1500, JSON.stringify(file.wikis.a).length);
});
