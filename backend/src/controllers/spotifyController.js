const {fetchUserPlaylists, fetchSpotifyPlaylistTracks} = require("../services/spotifyService");
const {BadRequestError} = require("../utils/error");

const getUserPlaylists = async (req, res, next) => {
  try {
    const {platformUserId} = req.query;

    if (!platformUserId) {
      return next(new BadRequestError("platformUserId is required"));
    }

    const playlists = await fetchUserPlaylists(platformUserId);
    if (!playlists) {
      return next(new BadRequestError("Failed to retrieve playlists"));
    }

    res.json({success: true, playlists});
  } catch (error) {
    next(error); // ✅  Forward the error to Express middleware
  }
};

const getPlaylistTracks = async (req, res, next) => {
  try {
    const {platformUserId, playlistId} = req.query;

    if (!platformUserId || !playlistId) {
      return next(new BadRequestError("platformUserId and playlistId are required"));
    }

    const tracks = await fetchSpotifyPlaylistTracks(platformUserId, playlistId);
    if (!tracks) {
      return next(new BadRequestError("Failed to retrieve playlist tracks"));
    }

    res.json({success: true, tracks});
  } catch (error) {
    next(error);
  }
};

module.exports = {getUserPlaylists, getPlaylistTracks};
