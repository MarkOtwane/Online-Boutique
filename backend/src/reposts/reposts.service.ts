/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepostDto } from './create-repost.dto';

@Injectable()
export class RepostsService {
  constructor(private prisma: PrismaService) {}

  async createRepost(userId: number, dto: CreateRepostDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reposted this product
    const existingRepost = await this.prisma.repost.findUnique({
      where: {
        productId_userId: {
          productId: dto.productId,
          userId,
        },
      },
    });

    if (existingRepost) {
      throw new BadRequestException('You have already reposted this product');
    }

    // Create the repost
    const repost = await this.prisma.repost.create({
      data: {
        productId: dto.productId,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    // Increment repostCount
    await this.prisma.product.update({
      where: { id: dto.productId },
      data: {
        repostCount: {
          increment: 1,
        },
      },
    });

    return repost;
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Retrieves all reposts for a given product
   * @param {number} productId - The ID of the product to retrieve reposts for
/*******  294ece42-9874-40b8-8cb2-b53a8d6fde5f  *******/ async getProductReposts(
    productId: number,
  ) {
    return this.prisma.repost.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteRepost(userId: number, repostId: number) {
    const repost = await this.prisma.repost.findUnique({
      where: { id: repostId },
    });

    if (!repost) {
      throw new NotFoundException('Repost not found');
    }

    if (repost.userId !== userId) {
      throw new BadRequestException('You can only delete your own reposts');
    }

    // Delete the repost
    await this.prisma.repost.delete({
      where: { id: repostId },
    });

    // Decrement repostCount
    await this.prisma.product.update({
      where: { id: repost.productId },
      data: {
        repostCount: {
          decrement: 1,
        },
      },
    });

    return repost;
  }
}
