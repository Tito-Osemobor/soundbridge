const express = require('express');
const {youtubeLogin, youtubeCallback} = require("../../controllers/auth/youtubeAuthController");

const router = express.Router();

router.get('/login', youtubeLogin);
router.get('/callback', youtubeCallback);

module.exports = router;
