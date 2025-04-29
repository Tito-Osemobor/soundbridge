import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {handlePlatformCallback, handlePlatformConnect, handlePlatformDisconnect} from '../controllers/oauthController.js';

const router = express.Router();

router.post('/connect', authenticate, handlePlatformConnect);
router.get('/callback/:platformId', handlePlatformCallback);
router.post('/disconnect', authenticate, handlePlatformDisconnect);

export default router;
