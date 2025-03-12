const express = require('express');
const {youtubeCallback, youtubeConnect} = require("../../controllers/auth/youtubeAuthController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.get('/connect', authenticate, youtubeConnect);
router.get('/callback', youtubeCallback);

module.exports = router;
