import { sign } from 'node:crypto';
import { config, requireConfig } from '../config.js';
import { AppError, providerFetch } from '../http.js';

const base = 'https://api.music.apple.com';
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');

export function developerToken() {
  const team = requireConfig(config.apple.team, 'APPLE_TEAM_ID');
  const keyId = requireConfig(config.apple.key, 'APPLE_KEY_ID');
  const privateKey = requireConfig(config.apple.privateKey, 'APPLE_PRIVATE_KEY');
  const now = Math.floor(Date.now() / 1000);
  const input = `${encode({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${encode({ iss: team, iat: now, exp: now + 86400 })}`;
  const signature = sign('sha256', Buffer.from(input), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${input}.${signature.toString('base64url')}`;
}

const headers = token => ({ Authorization: `Bearer ${developerToken()}`, 'Music-User-Token': token });
const absolute = path => new URL(path, base).toString();
async function applePages(url, token, map) {
  const result = [];
  while (url) {
    const page = await providerFetch(absolute(url), { headers: headers(token) });
    result.push(...(page.data || []).map(map));
    url = page.next;
  }
  return result;
}

export const apple = {
  id: 'APPLE_MUSIC',
  async profile(token) {
    const data = await providerFetch(`${base}/v1/me/storefront`, { headers: headers(token) });
    if (!data.data?.[0]?.id) throw new AppError('RECONNECT_REQUIRED', 'Apple Music authorization failed', 401);
    return data.data[0].id;
  },
  async playlists(token) {
    return applePages('/v1/me/library/playlists?limit=100', token, item => ({
      id: item.id, name: item.attributes?.name || 'Untitled playlist',
      count: item.relationships?.tracks?.data?.length || 0, creator: 'Apple Music',
    }));
  },
  async tracks(token, id) {
    return applePages(`/v1/me/library/playlists/${encodeURIComponent(id)}/tracks?limit=100`, token, item => ({
      id: item.attributes?.playParams?.catalogId || item.id,
      title: item.attributes?.name || 'Unavailable song',
      artist: item.attributes?.artistName || '',
      duration: item.attributes?.durationInMillis,
      unavailable: !item.attributes?.name,
    }));
  },
  async search(token, track, knownStorefront) {
    const storefront = knownStorefront || await this.profile(token);
    const term = encodeURIComponent(`${track.title} ${track.artist}`);
    const data = await providerFetch(`${base}/v1/catalog/${storefront}/search?types=songs&limit=5&term=${term}`,
      { headers: headers(token) });
    return (data.results?.songs?.data || []).map(item => ({
      id: item.id, title: item.attributes?.name || '',
      artist: item.attributes?.artistName || '',
      duration: item.attributes?.durationInMillis,
    }));
  },
  async create(token, name) {
    const data = await providerFetch(`${base}/v1/me/library/playlists`, {
      method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: { name, description: 'Transferred with SoundBridge', isPublic: false } }),
    });
    const id = data.data?.[0]?.id;
    if (!id) throw new AppError('PROVIDER_FAILED', 'Apple Music did not create a playlist', 502);
    return id;
  },
  async add(token, id, trackIds) {
    if (!trackIds.length) return;
    await providerFetch(`${base}/v1/me/library/playlists/${encodeURIComponent(id)}/tracks`, {
      method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: trackIds.map(trackId => ({ id: trackId, type: 'songs' })) }),
    });
  },
  async destinationIds(token, id) {
    const items = await this.tracks(token, id);
    return items.map(item => item.id);
  },
};
