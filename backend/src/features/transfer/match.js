import { AppError } from '../../http.js';

export const normalize = value => (value || '').normalize('NFKD').toLowerCase()
  .replace(/[\u0300-\u036f]/g, '').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim();

export function chooseMatch(track, candidates) {
  if (track.unavailable) return null;
  const title = normalize(track.title);
  const artist = normalize(track.artist);
  const strong = candidates.filter(candidate => {
    const combined = normalize(`${candidate.title} ${candidate.artist}`);
    return title && combined.includes(title) && artist && combined.includes(artist);
  });
  return strong.length === 1 ? strong[0].id : null;
}

export async function mapBounded(values, limit, worker) {
  const results = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (next < values.length) {
      const index = next++;
      results[index] = await worker(values[index], index);
    }
  }));
  return results;
}

export function validateTransfer(source, destination, playlistId) {
  if (source === destination) throw new AppError('SAME_PROVIDER', 'Choose a different destination');
  if (typeof playlistId !== 'string' || !playlistId.trim()) throw new AppError('INVALID_PLAYLIST', 'Choose a source playlist');
}
