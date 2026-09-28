import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { config } from '../src/config.js';
import { apple, developerToken } from '../src/providers/apple.js';

function musicKey() {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  config.apple = {
    team: 'TEAM123', key: 'KEY123',
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  };
  return publicKey;
}

test('Apple developer token is signed and carries the configured team and key IDs', () => {
  const publicKey = musicKey();
  const [header, claims, signature] = developerToken().split('.');
  assert.equal(JSON.parse(Buffer.from(header, 'base64url')).kid, 'KEY123');
  assert.equal(JSON.parse(Buffer.from(claims, 'base64url')).iss, 'TEAM123');
  assert.equal(verify('sha256', Buffer.from(`${header}.${claims}`),
    { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url')), true);
});

test('Apple adapter pages library playlists and supports search, private create, and add', async () => {
  musicKey();
  const original = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    assert.match(options.headers.Authorization, /^Bearer /);
    assert.equal(options.headers['Music-User-Token'], 'user-token');
    let body;
    if (url.includes('/v1/me/storefront')) body = { data: [{ id: 'us' }] };
    else if (url.includes('/v1/me/library/playlists?limit=100')) body = {
      data: [{ id: 'first', attributes: { name: 'First' } }],
      next: '/v1/me/library/playlists?offset=100',
    };
    else if (url.includes('/v1/me/library/playlists?offset=100')) body = {
      data: [{ id: 'second', attributes: { name: 'Second' } }],
    };
    else if (url.includes('/v1/catalog/us/search')) body = {
      results: { songs: { data: [{ id: 'song-1', attributes: { name: 'Golden Hour', artistName: 'Kacey Musgraves' } }] } },
    };
    else if (url.endsWith('/v1/me/library/playlists') && options.method === 'POST') body = { data: [{ id: 'created' }] };
    else if (url.endsWith('/v1/me/library/playlists/created/tracks') && options.method === 'POST') body = {};
    else throw new Error(`Unexpected Apple URL: ${url}`);
    return new Response(JSON.stringify(body), { status: 200 });
  };
  try {
    assert.equal(await apple.profile('user-token'), 'us');
    assert.deepEqual((await apple.playlists('user-token')).map(item => item.id), ['first', 'second']);
    assert.deepEqual((await apple.search('user-token', { title: 'Golden Hour', artist: 'Kacey Musgraves' }, 'us')).map(item => item.id), ['song-1']);
    assert.equal(await apple.create('user-token', 'Favorites'), 'created');
    await apple.add('user-token', 'created', ['song-1']);
    const create = requests.find(item => item.url.endsWith('/v1/me/library/playlists') && item.options.method === 'POST');
    assert.equal(JSON.parse(create.options.body).attributes.isPublic, false);
    const add = requests.find(item => item.url.endsWith('/v1/me/library/playlists/created/tracks'));
    assert.deepEqual(JSON.parse(add.options.body).data, [{ id: 'song-1', type: 'songs' }]);
  } finally {
    globalThis.fetch = original;
  }
});
