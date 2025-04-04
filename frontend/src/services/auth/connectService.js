import api from "@/services/api";
import { openBlankPopup, waitForOAuthResult } from "@/utils/openOAuthPopup";
import {
  NoAuthUrlError,
  OAuthError,
  UnknownOAuthError,
} from "@/utils/errors";

export const connectService = async (platformId) => {
  const popup = openBlankPopup(platformId);

  try {
    const response = await api.post(`/auth/connect?platformId=${platformId}`);
    const authUrl = response.data.redirectUrl;

    if (!authUrl) {
      popup.close();
      throw new NoAuthUrlError(platformId);
    }

    popup.location.href = authUrl;
    await waitForOAuthResult(popup, platformId);

    return { success: true };
  } catch (error) {
    if (!popup.closed) popup.close();

    if (error instanceof OAuthError && ["USER_CLOSED", "PLATFORM_REJECTED", "TIMEOUT", "POPUP_BLOCKED"].includes(error.type)) {
      console.warn(`[OAuth] Connection did not complete for ${platformId}:`, error.message);
    } else {
      console.error(`[OAuth] Unexpected failure for ${platformId}:`, error);
    }

    if (error instanceof OAuthError) {
      throw error;
    }

    throw new UnknownOAuthError(platformId, error.message);
  }
};
