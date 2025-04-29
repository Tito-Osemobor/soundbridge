import {Platform} from "@prisma/client";
import {BadRequestError, NotFoundError} from "../utils/error.js";
import {findPlatformUserId} from "./db.js";
import {fetchSpotifyPlaylists} from "./platforms/spotify/spotifyService.js";
import {fetchYoutubeMusicPlaylists} from "./platforms/youtubeMusic/youtubeService.js";

export const getPlaylistsForPlatform = async ({userId, platformId}) => {
  const platformUserId = await findPlatformUserId(userId, platformId);
  if (!platformUserId) {
    throw new NotFoundError(`No connected platformUserId for ${platformId}`);
  }

  switch (platformId) {
    case Platform.SPOTIFY:
      return fetchSpotifyPlaylists(userId, platformUserId);
    case Platform.YOUTUBE_MUSIC:
      return fetchYoutubeMusicPlaylists(userId, platformUserId);
    default:
      throw new BadRequestError(`Unsupported platform: ${platformId}`);
  }
};
