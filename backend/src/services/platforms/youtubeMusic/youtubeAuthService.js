import 'dotenv/config';
import {saveUserAuth} from '../../db.js';
import {APIError} from '../../../utils/error.js';
import {YOUTUBE_AUTH_URL, YOUTUBE_SCOPE, YOUTUBE_TOKEN_URL} from '../../../config/youtubeConfig.js';
import {Platform} from '@prisma/client';
import {buildOAuthUrl, exchangeCodeForToken} from '../../auth/oauthService.js';
import {fetchYoutubeMusicProfile} from './youtubeService.js';

export const getYoutubeMusicOAuthUrl = (state) => buildOAuthUrl({
  authUrl: YOUTUBE_AUTH_URL,
  clientId: process.env.YOUTUBE_CLIENT_ID,
  redirectUri: process.env.YOUTUBE_REDIRECT_URI,
  scope: YOUTUBE_SCOPE,

  // YouTube Music requires offline access for refresh tokens
  access_type: 'offline',
  prompt: 'consent',
  state,
});

export const handleYoutubeMusicOAuthCallback = async (code, userId) => {
  if (!code) throw new APIError("Authorization code missing", 400);

  const {access_token, refresh_token, expires_in} = await exchangeCodeForToken({
    tokenUrl: YOUTUBE_TOKEN_URL,
    code,
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
  });

  // Fetch the user's YouTube profile
  const profile = await fetchYoutubeMusicProfile(access_token);

  return saveUserAuth(userId, Platform.YOUTUBE_MUSIC, profile.id, access_token, refresh_token, expires_in)
};
