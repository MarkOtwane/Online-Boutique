import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.ProductCreateInput & { imageUrl?: string },
  ): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
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
      include: { category: true },
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
    return this.prisma.product.delete({ where: { id } });
  }
}
