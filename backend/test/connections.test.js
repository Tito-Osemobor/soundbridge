import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { config } from '../src/config.js';
import { decrypt, encrypt } from '../src/crypto.js';
import { createConnectionStore } from '../src/features/connections/store.js';

test('expired token refreshes and keeps a missing rotated refresh token', async () => {
  config.encryptionKey = randomBytes(32).toString('base64');
  let row = {
    platform: 'SPOTIFY', platformUserId: 'person',
    accessToken: encrypt('old-access'), refreshToken: encrypt('old-refresh'),
    expiresAt: new Date(Date.now() - 1_000),
  };
  const connection = {
    findUnique: async () => row,
    upsert: async ({ update }) => { row = { ...row, ...update }; return row; },
  };
  let refreshCalls = 0;
  const store = createConnectionStore({
    connection,
    resolveProvider: () => ({ refresh: async token => {
      assert.equal(token, 'old-refresh');
      refreshCalls += 1;
      return { access_token: 'new-access', expires_in: 3600 };
    } }),
  });
  assert.equal(await store.accessToken('SPOTIFY'), 'new-access');
  assert.equal(refreshCalls, 1);
  assert.equal(decrypt(row.accessToken), 'new-access');
  assert.equal(decrypt(row.refreshToken), 'old-refresh');
  assert.ok(row.expiresAt > new Date());
});

test('an expired connection without refresh credentials asks for reconnection', async () => {
  config.encryptionKey = randomBytes(32).toString('base64');
  const store = createConnectionStore({
    connection: { findUnique: async () => ({
      accessToken: encrypt('expired'), refreshToken: null, expiresAt: new Date(0),
    }) },
  });
  await assert.rejects(store.accessToken('YOUTUBE_MUSIC'), { code: 'RECONNECT_REQUIRED' });
});
