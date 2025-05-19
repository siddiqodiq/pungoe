/*
  Warnings:

  - You are about to drop the column `isArchived` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `tokensUsed` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "isArchived";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "tokensUsed";
