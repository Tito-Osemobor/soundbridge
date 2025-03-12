import api from "@/services/api";

const BASE_YOUTUBE_AUTH_URL = `${api.defaults.baseURL}/auth/youtube`;

export const connectYoutubeMusic = async () => {
  const width = 500, height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const authWindow = window.open("", "YouTubeConnect", `width=${width},height=${height},top=${top},left=${left}`);

  if (!authWindow) {
    alert("Popup was blocked. Please allow popups and try again.");
    return;
  }

  try {
    // Wait for the API to return the OAuth URL
    const response = await api.get(`${BASE_YOUTUBE_AUTH_URL}/connect`);
    const authUrl = response.data.redirectUrl;

    if (!authUrl) {
      console.error("❌ Error: No redirect URL received.");
      authWindow.close();
      return;
    }

    // ✅ Set the popup URL after API response
    authWindow.location.href = authUrl;

    // ✅ Wait for the popup to close
    const checkPopupClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkPopupClosed);
      }
    }, 500);
  } catch (error) {
    console.error("❌ Error connecting to YouTube Music:", error);
    authWindow.close();
  }
};
