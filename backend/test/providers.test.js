import test from 'node:test';
import assert from 'node:assert/strict';
import { spotify } from '../src/providers/spotify.js';
import { youtube } from '../src/providers/youtube.js';
import { providerFetch } from '../src/http.js';

test('Spotify playlists follow pagination', async () => {
  const original = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(url);
    return new Response(JSON.stringify(urls.length === 1
      ? { items: [{ id: 'one', name: 'First', items: { total: 2 } }], next: 'https://api.spotify.com/next' }
      : { items: [{ id: 'two', name: 'Second', items: { total: 3 } }], next: null }), { status: 200 });
  };
  try {
    assert.deepEqual((await spotify.playlists('token')).map(item => item.id), ['one', 'two']);
    assert.equal(urls.length, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test('YouTube playlist items follow page tokens and mark unavailable videos', async () => {
  const original = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(url);
    return new Response(JSON.stringify(urls.length === 1
      ? { items: [{ contentDetails: { videoId: 'video-1' }, snippet: { title: 'Song' } }], nextPageToken: 'next' }
      : { items: [{ snippet: { title: 'Deleted video' } }] }), { status: 200 });
  };
  try {
    const tracks = await youtube.tracks('token', 'playlist');
    assert.equal(tracks.length, 2);
    assert.equal(tracks[1].unavailable, true);
    assert.match(urls[1], /pageToken=next/);
  } finally {
    globalThis.fetch = original;
  }
});

test('provider quota response becomes a retryable public code', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'quota' }), { status: 429 });
  try {
    await assert.rejects(providerFetch('https://example.test', {}, 1), { code: 'RATE_LIMITED', status: 429 });
  } finally {
    globalThis.fetch = original;
  }
});
