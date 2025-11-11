-- Create Review model
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "verifiedPurchase" BOOLEAN DEFAULT false,
    "helpfulCount" INTEGER DEFAULT 0,
    "notHelpfulCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isApproved" BOOLEAN DEFAULT false,
    "reviewImages" TEXT[],

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Create UserReviewHelpfulness model
CREATE TABLE "UserReviewHelpfulness" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReviewHelpfulness_pkey" PRIMARY KEY ("id")
);

-- Create UserBehavior model for AI recommendations
CREATE TABLE "UserBehavior" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER,
    "actionType" TEXT NOT NULL, -- 'view', 'cart_add', 'purchase', 'review', 'search'
    "metadata" JSONB, -- Additional data like search terms, time spent, etc.
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "UserBehavior_pkey" PRIMARY KEY ("id")
);

-- Create ProductRecommendation model
CREATE TABLE "ProductRecommendation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "recommendationType" TEXT NOT NULL, -- 'collaborative', 'content_based', 'trending', 'personalized'
    "score" FLOAT NOT NULL, -- AI confidence score
    "reason" TEXT, -- Explanation for the recommendation
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isViewed" BOOLEAN DEFAULT false,
    "isClicked" BOOLEAN DEFAULT false,
    "isPurchased" BOOLEAN DEFAULT false,

    CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");

CREATE INDEX "UserReviewHelpfulness_reviewId_idx" ON "UserReviewHelpfulness"("reviewId");
CREATE INDEX "UserReviewHelpfulness_userId_idx" ON "UserReviewHelpfulness"("userId");
CREATE INDEX "UserReviewHelpfulness_reviewId_userId_idx" ON "UserReviewHelpfulness"("reviewId", "userId");

CREATE INDEX "UserBehavior_userId_idx" ON "UserBehavior"("userId");
CREATE INDEX "UserBehavior_productId_idx" ON "UserBehavior"("productId");
CREATE INDEX "UserBehavior_actionType_idx" ON "UserBehavior"("actionType");
CREATE INDEX "UserBehavior_timestamp_idx" ON "UserBehavior"("timestamp");
CREATE INDEX "UserBehavior_sessionId_idx" ON "UserBehavior"("sessionId");

CREATE INDEX "ProductRecommendation_userId_idx" ON "ProductRecommendation"("userId");
CREATE INDEX "ProductRecommendation_productId_idx" ON "ProductRecommendation"("productId");
CREATE INDEX "ProductRecommendation_recommendationType_idx" ON "ProductRecommendation"("recommendationType");
CREATE INDEX "ProductRecommendation_score_idx" ON "ProductRecommendation"("score");
CREATE INDEX "ProductRecommendation_createdAt_idx" ON "ProductRecommendation"("createdAt");

-- Add foreign key constraints
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "UserReviewHelpfulness" ADD CONSTRAINT "UserReviewHelpfulness_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE;
ALTER TABLE "UserReviewHelpfulness" ADD CONSTRAINT "UserReviewHelpfulness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "UserBehavior" ADD CONSTRAINT "UserBehavior_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL;
ALTER TABLE "UserBehavior" ADD CONSTRAINT "UserBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Add unique constraints
ALTER TABLE "UserReviewHelpfulness" ADD CONSTRAINT "UserReviewHelpfulness_reviewId_userId_key" UNIQUE ("reviewId", "userId");
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_userId_productId_type_key" UNIQUE ("userId", "productId", "recommendationType");