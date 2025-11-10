import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { SmtpProvider } from './providers/smtp.provider';
import { EmailQueue } from './queues/email.queue';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [MailerController],
  providers: [
    MailerService,
    EmailQueue,
    SmtpProvider,
    PrismaService,
    {
      provide: 'EmailProvider',
      useClass: SmtpProvider,
    },
  ],
  exports: [MailerService, EmailQueue],
})
export class MailerModule {}
