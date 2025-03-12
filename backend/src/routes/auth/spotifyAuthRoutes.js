const express = require("express");
const {spotifyCallback, spotifyConnect} = require("../../controllers/auth/spotifyAuthController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();


// 🔹 Connect Spotify Account to User
router.get('/connect', authenticate, spotifyConnect);
router.get('/callback', spotifyCallback);

module.exports = router;
