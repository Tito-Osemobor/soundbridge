const {SPOTIFY_API_BASE_URL} = require("../config/spotifyConfig");
const {BadRequestError, UnauthorizedError, APIError} = require("../utils/error");
const {Platform} = require("@prisma/client");
const {getValidAccessToken} = require("./auth/authService");

const fetchUserPlaylists = async (platformUserId) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in fetchUserPlaylists");
  }

  const accessToken = await getValidAccessToken(Platform.SPOTIFY, platformUserId);
  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/playlists`, {
    headers: {Authorization: `Bearer ${accessToken}`}
  });

  if (!response.ok) {
    throw new APIError(`Spotify API error: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  return data.items.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.tracks.total
  }));
};

const fetchSpotifyPlaylistTracks = async (platformUserId, playlistId) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in fetchSpotifyPlaylistTracks");
  }

  const accessToken = await getValidAccessToken(Platform.SPOTIFY, platformUserId);
  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  const response = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
    headers: {Authorization: `Bearer ${accessToken}`}
  });

  if (!response.ok) throw new APIError("Failed to fetch Spotify playlist tracks");

  const data = await response.json();
  return data.items.map(item => ({
    title: item.track.name,
    artist: item.track.artists.map(artist => artist.name).join(", "),
    album: item.track.album.name
  }));
};

module.exports = {fetchUserPlaylists, fetchSpotifyPlaylistTracks};
