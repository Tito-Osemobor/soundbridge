import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseMatch, mapBounded, normalize, validateTransfer } from '../src/features/transfer/match.js';

test('matching only selects one strong title and artist candidate', () => {
  const source = { title: 'Golden Hour', artist: 'Kacey Musgraves' };
  assert.equal(chooseMatch(source, [{ id: '1', title: 'Kacey Musgraves - Golden Hour (Official Audio)', artist: 'Kacey Musgraves' }]), '1');
  assert.equal(chooseMatch(source, [
    { id: '1', title: 'Golden Hour', artist: 'Kacey Musgraves' },
    { id: '2', title: 'Golden Hour (Live)', artist: 'Kacey Musgraves' },
  ]), null);
  assert.equal(chooseMatch(source, [{ id: 'bad', title: 'Golden Hour', artist: 'Another artist' }]), null);
  assert.equal(chooseMatch({ ...source, unavailable: true }, [{ id: '1', title: source.title, artist: source.artist }]), null);
  assert.equal(normalize('Beyoncé (Live) [Remaster]'), 'beyonce');
});

test('bounded mapping preserves order and limits concurrency', async () => {
  let active = 0;
  let max = 0;
  const results = await mapBounded([0, 1, 2, 3, 4], 2, async number => {
    active += 1;
    max = Math.max(max, active);
    await new Promise(resolve => setTimeout(resolve, number % 2 ? 2 : 5));
    active -= 1;
    return number * 2;
  });
  assert.deepEqual(results, [0, 2, 4, 6, 8]);
  assert.equal(max, 2);
});

test('a transfer requires two distinct providers and a playlist', () => {
  assert.throws(() => validateTransfer('SPOTIFY', 'SPOTIFY', 'a'), /different destination/);
  assert.throws(() => validateTransfer('SPOTIFY', 'YOUTUBE_MUSIC', ''), /source playlist/);
});
