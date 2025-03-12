const express = require('express');
const {appleCallback} = require("../../controllers/auth/appleAuthController");

const router = express.Router();


router.get('/apple/callback', appleCallback);

module.exports = router;
