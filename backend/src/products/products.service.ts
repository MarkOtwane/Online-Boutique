import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    price: number;
    category: { connect: { id: number } };
    imageUrl?: string;
  }): Promise<Product> {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: data.category.connect.id },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${data.category.connect.id} does not exist.`,
      );
    }

    try {
      return await this.prisma.product.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid category ID. The specified category does not exist.',
          );
        }
      }
      throw new BadRequestException(
        'Failed to create product. Please check your input.',
      );
    }
  }

  async findAll({
    categoryId,
    page = 1,
    pageSize = 10,
  }: {
    categoryId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where = categoryId ? { categoryId } : {};
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products, total };
  }

  async findOne(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        comments: {
          where: { parentId: null },
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
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    data: Prisma.ProductUpdateInput & { imageUrl?: string },
  ): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete all related records to avoid foreign key constraint errors

    // Delete comments for this product (cascade is already set in schema, but being explicit)
    await this.prisma.comment.deleteMany({
      where: { productId: id },
    });

    // Delete order items for this product
    await this.prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    // Finally, delete the product
    return this.prisma.product.delete({ where: { id } });
  }

  async findRecent(limit: number = 8): Promise<Product[]> {
    return this.prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }
}
