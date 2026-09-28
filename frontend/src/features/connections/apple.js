import { api } from '@/features/shared/api';

let loading;
function loadMusicKit() {
  if (window.MusicKit) return Promise.resolve(window.MusicKit);
  if (!loading) loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
    script.onload = () => window.MusicKit ? resolve(window.MusicKit) : reject(new Error('MusicKit did not load'));
    script.onerror = () => reject(new Error('Could not load MusicKit'));
    document.head.appendChild(script);
  });
  return loading;
}

export async function connectApple() {
  const kit = await loadMusicKit();
  const { developerToken } = await api('/api/connections/apple/token');
  await kit.configure({ developerToken, app: { name: 'SoundBridge', build: '1.0.0' } });
  const musicUserToken = await kit.getInstance().authorize();
  await api('/api/connections/apple', { method: 'POST', body: JSON.stringify({ musicUserToken }) });
}
