import { db } from '../../db.js';
import { decrypt, encrypt } from '../../crypto.js';
import { AppError } from '../../http.js';
import { provider } from '../../providers/index.js';

export function createConnectionStore({ connection = db.connection, resolveProvider = provider } = {}) {
async function saveConnection(platform, platformUserId, tokens) {
  const previous = await connection.findUnique({ where: { platform } });
  return connection.upsert({
    where: { platform },
    create: {
      platform, platformUserId,
      accessToken: encrypt(tokens.access_token),
      refreshToken: encrypt(tokens.refresh_token),
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    },
    update: {
      platformUserId,
      accessToken: encrypt(tokens.access_token),
      refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : previous?.refreshToken,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    },
  });
}

async function accessToken(platform) {
  const row = await connection.findUnique({ where: { platform } });
  if (!row) throw new AppError('NOT_CONNECTED', `${platform} is not connected`, 409);
  if (!row.expiresAt || row.expiresAt.getTime() > Date.now() + 60_000) {
    return decrypt(row.accessToken);
  }
  if (!row.refreshToken) throw new AppError('RECONNECT_REQUIRED', `Reconnect ${platform}`, 401);
  const refreshed = await resolveProvider(platform).refresh(decrypt(row.refreshToken));
  if (!refreshed.access_token) throw new AppError('RECONNECT_REQUIRED', `Reconnect ${platform}`, 401);
  await saveConnection(platform, row.platformUserId, refreshed);
  return refreshed.access_token;
}
return { saveConnection, accessToken };
}

export const { saveConnection, accessToken } = createConnectionStore();
