const {transferPlaylistService} = require("../services/transferService");

const transferPlaylist = async (req, res, next) => {
  try {
    const {spotifyUserId, youtubeUserId, playlistId, playlistName} = req.body;

    if (!spotifyUserId || !youtubeUserId || !playlistId) {
      return res.status(400).json({success: false, message: "Missing required parameters."});
    }

    const result = await transferPlaylistService(spotifyUserId, youtubeUserId, playlistId, playlistName);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {transferPlaylist};
