import {fetchSpotifyPlaylists} from "@/services/spotifyService";
// import {fetchYouTubePlaylists} from "@/services/youtubeService";
import {PLATFORM_IDS} from "@/constants/services"; // Ensure this exists

export const loadUserPlaylists = async (platformId, platformUserId) => {
  try {
    switch (platformId) {
      case PLATFORM_IDS.SPOTIFY:
        return await fetchSpotifyPlaylists(platformUserId);
      // case SUPPORTED_PLATFORMS.YOUTUBE_MUSIC.id:
      //   return await fetchYouTubePlaylists(platformUserId);
      default:
        console.warn("Unsupported platform:", platformId);
        return [];
    }
  } catch (error) {
    console.error(`Error loading playlists from ${platformId}:`, error);
    return [];
  }
};
