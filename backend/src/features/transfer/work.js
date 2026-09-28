import { db } from '../../db.js';
import { accessToken } from '../connections/store.js';
import { provider } from '../../providers/index.js';
import { chooseMatch, mapBounded } from './match.js';

export function createWorker({ store = db.transfer, tokenFor = accessToken, resolveProvider = provider } = {}) {
const active = new Set();
const update = (id, data) => store.update({ where: { id }, data });

async function runMatch(id) {
  if (active.has(id)) return;
  active.add(id);
  try {
    const job = await store.findUniqueOrThrow({ where: { id } });
    const source = resolveProvider(job.source);
    const destination = resolveProvider(job.destination);
    const [sourceToken, destinationToken] = await Promise.all([
      tokenFor(job.source), tokenFor(job.destination),
    ]);
    const destinationContext = job.destination === 'APPLE_MUSIC' ? await destination.profile(destinationToken) : undefined;
    const tracks = await source.tracks(sourceToken, job.sourcePlaylistId);
    if (!tracks.length) throw new Error('EMPTY_PLAYLIST');
    const cache = new Map();
    const items = [...job.items];
    for (let offset = items.length; offset < tracks.length; offset += 3) {
      const batch = await mapBounded(tracks.slice(offset, offset + 3), 3, async track => {
        if (track.unavailable) return { source: track, candidates: [], selectedId: null, status: 'skipped', error: 'Unavailable at source' };
        const query = `${track.title}| ${track.artist}`.toLowerCase();
        if (!cache.has(query)) cache.set(query, destination.search(destinationToken, track, destinationContext));
        const candidates = await cache.get(query);
        return { source: track, candidates, selectedId: chooseMatch(track, candidates), status: 'pending', error: null };
      });
      items.push(...batch);
      await update(id, { items });
    }
    await update(id, { items, status: 'ready', error: null });
  } catch (error) {
    await update(id, { status: error.code === 'RATE_LIMITED' ? 'paused' : 'failed', error: error.code || 'MATCH_FAILED' });
  } finally {
    active.delete(id);
  }
}

async function runWrite(id) {
  if (active.has(id)) return;
  active.add(id);
  try {
    let job = await store.findUniqueOrThrow({ where: { id } });
    const adapter = resolveProvider(job.destination);
    const token = await tokenFor(job.destination);
    if (!job.destinationPlaylistId) {
      const destinationPlaylistId = await adapter.create(token, job.sourceName);
      job = await update(id, { destinationPlaylistId });
    }
    const existing = await adapter.destinationIds(token, job.destinationPlaylistId);
    const counts = new Map();
    for (const value of existing) counts.set(value, (counts.get(value) || 0) + 1);
    const seen = new Map();
    const items = [...job.items];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (!item.selectedId || item.status === 'skipped') continue;
      const used = seen.get(item.selectedId) || 0;
      seen.set(item.selectedId, used + 1);
      if ((counts.get(item.selectedId) || 0) > used) {
        items[index] = { ...item, status: 'done', error: null };
        continue;
      }
      try {
        await adapter.add(token, job.destinationPlaylistId, [item.selectedId]);
        items[index] = { ...item, status: 'done', error: null };
        counts.set(item.selectedId, (counts.get(item.selectedId) || 0) + 1);
      } catch (error) {
        items[index] = { ...item, status: 'failed', error: error.code || 'ADD_FAILED' };
        await update(id, { items, status: 'paused', error: error.code || 'ADD_FAILED' });
        return;
      }
      await update(id, { items });
    }
    await update(id, { items, status: 'completed', error: null });
  } catch (error) {
    await update(id, { status: 'paused', error: error.code || 'TRANSFER_FAILED' });
  } finally {
    active.delete(id);
  }
}

async function recoverTransfers() {
  const pending = await store.findMany({ where: { status: { in: ['matching', 'running'] } } });
  await Promise.all(pending.map(job => job.status === 'matching' ? runMatch(job.id) : runWrite(job.id)));
}
return { runMatch, runWrite, recoverTransfers };
}

export const { runMatch, runWrite, recoverTransfers } = createWorker();
