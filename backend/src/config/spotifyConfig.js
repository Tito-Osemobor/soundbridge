import {getRequiredEnv} from "../utils/config.js";

export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

export const SPOTIFY_SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

export const SPOTIFY_CLIENT_ID = getRequiredEnv("SPOTIFY_CLIENT_ID");
export const SPOTIFY_CLIENT_SECRET = getRequiredEnv("SPOTIFY_CLIENT_SECRET");
export const SPOTIFY_REDIRECT_URI = getRequiredEnv("SPOTIFY_REDIRECT_URI");
