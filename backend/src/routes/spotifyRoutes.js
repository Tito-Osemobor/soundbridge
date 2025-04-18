import express from 'express';
import {getPlaylistTracks, getUserPlaylists} from "../controllers/spotifyController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/playlists', authenticate, getUserPlaylists);
router.get("/playlists/tracks", authenticate, getPlaylistTracks);

export default router;
