const { fetchUserPlaylists } = require("../services/spotifyService");
const { BadRequestError } = require("../utils/error");

const getUserPlaylists = async (req, res, next) => {
  try {
    const { platformUserId } = req.query;

    if (!platformUserId) {
      return next(new BadRequestError("platformUserId is required"));
    }

    const playlists = await fetchUserPlaylists(platformUserId);
    if (!playlists) {
      return next(new BadRequestError("Failed to retrieve playlists"));
    }

    res.json({ success: true, playlists });
  } catch (error) {
    next(error); // ✅  Forward the error to Express middleware
  }
};

module.exports = { getUserPlaylists };
