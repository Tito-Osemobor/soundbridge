import { spotify } from './spotify.js';
import { youtube } from './youtube.js';
import { apple } from './apple.js';
import { AppError } from '../http.js';

const providers = { SPOTIFY: spotify, YOUTUBE_MUSIC: youtube, APPLE_MUSIC: apple };

export function provider(id) {
  const value = providers[id];
  if (!value) throw new AppError('INVALID_PROVIDER', 'Unsupported provider');
  return value;
}
