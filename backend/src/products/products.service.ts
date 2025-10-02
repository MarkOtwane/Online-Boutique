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
    const skip = (page - 1) * pageSize;

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
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: number): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
      include: { category: true },
    });
  }
}
