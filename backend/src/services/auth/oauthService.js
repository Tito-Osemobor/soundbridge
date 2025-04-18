import {APIError, NotFoundError} from "../../utils/error.js";
import {findUserByPlatformUserId, updateAccessToken} from "../db.js";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../../config/applicationConfig.js";

export const generateOAuthStateToken = ({ userId, platform }, expiresIn = "10m") => {
  return jwt.sign(
    { userId, platform },
    JWT_SECRET,
    { expiresIn }
  );
};

export const buildOAuthUrl = ({authUrl, clientId, redirectUri, scope, state, extraParams = {}}) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    ...extraParams,
  });

  return `${authUrl}?${params.toString()}`;
};

export const exchangeCodeForToken = async ({tokenUrl, code, clientId, clientSecret, redirectUri}) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  });

  const data = await response.json();
  if (data.error) throw new APIError(data.error_description || "Token exchange failed");

  return data;
};

export const getValidAccessToken = async ({
  userId,
  platform,
  platformUserId,
  refreshConfig,
}) => {
  const userAuth = await findUserByPlatformUserId(userId, platform, platformUserId);
  if (!userAuth) throw new NotFoundError("User not found");

  const tokenExpirationTime = new Date(userAuth.updatedAt).getTime() + userAuth.expiresIn * 1000;
  const currentTime = Date.now();

  if (currentTime >= tokenExpirationTime) {
    console.log(`🔄 Access token expired for ${platformUserId} on ${platform}, refreshing...`);

    console.log(`refreshConfigClientId, ${ refreshConfig.clientId }`)
    return await refreshAccessToken({
      userId,
      platform,
      platformUserId,
      refreshToken: userAuth.refreshToken,
      clientId: refreshConfig.clientId,
      clientSecret: refreshConfig.clientSecret,
      tokenUrl: refreshConfig.tokenUrl,
    });
  }

  console.log(`✅ Using existing access token for ${platformUserId} on ${platform}`);
  return userAuth.accessToken;
};

export const refreshAccessToken = async ({
  userId,
  platform,
  platformUserId,
  refreshToken,
  clientId,
  clientSecret,
  tokenUrl,
}) => {
  if (!refreshToken) {
    throw new APIError(`No refresh token found for user ${platformUserId}`, 400);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body,
  });

  const data = await response.json();
  if (data.error) {
    throw new APIError(`${platform} Token Refresh Error: ${data.error}`, 500);
  }

  const { access_token: newAccessToken, expires_in: newExpiresIn } = data;

  await updateAccessToken(userId, platformUserId, platform, newAccessToken, newExpiresIn);
  console.log(`🔄  Successfully refreshed ${platform} access token.`);

  return newAccessToken;
};
