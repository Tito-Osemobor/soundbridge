const { getValidAccessToken } = require('./auth/authService');
const { SPOTIFY_API_BASE_URL } = require("../config/spotifyConfig");
const { BadRequestError, UnauthorizedError, APIError } = require("../utils/error");

const fetchUserPlaylists = async (platformUserId) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in fetchUserPlaylists");
  }

  const accessToken = await getValidAccessToken('spotify', platformUserId);
  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/playlists`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new APIError(`Spotify API error: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  return data.items;
};

module.exports = { fetchUserPlaylists };
