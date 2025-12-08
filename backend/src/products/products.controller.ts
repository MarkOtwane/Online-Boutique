/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';

import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import cloudinary from '../cloudinary.config';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new Error('Only JPG, JPEG, PNG, and WEBP files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async create(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    // Manually parse and validate FormData fields
    const data = req.body as unknown as { [key: string]: string };
    const name = data.name?.trim();
    const priceStr = data.price;
    const categoryIdStr = data.categoryId;

    if (!name || !priceStr || !categoryIdStr) {
      throw new BadRequestException(
        'Name, price, and categoryId are required.',
      );
    }

    const price = parseFloat(priceStr);
    const categoryId = parseInt(categoryIdStr);

    if (isNaN(price) || price <= 0) {
      throw new BadRequestException('Price must be a positive number.');
    }

    if (isNaN(categoryId) || categoryId <= 0) {
      throw new BadRequestException('CategoryId must be a positive integer.');
    }

    let imageUrl: string | undefined;

    if (file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'boutique-products',
          public_id: `product-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          format: 'png',
        });

        imageUrl = result.secure_url;

        // Delete local file after upload
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        // If Cloudinary fails, we'll create the product without an image
        // Delete the local file anyway
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to delete local file:', unlinkError);
        }
      }
    }

    return this.productsService.create({
      name,
      price,
      category: {
        connect: { id: categoryId },
      },
      imageUrl,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new Error('Only JPG, JPEG, PNG, and WEBP files are allowed'),
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
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Product> {
    const data = req.body as unknown as { [key: string]: string };
    let imageUrl: string | undefined;

    if (file) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'boutique-products',
        public_id: `product-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        format: 'png',
      });

      imageUrl = result.secure_url;

      // Delete local file after upload
      await fs.unlink(file.path);
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.price) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0) {
        throw new BadRequestException('Price must be a positive number.');
      }
      updateData.price = price;
    }
    if (data.categoryId) {
      const categoryId = parseInt(data.categoryId);
      if (isNaN(categoryId) || categoryId <= 0) {
        throw new BadRequestException('CategoryId must be a positive integer.');
      }
      updateData.category = {
        connect: { id: categoryId },
      };
    }
    if (imageUrl) updateData.imageUrl = imageUrl;

    return this.productsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}
