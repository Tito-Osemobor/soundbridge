DROP TABLE IF EXISTS "UserAuth" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "Platform" CASCADE;
CREATE TYPE "Platform" AS ENUM ('SPOTIFY', 'YOUTUBE_MUSIC', 'APPLE_MUSIC');
CREATE TABLE "Connection" (
  "platform" "Platform" NOT NULL,
  "platformUserId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Connection_pkey" PRIMARY KEY ("platform")
);
CREATE TABLE "Transfer" (
  "id" TEXT NOT NULL,
  "source" "Platform" NOT NULL,
  "destination" "Platform" NOT NULL,
  "sourcePlaylistId" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "destinationPlaylistId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'matching',
  "stage" TEXT NOT NULL DEFAULT 'matching',
  "items" JSONB NOT NULL DEFAULT '[]',
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Transfer_status_updatedAt_idx" ON "Transfer"("status", "updatedAt");
