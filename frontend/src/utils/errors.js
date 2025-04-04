// Base class for all OAuth-related errors
export class OAuthError extends Error {
  constructor(type, platformId, message) {
    super(message);
    this.name = "OAuthError";
    this.type = type;
    this.platformId = platformId;
  }
}

// === Specific Errors ===

// When the popup is blocked by the browser
export class PopupBlockedError extends OAuthError {
  constructor(platformId) {
    super("POPUP_BLOCKED", platformId, "Popup was blocked by the browser");
  }
}

// When the user closes the popup before completing
export class UserClosedPopupError extends OAuthError {
  constructor(platformId) {
    super("USER_CLOSED", platformId, "User closed the popup window");
  }
}

// When the OAuth process times out
export class OAuthTimeoutError extends OAuthError {
  constructor(platformId) {
    super("TIMEOUT", platformId, "OAuth timed out");
  }
}

// When the popup returns an error from the provider
export class OAuthProviderError extends OAuthError {
  constructor(platformId, message = "OAuth failed on provider side") {
    super("OAUTH_PROVIDER_ERROR", platformId, message);
  }
}

// When the backend gives no redirect URL
export class NoAuthUrlError extends OAuthError {
  constructor(platformId) {
    super("NO_AUTH_URL", platformId, "No auth URL received from server");
  }
}

// Generic fallback
export class UnknownOAuthError extends OAuthError {
  constructor(platformId, message = "Unexpected error during OAuth flow") {
    super("UNKNOWN_ERROR", platformId, message);
  }
}

export class UserFetchFailedError extends OAuthError {
  constructor(platformId) {
    super("USER_FETCH_FAILED", platformId, "Failed to fetch user after connecting platform");
  }
}

export class AlreadyConnectedError extends OAuthError {
  constructor(platformId) {
    super("ALREADY_CONNECTED", platformId, "This platform is already connected");
  }
}

export class PlatformConnectionRejectedError extends OAuthError {
  constructor(platformId) {
    super("PLATFORM_REJECTED", platformId, "You declined to grant access");
  }
}

export class PlatformNotSupportedError extends OAuthError {
  constructor(platformId) {
    super("PLATFORM_NOT_SUPPORTED", platformId, "This platform is not supported");
  }
}

export class BackendConnectionError extends OAuthError {
  constructor(platformId, message = "Backend failed to initiate OAuth flow") {
    super("BACKEND_CONNECT_FAILED", platformId, message);
  }
}
