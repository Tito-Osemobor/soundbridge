import 'dotenv/config';

export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 8080),
  webOrigin: process.env.WEB_ORIGIN || 'http://127.0.0.1:3000',
  encryptionKey: process.env.ENCRYPTION_KEY,
  spotify: {
    id: process.env.SPOTIFY_CLIENT_ID,
    secret: process.env.SPOTIFY_CLIENT_SECRET,
    redirect: process.env.SPOTIFY_REDIRECT_URI,
  },
  youtube: {
    id: process.env.YOUTUBE_CLIENT_ID,
    secret: process.env.YOUTUBE_CLIENT_SECRET,
    redirect: process.env.YOUTUBE_REDIRECT_URI,
  },
  apple: {
    team: process.env.APPLE_TEAM_ID,
    key: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
};

export function requireConfig(value, name) {
  if (!value) throw new Error(`${name} is required for this provider`);
  return value;
}
