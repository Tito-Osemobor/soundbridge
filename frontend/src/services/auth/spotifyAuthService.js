import api from "@/services/api";

const BASE_SPOTIFY_AUTH_URL = `${api.defaults.baseURL}/auth/spotify`;

export const loginWithSpotify = () => {
  window.location.href = `${BASE_SPOTIFY_AUTH_URL}/login`;
}

export const connectSpotify = async () => {
  try {
    const response = await api.get(`${BASE_SPOTIFY_AUTH_URL}/connect`);
    window.location.href = response.data.redirectUrl || "/auth/spotify/connect";
  } catch (error) {
    console.error("Error connecting Spotify:", error);
  }
};
