import { config, requireConfig } from '../config.js';
import { AppError, pages, providerFetch } from '../http.js';

const base = 'https://api.spotify.com/v1';
const headers = token => ({ Authorization: `Bearer ${token}` });

export const spotify = {
  id: 'SPOTIFY',
  oauth() {
    const url = new URL('https://accounts.spotify.com/authorize');
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: requireConfig(config.spotify.id, 'SPOTIFY_CLIENT_ID'),
      redirect_uri: requireConfig(config.spotify.redirect, 'SPOTIFY_REDIRECT_URI'),
      scope: 'playlist-read-private playlist-read-collaborative playlist-modify-private',
    }).toString();
    return url;
  },
  async exchange(code) {
    return providerFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code,
        redirect_uri: config.spotify.redirect,
        client_id: config.spotify.id,
        client_secret: config.spotify.secret,
      }),
    });
  },
  async refresh(refreshToken) {
    return providerFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.spotify.id,
        client_secret: config.spotify.secret,
      }),
    });
  },
  async profile(token) {
    const data = await providerFetch(`${base}/me`, { headers: headers(token) });
    return data.id;
  },
  async playlists(token) {
    return pages(`${base}/me/playlists?limit=50`, { headers: headers(token) },
      page => (page.items || []).filter(Boolean).map(item => ({
        id: item.id, name: item.name, count: item.items?.total ?? item.tracks?.total ?? 0,
        creator: item.owner?.display_name || 'Spotify',
      })));
  },
  async tracks(token, id) {
    return pages(`${base}/playlists/${encodeURIComponent(id)}/items?limit=50`,
      { headers: headers(token) }, page => (page.items || []).map(item => {
        const track = item.item || item.track;
        return track?.type === 'track' && !track.is_local
          ? { id: track.id, title: track.name, artist: track.artists?.map(a => a.name).join(', ') || '', duration: track.duration_ms }
          : { id: null, title: track?.name || 'Unavailable item', artist: '', unavailable: true };
      }));
  },
  async search(token, track) {
    const query = encodeURIComponent(`track:${track.title} artist:${track.artist}`);
    const data = await providerFetch(`${base}/search?type=track&limit=5&q=${query}`, { headers: headers(token) });
    return (data.tracks?.items || []).map(item => ({
      id: item.uri, title: item.name, artist: item.artists?.map(a => a.name).join(', ') || '',
      duration: item.duration_ms,
    }));
  },
  async create(token, name) {
    const data = await providerFetch(`${base}/me/playlists`, {
      method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, public: false, description: 'Transferred with SoundBridge' }),
    });
    if (!data.id) throw new AppError('PROVIDER_FAILED', 'Spotify did not create a playlist', 502);
    return data.id;
  },
  async add(token, id, trackIds) {
    if (!trackIds.length) return;
    await providerFetch(`${base}/playlists/${encodeURIComponent(id)}/items`, {
      method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: trackIds }),
    });
  },
  async destinationIds(token, id) {
    return pages(`${base}/playlists/${encodeURIComponent(id)}/items?limit=50`,
      { headers: headers(token) }, page => (page.items || []).map(item => item.item?.uri || item.track?.uri).filter(Boolean));
  },
};
