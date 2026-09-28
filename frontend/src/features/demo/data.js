export const platforms = [
  { id: 'SPOTIFY', name: 'Spotify', mark: '◉', color: 'spotify' },
  { id: 'YOUTUBE_MUSIC', name: 'YouTube Music', mark: '▶', color: 'youtube' },
  { id: 'APPLE_MUSIC', name: 'Apple Music', mark: '♫', color: 'apple' },
];

const sample = {
  SPOTIFY: [
    { id: 's1', name: 'Late Night Drive', count: 4, creator: 'Sample library' },
    { id: 's2', name: 'Sunday Morning', count: 3, creator: 'Sample library' },
  ],
  YOUTUBE_MUSIC: [
    { id: 'y1', name: 'Soundtrack to Summer', count: 3, creator: 'Sample library' },
    { id: 'y2', name: 'Focus Mode', count: 4, creator: 'Sample library' },
  ],
  APPLE_MUSIC: [
    { id: 'a1', name: 'On Repeat', count: 3, creator: 'Sample library' },
  ],
};

const songs = [
  { title: 'Golden Hour', artist: 'Kacey Musgraves' },
  { title: 'Pink + White', artist: 'Frank Ocean' },
  { title: 'Redbone', artist: 'Childish Gambino' },
  { title: 'A Song Without a Match', artist: 'Unknown Artist' },
];

const jobs = new Map();
export const demo = {
  connections: async () => platforms.map(item => ({ platform: item.id, platformUserId: 'sample' })),
  playlists: async id => sample[id] || [],
  async start({ source, destination, playlistId }) {
    const playlist = sample[source].find(item => item.id === playlistId);
    const id = `demo-${Date.now()}`;
    const job = {
      id, source, destination, sourceName: playlist.name, status: 'matching',
      items: [], destinationPlaylistId: null, error: null,
    };
    jobs.set(id, job);
    setTimeout(() => {
      job.items = songs.slice(0, playlist.count).map((track, index) => ({
        source: track,
        candidates: index === 3 ? [] : [
          { id: `match-${index}`, title: track.title, artist: track.artist },
          { id: `alt-${index}`, title: `${track.title} (Live)`, artist: track.artist },
        ],
        selectedId: index === 1 || index === 3 ? null : `match-${index}`,
        status: 'pending',
      }));
      job.status = 'ready';
    }, 550);
    return { ...job };
  },
  async get(id) {
    return { ...jobs.get(id), items: [...jobs.get(id).items] };
  },
  async confirm(id, choices) {
    const job = jobs.get(id);
    job.items = job.items.map((item, index) => ({
      ...item, selectedId: choices[index], status: choices[index] ? 'pending' : 'skipped',
    }));
    job.status = 'running';
    setTimeout(() => {
      job.items = job.items.map(item => item.selectedId ? { ...item, status: 'done' } : item);
      job.destinationPlaylistId = 'sample-playlist';
      job.status = 'completed';
    }, 950);
    return { id, status: 'running' };
  },
  async retry(id) {
    return jobs.get(id);
  },
};
