/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { CustomLoggerService } from '../auth/logger.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingService } from '../tracking/tracking.service';
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private logger: CustomLoggerService,
    private trackingService: TrackingService,
    private mailerService: MailerService,
  ) {}

  private mapPaymentStatusToFrontend(paymentStatus: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'pending',
      [PaymentStatus.PAID]: 'completed',
      [PaymentStatus.CANCELLED]: 'cancelled',
      [PaymentStatus.FAILED]: 'failed',
    };
    return statusMap[paymentStatus] || paymentStatus.toLowerCase();
  }

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
    return {
      ...order,
      status: this.mapPaymentStatusToFrontend(order.paymentStatus),
    } as any;
  }

  async getUserOrders(userId: number): Promise<any[]> {
    this.logger.log(`Fetching orders for user ${userId}`);
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Map paymentStatus to status for frontend compatibility
    return orders.map((order) => ({
      ...order,
      status: this.mapPaymentStatusToFrontend(order.paymentStatus),
    }));
  }

  async getAllOrders(): Promise<any[]> {
    this.logger.log('Fetching all orders');
    const orders = await this.prisma.order.findMany({
      include: { orderItems: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
    // Map paymentStatus to status for frontend compatibility
    return orders.map((order) => ({
      ...order,
      status: this.mapPaymentStatusToFrontend(order.paymentStatus),
    }));
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    this.logger.log(`Updating order ${orderId} status to ${status}`);

    // Map frontend status values to PaymentStatus enum
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PENDING,
      processing: PaymentStatus.PENDING,
      shipped: PaymentStatus.PAID,
      completed: PaymentStatus.PAID,
      cancelled: PaymentStatus.CANCELLED,
      failed: PaymentStatus.FAILED,
    };

    const paymentStatus = statusMap[status.toLowerCase()];

    if (!paymentStatus) {
      this.logger.error(`Invalid status value: ${status}`);
      throw new BadRequestException(`Invalid status value: ${status}`);
    }

    const order = await this.prisma.order.update({
      where: { id: Number(orderId) },
      data: { paymentStatus },
      include: { orderItems: { include: { product: true } }, user: true },
    });

    this.logger.log(`Order ${orderId} status updated successfully`);

    // Handle automatic tracking and email notifications
    if (status.toLowerCase() === 'shipped') {
      await this.handleOrderShipped(order);
    } else if (status.toLowerCase() === 'completed') {
      await this.handleOrderDelivered(order);
    }

    // Map paymentStatus back to the frontend status format
    const reverseStatusMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]:
        status.toLowerCase() === 'processing' ? 'processing' : 'pending',
      [PaymentStatus.PAID]:
        status.toLowerCase() === 'shipped' ? 'shipped' : 'completed',
      [PaymentStatus.CANCELLED]: 'cancelled',
      [PaymentStatus.FAILED]: 'failed',
    };

    return {
      ...order,
      status:
        reverseStatusMap[order.paymentStatus] ||
        order.paymentStatus.toLowerCase(),
    };
  }

  private async handleOrderShipped(order: any): Promise<void> {
    try {
      // Create tracking record
      const trackingId = await this.trackingService.createTracking({
        orderId: order.id,
        initialStatus: 'shipped',
        location: 'Warehouse',
        notes: 'Order has been shipped',
      });

      // Send shipping confirmation email
      await this.mailerService.sendShippingUpdate(order.id, order.user.email, {
        trackingId: trackingId,
        status: 'Shipped',
        shippedDate: new Date().toISOString(),
        trackingUrl: `${process.env.FRONTEND_URL}/tracking?id=${trackingId}`,
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 7 days from now
      });

      this.logger.log(`Shipping notification sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle order shipped for ${order.id}:`,
        error,
      );
    }
  }

  private async handleOrderDelivered(order: any): Promise<void> {
    try {
      // Update tracking to delivered
      await this.trackingService.updateTracking(order.id, {
        status: 'delivered',
        location: 'Delivered to customer',
        notes: 'Package successfully delivered',
      });

      // Send delivery confirmation email
      await this.mailerService.sendEmail({
        to: order.user.email,
        template: 'delivery-confirmation',
        context: {
          orderId: order.id,
          trackingId: `TRK-${order.id}`,
          deliveredDate: new Date().toISOString(),
          deliveryLocation: 'Customer address',
          reviewUrl: `${process.env.FRONTEND_URL}/products`,
        },
      });

      this.logger.log(`Delivery notification sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle order delivered for ${order.id}:`,
        error,
      );
    }
  }
}
