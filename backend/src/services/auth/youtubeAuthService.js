require('dotenv').config();
const {prisma, saveUserAuth, findUserByPlatformUserId, updateAccessToken} = require('../../services/db');
const {APIError} = require("../../utils/error");
const {
  YOUTUBE_AUTH_URL,
  YOUTUBE_TOKEN_URL,
  YOUTUBE_API_BASE_URL,
  YOUTUBE_SCOPE
} = require('../../config/youtubeConfig');

const youtubeLoginService = () => {
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.YOUTUBE_CLIENT_ID,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
    scope: YOUTUBE_SCOPE,
    access_type: 'offline',
  });

  return `${YOUTUBE_AUTH_URL}?${queryParams}`;
};

const youtubeCallbackService = async (code, exisitingUserId = null) => {
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

  // Check if user already exists
  let userId = exisitingUserId;
  let userAuth = await findUserByPlatformUserId('youtube_music', platformUserId);

  if (!userAuth) {
    if (!userId) {
      console.log("🔹  New user detected. Creating new account...");
      // Create new user first
      const newUser = await prisma.user.create({data: {}});
      userId = newUser.userId;
    }
    // Save authentication details
    await saveUserAuth(userId, 'youtube_music', platformUserId, access_token, refresh_token, expires_in);
  } else {
    userId = userAuth.userId;
    await prisma.userAuth.update({
      where: {id: userAuth.id},
      data: {accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in}
    });
  }

  console.log(`🔑  YouTube user ${userId} authenticated`);
  return {userId, accessToken: access_token};
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

  const response = await fetch(process.env.YOUTUBE_TOKEN_URL, {
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

  await updateAccessToken(platformUserId, 'youtube_music', newAccessToken, newExpiresIn);

  console.log("🔄  Successfully refreshed YouTube access token.");
  return newAccessToken;
};

module.exports = {youtubeLoginService, youtubeCallbackService, refreshYouTubeToken};
