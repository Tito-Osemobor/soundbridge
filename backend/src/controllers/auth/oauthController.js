import {Platform} from "@prisma/client";
import {getSpotifyOAuthUrl, handleSpotifyOAuthCallback} from "../../services/platforms/spotify/spotifyAuthService.js";
import {
  getYoutubeMusicOAuthUrl,
  handleYoutubeMusicOAuthCallback
} from "../../services/platforms/youtubeMusic/youtubeAuthService.js";
import {generateOAuthStateToken} from "../../services/auth/oauthService.js";
import jwt from "jsonwebtoken";

export const handlePlatformConnect = async (req, res, next) => {
  const platformId = req.query.platformId;
  const userId = req.user?.userId;

  if (!platformId) {
    return res.status(400).json({success: false, message: "Missing platform parameter"});
  }

  if (!userId) {
    return res.status(401).json({success: false, message: "Unauthorized"});
  }

  try {
    const state = generateOAuthStateToken({userId, platform: platformId});
    let oauthRedirectUrl;

    switch (platformId) {
      case Platform.SPOTIFY:
        oauthRedirectUrl = getSpotifyOAuthUrl(state);
        break;
      case Platform.YOUTUBE_MUSIC:
        oauthRedirectUrl = getYoutubeMusicOAuthUrl(state);
        break;
      default:
        return res.status(400).json({success: false, message: "Unsupported platform"});
    }

    console.log(`🔹 Redirecting to ${platformId} for connect:`, oauthRedirectUrl);
    return res.json({success: true, oauthRedirectUrl});
  } catch (err) {
    next(err);
  }
};

export const handlePlatformCallback = async (req, res, next) => {
  const platformId = req.params.platformId;
  const {code, state} = req.query;

  if (!platformId || !code || !state) {
    return res.status(400).json({success: false, message: "Missing required parameters"});
  }

  try {
    const decodedState = jwt.verify(state, process.env.JWT_SECRET);
    console.log('decodedState', decodedState);
    const userId = decodedState.userId;

    if (!userId || decodedState.platform !== platformId) {
      return res.status(400).json({success: false, message: "Invalid state payload"});
    }
    switch (platformId) {
      case Platform.SPOTIFY:
        await handleSpotifyOAuthCallback(code, userId);
        break;
      case Platform.YOUTUBE_MUSIC:
        await handleYoutubeMusicOAuthCallback(code, userId);
        break;
      default:
        return res.status(400).json({success: false, message: "Unsupported platform"});
    }

    console.log(`✅ ${platformId} connected successfully.`);
    return res.redirect(`${process.env.FRONTEND_DEV_URL}/oauth?platformId=${platformId}&success=true`);
  } catch (error) {
    console.error("OAuth callback failed:", error);
    return res.redirect(`${process.env.FRONTEND_DEV_URL}/oauth?platformId=${platformId || "unknown"}&success=false&error=${encodeURIComponent(error.message)}`);
  }
};
