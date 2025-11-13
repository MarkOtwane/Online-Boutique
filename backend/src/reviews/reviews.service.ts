/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReviewDto,
  MarkHelpfulDto,
  ReviewQueryDto,
  UpdateReviewDto,
} from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: number, createReviewDto: CreateReviewDto) {
    // Verify user hasn't already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId: createReviewDto.productId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    // Check if user has purchased this product for verified badge
    const hasPurchased = await this.checkPurchaseHistory(
      userId,
      createReviewDto.productId,
    );

    return this.prisma.review.create({
      data: {
        userId,
        productId: createReviewDto.productId,
        content: createReviewDto.content,
        rating: createReviewDto.rating,
        title: createReviewDto.title,
        reviewImages: createReviewDto.reviewImages || [],
        verifiedPurchase: hasPurchased,
        isApproved: false, // Reviews need admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async getReviews(query: ReviewQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isApproved: true, // Only show approved reviews
    };

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.ratingFilter) {
      where.rating = query.ratingFilter;
    }

    if (query.onlyVerified) {
      where.verifiedPurchase = true;
    }

    const reviews = await this.prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        helpfulness: {
          select: {
            isHelpful: true,
            userId: true,
          },
        },
      },
    });

    const total = await this.prisma.review.count({ where });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewById(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        helpfulness: {
          select: {
            isHelpful: true,
            userId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateReview(
    userId: number,
    id: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.getReviewById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        ...updateReviewDto,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async deleteReview(userId: number, id: number) {
    const review = await this.getReviewById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: 'Review deleted successfully' };
  }

  async markHelpful(
    userId: number,
    reviewId: number,
    markHelpfulDto: MarkHelpfulDto,
  ) {
    // Check if review exists
    await this.getReviewById(reviewId);

    // Check if user already marked this review
    const existingHelpfulness =
      await this.prisma.userReviewHelpfulness.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
      });

    if (existingHelpfulness) {
      // Update existing record
      await this.prisma.userReviewHelpfulness.update({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
        data: {
          isHelpful: markHelpfulDto.isHelpful,
        },
      });
    } else {
      // Create new record
      await this.prisma.userReviewHelpfulness.create({
        data: {
          reviewId,
          userId,
          isHelpful: markHelpfulDto.isHelpful,
        },
      });
    }

    // Update helpful counts on the review
    await this.updateReviewHelpfulCounts(reviewId);

    return { message: 'Review helpfulness updated successfully' };
  }

  async getReviewStatistics(productId: number) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true,
      },
      _count: {
        rating: true,
      },
    });

    const totalReviews = await this.prisma.review.count({
      where: {
        productId,
        isApproved: true,
      },
    });

    const averageRating = await this.prisma.review.aggregate({
      where: {
        productId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
    });

    // Format the distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      distribution[stat.rating as keyof typeof distribution] =
        stat._count.rating;
    });

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      distribution,
    };
  }

  async approveReview(id: number) {
    return this.prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async getPendingReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const reviews = await this.prisma.review.findMany({
      where: { isApproved: false },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    const total = await this.prisma.review.count({
      where: { isApproved: false },
    });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async checkPurchaseHistory(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    const purchase = await this.prisma.orderItem.findFirst({
      where: {
        order: {
          userId,
          paymentStatus: 'PAID',
        },
        productId,
      },
    });

    return !!purchase;
  }

  private async updateReviewHelpfulCounts(reviewId: number) {
    const helpfulnessData = await this.prisma.userReviewHelpfulness.findMany({
      where: { reviewId },
    });

    const helpfulCount = helpfulnessData.filter((h) => h.isHelpful).length;
    const notHelpfulCount = helpfulnessData.filter((h) => !h.isHelpful).length;

    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount,
        notHelpfulCount,
      },
    });
  }

  async canUserReview(userId: number, productId: number) {
    const hasPurchased = await this.checkPurchaseHistory(userId, productId);
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    return {
      canReview: hasPurchased && !existingReview,
      hasPurchased,
      hasReviewed: !!existingReview,
    };
  }
}
