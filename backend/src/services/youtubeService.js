const {getValidAccessToken} = require("./auth/authService");
const {YOUTUBE_API_BASE_URL} = require("../config/youtubeConfig");
const {BadRequestError, UnauthorizedError, APIError} = require("../utils/error");
const {Platform} = require("@prisma/client");

const createYouTubePlaylist = async (platformUserId, playlistName) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in createYouTubePlaylist");
  }

  const accessToken = await getValidAccessToken(Platform.YOUTUBE_MUSIC, platformUserId);
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

const searchYouTubeMusic = async (platformUserId, query) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in searchYouTubeMusic");
  }

  const accessToken = await getValidAccessToken(Platform.YOUTUBE_MUSIC, platformUserId);
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

const addToYouTubePlaylist = async (platformUserId, playlistId, trackIds) => {
  if (!platformUserId) {
    throw new BadRequestError("platformUserId is missing in addToYouTubePlaylist");
  }

  const accessToken = await getValidAccessToken(Platform.YOUTUBE_MUSIC, platformUserId);
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

module.exports = {searchYouTubeMusic, createYouTubePlaylist, addToYouTubePlaylist};
