import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async create(@Body() data: { name: string }): Promise<Category> {
    return await this.categoriesService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string },
  ): Promise<Category> {
    return await this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async delete(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return await this.categoriesService.delete(id);
  }
}
