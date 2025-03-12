const express = require('express');
const {getUserPlaylists, getPlaylistTracks} = require("../controllers/spotifyController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/playlists', authenticate, getUserPlaylists);
router.get("/playlists/tracks", authenticate, getPlaylistTracks);


module.exports = router;
