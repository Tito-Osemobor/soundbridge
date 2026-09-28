import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { config } from '../src/config.js';
import { encrypt, decrypt } from '../src/crypto.js';

test('provider tokens encrypt, decrypt and reject tampering', () => {
  config.encryptionKey = randomBytes(32).toString('base64');
  const encrypted = encrypt('secret-token');
  assert.notEqual(encrypted, 'secret-token');
  assert.equal(decrypt(encrypted), 'secret-token');
  const parts = encrypted.split('.');
  parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1);
  assert.throws(() => decrypt(parts.join('.')));
  assert.equal(encrypt(null), null);
});
