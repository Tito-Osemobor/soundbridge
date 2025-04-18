import express from 'express';
import authenticate from "../../middleware/authMiddleware.js";
import {getUserProfile, login, logout, register} from "../../controllers/auth/authController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getUserProfile);

export default router;
