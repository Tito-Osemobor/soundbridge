import {
  addToYouTubePlaylist,
  createYouTubePlaylist,
  searchYouTubeMusic
} from "../services/platforms/youtubeMusic/youtubeService.js";
import {BadRequestError} from "../utils/error.js";

export const searchTrackOnYouTube = async (req, res, next) => {
  try {
    const {platformUserId, query} = req.query;
    const userId = req.user?.userId;

    if (!platformUserId || !query) {
      return res.status(400).json({success: false, message: "Missing parameters"});
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const videoId = await searchYouTubeMusic(userId, platformUserId, query);
    res.json({success: true, videoId});
  } catch (error) {
    next(error);
  }
};

export const createPlaylistOnYouTube = async (req, res, next) => {
  try {
    const {platformUserId, playlistName} = req.body;
    const userId = req.user?.userId;

    if (!platformUserId || !playlistName) {
      return res.status(400).json({success: false, message: "Missing parameters"});
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const playlistId = await createYouTubePlaylist(userId, platformUserId, playlistName);
    res.json({success: true, playlistId});
  } catch (error) {
    next(error);
  }
};

export const addTracksToYouTubePlaylist = async (req, res, next) => {
  try {
    const {platformUserId, playlistId, trackIds} = req.body;
    const userId = req.user?.userId;

    if (!platformUserId || !playlistId || !trackIds || !Array.isArray(trackIds)) {
      return next(new BadRequestError("platformUserId, playlistId, and trackIds (array) are required"));
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const result = await addToYouTubePlaylist(userId, platformUserId, playlistId, trackIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
