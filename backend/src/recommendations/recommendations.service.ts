/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GetRecommendationsQueryDto,
  RecommendationType,
  TrackBehaviorDto,
  UpdateRecommendationDto,
} from './dto/create-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  // AI-Powered Recommendation Algorithms

  // 1. Collaborative Filtering: "Users who bought X also bought Y"
  async generateCollaborativeRecommendations(userId: number, limit = 10) {
    // Get user's purchase history
    const userPurchases = await this.prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          paymentStatus: 'PAID',
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (userPurchases.length === 0) return [];

    // Find similar users (users who bought similar products)
    const purchasedProductIds = userPurchases.map((p) => p.productId);
    const purchasedCategoryIds = [
      ...new Set(userPurchases.map((p) => p.product.categoryId)),
    ];

    // Find users with similar purchase patterns
    const similarUsers = await this.prisma.orderItem.findMany({
      where: {
        productId: { in: purchasedProductIds },
        order: {
          userId: { not: userId },
          paymentStatus: 'PAID',
        },
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        product: true,
      },
      take: 100, // Limit for performance
    });

    // Count product frequencies among similar users
    const productScores = new Map<number, number>();
    similarUsers.forEach((item) => {
      const currentScore = productScores.get(item.productId) || 0;
      productScores.set(item.productId, currentScore + 1);
    });

    // Remove products user already purchased
    purchasedProductIds.forEach((id) => productScores.delete(id));

    // Convert to recommendations
    const recommendations = Array.from(productScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        recommendationType: RecommendationType.COLLABORATIVE,
        score: Math.min(score / similarUsers.length, 1), // Normalize score
        reason: 'Users with similar purchases also bought this',
      }));

    return recommendations;
  }

  // 2. Content-Based Filtering: "Similar products based on categories and ratings"
  async generateContentBasedRecommendations(userId: number, limit = 10) {
    // Get user's most viewed/purchased categories
    const userBehavior = await this.prisma.userBehavior.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    if (userBehavior.length === 0) return [];

    // Analyze user preferences
    const categoryPreferences = new Map<number, number>();
    const priceRange = { min: 0, max: 0, count: 0 };

    userBehavior.forEach((behavior) => {
      if (behavior.product?.category) {
        const categoryId = behavior.product.categoryId;
        const currentScore = categoryPreferences.get(categoryId) || 0;

        // Weight different actions
        const actionWeight =
          {
            purchase: 3,
            cart_add: 2,
            view: 1,
            review: 2,
            search: 1,
          }[behavior.actionType] || 1;

        categoryPreferences.set(categoryId, currentScore + actionWeight);
      }

      if (behavior.product?.price) {
        priceRange.min += behavior.product.price;
        priceRange.max += behavior.product.price;
        priceRange.count++;
      }
    });

    if (priceRange.count === 0) return [];

    // Calculate average preferred price
    const avgPrice = priceRange.min / priceRange.count;

    // Find products matching user preferences
    const preferredCategoryIds = Array.from(categoryPreferences.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 categories
      .map(([id]) => id);

    const recommendations = await this.prisma.product.findMany({
      where: {
        categoryId: { in: preferredCategoryIds },
        id: {
          notIn: userBehavior
            .filter((b) => b.productId)
            .map((b) => b.productId),
        },
        price: {
          gte: avgPrice * 0.7,
          lte: avgPrice * 1.3, // Price range ±30%
        },
      },
      include: {
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true,
          },
        },
        category: true,
      },
      take: limit * 2, // Get more to calculate scores
    });

    // Score products based on multiple factors
    const scoredProducts = recommendations.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      const categoryScore =
        (categoryPreferences.get(product.categoryId) || 0) /
        Math.max(...categoryPreferences.values());
      const priceScore = 1 - Math.abs(product.price - avgPrice) / avgPrice; // Closer to preferred price = higher score
      const ratingScore = avgRating / 5; // Normalize rating to 0-1

      const finalScore =
        categoryScore * 0.5 + priceScore * 0.3 + ratingScore * 0.2;

      return {
        productId: product.id,
        recommendationType: RecommendationType.CONTENT_BASED,
        score: Math.max(finalScore, 0.1), // Minimum score
        reason: `Based on your interest in ${product.category.name} products`,
      };
    });

    return scoredProducts.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // 3. Trending Products: "Popular products right now"
  async generateTrendingRecommendations(limit = 10) {
    // Get products with recent high activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingProducts = await this.prisma.userBehavior.groupBy({
      by: ['productId'],
      where: {
        timestamp: { gte: thirtyDaysAgo },
        productId: { not: null },
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: limit,
    });

    const recommendations = [];
    for (const trend of trendingProducts) {
      if (trend.productId) {
        // Get additional context for the product
        const product = await this.prisma.product.findUnique({
          where: { id: trend.productId },
          include: {
            reviews: {
              where: { isApproved: true },
              select: { rating: true },
            },
            category: true,
          },
        });

        if (product) {
          const avgRating =
            product.reviews.length > 0
              ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                product.reviews.length
              : 0;

          recommendations.push({
            productId: product.id,
            recommendationType: RecommendationType.TRENDING,
            score: Math.min(trend._count.productId / 10, 1), // Normalize based on activity
            reason: `Trending in ${product.category.name} - ${trend._count.productId} people showed interest recently`,
          });
        }
      }
    }

    return recommendations;
  }

  // 4. Personalized Recommendations: Combine all algorithms
  async generatePersonalizedRecommendations(userId: number, limit = 10) {
    const [collaborative, contentBased, trending] = await Promise.all([
      this.generateCollaborativeRecommendations(userId, Math.ceil(limit * 0.4)),
      this.generateContentBasedRecommendations(userId, Math.ceil(limit * 0.4)),
      this.generateTrendingRecommendations(Math.ceil(limit * 0.2)),
    ]);

    // Combine and deduplicate
    const allRecommendations = [...collaborative, ...contentBased, ...trending];
    const uniqueRecommendations = new Map<number, any>();

    allRecommendations.forEach((rec) => {
      const existing = uniqueRecommendations.get(rec.productId);
      if (!existing || rec.score > existing.score) {
        uniqueRecommendations.set(rec.productId, rec);
      }
    });

    return Array.from(uniqueRecommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Main method to generate and save recommendations
  async generateRecommendationsForUser(userId: number, limit = 10) {
    const recommendations = await this.generatePersonalizedRecommendations(
      userId,
      limit,
    );

    // Save recommendations to database
    const savedRecommendations = [];
    for (const rec of recommendations) {
      try {
        const saved = await this.prisma.productRecommendation.upsert({
          where: {
            userId_productId_recommendationType: {
              userId,
              productId: rec.productId,
              recommendationType: rec.recommendationType,
            },
          },
          update: {
            score: rec.score,
            reason: rec.reason,
            createdAt: new Date(),
          },
          create: {
            userId,
            productId: rec.productId,
            recommendationType: rec.recommendationType,
            score: rec.score,
            reason: rec.reason,
          },
        });
        savedRecommendations.push(saved);
      } catch (error) {
        // Continue if there's an error with one recommendation
        console.error(
          `Failed to save recommendation for product ${rec.productId}:`,
          error,
        );
      }
    }

    return savedRecommendations;
  }

  // Track user behavior for AI learning
  async trackBehavior(trackBehaviorDto: TrackBehaviorDto) {
    return this.prisma.userBehavior.create({
      data: {
        userId: trackBehaviorDto.userId,
        productId: trackBehaviorDto.productId,
        actionType: trackBehaviorDto.actionType,
        metadata: trackBehaviorDto.metadata,
        sessionId: trackBehaviorDto.sessionId,
      },
    });
  }

  // Get recommendations for a user
  async getRecommendations(query: GetRecommendationsQueryDto) {
    const {
      userId,
      limit = 10,
      recommendationTypes,
      sortBy = 'score',
      sortOrder = 'desc',
    } = query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (recommendationTypes && recommendationTypes.length > 0) {
      where.recommendationType = { in: recommendationTypes };
    }

    const recommendations = await this.prisma.productRecommendation.findMany({
      where,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        product: {
          include: {
            category: true,
            reviews: {
              where: { isApproved: true },
              select: { rating: true },
            },
          },
        },
        user: {
          select: { id: true, email: true },
        },
      },
    });

    // Add computed average rating
    return recommendations.map((rec) => ({
      ...rec,
      product: {
        ...rec.product,
        averageRating:
          rec.product.reviews.length > 0
            ? rec.product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              rec.product.reviews.length
            : 0,
        reviewCount: rec.product.reviews.length,
      },
    }));
  }

  // Update recommendation interaction
  async updateRecommendationInteraction(
    userId: number,
    productId: number,
    updates: UpdateRecommendationDto,
  ) {
    return this.prisma.productRecommendation.updateMany({
      where: {
        userId,
        productId,
      },
      data: updates,
    });
  }

  // Get recommendation statistics
  async getRecommendationStats(userId?: number) {
    const where = userId ? { userId } : {};

    const [total, clicked, purchased, byType] = await Promise.all([
      this.prisma.productRecommendation.count({ where }),
      this.prisma.productRecommendation.count({
        where: { ...where, isClicked: true },
      }),
      this.prisma.productRecommendation.count({
        where: { ...where, isPurchased: true },
      }),
      this.prisma.productRecommendation.groupBy({
        by: ['recommendationType'],
        where,
        _count: { recommendationType: true },
        _avg: { score: true },
      }),
    ]);

    return {
      total,
      clicked,
      purchased,
      clickThroughRate: total > 0 ? clicked / total : 0,
      conversionRate: total > 0 ? purchased / total : 0,
      byType: byType.map((type) => ({
        type: type.recommendationType,
        count: type._count.recommendationType,
        averageScore: type._avg.score,
      })),
    };
  }

  // Batch generate recommendations for all users
  async batchGenerateRecommendations() {
    const users = await this.prisma.user.findMany({
      where: { role: 'customer' },
      select: { id: true },
    });

    const results = [];
    for (const user of users) {
      try {
        const recommendations = await this.generateRecommendationsForUser(
          user.id,
          10,
        );
        results.push({ userId: user.id, count: recommendations.length });
      } catch (error) {
        console.error(
          `Failed to generate recommendations for user ${user.id}:`,
          error,
        );
        results.push({ userId: user.id, count: 0, error: error.message });
      }
    }

    return results;
  }
}
