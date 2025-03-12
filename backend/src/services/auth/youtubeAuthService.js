require('dotenv').config();
const {prisma, saveUserAuth, findUserByPlatformUserId, updateAccessToken} = require('../../services/db');
const {APIError} = require("../../utils/error");
const {
  YOUTUBE_AUTH_URL,
  YOUTUBE_TOKEN_URL,
  YOUTUBE_API_BASE_URL,
  YOUTUBE_SCOPE
} = require('../../config/youtubeConfig');
const {Platform} = require("@prisma/client");

const youtubeLoginService = () => {
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.YOUTUBE_CLIENT_ID,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
    scope: YOUTUBE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${YOUTUBE_AUTH_URL}?${queryParams}`;
};

const youtubeCallbackService = async (code, existingUserId) => {
  if (!code) throw new APIError("Authorization code missing", 400);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
  });

  const response = await fetch(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  });

  const data = await response.json();
  if (data.error) {
    console.log("❌  Error in YouTube token exchange:", data.error_description);
    throw new APIError(data.error_description || 'Failed to authenticate with YouTube', 400);
  }

  const {access_token, refresh_token, expires_in} = data;

  // Fetch the user's YouTube profile
  const userProfileResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=id&mine=true`, {
    headers: {Authorization: `Bearer ${access_token}`}
  });

  const userProfile = await userProfileResponse.json();
  if (!userProfile.items || userProfile.items.length === 0) {
    throw new APIError("Failed to fetch user profile from YouTube", 400);
  }

  const platformUserId = userProfile.items[0].id;

  // Check if user is already linked
  let userAuth = await findUserByPlatformUserId(Platform.YOUTUBE_MUSIC, platformUserId);

  if (!userAuth) {
    if (!existingUserId) throw new APIError("User must be logged in to connect YouTube", 401);

    console.log("🔹 Linking new YouTube account...");
    await saveUserAuth(existingUserId, Platform.YOUTUBE_MUSIC, platformUserId, access_token, refresh_token, expires_in);
  } else {
    console.log("🔹 Updating existing YouTube authentication...");
    const updateData = {accessToken: access_token, expiresIn: expires_in};
    if (refresh_token) updateData.refreshToken = refresh_token;

    await prisma.userAuth.update({where: {id: userAuth.id}, data: updateData});
  }

  console.log("✅ YouTube account connected successfully.");
  return existingUserId;
};

const refreshYouTubeToken = async (userAuth) => {
  if (!userAuth || !userAuth.refreshToken) {
    throw new APIError("No refresh token found. User must log in again.", 400);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: userAuth.refreshToken,
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
  });

  const response = await fetch(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  });

  const data = await response.json();
  if (data.error) {
    throw new APIError(`YouTube Token Refresh Error: ${data.error}`, 500);
  }

  const newAccessToken = data.access_token;
  const newExpiresIn = data.expires_in;

  await updateAccessToken(userAuth.platformUserId, Platform.YOUTUBE_MUSIC, newAccessToken, newExpiresIn);

  console.log("🔄  Successfully refreshed YouTube access token.");
  return newAccessToken;
};

module.exports = {youtubeLoginService, youtubeCallbackService, refreshYouTubeToken};
