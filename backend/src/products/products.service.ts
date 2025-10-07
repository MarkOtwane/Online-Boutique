import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    categoryId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const { categoryId, page = 1, pageSize = 10 } = params;

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validPageSize = Math.min(Math.max(1, pageSize), 100); // Cap at 100 items per page
    const skip = (validPage - 1) * validPageSize;

    const where = categoryId ? { categoryId } : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findOne(id: number): Promise<Product | null> {
    try {
      return await this.prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
    } catch (error) {
      throw new Error(`Failed to find product with id ${id}: ${error}`);
    }
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data,
        include: { category: true },
      });
    } catch (error) {
      throw new Error(`Failed to create product: ${error}`);
    }
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
        include: { category: true },
      });
    } catch (error) {
      throw new Error(`Failed to update product with id ${id}: ${error}`);
    }
  }

  async delete(id: number): Promise<Product> {
    try {
      return await this.prisma.product.delete({
        where: { id },
        include: { category: true },
      });
    } catch (error) {
      throw new Error(`Failed to delete product with id ${id}: ${error}`);
    }
  }
}
