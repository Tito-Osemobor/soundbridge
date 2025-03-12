const express = require("express");
const {
  searchTrackOnYouTube,
  createPlaylistOnYouTube,
  addTracksToYouTubePlaylist
} = require("../controllers/youtubeController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", authenticate, searchTrackOnYouTube);
router.post("/playlist/create", authenticate, createPlaylistOnYouTube);
router.post("/playlist/add-tracks", authenticate, addTracksToYouTubePlaylist);

module.exports = router;
