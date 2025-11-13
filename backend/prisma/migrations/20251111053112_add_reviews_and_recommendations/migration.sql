/*
  Warnings:

  - Made the column `isViewed` on table `ProductRecommendation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isClicked` on table `ProductRecommendation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isPurchased` on table `ProductRecommendation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verifiedPurchase` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `helpfulCount` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notHelpfulCount` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isApproved` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductRecommendation" DROP CONSTRAINT "ProductRecommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBehavior" DROP CONSTRAINT "UserBehavior_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBehavior" DROP CONSTRAINT "UserBehavior_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserReviewHelpfulness" DROP CONSTRAINT "UserReviewHelpfulness_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserReviewHelpfulness" DROP CONSTRAINT "UserReviewHelpfulness_userId_fkey";

-- DropIndex
DROP INDEX "public"."UserReviewHelpfulness_reviewId_userId_idx";

-- AlterTable
ALTER TABLE "public"."ProductRecommendation" ALTER COLUMN "isViewed" SET NOT NULL,
ALTER COLUMN "isClicked" SET NOT NULL,
ALTER COLUMN "isPurchased" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Review" ALTER COLUMN "verifiedPurchase" SET NOT NULL,
ALTER COLUMN "helpfulCount" SET NOT NULL,
ALTER COLUMN "notHelpfulCount" SET NOT NULL,
ALTER COLUMN "isApproved" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReviewHelpfulness" ADD CONSTRAINT "UserReviewHelpfulness_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReviewHelpfulness" ADD CONSTRAINT "UserReviewHelpfulness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBehavior" ADD CONSTRAINT "UserBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBehavior" ADD CONSTRAINT "UserBehavior_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."ProductRecommendation_userId_productId_type_key" RENAME TO "ProductRecommendation_userId_productId_recommendationType_key";
