const { findUserByPlatformUserId } = require("../db");
const { refreshSpotifyToken } = require("./spotifyAuthService");
const {UnauthorizedError, APIError} = require("../../utils/error");

const getValidAccessToken = async (platform, platformUserId) => {
  const userAuth = await findUserByPlatformUserId(platform, platformUserId);
  if (!userAuth) throw new UnauthorizedError('User authentication not found');

  const tokenExpirationTime = new Date(userAuth.updatedAt).getTime() + userAuth.expiresIn * 1000;
  const currentTime = Date.now();

  if (currentTime >= tokenExpirationTime) {
    console.log(`🔄 Access token expired for ${platformUserId} on ${platform}, refreshing...`);

    let newAccessToken = null;

    switch (platform) {
      case 'spotify':
        newAccessToken = await refreshSpotifyToken(userAuth, platformUserId);
        break;
      default:
        throw new APIError(`Unsupported platform: ${platform}`, 400);
    }

    if (!newAccessToken) {
      throw new APIError(`Failed to refresh token for ${platformUserId} on ${platform}`, 500);
    }

    return newAccessToken;
  }

  console.log(`✅  Using existing access token for ${platformUserId} on ${platform}`);
  return userAuth.accessToken;
};

module.exports = { getValidAccessToken };
