/*
  Warnings:

  - You are about to drop the column `coverImage` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "coverImage",
ADD COLUMN     "coverPic" TEXT;

-- DropTable
DROP TABLE "images";

-- CreateTable
CREATE TABLE "picture" (
    "id" TEXT NOT NULL,
    "blob" BYTEA NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "picture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "picture_url_key" ON "picture"("url");

-- CreateIndex
CREATE INDEX "picture_url_idx" ON "picture"("url");
