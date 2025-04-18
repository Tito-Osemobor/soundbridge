import {getRequiredEnv} from "../utils/config.js";

export const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth';
export const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

export const YOUTUBE_CLIENT_ID = getRequiredEnv("YOUTUBE_CLIENT_ID");
export const YOUTUBE_CLIENT_SECRET = getRequiredEnv("YOUTUBE_CLIENT_SECRET");
export const YOUTUBE_REDIRECT_URI = getRequiredEnv("YOUTUBE_REDIRECT_URI");
