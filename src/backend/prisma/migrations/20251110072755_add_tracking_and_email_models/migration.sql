-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('GENERAL', 'PRODUCT_REVIEW', 'LIFESTYLE', 'TRENDS', 'ADMIN_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "public"."TrackingStatus" AS ENUM ('ORDER_PLACED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED', 'BOUNCED');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "reactionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Reaction" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reactionKind" TEXT NOT NULL DEFAULT 'like',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityPost" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "caption" TEXT NOT NULL,
    "postType" "public"."PostType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "reactionCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "repostCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityComment" (
    "id" SERIAL NOT NULL,
    "communityPostId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityReaction" (
    "id" SERIAL NOT NULL,
    "communityPostId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'like',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityRepost" (
    "id" SERIAL NOT NULL,
    "communityPostId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityRepost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderTracking" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "trackingId" TEXT NOT NULL,
    "currentStatus" "public"."TrackingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackingCheckpoint" (
    "id" SERIAL NOT NULL,
    "trackingId" INTEGER NOT NULL,
    "status" "public"."TrackingStatus" NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" "public"."EmailStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reaction_productId_idx" ON "public"."Reaction"("productId");

-- CreateIndex
CREATE INDEX "Reaction_userId_idx" ON "public"."Reaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_productId_userId_key" ON "public"."Reaction"("productId", "userId");

-- CreateIndex
CREATE INDEX "CommunityPost_userId_idx" ON "public"."CommunityPost"("userId");

-- CreateIndex
CREATE INDEX "CommunityPost_productId_idx" ON "public"."CommunityPost"("productId");

-- CreateIndex
CREATE INDEX "CommunityPost_postType_idx" ON "public"."CommunityPost"("postType");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "public"."CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityComment_communityPostId_idx" ON "public"."CommunityComment"("communityPostId");

-- CreateIndex
CREATE INDEX "CommunityComment_userId_idx" ON "public"."CommunityComment"("userId");

-- CreateIndex
CREATE INDEX "CommunityComment_parentId_idx" ON "public"."CommunityComment"("parentId");

-- CreateIndex
CREATE INDEX "CommunityReaction_communityPostId_idx" ON "public"."CommunityReaction"("communityPostId");

-- CreateIndex
CREATE INDEX "CommunityReaction_userId_idx" ON "public"."CommunityReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityReaction_communityPostId_userId_key" ON "public"."CommunityReaction"("communityPostId", "userId");

-- CreateIndex
CREATE INDEX "CommunityRepost_communityPostId_idx" ON "public"."CommunityRepost"("communityPostId");

-- CreateIndex
CREATE INDEX "CommunityRepost_userId_idx" ON "public"."CommunityRepost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityRepost_communityPostId_userId_key" ON "public"."CommunityRepost"("communityPostId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTracking_orderId_key" ON "public"."OrderTracking"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTracking_trackingId_key" ON "public"."OrderTracking"("trackingId");

-- CreateIndex
CREATE INDEX "OrderTracking_trackingId_idx" ON "public"."OrderTracking"("trackingId");

-- CreateIndex
CREATE INDEX "OrderTracking_currentStatus_idx" ON "public"."OrderTracking"("currentStatus");

-- CreateIndex
CREATE INDEX "TrackingCheckpoint_trackingId_idx" ON "public"."TrackingCheckpoint"("trackingId");

-- CreateIndex
CREATE INDEX "TrackingCheckpoint_status_idx" ON "public"."TrackingCheckpoint"("status");

-- CreateIndex
CREATE INDEX "EmailLog_orderId_idx" ON "public"."EmailLog"("orderId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "public"."EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "public"."EmailLog"("status");

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityPost" ADD CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityPost" ADD CONSTRAINT "CommunityPost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityComment" ADD CONSTRAINT "CommunityComment_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityComment" ADD CONSTRAINT "CommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityComment" ADD CONSTRAINT "CommunityComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."CommunityComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityReaction" ADD CONSTRAINT "CommunityReaction_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityReaction" ADD CONSTRAINT "CommunityReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityRepost" ADD CONSTRAINT "CommunityRepost_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityRepost" ADD CONSTRAINT "CommunityRepost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderTracking" ADD CONSTRAINT "OrderTracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackingCheckpoint" ADD CONSTRAINT "TrackingCheckpoint_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "public"."OrderTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
