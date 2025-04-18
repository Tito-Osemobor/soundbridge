import {SPOTIFY_API_BASE_URL, SPOTIFY_TOKEN_URL} from '../../../config/spotifyConfig.js';
import {APIError, UnauthorizedError} from '../../../utils/error.js';
import {Platform} from '@prisma/client';
import {getValidAccessToken} from '../../auth/oauthService.js';
import 'dotenv/config';

const getSpotifyAccessToken = async (userId, platformUserId) => {
  return await getValidAccessToken({
    userId,
    platform: Platform.SPOTIFY,
    platformUserId,
    refreshConfig: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      tokenUrl: SPOTIFY_TOKEN_URL
    }
  });
}

export const fetchSpotifyProfile = async (accessToken) => {
  const userProfileResponse = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {  // 🔹 Fixed incorrect API URL
    headers: {Authorization: `Bearer ${accessToken}`}
  });

  const userProfile = await userProfileResponse.json();
  if (!userProfile.id) {
    throw new APIError("Failed to fetch user profile from Spotify", 400);
  }
  return userProfile;
}

export const fetchUserPlaylists = async (userId, platformUserId) => {
  const accessToken = await getSpotifyAccessToken(userId, platformUserId);
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

export const fetchSpotifyPlaylistTracks = async (userId, platformUserId, playlistId) => {
  const accessToken = await getSpotifyAccessToken(userId, platformUserId);
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
