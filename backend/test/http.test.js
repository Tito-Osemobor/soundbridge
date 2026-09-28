import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { config } from '../src/config.js';

test('health, invalid provider and cross-origin write boundary', async () => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(`${base}/api/health`);
    assert.deepEqual(await health.json(), { ok: true });
    const invalid = await fetch(`${base}/api/connections/start/INVALID`, { redirect: 'manual' });
    assert.equal(invalid.status, 400);
    const missingState = await fetch(`${base}/api/connections/callback/SPOTIFY?state=forged&code=fake`, { redirect: 'manual' });
    assert.equal(missingState.headers.get('location'), '/hub?connection=state');
    const denied = await fetch(`${base}/api/connections/callback/SPOTIFY?error=access_denied`, { redirect: 'manual' });
    assert.equal(denied.headers.get('location'), '/hub?connection=denied');
    const rejected = await fetch(`${base}/api/connections/apple`, {
      method: 'POST',
      headers: { origin: 'https://other.example', 'content-type': 'application/json' },
      body: JSON.stringify({ musicUserToken: 'example' }),
    });
    assert.equal(rejected.status, 403);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('OAuth callback identifies the failed step without logging credentials', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const previous = { ...config.spotify };
  const logs = [];
  let failAt = 'exchange';
  let server;
  try {
    Object.assign(config.spotify, {
      id: 'test-client', secret: 'test-secret',
      redirect: 'http://127.0.0.1:3000/api/connections/callback/SPOTIFY',
    });
    console.error = (...args) => logs.push(args);
    globalThis.fetch = (url, options) => {
      if (String(url) === 'https://accounts.spotify.com/api/token') {
        return Promise.resolve(new Response(JSON.stringify(failAt === 'exchange'
          ? { error: 'invalid_grant' } : { access_token: 'secret-access-token' }),
        { status: failAt === 'exchange' ? 400 : 200 }));
      }
      if (String(url) === 'https://api.spotify.com/v1/me') {
        return Promise.resolve(new Response('{}', { status: 403 }));
      }
      return originalFetch(url, options);
    };
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const expected of [
      { step: 'exchange', status: 400 },
      { step: 'profile', status: 403 },
    ]) {
      failAt = expected.step;
      const start = await originalFetch(`${base}/api/connections/start/SPOTIFY`, { redirect: 'manual' });
      const state = new URL(start.headers.get('location')).searchParams.get('state');
      const cookie = start.headers.get('set-cookie').split(';')[0];
      const callback = await originalFetch(
        `${base}/api/connections/callback/SPOTIFY?state=${encodeURIComponent(state)}&code=secret-code`,
        { headers: { cookie }, redirect: 'manual' },
      );
      assert.equal(callback.headers.get('location'), '/hub?connection=failed');
      assert.equal(logs.at(-1)[0], 'OAuth callback failed');
      assert.deepEqual(logs.at(-1)[1], {
        platform: 'SPOTIFY', step: expected.step, code: 'PROVIDER_FAILED', status: expected.status,
      });
    }
    assert.doesNotMatch(JSON.stringify(logs), /secret-code|secret-access-token|test-secret/);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    globalThis.fetch = originalFetch;
    console.error = originalError;
    Object.assign(config.spotify, previous);
  }
});
