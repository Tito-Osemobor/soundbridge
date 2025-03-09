require('dotenv').config();
const { prisma, saveUserAuth, findUserByPlatformUserId, updateAccessToken } = require('../../services/db');
const querystring = require('querystring');
const { SPOTIFY_AUTH_URL, SPOTIFY_TOKEN_URL, SPOTIFY_SCOPES, SPOTIFY_API_BASE_URL } = require('../../config/spotifyConfig');
const { APIError, UnauthorizedError } = require("../../utils/error");

const spotifyLoginService = () => {
  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  return `${SPOTIFY_AUTH_URL}?${queryParams}`;
};

const spotifyCallbackService = async (code, existingUserId = null) => {
  if (!code) throw new APIError("Authorization code missing", 400);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();

  if (data.error) {
    console.log("❌  Error in YouTube token exchange:", data.error_description);
    throw new APIError(data.error_description || 'Failed to authenticate with Spotify', 400);
  }

  const { access_token, refresh_token, expires_in } = data;

  // Fetch the user's Spotify profile
  const userProfileResponse = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {  // 🔹 Fixed incorrect API URL
    headers: { Authorization: `Bearer ${access_token}` }
  });

  const userProfile = await userProfileResponse.json();
  if (!userProfile.id) {
    throw new APIError("Failed to fetch user profile from Spotify", 400);
  }

  const platformUserId = userProfile.id; // Spotify user ID

  // Check if the user already exists in our database
  let userId = existingUserId;
  let userAuth = await findUserByPlatformUserId('spotify', platformUserId);


  if (!userAuth) {
    if (!userId) {
      console.log("🔹 New user detected. Creating new account...");
      const newUser = await prisma.user.create({ data: {} });
      userId = newUser.userId;
    }
    await saveUserAuth(userId, 'spotify', platformUserId, access_token, refresh_token, expires_in);
  } else {
    userId = userAuth.userId;
    await prisma.userAuth.update({
      where: { id: userAuth.id },
      data: { accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in }
    });
  }

  console.log(`🔑 Spotify user ${userId} authenticated`);
  return userId;
};

const refreshSpotifyToken = async (userAuth, platformUserId) => {
  if (!userAuth || !userAuth.refreshToken) {
    throw new UnauthorizedError(`No refresh token found for user ${platformUserId}`);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: userAuth.refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();
  if (data.error) {
    throw new APIError(`Spotify Token Refresh Error: ${data.error}`, 500);
  }

  const newAccessToken = data.access_token;
  const newExpiresIn = data.expires_in;

  await updateAccessToken(platformUserId, 'spotify', newAccessToken, newExpiresIn);

  console.log("🔄  Successfully refreshed Spotify access token.");
  return newAccessToken;
};

module.exports = { spotifyLoginService, spotifyCallbackService, refreshSpotifyToken };
