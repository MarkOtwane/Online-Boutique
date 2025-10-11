/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Order } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

import { Get, SetMetadata } from '@nestjs/common';
import { RolesGuard } from '../roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() data: { items: { productId: number; quantity: number }[] },
  ): Promise<Order> {
    return this.ordersService.createOrder(req.user.id, data.items);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Request() req): Promise<Order[]> {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }
}
