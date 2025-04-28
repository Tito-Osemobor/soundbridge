import 'dotenv/config';
import {Platform} from '@prisma/client';

import {
  YOUTUBE_API_BASE_URL,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_TOKEN_URL
} from '../../../config/youtubeConfig.js';
import {APIError, BadRequestError, UnauthorizedError} from '../../../utils/error.js';

import {getValidAccessToken} from '../../auth/oauthService.js';

const getYoutubeMusicAccessToken = async (userId, platformUserId) => {
  return await getValidAccessToken({
    userId,
    platformId: Platform.YOUTUBE_MUSIC,
    platformUserId,
    refreshConfig: {
      clientId: YOUTUBE_CLIENT_ID,
      clientSecret: YOUTUBE_CLIENT_SECRET,
      tokenUrl: YOUTUBE_TOKEN_URL
    }
  });
}

export const fetchYoutubeMusicProfile = async (accessToken) => {
  const userProfileResponse = await fetch(`${YOUTUBE_API_BASE_URL}/channels?part=id&mine=true`, {
    headers: {Authorization: `Bearer ${accessToken}`}
  });

  const userProfile = await userProfileResponse.json();
  if (!userProfile.items || userProfile.items.length === 0) {
    throw new APIError("Failed to fetch user profile from YouTube", 400);
  }
  return userProfile.items[0];
}

export const createYouTubePlaylist = async (userId, platformUserId, playlistName) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in createYouTubePlaylist");
  }

  const accessToken = await getYoutubeMusicAccessToken(userId, platformUserId);

  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  const response = await fetch(`${YOUTUBE_API_BASE_URL}/playlists?part=snippet,status`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      snippet: {
        title: playlistName,
        description: "Playlist transferred from Spotify via SoundBridge",
      },
      status: {privacyStatus: "public"}
    })
  });

  if (!response.ok) throw new APIError("Failed to create YouTube playlist");

  const data = await response.json();
  return data.id;
};

export const searchYouTubeMusic = async (userId, platformUserId, query) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in searchYouTubeMusic");
  }

  const accessToken = await getYoutubeMusicAccessToken(userId, platformUserId);

  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  const response = await fetch(
    `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}`,
    {
      headers: {Authorization: `Bearer ${accessToken}`}
    }
  );

  if (!response.ok) throw new APIError("Failed to search YouTube Music");

  const data = await response.json();
  return data.items.length > 0 ? data.items[0].id.videoId : null;
};

export const addToYouTubePlaylist = async (userId, platformUserId, playlistId, trackIds) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in addToYouTubePlaylist");
  }

  const accessToken = await getYoutubeMusicAccessToken(userId, platformUserId);
  if (!accessToken) {
    throw new UnauthorizedError("Failed to retrieve a valid access token");
  }

  for (const trackId of trackIds) {
    const response = await fetch(`${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        snippet: {
          playlistId: playlistId,
          resourceId: {kind: "youtube#video", videoId: trackId}
        }
      })
    });

    if (!response.ok) throw new APIError(`Failed to add track ${trackId} to playlist`);
  }

  return {success: true, message: "Tracks added successfully"};
};
