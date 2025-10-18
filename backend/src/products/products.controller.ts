import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';

import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
@UseGuards(JwtAuthGuard)
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

  @Get('recent')
  async findRecent(): Promise<Product[]> {
    return this.productsService.findRecent();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product | null> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Only JPG, JPEG, and PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async create(
    @Body() data: { name: string; price: string; categoryId: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.productsService.create({
      name: data.name,
      price: parseFloat(data.price),
      category: {
        connect: { id: parseInt(data.categoryId) },
      },
      imageUrl,
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @SetMetadata('roles', ['admin'])
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new Error('Only JPG, JPEG, and PNG files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; price?: string; categoryId?: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.categoryId) {
      updateData.category = {
        connect: { id: parseInt(data.categoryId) },
      };
    }
    if (imageUrl) updateData.imageUrl = imageUrl;

    return this.productsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @SetMetadata('roles', ['admin'])
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}
