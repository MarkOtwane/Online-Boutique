import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCommunityPostDto,
  UpdateCommunityPostDto,
  CreateCommunityCommentDto,
  CommunityPostFilters,
} from './community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async createCommunityPost(userId: number, dto: CreateCommunityPostDto) {
    // Check if user is admin for ADMIN_ANNOUNCEMENT posts
    if (dto.postType === 'ADMIN_ANNOUNCEMENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== 'admin') {
        throw new ForbiddenException(
          'Only admins can create announcement posts',
        );
      }
    }

    // Check if productId is valid if provided
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    return this.prisma.communityPost.create({
      data: {
        userId,
        content: dto.content,
        imageUrl: dto.imageUrl,
        caption: dto.caption,
        postType: dto.postType || 'GENERAL',
        productId: dto.productId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
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
  }

  async getCommunityPosts(filters?: CommunityPostFilters) {
    const where: any = {};

    if (filters?.postType) {
      where.postType = filters.postType;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    return this.prisma.communityPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
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
        reactions: {
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
        comments: {
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
          take: 3, // Latest 3 comments
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCommunityPost(postId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isOnline: true,
            lastSeen: true,
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
        reactions: {
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
        comments: {
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
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          where: {
            parentId: null, // Only top-level comments
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        reposts: {
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
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    return post;
  }

  async updateCommunityPost(
    userId: number,
    postId: number,
    dto: UpdateCommunityPostDto,
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.communityPost.update({
      where: { id: postId },
      data: dto,
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
  }

  async deleteCommunityPost(userId: number, postId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.communityPost.delete({
      where: { id: postId },
    });

    return { message: 'Community post deleted successfully' };
  }

  async createCommunityComment(
    userId: number,
    postId: number,
    dto: CreateCommunityCommentDto,
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.communityComment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment || parentComment.communityPostId !== postId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.communityComment.create({
      data: {
        communityPostId: postId,
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Update comment count
    await this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return comment;
  }

  async toggleCommunityReaction(userId: number, postId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    const existingReaction = await this.prisma.communityReaction.findUnique({
      where: {
        communityPostId_userId: {
          communityPostId: postId,
          userId,
        },
      },
    });

    if (existingReaction) {
      await this.prisma.communityReaction.delete({
        where: { id: existingReaction.id },
      });

      await this.prisma.communityPost.update({
        where: { id: postId },
        data: {
          reactionCount: {
            decrement: 1,
          },
        },
      });

      return { message: 'Reaction removed', reaction: null };
    } else {
      const reaction = await this.prisma.communityReaction.create({
        data: {
          communityPostId: postId,
          userId,
          type: 'like',
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

      await this.prisma.communityPost.update({
        where: { id: postId },
        data: {
          reactionCount: {
            increment: 1,
          },
        },
      });

      return { message: 'Reaction added', reaction };
    }
  }

  async repostCommunityPost(userId: number, postId: number, content?: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    // Check if already reposted
    const existingRepost = await this.prisma.communityRepost.findUnique({
      where: {
        communityPostId_userId: {
          communityPostId: postId,
          userId,
        },
      },
    });

    if (existingRepost) {
      throw new ForbiddenException('You have already reposted this content');
    }

    const repost = await this.prisma.communityRepost.create({
      data: {
        communityPostId: postId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        communityPost: {
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
    });

    // Update repost count
    await this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        repostCount: {
          increment: 1,
        },
      },
    });

    return repost;
  }

  async deleteCommunityComment(userId: number, commentId: number) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete comment and all its replies
    await this.prisma.communityComment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId },
        ],
      },
    });

    // Update comment count
    await this.prisma.communityPost.update({
      where: { id: comment.communityPostId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Comment deleted successfully' };
  }
}