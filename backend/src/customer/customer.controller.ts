/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  create(@Body() data: CreateCustomerDto) {
    return this.prisma.customer.create({ data });
  }

  @Get()
  findAll() {
    return this.prisma.customer.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.customer.findUnique({
      where: { id: +id },
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.prisma.customer.update({
      where: { id: +id },
      data: updateCustomerDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.customer.delete({
      where: { id: +id },
    });
  }
}
