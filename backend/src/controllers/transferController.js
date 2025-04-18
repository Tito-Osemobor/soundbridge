import {transferPlaylistService} from "../services/transferService.js";

export const transferPlaylist = async (req, res, next) => {
  try {
    const {spotifyUserId, youtubeUserId, playlistId, playlistName} = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    if (!spotifyUserId || !youtubeUserId || !playlistId) {
      return res.status(400).json({success: false, message: "Missing required parameters."});
    }

    const result = await transferPlaylistService(userId, spotifyUserId, youtubeUserId, playlistId, playlistName);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
