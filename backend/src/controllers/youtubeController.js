const {searchYouTubeMusic, createYouTubePlaylist, addToYouTubePlaylist} = require("../services/youtubeService");
const {BadRequestError} = require("../utils/error");

const searchTrackOnYouTube = async (req, res, next) => {
  try {
    const {platformUserId, query} = req.query;

    if (!platformUserId || !query) {
      return next(new BadRequestError("platformUserId and query are required"));
    }

    const videoId = await searchYouTubeMusic(platformUserId, query);
    res.json({success: true, videoId});
  } catch (error) {
    next(error);
  }
};

module.exports = {searchTrackOnYouTube};
const createPlaylistOnYouTube = async (req, res, next) => {
  try {
    const {platformUserId, playlistName} = req.body;

    if (!platformUserId || !playlistName) {
      return next(new BadRequestError("platformUserId and playlistName are required"));
    }

    const playlistId = await createYouTubePlaylist(platformUserId, playlistName);
    res.json({success: true, playlistId});
  } catch (error) {
    next(error);
  }
};

const addTracksToYouTubePlaylist = async (req, res, next) => {
  try {
    const {platformUserId, playlistId, trackIds} = req.body;

    if (!platformUserId || !playlistId || !trackIds || !Array.isArray(trackIds)) {
      return next(new BadRequestError("platformUserId, playlistId, and trackIds (array) are required"));
    }

    const result = await addToYouTubePlaylist(platformUserId, playlistId, trackIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {searchTrackOnYouTube, createPlaylistOnYouTube, addTracksToYouTubePlaylist};
