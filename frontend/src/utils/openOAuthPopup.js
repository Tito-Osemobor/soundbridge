import {
  OAuthProviderError,
  OAuthTimeoutError,
  PopupBlockedError,
  UserClosedPopupError,
} from "@/utils/errors";

let activePopup = null; // Singleton guard

export const openBlankPopup = (platformId) => {
  const width = 500,
    height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  if (activePopup && !activePopup.closed) {
    activePopup.focus();
    throw {
      type: "POPUP_ALREADY_OPEN",
      platformId,
      message: "Another OAuth popup is already active",
    };
  }

  const popup = window.open(
    "about:blank",
    `${platformId}-popup`,
    `width=${width},height=${height},top=${top},left=${left}`
  );

  if (!popup) {
    throw new PopupBlockedError(platformId);
  }

  popup.focus();
  activePopup = popup;
  return popup;
};

export const waitForOAuthResult = (popup, platformId) => {
  return new Promise((resolve, reject) => {
    const timeoutDuration = 10 * 60 * 1000;

    const cleanup = () => {
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("message", listener);
      if (!popup.closed) popup.close();
      activePopup = null;
    };

    const timeout = setTimeout(() => {
      cleanup();
      console.warn(`[OAuthPopup] Timeout waiting for ${platformId} to complete.`);
      reject(new OAuthTimeoutError(platformId));
    }, timeoutDuration);

    const interval = setInterval(() => {
      if (popup.closed) {
        cleanup();
        console.warn(`[OAuthPopup] User closed popup for ${platformId}.`);
        reject(new UserClosedPopupError(platformId));
      }
    }, 500);

    const listener = (event) => {
      if (event.origin !== window.location.origin) return;

      const { type, platformId: msgPlatformId, status, error } = event.data || {};
      if (type !== "OAUTH_RESULT" || msgPlatformId !== platformId) return;

      cleanup();

      if (status === "success") {
        resolve();
      } else {
        console.warn(`[OAuthPopup] OAuth provider returned error for ${platformId}.`);
        reject(new OAuthProviderError(platformId));
      }
    };

    window.addEventListener("message", listener);
  });
};
