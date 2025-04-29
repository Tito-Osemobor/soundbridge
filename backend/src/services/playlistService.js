import {Platform} from "@prisma/client";
import {fetchSpotifyPlaylists} from "./platforms/spotify/spotifyService.js";
import {findPlatformUserId} from "./db.js";
import {BadRequestError, NotFoundError} from "../utils/error.js";

export const getPlaylistsForPlatform = async ({userId, platformId}) => {
  const platformUserId = await findPlatformUserId(userId, platformId);
  if (!platformUserId) {
    throw new NotFoundError(`No connected platformUserId for ${platformId}`);
  }

  switch (platformId) {
    case Platform.SPOTIFY:
      return fetchSpotifyPlaylists(userId, platformUserId);
    // case Platform.YOUTUBE_MUSIC:
    //   return fetchYouTubePlaylists(userId, platformUserId);
    default:
      throw new BadRequestError(`Unsupported platform: ${platformId}`);
  }
};
