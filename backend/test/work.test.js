import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorker } from '../src/features/transfer/work.js';

function fixture() {
  let job = {
    id: 'job-1', source: 'SPOTIFY', destination: 'YOUTUBE_MUSIC',
    sourcePlaylistId: 'playlist-1', sourceName: 'Favorites', status: 'matching',
    destinationPlaylistId: null, items: [], error: null,
  };
  const added = [];
  let failOnce = true;
  const store = {
    findUniqueOrThrow: async () => structuredClone(job),
    update: async ({ data }) => { job = { ...job, ...structuredClone(data) }; return structuredClone(job); },
    findMany: async () => [structuredClone(job)],
  };
  const source = { tracks: async () => [
    { title: 'Golden Hour', artist: 'Kacey Musgraves' },
    { title: 'Redbone', artist: 'Childish Gambino' },
  ] };
  const destination = {
    search: async (_token, track) => [{ id: track.title, title: track.title, artist: track.artist }],
    create: async () => 'created-1',
    destinationIds: async () => [...added],
    add: async (_token, _id, ids) => {
      if (ids[0] === 'Redbone' && failOnce) {
        failOnce = false;
        throw Object.assign(new Error('quota'), { code: 'RATE_LIMITED' });
      }
      added.push(...ids);
    },
  };
  const worker = () => createWorker({
    store, tokenFor: async () => 'token',
    resolveProvider: id => id === 'SPOTIFY' ? source : destination,
  });
  return { worker, get job() { return job; }, added };
}

test('matching preserves order and interrupted transfer retries missing items', async () => {
  const state = fixture();
  await state.worker().runMatch('job-1');
  assert.equal(state.job.status, 'ready');
  assert.deepEqual(state.job.items.map(item => item.selectedId), ['Golden Hour', 'Redbone']);
  await state.worker().runWrite('job-1');
  assert.equal(state.job.status, 'paused');
  assert.equal(state.job.destinationPlaylistId, 'created-1');
  assert.deepEqual(state.added, ['Golden Hour']);
  await state.worker().runWrite('job-1');
  assert.equal(state.job.status, 'completed');
  assert.deepEqual(state.added, ['Golden Hour', 'Redbone']);
  assert.deepEqual(state.job.items.map(item => item.status), ['done', 'done']);
});

test('restart recovery resumes a running transfer without duplicate writes', async () => {
  const state = fixture();
  await state.worker().runMatch('job-1');
  await state.worker().runWrite('job-1');
  state.job.status = 'running';
  await state.worker().recoverTransfers();
  assert.deepEqual(state.added, ['Golden Hour', 'Redbone']);
});
