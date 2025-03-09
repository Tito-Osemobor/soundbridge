const express = require("express");
const {spotifyLogin, spotifyCallback} = require("../../controllers/auth/spotifyAuthController");

const router = express.Router();

// 🔹 Spotify Authentication
router.get('/login', spotifyLogin);
router.get('/callback', spotifyCallback);

module.exports = router;
