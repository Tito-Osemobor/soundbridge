/*
  Warnings:

  - A unique constraint covering the columns `[userId,platformUserId,platform]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserAuth_platformUserId_platform_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_platformUserId_platform_key" ON "UserAuth"("userId", "platformUserId", "platform");
