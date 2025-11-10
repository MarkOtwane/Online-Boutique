/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

export interface TrackingInfo {
  trackingId: string;
  currentStatus: string;
  statusHistory: Array<{
    status: string;
    location: string;
    notes?: string;
    timestamp: Date;
  }>;
  estimatedDelivery?: Date;
  lastUpdated: Date;
}

export interface CreateTrackingDto {
  orderId: number;
  initialStatus?: string;
  location?: string;
  notes?: string;
}

export interface UpdateTrackingDto {
  status?: string;
  location?: string;
  notes?: string;
  estimatedDelivery?: Date;
}

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async createTracking(dto: CreateTrackingDto): Promise<string> {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if tracking already exists for this order
    const existingTracking = await this.prisma.orderTracking.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingTracking) {
      throw new BadRequestException('Tracking already exists for this order');
    }

    // Generate unique tracking ID
    const trackingId = uuidv4();

    // Create tracking record
    const tracking = await this.prisma.orderTracking.create({
      data: {
        orderId: dto.orderId,
        trackingId,
        currentStatus: (dto.initialStatus as any) || 'ORDER_PLACED',
      },
    });

    // Create initial checkpoint
    await this.prisma.trackingCheckpoint.create({
      data: {
        trackingId: tracking.id,
        status: tracking.currentStatus,
        location: dto.location || 'Order Processing Center',
        notes: dto.notes || 'Order received and processing started',
      },
    });

    return trackingId;
  }

  async getTrackingInfo(trackingId: string): Promise<TrackingInfo> {
    const tracking = (await this.prisma.orderTracking.findUnique({
      where: { trackingId },
      include: {
        checkpoints: {
          orderBy: { timestamp: 'desc' },
        },
        order: {
          select: {
            id: true,
            createdAt: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })) as any;

    if (!tracking) {
      throw new NotFoundException('Tracking information not found');
    }

    const statusHistory = tracking.checkpoints.map((checkpoint) => ({
      status: checkpoint.status,
      location: checkpoint.location,
      notes: checkpoint.notes,
      timestamp: checkpoint.timestamp,
    }));

    return {
      trackingId: tracking.trackingId,
      currentStatus: tracking.currentStatus,
      statusHistory,
      lastUpdated: tracking.updatedAt,
    };
  }

  async updateTracking(orderId: number, dto: UpdateTrackingDto): Promise<void> {
    const tracking = await this.prisma.orderTracking.findUnique({
      where: { orderId },
    });

    if (!tracking) {
      throw new NotFoundException(
        'Tracking information not found for this order',
      );
    }

    // Update tracking status if provided
    if (dto.status) {
      await this.prisma.orderTracking.update({
        where: { orderId },
        data: {
          currentStatus: dto.status as any,
        },
      });
    }

    // Create new checkpoint
    await this.prisma.trackingCheckpoint.create({
      data: {
        trackingId: tracking.id,
        status: (dto.status || tracking.currentStatus) as any,
        location: dto.location || 'Unknown Location',
        notes: dto.notes,
      },
    });
  }

  async getOrderTracking(orderId: number): Promise<TrackingInfo | null> {
    const tracking = await this.prisma.orderTracking.findUnique({
      where: { orderId },
      include: {
        checkpoints: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!tracking) {
      return null;
    }

    const statusHistory = tracking.checkpoints.map((checkpoint) => ({
      status: checkpoint.status,
      location: checkpoint.location,
      notes: checkpoint.notes,
      timestamp: checkpoint.timestamp,
    }));

    return {
      trackingId: tracking.trackingId,
      currentStatus: tracking.currentStatus,
      statusHistory,
      lastUpdated: tracking.updatedAt,
    };
  }

  async getAllTracking(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { status, limit = 50, offset = 0 } = options || {};

    const tracking = await this.prisma.orderTracking.findMany({
      where: status ? { currentStatus: status as any } : {},
      include: {
        order: {
          select: {
            id: true,
            total: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        checkpoints: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Only get the latest checkpoint
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return tracking.map((t) => ({
      trackingId: t.trackingId,
      orderId: t.orderId,
      currentStatus: t.currentStatus,
      customerEmail: (t as any).order.user.email,
      orderTotal: (t as any).order.total,
      lastLocation: (t as any).checkpoints[0]?.location || 'Unknown',
      lastUpdated: t.updatedAt,
    }));
  }

  async getTrackingStats(): Promise<any> {
    const stats = await this.prisma.orderTracking.groupBy({
      by: ['currentStatus'],
      _count: { currentStatus: true },
    });

    const total = await this.prisma.orderTracking.count();

    return {
      total,
      byStatus: stats.reduce(
        (acc, stat) => {
          acc[stat.currentStatus] = stat._count.currentStatus;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
