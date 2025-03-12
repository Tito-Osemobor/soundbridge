import api from "@/services/api";
const BASE_SPOTIFY_AUTH_URL = `${api.defaults.baseURL}/api/spotify`;

export const fetchSpotifyPlaylists = async (platformUserId) => {
  try {
    const response = await api.get(`${BASE_SPOTIFY_AUTH_URL}/playlists?platformUserId=${platformUserId}`);
    return response.data.playlists;
  } catch (error) {
    console.error("Error fetching Spotify playlists:", error);
    return [];
  }
};

export const fetchSpotifyPlaylistTracks = async (playlistId) => {
  try {
    const response = await api.get(`${BASE_SPOTIFY_AUTH_URL}/playlists/tracks?playlistId=${playlistId}`);
    return response.data.tracks;
  } catch (error) {
    console.error("Error fetching Spotify playlist tracks:", error);
    return [];
  }
};
