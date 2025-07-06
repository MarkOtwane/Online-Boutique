/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  create(@Body() data: CreateAdminDto) {
    return this.prisma.admin.create({data});
  }

  @Get()
  findAll() {
    return this.prisma.admin.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.admin.findUnique({
      where: {id: +id}
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.prisma.admin.update({
      where: {id: +id},
      data: updateAdminDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.admin.delete({
      where: {id: +id},
    });
  }
}
