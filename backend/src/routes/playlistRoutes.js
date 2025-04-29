import express from 'express';
import authenticate from "../middleware/authMiddleware.js";
import {getPlaylists} from "../controllers/playlistController.js";

const router = express.Router();

router.get('/', authenticate, getPlaylists);
// router.get('/playlists/tracks', authenticate, getPlaylistTracks);

export default router;
