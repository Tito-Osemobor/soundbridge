import 'dotenv/config';
import {saveUserAuth} from '../../db.js';
import {SPOTIFY_AUTH_URL, SPOTIFY_SCOPES, SPOTIFY_TOKEN_URL} from '../../../config/spotifyConfig.js';
import {APIError} from '../../../utils/error.js';
import {Platform} from '@prisma/client';
import {buildOAuthUrl, exchangeCodeForToken} from '../../auth/oauthService.js';
import {fetchSpotifyProfile} from './spotifyService.js';

export const getSpotifyOAuthUrl = (state) => buildOAuthUrl({
  authUrl: SPOTIFY_AUTH_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  scope: SPOTIFY_SCOPES,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  state,
});

export const handleSpotifyOAuthCallback = async (code, userId) => {
  if (!code) throw new APIError("Authorization code missing", 400);

  const {access_token, refresh_token, expires_in} = await exchangeCodeForToken({
    tokenUrl: SPOTIFY_TOKEN_URL,
    code,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  // Fetch the user's Spotify profile
  const profile = await fetchSpotifyProfile(access_token);

  return saveUserAuth(userId, Platform.SPOTIFY, profile.id, access_token, refresh_token, expires_in);
};
