const express = require('express');
const {getUserPlaylists} = require("../controllers/spotifyController");

const router = express.Router();

router.get('/playlists', getUserPlaylists);

module.exports = router;
