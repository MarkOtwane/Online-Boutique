import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma, Product } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('categoryId', ParseIntPipe) categoryId?: number,
    @Query('page', ParseIntPipe) page?: number,
    @Query('pageSize', ParseIntPipe) pageSize?: number,
  ): Promise<{ products: Product[]; total: number }> {
    return this.productsService.findAll({ categoryId, page, pageSize });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product | null> {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() data: Prisma.ProductCreateInput): Promise<Product> {
    return this.productsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.ProductUpdateInput,
  ): Promise<Product> {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}
