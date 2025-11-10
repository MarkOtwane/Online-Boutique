/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async createTracking(
    @Body()
    body: {
      orderId: number;
      initialStatus?: string;
      location?: string;
      notes?: string;
    },
  ) {
    const trackingId = await this.trackingService.createTracking(body);
    return { trackingId };
  }

  @Get(':trackingId')
  async getTrackingInfo(@Param('trackingId') trackingId: string) {
    return this.trackingService.getTrackingInfo(trackingId);
  }

  @Put('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async updateTracking(
    @Param('orderId') orderId: string,
    @Body()
    body: {
      status?: string;
      location?: string;
      notes?: string;
      estimatedDelivery?: Date;
    },
  ) {
    await this.trackingService.updateTracking(parseInt(orderId), body);
    return { message: 'Tracking updated successfully' };
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async getOrderTracking(@Param('orderId') orderId: string) {
    return this.trackingService.getOrderTracking(parseInt(orderId));
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getAllTracking(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.trackingService.getAllTracking({
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', ['admin'])
  async getTrackingStats() {
    return this.trackingService.getTrackingStats();
  }
}
