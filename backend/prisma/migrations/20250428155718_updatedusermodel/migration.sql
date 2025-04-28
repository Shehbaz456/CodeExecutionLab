/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "coverImagePublicId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "name" SET NOT NULL;
