import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomLoggerService } from '../auth/logger.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, JwtAuthGuard, CustomLoggerService],
})
export class OrdersModule {}
