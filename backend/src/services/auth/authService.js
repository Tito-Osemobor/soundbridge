const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {findUserByPlatformUserId, prisma} = require("../db");
const {refreshSpotifyToken} = require("./spotifyAuthService");
const {UnauthorizedError, APIError, BadRequestError} = require("../../utils/error");
const {refreshYouTubeToken} = require("./youtubeAuthService");
const {Platform} = require("@prisma/client");

const generateToken = (userId) => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
};

const registerUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {email, password: hashedPassword},
    select: { // ✅ Exclude password from response
      userId: true,
      email: true,
      createdAt: true,
      userAuths: {
        select: {
          platform: true,
          platformUserId: true,
          updatedAt: true
        }
      }
    }
  });
};

const verifyUserCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {email},
    select: { // ✅ Exclude password from response
      userId: true,
      email: true,
      createdAt: true,
      password: true, // We still need to retrieve this to compare it
      userAuths: {
        select: {
          platform: true,
          platformUserId: true,
          updatedAt: true
        }
      }
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new BadRequestError("Invalid credentials");
  }

  // ✅ Remove password before returning user object
  const {password: _, ...userWithoutPassword} = user;
  return formatUserProfile(userWithoutPassword.userId, userWithoutPassword.email, userWithoutPassword.userAuths);
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "PROD",
    sameSite: "Strict",
  });
};

const setSessionCookie = (res, sessionId) => {
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "PROD",
    sameSite: "Lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });
}

const getValidAccessToken = async (platform, platformUserId) => {
  const userAuth = await findUserByPlatformUserId(platform, platformUserId);
  if (!userAuth) throw new UnauthorizedError('User authentication not found');

  const tokenExpirationTime = new Date(userAuth.updatedAt).getTime() + userAuth.expiresIn * 1000;
  const currentTime = Date.now();

  if (currentTime >= tokenExpirationTime) {
    console.log(`🔄 Access token expired for ${platformUserId} on ${platform}, refreshing...`);

    let newAccessToken = null;

    switch (platform) {
      case Platform.SPOTIFY:
        newAccessToken = await refreshSpotifyToken(userAuth, platformUserId);
        break;
      case Platform.YOUTUBE_MUSIC:
        newAccessToken = await refreshYouTubeToken(userAuth);
        break;
      default:
        throw new APIError(`Unsupported platform: ${platform}`, 400);
    }

    if (!newAccessToken) {
      throw new APIError(`Failed to refresh token for ${platformUserId} on ${platform}`, 500);
    }

    return newAccessToken;
  }

  console.log(`✅  Using existing access token for ${platformUserId} on ${platform}`);
  return userAuth.accessToken;
};

const formatUserProfile = (userId, email, userAuths) => {
  return {
    userId,
    email,
    platformsConnected: userAuths.map(auth => ({
      id: auth.platform,
      platformUserId: auth.platformUserId,
      connectedAt: auth.updatedAt
    })),
  };
};

const fetchUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {userId},
    select: {
      email: true,
      userAuths: {
        select: {
          platform: true,
          platformUserId: true,
          updatedAt: true
        }
      }
    }
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // ✅ Ensure `userAuths` is always an array
  return formatUserProfile(userId, user.email, user.userAuths || []);
};


module.exports = {
  generateToken,
  setAuthCookie,
  setSessionCookie,
  getValidAccessToken,
  fetchUserProfile,
  registerUser,
  verifyUserCredentials,
  formatUserProfile
};
