import { Router } from 'express';
import { db } from '../../db.js';
import { AppError, route } from '../../http.js';
import { accessToken } from '../connections/store.js';
import { provider } from '../../providers/index.js';
import { validateTransfer } from './match.js';
import { recoverTransfers, runMatch, runWrite } from './work.js';

export { recoverTransfers };
export const transfers = Router();

transfers.get('/', route(async (_req, res) => {
  res.json(await db.transfer.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }));
}));

transfers.post('/', route(async (req, res) => {
  const { source, destination, playlistId } = req.body || {};
  const sourceAdapter = provider(source);
  provider(destination);
  validateTransfer(source, destination, playlistId);
  const token = await accessToken(source);
  await accessToken(destination);
  const playlist = (await sourceAdapter.playlists(token)).find(item => item.id === playlistId);
  if (!playlist) throw new AppError('INVALID_PLAYLIST', 'Playlist is not available in the source account', 404);
  const job = await db.transfer.create({
    data: { source, destination, sourcePlaylistId: playlistId, sourceName: playlist.name },
  });
  setImmediate(() => void runMatch(job.id));
  res.status(202).json(job);
}));

transfers.get('/:id', route(async (req, res) => {
  const job = await db.transfer.findUnique({ where: { id: req.params.id } });
  if (!job) throw new AppError('NOT_FOUND', 'Transfer not found', 404);
  res.json(job);
}));

transfers.post('/:id/confirm', route(async (req, res) => {
  const job = await db.transfer.findUnique({ where: { id: req.params.id } });
  if (!job) throw new AppError('NOT_FOUND', 'Transfer not found', 404);
  if (job.status !== 'ready') throw new AppError('NOT_READY', 'Transfer is not ready for review', 409);
  const choices = req.body?.choices;
  if (!Array.isArray(choices) || choices.length !== job.items.length) {
    throw new AppError('INVALID_CHOICES', 'Review each track before transfer');
  }
  if (!choices.some(Boolean)) throw new AppError('NO_MATCHES', 'Select at least one track to transfer');
  const items = job.items.map((item, index) => {
    const selectedId = choices[index];
    if (selectedId !== null && !item.candidates.some(candidate => candidate.id === selectedId)) {
      throw new AppError('INVALID_CHOICES', 'A selected match is not in the candidate list');
    }
    return { ...item, selectedId, status: selectedId ? 'pending' : 'skipped' };
  });
  const claimed = await db.transfer.updateMany({ where: { id: job.id, status: 'ready' }, data: { items, status: 'running', stage: 'writing' } });
  if (!claimed.count) throw new AppError('NOT_READY', 'Transfer already started', 409);
  setImmediate(() => void runWrite(job.id));
  res.status(202).json({ id: job.id, status: 'running' });
}));

transfers.post('/:id/retry', route(async (req, res) => {
  const job = await db.transfer.findUnique({ where: { id: req.params.id } });
  if (!job) throw new AppError('NOT_FOUND', 'Transfer not found', 404);
  if (!['paused', 'failed'].includes(job.status)) throw new AppError('NOT_RETRYABLE', 'Transfer is not paused', 409);
  const status = job.stage === 'writing' ? 'running' : 'matching';
  const claimed = await db.transfer.updateMany({ where: { id: job.id, status: job.status }, data: { status, error: null } });
  if (!claimed.count) throw new AppError('NOT_RETRYABLE', 'Transfer already resumed', 409);
  setImmediate(() => void (status === 'matching' ? runMatch(job.id) : runWrite(job.id)));
  res.status(202).json({ id: job.id, status });
}));
