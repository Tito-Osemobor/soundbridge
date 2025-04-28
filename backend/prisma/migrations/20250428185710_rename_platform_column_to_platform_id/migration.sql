-- Drop old index
DROP INDEX "UserAuth_userId_platformUserId_platform_key";

-- Rename the column
ALTER TABLE "UserAuth"
  RENAME COLUMN "platform" TO "platformId";

-- Create new index
CREATE UNIQUE INDEX "UserAuth_userId_platformUserId_platformId_key"
  ON "UserAuth"("userId", "platformUserId", "platformId");
