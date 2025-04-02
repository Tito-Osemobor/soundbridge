import api from "@/services/api";

const BASE_SPOTIFY_AUTH_URL = `${api.defaults.baseURL}/auth/spotify`;

export const connectSpotify = async () => {
  const width = 500, height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const authWindow = window.open("", "SpotifyConnect", `width=${width},height=${height},top=${top},left=${left}`);

  if (!authWindow) {
    alert("Popup was blocked. Please allow popups and try again.");
    return;
  }

  try {
    const response = await api.get(`${BASE_SPOTIFY_AUTH_URL}/connect`);
    const authUrl = response.data.redirectUrl;

    if (!authUrl) {
      console.error("Error: No redirect URL received.");
      authWindow.close();
      return;
    }

    authWindow.location.href = authUrl;

    const checkPopupClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkPopupClosed);
      }
    }, 500);
  } catch (error) {
    console.error("Error connecting Spotify:", error);
    authWindow.close();
  }
};
