const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authMiddleware');
const { handlePlatformConnect, handlePlatformCallback } = require('../../controllers/auth/connectController');

router.post('/', authenticate, handlePlatformConnect);
router.get('/callback/:platformId', handlePlatformCallback);

module.exports = router;
