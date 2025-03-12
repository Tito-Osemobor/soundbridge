const express = require("express");
const {transferPlaylist} = require("../controllers/transferController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/playlist", authenticate, transferPlaylist);

module.exports = router;
