import { Router } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '../../config.js';
import { db } from '../../db.js';
import { AppError, route } from '../../http.js';
import { provider } from '../../providers/index.js';
import { developerToken } from '../../providers/apple.js';
import { saveConnection } from './store.js';

export const connections = Router();
const cookieName = 'soundbridge_oauth';

connections.get('/', route(async (_req, res) => {
  const rows = await db.connection.findMany({ select: { platform: true, platformUserId: true } });
  res.json(rows);
}));

connections.get('/start/:platform', route(async (req, res) => {
  const id = req.params.platform;
  if (id === 'APPLE_MUSIC') throw new AppError('INVALID_PROVIDER', 'Use Apple Music authorization in the app');
  const target = provider(id).oauth();
  const state = randomBytes(32).toString('base64url');
  target.searchParams.set('state', state);
  res.cookie(cookieName, state, {
    httpOnly: true, sameSite: 'lax', secure: config.webOrigin.startsWith('https:'),
    maxAge: 10 * 60_000, path: '/api/connections/callback',
  });
  res.redirect(target.toString());
}));

connections.get('/callback/:platform', route(async (req, res) => {
  const id = req.params.platform;
  const expected = req.cookies?.[cookieName];
  const received = req.query.state;
  res.clearCookie(cookieName, { path: '/api/connections/callback' });
  if (req.query.error) return res.redirect('/hub?connection=denied');
  if (typeof expected !== 'string' || typeof received !== 'string' ||
    expected.length !== received.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(received))) {
    return res.redirect('/hub?connection=state');
  }
  try {
    const adapter = provider(id);
    const tokens = await adapter.exchange(req.query.code);
    const platformUserId = await adapter.profile(tokens.access_token);
    await saveConnection(id, platformUserId, tokens);
    return res.redirect('/hub?connection=success');
  } catch {
    return res.redirect('/hub?connection=failed');
  }
}));

connections.get('/apple/token', route(async (_req, res) => {
  res.json({ developerToken: developerToken() });
}));

connections.post('/apple', route(async (req, res) => {
  const token = req.body?.musicUserToken;
  if (typeof token !== 'string' || token.length < 20) throw new AppError('INVALID_TOKEN', 'Apple Music token is invalid');
  const storefront = await provider('APPLE_MUSIC').profile(token);
  await saveConnection('APPLE_MUSIC', storefront, { access_token: token });
  res.json({ platform: 'APPLE_MUSIC', platformUserId: storefront });
}));

connections.delete('/:platform', route(async (req, res) => {
  const id = req.params.platform;
  provider(id);
  await db.connection.deleteMany({ where: { platform: id } });
  res.status(204).end();
}));
