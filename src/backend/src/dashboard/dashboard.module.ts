import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../auth/logger.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService, CustomLoggerService],
  exports: [DashboardService],
})
export class DashboardModule {}
