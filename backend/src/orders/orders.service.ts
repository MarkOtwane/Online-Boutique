import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { CustomLoggerService } from '../auth/logger.service';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private logger: CustomLoggerService,
  ) {}

  async createOrder(
    userId: number,
    items: { productId: number; quantity: number }[],
  ): Promise<any> {
    this.logger.log(`Creating order for user ${userId}`);
    if (!items || items.length === 0) {
      this.logger.error('Order must contain at least one item');
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      this.logger.error('One or more products not found');
      throw new BadRequestException('One or more products not found');
    }

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find((p) => p.id === item.productId)!.price,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    this.logger.log(`Order ${order.id} created successfully`);
    // Map paymentStatus to status for frontend compatibility
    return { ...order, status: order.paymentStatus } as any;
  }

  async getUserOrders(userId: number): Promise<any[]> {
    this.logger.log(`Fetching orders for user ${userId}`);
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Map paymentStatus to status for frontend compatibility
    return orders.map((order) => ({ ...order, status: order.paymentStatus }));
  }

  async getAllOrders(): Promise<any[]> {
    this.logger.log('Fetching all orders');
    const orders = await this.prisma.order.findMany({
      include: { orderItems: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
    // Map paymentStatus to status for frontend compatibility
    return orders.map((order) => ({ ...order, status: order.paymentStatus }));
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    this.logger.log(`Updating order ${orderId} status to ${status}`);

    // Map status to PaymentStatus enum
    const paymentStatus = status.toUpperCase() as PaymentStatus;

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: { orderItems: { include: { product: true } }, user: true },
    });

    this.logger.log(`Order ${orderId} status updated successfully`);
    // Map paymentStatus to status for frontend compatibility
    return { ...order, status: order.paymentStatus };
  }
}
