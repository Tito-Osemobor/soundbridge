const express = require('express');
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

// 🔹 Protected Route: Get logged-in user session
router.get('/me', authenticate, (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
  }

  res.json({ success: true, userId: req.user.userId });
});

module.exports = router;
