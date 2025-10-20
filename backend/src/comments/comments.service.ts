import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async getProductComments(productId: number) {
    return this.prisma.comment.findMany({
      where: {
        productId,
        parentId: null, // Only get root comments
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createComment(userId: number, dto: CreateCommentDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If parentId is provided, verify parent comment exists and belongs to the same product
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.productId !== dto.productId) {
        throw new ForbiddenException(
          'Parent comment does not belong to this product',
        );
      }
    }

    return this.prisma.comment.create({
      data: {
        productId: dto.productId,
        userId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateComment(
    userId: number,
    commentId: number,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
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
      },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Allow deletion if user owns the comment or is an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (comment.userId !== userId && user?.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete all replies first (cascade should handle this, but being explicit)
    await this.prisma.comment.deleteMany({
      where: { parentId: commentId },
    });

    // Delete the comment
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async markAsAdminResponse(
    userId: number,
    commentId: number,
    isOfficialResponse = false,
  ) {
    // Verify user is an admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'admin') {
      throw new ForbiddenException(
        'Only admins can mark responses as admin responses',
      );
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isAdminResponse: true,
        isOfficialResponse,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getAdminResponses(productId?: number) {
    return this.prisma.comment.findMany({
      where: {
        isAdminResponse: true,
        ...(productId && { productId }),
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
