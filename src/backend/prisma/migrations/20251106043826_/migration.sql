/*
  Warnings:

  - You are about to drop the column `isGlobalGroup` on the `ChatConversation` table. All the data in the column will be lost.
  - You are about to drop the column `reactionCount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `CommunityComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunityRepost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CommunityComment" DROP CONSTRAINT "CommunityComment_communityPostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityComment" DROP CONSTRAINT "CommunityComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityComment" DROP CONSTRAINT "CommunityComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityPost" DROP CONSTRAINT "CommunityPost_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityPost" DROP CONSTRAINT "CommunityPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityReaction" DROP CONSTRAINT "CommunityReaction_communityPostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityReaction" DROP CONSTRAINT "CommunityReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityRepost" DROP CONSTRAINT "CommunityRepost_communityPostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityRepost" DROP CONSTRAINT "CommunityRepost_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reaction" DROP CONSTRAINT "Reaction_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- AlterTable
ALTER TABLE "public"."ChatConversation" DROP COLUMN "isGlobalGroup";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "reactionCount";

-- DropTable
DROP TABLE "public"."CommunityComment";

-- DropTable
DROP TABLE "public"."CommunityPost";

-- DropTable
DROP TABLE "public"."CommunityReaction";

-- DropTable
DROP TABLE "public"."CommunityRepost";

-- DropTable
DROP TABLE "public"."Reaction";

-- DropEnum
DROP TYPE "public"."PostType";
