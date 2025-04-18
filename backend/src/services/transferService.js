import {fetchSpotifyPlaylistTracks} from './platforms/spotify/spotifyService.js';
import {
  addToYouTubePlaylist,
  createYouTubePlaylist,
  searchYouTubeMusic
} from './platforms/youtubeMusic/youtubeService.js';

export const transferPlaylistService = async (userId, spotifyUserId, youtubeUserId, playlistId, playlistName) => {
  console.log(`🚀 Initiating transfer for playlist ID: ${playlistId}`);

  // Fetch Spotify tracks
  const tracks = await fetchSpotifyPlaylistTracks(userId, spotifyUserId, playlistId);
  if (!tracks.length) throw new Error("No tracks found in the playlist.");

  console.log(`🎵 Found ${tracks.length} tracks. Searching for matches on YouTube...`);

  // Match tracks on YouTube
  const matchedTracks = await Promise.all(
    tracks.map(async (track) => {
      const videoId = await searchYouTubeMusic(userId, youtubeUserId, `${track.title} ${track.artist}`);
      return videoId ? videoId : null;
    })
  );

  const validTracks = matchedTracks.filter(id => id !== null);
  if (!validTracks.length) throw new Error("No matching tracks found on YouTube.");

  console.log(`✅ Matched ${validTracks.length} tracks. Creating YouTube playlist...`);

  // Create YouTube playlist
  const youtubePlaylistId = await createYouTubePlaylist(userId, youtubeUserId, `Soundbridge - ${playlistName}`);
  if (!youtubePlaylistId) throw new Error("Failed to create YouTube playlist.");

  console.log(`📂 YouTube Playlist Created: ${youtubePlaylistId}`);

  // Add tracks to the playlist
  await addToYouTubePlaylist(userId, youtubeUserId, youtubePlaylistId, validTracks);

  console.log(`✅ Transfer complete!`);
  return {success: true, message: "Playlist transfer successful", youtubePlaylistId};
};
