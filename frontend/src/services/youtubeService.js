import api from "@/services/api";

const BASE_YOUTUBE_AUTH_URL = `${api.defaults.baseURL}/api/youtube`;

export const createYouTubePlaylist = async (playlistName) => {
  try {
    const response = await api.post(`${BASE_YOUTUBE_AUTH_URL}/playlists`, { playlistName }, { withCredentials: true });
    return response.data.playlistId;
  } catch (error) {
    console.error("Error creating YouTube playlist:", error);
    return null;
  }
};

export const searchYouTubeTrack = async (query) => {
  try {
    const response = await api.get(`${BASE_YOUTUBE_AUTH_URL}/search?query=${encodeURIComponent(query)}`, { withCredentials: true });
    return response.data.videoId;
  } catch (error) {
    console.error(`Error searching for "${query}" on YouTube Music:`, error);
    return null;
  }
};

export const addTracksToYouTubePlaylist = async (playlistId, trackIds) => {
  try {
    await api.post(`${BASE_YOUTUBE_AUTH_URL}/playlist/add-tracks`, { playlistId, trackIds }, { withCredentials: true });
    return true;
  } catch (error) {
    console.error("Error adding tracks to YouTube playlist:", error);
    return false;
  }
};
