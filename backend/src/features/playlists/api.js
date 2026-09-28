import { Router } from 'express';
import { accessToken } from '../connections/store.js';
import { provider } from '../../providers/index.js';
import { route } from '../../http.js';

export const playlists = Router();
playlists.get('/', route(async (req, res) => {
  const adapter = provider(req.query.provider);
  const token = await accessToken(adapter.id);
  res.json(await adapter.playlists(token));
}));
