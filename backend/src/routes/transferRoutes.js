import express from "express";
import {transferPlaylist} from "../controllers/transferController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/playlist", authenticate, transferPlaylist);

export default router;
