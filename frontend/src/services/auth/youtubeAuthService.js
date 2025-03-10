import api from "@/services/api";

const BASE_YOUTUBE_AUTH_URL = `${api.defaults.baseURL}/auth/youtube`;

export const loginWithYoutube = () => {
  window.location.href = `${BASE_YOUTUBE_AUTH_URL}/login`;
}

export const connectYoutube = async () => {
  try {
    const response = await api.get(`${BASE_YOUTUBE_AUTH_URL}/connect`);
    window.location.href = response.data.redirectUrl || "/auth/youtube/connect";
  } catch (error) {
    console.error("Error connecting YouTube:", error);
  }
};
