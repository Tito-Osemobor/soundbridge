import express from 'express';
import authenticate from '../../middleware/authMiddleware.js';
import {handlePlatformCallback, handlePlatformConnect} from '../../controllers/auth/oauthController.js';

const router = express.Router();

router.post('/connect', authenticate, handlePlatformConnect);
router.get('/callback/:platformId', handlePlatformCallback);

export default router;
