/*
  Warnings:

  - You are about to drop the column `provider` on the `Session` table. All the data in the column will be lost.
  - Added the required column `platform` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `platform` on the `UserAuth` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('SPOTIFY', 'APPLE_MUSIC', 'YOUTUBE_MUSIC');

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "provider",
ADD COLUMN     "platform" "Platform" NOT NULL;

-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "platform",
ADD COLUMN     "platform" "Platform" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_platformUserId_platform_key" ON "UserAuth"("platformUserId", "platform");
