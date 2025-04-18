import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const saveUserAuth = async (userId, platform, platformUserId, accessToken, refreshToken, expiresIn) => {
  try {
    await prisma.userAuth.upsert({
      where: {
        userId_platformUserId_platform: {
          userId,
          platformUserId,
          platform
        }
      },
      update: {
        accessToken,
        refreshToken,
        expiresIn
      },
      create: {
        userId,
        platform,
        platformUserId,
        accessToken,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error(`❌  Error saving user tokens for ${platform}:`, error);
  }
};

const findUserByPlatformUserId = async (userId, platform, platformUserId) => {
  return prisma.userAuth.findUnique({
    where: {
      userId_platformUserId_platform: {
        userId,
        platformUserId,
        platform
      }
    }
  });
};

const updateAccessToken = async (userId, platformUserId, platform, newAccessToken, newExpiresIn) => {
  try {
    await prisma.userAuth.update({
      where: {
        userId_platformUserId_platform: {
          userId,
          platformUserId,
          platform
        }
      },
      data: {
        accessToken: newAccessToken,
        expiresIn: newExpiresIn,
        updatedAt: new Date()
      }
    });
    console.log(`✅  Access token updated for ${platform} user ${platformUserId}`);
  } catch (error) {
    console.error(`❌  Error updating access token for ${platformUserId}:`, error);
  }
};


export {prisma, saveUserAuth, findUserByPlatformUserId, updateAccessToken};
