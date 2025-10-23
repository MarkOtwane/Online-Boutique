import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RepostsController } from './reposts.controller';
import { RepostsService } from './reposts.service';

@Module({
  controllers: [RepostsController],
  providers: [RepostsService, PrismaService],
  exports: [RepostsService],
})
export class RepostsModule {}
