import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { connections } from './features/connections/api.js';
import { playlists } from './features/playlists/api.js';
import { transfers, recoverTransfers } from './features/transfer/api.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if (origin && origin !== config.webOrigin) return res.status(403).json({ code: 'BAD_ORIGIN', message: 'Request origin is not allowed' });
  }
  next();
});
app.use('/api/connections', connections);
app.use('/api/playlists', playlists);
app.use('/api/transfers', transfers);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    code: error.code || 'INTERNAL_ERROR',
    message: status >= 500 && !error.code ? 'An unexpected error occurred' : error.message,
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, config.host, () => {
    console.log(`SoundBridge API listening on ${config.host}:${config.port}`);
    recoverTransfers().catch(console.error);
  });
}
