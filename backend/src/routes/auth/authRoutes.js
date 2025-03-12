const express = require('express');
const authenticate = require("../../middleware/authMiddleware");
const {logout, getUserProfile, register, login} = require("../../controllers/auth/authController");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getUserProfile);

module.exports = router;
