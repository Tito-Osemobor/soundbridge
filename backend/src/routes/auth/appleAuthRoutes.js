const express = require('express');
const {appleLogin, appleCallback} = require("../../controllers/auth/appleAuthController");

const router = express.Router();

// 🔹 Apple Music Authentication (Placeholder for now)
router.get('/apple/login', appleLogin);
router.get('/apple/callback', appleCallback);

module.exports = router;
