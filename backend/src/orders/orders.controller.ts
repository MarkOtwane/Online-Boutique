/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

import { SetMetadata } from '@nestjs/common';
import { RolesGuard } from '../roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Body() data: { items: { productId: number; quantity: number }[] },
  ): Promise<any> {
    return this.ordersService.createOrder(req.user.id, data.items);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Request() req): Promise<any[]> {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getAllOrders(): Promise<any[]> {
    return this.ordersService.getAllOrders();
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async updateOrderStatus(
    @Param('id') orderId: number,
    @Body() body: { status: string },
  ): Promise<any> {
    return this.ordersService.updateOrderStatus(orderId, body.status);
  }
}
