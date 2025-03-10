const express = require("express");
const {spotifyLogin, spotifyCallback, spotifyConnect} = require("../../controllers/auth/spotifyAuthController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

// 🔹 Spotify Authentication
router.get('/login', spotifyLogin);
router.get('/callback', spotifyCallback);

// 🔹 Connect Spotify Account to User
router.get('/connect', authenticate, spotifyConnect);

module.exports = router;
