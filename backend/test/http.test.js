import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

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
