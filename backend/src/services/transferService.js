const {fetchSpotifyPlaylistTracks} = require("./spotifyService");
const {searchYouTubeMusic, createYouTubePlaylist, addToYouTubePlaylist} = require("./youtubeService");

const transferPlaylistService = async (spotifyUserId, youtubeUserId, playlistId, playlistName) => {
  console.log(`🚀 Initiating transfer for playlist ID: ${playlistId}`);

  // Fetch Spotify tracks
  const tracks = await fetchSpotifyPlaylistTracks(spotifyUserId, playlistId);
  if (!tracks.length) throw new Error("No tracks found in the playlist.");

  console.log(`🎵 Found ${tracks.length} tracks. Searching for matches on YouTube...`);

  // Match tracks on YouTube
  const matchedTracks = await Promise.all(
    tracks.map(async (track) => {
      const videoId = await searchYouTubeMusic(youtubeUserId, `${track.title} ${track.artist}`);
      return videoId ? videoId : null;
    })
  );

  const validTracks = matchedTracks.filter(id => id !== null);
  if (!validTracks.length) throw new Error("No matching tracks found on YouTube.");

  console.log(`✅ Matched ${validTracks.length} tracks. Creating YouTube playlist...`);

  // Create YouTube playlist
  const youtubePlaylistId = await createYouTubePlaylist(youtubeUserId, `Soundbridge - ${playlistName}`);
  if (!youtubePlaylistId) throw new Error("Failed to create YouTube playlist.");

  console.log(`📂 YouTube Playlist Created: ${youtubePlaylistId}`);

  // Add tracks to the playlist
  await addToYouTubePlaylist(youtubeUserId, youtubePlaylistId, validTracks);

  console.log(`✅ Transfer complete!`);
  return {success: true, message: "Playlist transfer successful", youtubePlaylistId};
};

module.exports = {transferPlaylistService};
