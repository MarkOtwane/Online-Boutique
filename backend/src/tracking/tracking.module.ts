import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [TrackingController],
  providers: [TrackingService, PrismaService],
  exports: [TrackingService],
})
export class TrackingModule {}
