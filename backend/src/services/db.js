import {PrismaClient} from '@prisma/client';

export const prisma = new PrismaClient();

export const saveUserAuth = async (userId, platformId, platformUserId, accessToken, refreshToken, expiresIn) => {
  try {
    await prisma.userAuth.upsert({
      where: {
        userId_platformUserId_platformId: {
          userId,
          platformUserId,
          platformId
        }
      },
      update: {
        accessToken,
        refreshToken,
        expiresIn
      },
      create: {
        userId,
        platformId,
        platformUserId,
        accessToken,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error(`❌  Error saving user tokens for ${platformId}:`, error);
  }
};

export const findUserByPlatformUserId = async (userId, platformId, platformUserId) => {
  return prisma.userAuth.findUnique({
    where: {
      userId_platformUserId_platformId: {
        userId,
        platformUserId,
        platformId
      }
    }
  });
};

export const updateAccessToken = async (userId, platformUserId, platformId, newAccessToken, newExpiresIn) => {
  try {
    await prisma.userAuth.update({
      where: {
        userId_platformUserId_platformId: {
          userId,
          platformUserId,
          platformId
        }
      },
      data: {
        accessToken: newAccessToken,
        expiresIn: newExpiresIn,
        updatedAt: new Date()
      }
    });
    console.log(`✅  Access token updated for ${platformId} user ${platformUserId}`);
  } catch (error) {
    console.error(`❌  Error updating access token for ${platformUserId}:`, error);
  }
};

export const findPlatformUserId = async (userId, platformId) => {
  const userAuth = await prisma.userAuth.findFirst({
    where: {
      userId,
      platformId
    },
    select: {
      platformUserId: true
    }
  });

  return userAuth?.platformUserId;
};
