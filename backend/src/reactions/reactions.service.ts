import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async toggleReaction(userId: number, productId: number) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if reaction already exists
    const existingReaction = await this.prisma.reaction.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction (unlike)
      await this.prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      // Decrement reactionCount
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          reactionCount: {
            decrement: 1,
          },
        },
      });

      return { action: 'removed', reactionCount: product.reactionCount - 1 };
    } else {
      // Add reaction (like)
      await this.prisma.reaction.create({
        data: {
          productId,
          userId,
          reactionKind: 'like',
        },
      });

      // Increment reactionCount
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          reactionCount: {
            increment: 1,
          },
        },
      });

      return { action: 'added', reactionCount: product.reactionCount + 1 };
    }
  }

  async getProductReactions(productId: number) {
    return this.prisma.reaction.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserReaction(userId: number, productId: number) {
    return this.prisma.reaction.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }
}