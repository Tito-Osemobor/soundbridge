import {fetchSpotifyPlaylistTracks, fetchUserPlaylists} from "../services/platforms/spotify/spotifyService.js";
import {BadRequestError} from "../utils/error.js";

export const getUserPlaylists = async (req, res, next) => {
  try {
    const {platformUserId} = req.query;

    const userId = req.user?.userId;

    if (!platformUserId) {
      return res.status(400).json({success: false, message: "Missing platform parameter"});
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const playlists = await fetchUserPlaylists(userId, platformUserId);
    if (!playlists) {
      return next(new BadRequestError("Failed to retrieve playlists"));
    }

    res.json({success: true, playlists});
  } catch (error) {
    next(error);
  }
};

export const getPlaylistTracks = async (req, res, next) => {
  try {
    const {platformUserId, playlistId} = req.query;

    const userId = req.user?.userId;

    if (!platformUserId) {
      return res.status(400).json({success: false, message: "Missing platform parameter"});
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const tracks = await fetchSpotifyPlaylistTracks(userId, platformUserId, playlistId);
    if (!tracks) {
      return next(new BadRequestError("Failed to retrieve playlist tracks"));
    }

    res.json({success: true, tracks});
  } catch (error) {
    next(error);
  }
};
