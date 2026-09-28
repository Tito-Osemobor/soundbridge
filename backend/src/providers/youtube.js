import { config, requireConfig } from '../config.js';
import { AppError, pages, providerFetch } from '../http.js';

const base = 'https://www.googleapis.com/youtube/v3';
const headers = token => ({ Authorization: `Bearer ${token}` });

export const youtube = {
  id: 'YOUTUBE_MUSIC',
  oauth() {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: requireConfig(config.youtube.id, 'YOUTUBE_CLIENT_ID'),
      redirect_uri: requireConfig(config.youtube.redirect, 'YOUTUBE_REDIRECT_URI'),
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      access_type: 'offline', prompt: 'consent',
    }).toString();
    return url;
  },
  async exchange(code) {
    return providerFetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code,
        redirect_uri: config.youtube.redirect,
        client_id: config.youtube.id,
        client_secret: config.youtube.secret,
      }),
    });
  },
  async refresh(refreshToken) {
    return providerFetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token', refresh_token: refreshToken,
        client_id: config.youtube.id, client_secret: config.youtube.secret,
      }),
    });
  },
  async profile(token) {
    const data = await providerFetch(`${base}/channels?part=id&mine=true`, { headers: headers(token) });
    if (!data.items?.[0]?.id) throw new AppError('NO_CHANNEL', 'No YouTube channel was found', 400);
    return data.items[0].id;
  },
  async playlists(token) {
    return pages(`${base}/playlists?part=snippet,contentDetails&mine=true&maxResults=50`,
      { headers: headers(token) }, page => (page.items || []).map(item => ({
        id: item.id, name: item.snippet.title, count: item.contentDetails?.itemCount || 0,
        creator: item.snippet.channelTitle || 'YouTube',
      })));
  },
  async tracks(token, id) {
    return pages(`${base}/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${encodeURIComponent(id)}`,
      { headers: headers(token) }, page => (page.items || []).map(item => ({
        id: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || null,
        title: item.snippet?.title || 'Unavailable video',
        artist: item.snippet?.videoOwnerChannelTitle || '',
        unavailable: !item.contentDetails?.videoId || item.snippet?.title === 'Deleted video',
      })));
  },
  async search(token, track) {
    const q = encodeURIComponent(`${track.title} ${track.artist} official audio`);
    const data = await providerFetch(`${base}/search?part=snippet&type=video&videoCategoryId=10&maxResults=5&q=${q}`,
      { headers: headers(token) });
    return (data.items || []).filter(item => item.id?.videoId).map(item => ({
      id: item.id.videoId, title: item.snippet.title,
      artist: item.snippet.channelTitle || '',
    }));
  },
  async create(token, name) {
    const data = await providerFetch(`${base}/playlists?part=snippet,status`, {
      method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippet: { title: name, description: 'Transferred with SoundBridge' }, status: { privacyStatus: 'private' } }),
    });
    if (!data.id) throw new AppError('PROVIDER_FAILED', 'YouTube did not create a playlist', 502);
    return data.id;
  },
  async add(token, id, trackIds) {
    for (const trackId of trackIds) {
      await providerFetch(`${base}/playlistItems?part=snippet`, {
        method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: { playlistId: id, resourceId: { kind: 'youtube#video', videoId: trackId } } }),
      });
    }
  },
  async destinationIds(token, id) {
    return pages(`${base}/playlistItems?part=contentDetails&maxResults=50&playlistId=${encodeURIComponent(id)}`,
      { headers: headers(token) }, page => (page.items || []).map(item => item.contentDetails?.videoId).filter(Boolean));
  },
};
