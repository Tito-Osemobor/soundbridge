import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {prisma} from "./db.js";
import {JWT_SECRET, NODE_ENV} from "../config/applicationConfig.js";

export const generateToken = (userId, expiresIn = "7d") => {
  return jwt.sign(
    {userId},
    JWT_SECRET,
    {expiresIn: expiresIn}
)};

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "Strict",
  });
};

export const registerUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {email, password: hashedPassword},
    select: { // ✅ Exclude password from response
      userId: true,
      email: true,
      createdAt: true,
      userAuths: {
        select: {
          platformId: true,
          platformUserId: true,
          updatedAt: true
        }
      }
    }
  });
};

export const verifyUserCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {email},
    select: { // ✅ Exclude password from response
      userId: true,
      email: true,
      createdAt: true,
      password: true, // We still need to retrieve this to compare it
      userAuths: {
        select: {
          platformId: true,
          platformUserId: true,
          updatedAt: true
        }
      }
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null
  }

  // ✅ Remove password before returning user object
  const {password: _, ...userWithoutPassword} = user;
  return formatUserProfile(userWithoutPassword.userId, userWithoutPassword.email, userWithoutPassword.userAuths);
};

export const fetchUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {userId},
    select: {
      email: true,
      userAuths: {
        select: {
          platformId: true,
          platformUserId: true,
          createdAt: true
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

const formatUserProfile = (userId, email, userAuths) => {
  return {
    userId,
    email,
    platformsConnected: userAuths.map(auth => ({
      id: auth.platformId,
      platformUserId: auth.platformUserId,
      connectedAt: auth.createdAt
    })),
  };
};
