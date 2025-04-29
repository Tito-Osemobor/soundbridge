import {getPlaylistsForPlatform} from "../services/playlistService.js";

export const getPlaylists = async (req, res, next) => {
  try {
    const platformId  = req.query.platformId;
    const userId = req.user.userId;

    if (!platformId) {
      return res.status(400).json({success: false, message: "Missing platformId parameter"});
    }

    if (!userId) {
      return res.status(401).json({success: false, message: "Unauthorized"});
    }

    const playlists = await getPlaylistsForPlatform({ userId, platformId });
    if (!playlists || playlists.length === 0) {
      return res.status(400).json({success: false, message: "No playlists found"});
    }
    res.json({ success: true, playlists });
  } catch (error) {
    next(error);
  }
};
