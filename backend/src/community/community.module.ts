import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityChatGateway } from './community-chat.gateway';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityChatGateway, PrismaService],
  exports: [CommunityService],
})
export class CommunityModule {}
