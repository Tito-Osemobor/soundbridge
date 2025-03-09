/*
  Warnings:

  - A unique constraint covering the columns `[platformUserId]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[platformUserId,platform]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platformUserId` to the `UserAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "platformUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_platformUserId_key" ON "UserAuth"("platformUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_platformUserId_platform_key" ON "UserAuth"("platformUserId", "platform");
