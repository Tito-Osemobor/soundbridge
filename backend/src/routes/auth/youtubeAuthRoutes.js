const express = require('express');
const {youtubeLogin, youtubeCallback, youtubeConnect} = require("../../controllers/auth/youtubeAuthController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.get('/login', youtubeLogin);
router.get('/callback', youtubeCallback);

router.get('/connect', authenticate, youtubeConnect);

module.exports = router;
