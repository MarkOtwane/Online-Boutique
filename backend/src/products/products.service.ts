/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    try {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          name: data.name,
          // description: data.description,
          // price: data.price,
          image: data.image
        }
      });

      if (existingProduct) {
        throw new ConflictException('Product with these details already exists');
      }

      return await this.prisma.product.create({
        data: {
          name: data.name,
          descripton: data.description,
          price: data.price,
          image: data.image,
          stripePriceId: data.stripePriceId,
        }
      });
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({
      where: { id }
    });
  }
}
