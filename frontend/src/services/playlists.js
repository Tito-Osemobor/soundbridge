import api from "@/services/api";
import {API_ENDPOINTS} from "@/constants/endpoints"; // Ensure this exists

export const loadUserPlaylists = async (platformId) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PLATFORM.PLAYLISTS}?platformId=${platformId}`);
    return response.data?.playlists ?? []; // ✅ flatten here
  } catch (error) {
    const message =
      error?.response?.data?.message || "Failed to load playlists.";
    console.warn(`⚠️ Failed to load playlists for ${platformId}: ${message}`);

    // Let Redux know what happened
    throw new Error(message);
  }
};
